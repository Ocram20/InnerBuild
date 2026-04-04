import type { TFunction } from "i18next";
import { supportedTranslationLanguages } from "@/lib/language";

function normalize(s: string) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'")
    .replace(/[“”]/g, '"');
}

const SUGGESTED_HABIT_IDS = [
  "drink_water",
  "deep_breaths",
  "make_bed",
  "read_10min",
  "walk_10min",
  "eat_fruit",
  "gratitude",
  "meditate_15min",
  "exercise_30min",
  "sleep_8hrs",
  "no_phone_1hr",
] as const;

const SUGGESTED_CHALLENGE_IDS = [
  "social-media-7",
  "screen-time-21",
  "dopamine-detox-3",
  "mindfulness-30",
  "negativity-fast-7",
  "sleep-reset-14",
  "nofap-30",
  "recovery-90",
  "awareness-week-7",
] as const;

export function localizeSuggestedHabitTitle(t: TFunction, rawTitle: string): string {
  const raw = normalize(rawTitle);
  if (!raw) return rawTitle;

  for (const id of SUGGESTED_HABIT_IDS) {
    for (const lng of supportedTranslationLanguages) {
      const candidate = normalize(t(`suggested_habits.items.${id}.title`, { lng }));
      if (candidate && candidate === raw) {
        return t(`suggested_habits.items.${id}.title`);
      }
    }
  }

  return rawTitle;
}

export function localizeSuggestedHabitDescription(t: TFunction, rawDescription: string | null | undefined): string | null {
  if (!rawDescription) return rawDescription ?? null;
  const raw = normalize(rawDescription);
  if (!raw) return rawDescription;

  for (const id of SUGGESTED_HABIT_IDS) {
    for (const lng of supportedTranslationLanguages) {
      const candidate = normalize(t(`suggested_habits.items.${id}.description`, { lng }));
      if (candidate && candidate === raw) {
        return t(`suggested_habits.items.${id}.description`);
      }
    }
  }

  return rawDescription;
}

export function localizeSuggestedChallengeTitle(t: TFunction, rawTitle: string): string {
  const raw = normalize(rawTitle);
  if (!raw) return rawTitle;

  for (const id of SUGGESTED_CHALLENGE_IDS) {
    for (const lng of supportedTranslationLanguages) {
      const candidateTitle = normalize(t(`suggested_challenges_content.${id}.title`, { lng }));
      if (candidateTitle && candidateTitle === raw) {
        return t(`suggested_challenges_content.${id}.title`);
      }
    }
  }

  return rawTitle;
}

export function localizeSuggestedChallenge(
  t: TFunction,
  input: {
    title: string;
    description: string | null;
    science_note: string | null;
    daily_steps: string[] | null;
  }
) {
  const rawTitle = normalize(input.title);
  const rawDescription = normalize(input.description || "");

  for (const id of SUGGESTED_CHALLENGE_IDS) {
    for (const lng of supportedTranslationLanguages) {
      const candidateTitle = normalize(t(`suggested_challenges_content.${id}.title`, { lng }));
      const candidateDesc = normalize(t(`suggested_challenges_content.${id}.description`, { lng }));

      const titleMatches = candidateTitle && rawTitle && candidateTitle === rawTitle;
      const descMatches = candidateDesc && rawDescription && candidateDesc === rawDescription;

      if (titleMatches || descMatches) {
        return {
          title: t(`suggested_challenges_content.${id}.title`),
          description: t(`suggested_challenges_content.${id}.description`),
          science_note: t(`suggested_challenges_content.${id}.science_note`),
          daily_steps: (t(`suggested_challenges_content.${id}.daily_steps`, { returnObjects: true }) as string[]),
          matchedTemplateId: id,
        };
      }
    }
  }

  return { ...input, matchedTemplateId: null as null };
}

