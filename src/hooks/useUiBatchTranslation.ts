import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  localizeSuggestedChallengeTitle,
  localizeSuggestedHabitTitle,
} from "@/lib/templateLocalization";

const cache = new Map<string, string>();

function langBase(code: string | undefined) {
  return (code || "en").toLowerCase().split("-")[0];
}

function cacheKey(lang: string, s: string) {
  return `${lang}\n${s}`;
}

function tryTemplate(t: (key: string, opts?: object) => string, s: string): string {
  const h = localizeSuggestedHabitTitle(t, s);
  if (h !== s) return h;
  return localizeSuggestedChallengeTitle(t, s);
}

/**
 * Maps user-stored strings (habits, tasks, etc.) to the active UI language:
 * suggested templates via i18n, everything else via translate-ui-batch (Groq).
 */
export function useUiBatchTranslation(rawStrings: string[], enabled: boolean) {
  const { t, i18n } = useTranslation();
  const lang = langBase(i18n.resolvedLanguage || i18n.language);

  const batchRef = useRef<string[]>([]);
  const { toTranslate, stableKey } = useMemo(() => {
    const unique = [...new Set(rawStrings.filter((s) => typeof s === "string" && s.trim()))];
    const need: string[] = [];
    for (const s of unique) {
      const loc = tryTemplate(t, s);
      if (loc !== s) continue;
      if (cache.has(cacheKey(lang, s))) continue;
      need.push(s);
    }
    need.sort();
    batchRef.current = need;
    return { toTranslate: need, stableKey: `${lang}:${need.join("\u0001")}` };
  }, [rawStrings, t, lang]);

  const [remoteReady, setRemoteReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setRemoteReady(true);
      return;
    }
    if (toTranslate.length === 0) {
      setRemoteReady(true);
      return;
    }

    setRemoteReady(false);
    let cancelled = false;
    const payload = batchRef.current;

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          if (!cancelled) setRemoteReady(true);
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-ui-batch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              strings: payload,
              language: i18n.resolvedLanguage || i18n.language || lang,
            }),
          }
        );

        if (!res.ok || cancelled) {
          if (!cancelled) setRemoteReady(true);
          return;
        }

        const data = (await res.json()) as { translations?: string[] };
        const arr = data.translations;
        if (!Array.isArray(arr) || arr.length !== payload.length) {
          if (!cancelled) setRemoteReady(true);
          return;
        }

        payload.forEach((orig, i) => {
          const tr = arr[i];
          if (typeof tr === "string" && tr.trim()) {
            cache.set(cacheKey(lang, orig), tr);
          }
        });
      } catch {
        /* keep originals */
      } finally {
        if (!cancelled) setRemoteReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, stableKey, lang, i18n.resolvedLanguage, i18n.language]);

  const display = useCallback(
    (s: string) => {
      if (!s) return s;
      const loc = tryTemplate(t, s);
      if (loc !== s) return loc;
      return cache.get(cacheKey(lang, s)) ?? s;
    },
    [t, lang]
  );

  const needsRemote = enabled && toTranslate.length > 0;
  const ready = !enabled || !needsRemote || remoteReady;

  return { display, ready, needsRemote };
}
