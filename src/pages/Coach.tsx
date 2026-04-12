import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, ArrowLeft, Sparkles, Target, Flame, Lightbulb, Heart, Trophy, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { toast } from "sonner";
import { CoachLockedPreview } from "@/components/coach/CoachLockedPreview";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";
type Message = { id?: string; role: "user" | "assistant"; content: string; };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`;

export default function Coach() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const { hasAdminRole, loading: roleLoading } = useAdminAccess();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickActions = [
    { id: "habit", label: t("coach.quick_actions.habit_label"), icon: Target, prompt: t("coach.quick_actions.habit_prompt") },
    { id: "challenge", label: t("coach.quick_actions.challenge_label"), icon: Flame, prompt: t("coach.quick_actions.challenge_prompt") },
    { id: "motivation", label: t("coach.quick_actions.motivation_label"), icon: Zap, prompt: t("coach.quick_actions.motivation_prompt") },
    { id: "reflect", label: t("coach.quick_actions.reflect_label"), icon: Lightbulb, prompt: t("coach.quick_actions.reflect_prompt") },
  ];

  const randomTip = t("coach.tip_default");
  const fromExplore = location.state?.from === "explore";
  const handleBack = () => navigate(fromExplore ? "/explore" : "/dashboard");

  const isPremium = hasAdminRole || subscription.subscribed;
  const accessLoading = subLoading || roleLoading;

  useEffect(() => { if (user && isPremium) loadMessages(); }, [user, isPremium]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const loadMessages = async () => {
    if (!user) return;
    setLoadingMessages(true);
    const { data, error } = await supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
    if (error) console.error("Error loading messages:", error);
    else setMessages(data.map(m => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })));
    setLoadingMessages(false);
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!user) return;
    const { error } = await supabase.from("chat_messages").insert({ user_id: user.id, role, content });
    if (error) console.error("Error saving message:", error);
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading || !user) return;
    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages); setInput(""); setIsLoading(true);
    await saveMessage("user", userMessage.content);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { toast.error(t("coach.errors.not_authenticated")); setIsLoading(false); return; }
      const resp = await fetch(CHAT_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })), language: i18n.resolvedLanguage || i18n.language }) });
      if (!resp.ok) {
        if (resp.status === 429) toast.error(t("coach.errors.rate_limited"));
        else if (resp.status === 401) toast.error(t("coach.errors.unauthorized"));
        else if (resp.status === 402 || resp.status === 403) toast.error(t("coach.errors.api_key_or_quota"));
        else toast.error(t("coach.errors.failed_response"));
        setIsLoading(false); return;
      }
      const data = await resp.json();
      const assistantContent = data.response || t("coach.errors.default_ai_reply");
      setMessages(prev => [...prev, { role: "assistant", content: assistantContent }]);
      await saveMessage("assistant", assistantContent);
    } catch (error) { console.error("Chat error:", error); toast.error(t("coach.errors.send_failed")); }
    finally { setIsLoading(false); }
  };

  const handleQuickAction = (prompt: string) => sendMessage(prompt);

  const clearChat = async () => {
    if (!user) return;
    const { error } = await supabase.from("chat_messages").delete().eq("user_id", user.id);
    if (error) toast.error(t("coach.errors.clear_failed"));
    else { setMessages([]); toast.success(t("coach.chat_cleared")); }
  };

  if (accessLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 safe-area-header z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9"><ArrowLeft className="h-5 w-5" /></Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"><Bot className="h-5 w-5 text-primary-foreground" /></div>
                <div><h1 className="text-xl font-bold">{t("coach.title")}</h1><p className="text-sm text-muted-foreground">{t("coach.subtitle")}</p></div>
              </div>
            </div>
          </div>
        </header>
        <CoachLockedPreview />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 safe-area-header z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9"><ArrowLeft className="h-5 w-5" /></Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg animate-pulse"><Bot className="h-5 w-5 text-primary-foreground" /></div>
                <div><h1 className="text-xl font-bold">{t("coach.title")}</h1><p className="text-sm text-muted-foreground">{t("coach.subtitle")}</p></div>
              </div>
            </div>
            {messages.length > 0 && <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground">{t("coach.clear_chat")}</Button>}
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-6 flex flex-col">
        {loadingMessages ? (
          <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center mb-6 shadow-xl animate-scale-in">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("coach.greeting")}</h2>
            <p className="text-muted-foreground mb-2 max-w-md">{t("coach.intro")}</p>
            <Card className="bg-primary/5 border-primary/20 mb-8 max-w-md">
              <CardContent className="py-3 px-4">
                <p className="text-sm text-foreground/80 italic flex items-center gap-2"><Heart className="h-4 w-4 text-primary flex-shrink-0" />{randomTip}</p>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground mb-4">{t("coach.quick_actions_title")}</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {quickActions.map((action) => (
                <button key={action.id} onClick={() => handleQuickAction(action.prompt)} disabled={isLoading}
                  className="flex items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all text-left group">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"><action.icon className="h-4 w-4 text-primary" /></div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-8 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-sm"><Trophy className="h-4 w-4 text-amber-500" /><span>{t("coach.pillars.track_progress")}</span></div>
              <div className="flex items-center gap-1.5 text-sm"><Target className="h-4 w-4 text-emerald-500" /><span>{t("coach.pillars.build_habits")}</span></div>
              <div className="flex items-center gap-1.5 text-sm"><Flame className="h-4 w-4 text-rose-500" /><span>{t("coach.pillars.take_challenges")}</span></div>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4 pb-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-md"><Bot className="h-5 w-5 text-primary-foreground" /></div>}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    {msg.role === "user" && <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"><User className="h-5 w-5" /></div>}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md"><Bot className="h-5 w-5 text-primary-foreground" /></div>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
              {quickActions.map((action) => (
                <Badge key={action.id} variant="secondary" className="cursor-pointer hover:bg-primary/10 transition-colors whitespace-nowrap px-3 py-1.5" onClick={() => handleQuickAction(action.prompt)}>
                  <action.icon className="h-3 w-3 mr-1.5" />{action.label}
                </Badge>
              ))}
            </div>
          </>
        )}

        <div className="pt-4 border-t border-border mt-auto safe-area-bottom">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
            <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("coach.input_placeholder")} disabled={isLoading} className="flex-1 h-12 rounded-xl bg-muted/50 border-border/50 focus:border-primary/50" />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-12 w-12 rounded-xl">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
