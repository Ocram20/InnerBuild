import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ListTodo, ShieldAlert, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cleanupExpiredDailyPlanningItems } from "@/lib/dailyPlanningCleanup";
import { useUiBatchTranslation } from "@/hooks/useUiBatchTranslation";
interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  description?: string | null;
  created_at?: string;
}

interface NotToDoItem {
  id: string;
  title: string;
  status: "pending" | "avoided" | "broken";
}

interface QuickAccessTodosProps {
  userId: string | undefined;
}

export default function QuickAccessTodos({ userId }: QuickAccessTodosProps) {
  const { t, i18n } = useTranslation();
  const [todos, setTodos] = useState<Task[]>([]);
  const [allTodos, setAllTodos] = useState<Task[]>([]);
  const [notTodos, setNotTodos] = useState<NotToDoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetDate = format(new Date(), "yyyy-MM-dd");
  const shouldTranslateContent = (i18n.resolvedLanguage || i18n.language || "it").toLowerCase().split("-")[0] !== "it";
  const rawStrings = [...todos.map((task) => task.title), ...notTodos.map((item) => item.title)].filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0
  );
  const { display } = useUiBatchTranslation(rawStrings, shouldTranslateContent && rawStrings.length > 0);

  const fetchTodosAndNotTodos = async () => {
    if (!userId) return;
    
    try {
      await cleanupExpiredDailyPlanningItems(userId);
      const { data: todosData, error: todosError } = await supabase
        .from("daily_tasks")
        .select("id, title, is_completed, description, created_at")
        .eq("user_id", userId)
        .eq("target_date", targetDate)
        .order("created_at", { ascending: true });

      const { data: notTodosData, error: notTodosError } = await supabase
        .from("not_to_do_items")
        .select("id, title, status")
        .eq("user_id", userId)
        .eq("target_date", targetDate)
        .order("created_at", { ascending: true })
        .limit(5);

      if (todosError) console.error("Error fetching todos:", todosError);
      if (notTodosError) console.error("Error fetching not-to-do items:", notTodosError);

      const getPriorityOrder = (description?: string | null) => {
        if ((description || "").trim() === "__priority:focus") return 0;
        if ((description || "").trim() === "__priority:quick") return 2;
        return 1;
      };
      const sortedTodos = [...(todosData || [])].sort((a, b) => {
        const pa = getPriorityOrder(a.description);
        const pb = getPriorityOrder(b.description);
        if (pa !== pb) return pa - pb;
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      });
      setAllTodos(sortedTodos);
      setTodos(sortedTodos.slice(0, 5));
      setNotTodos((notTodosData || []).map(item => ({
        ...item,
        status: item.status as "pending" | "avoided" | "broken",
      })));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quick access data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTodosAndNotTodos();
      pollingIntervalRef.current = setInterval(() => {
        fetchTodosAndNotTodos();
      }, 2000);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && userId) {
        fetchTodosAndNotTodos();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [userId]);

  const toggleTodo = async (task: Task) => {
    const newCompleted = !task.is_completed;

    try {
      const { error } = await supabase
        .from("daily_tasks")
        .update({ 
          is_completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null,
        })
        .eq("id", task.id);

      if (error) throw error;

      setTodos(todos.map(t => 
        t.id === task.id ? { ...t, is_completed: newCompleted } : t
      ));
      setAllTodos(allTodos.map(t => 
        t.id === task.id ? { ...t, is_completed: newCompleted } : t
      ));
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("daily_planning.could_not_update_task"),
        variant: "destructive",
      });
    }
  };

  const toggleNotTodoStatus = async (item: NotToDoItem) => {
    const newStatus = item.status === "avoided" ? "pending" : "avoided";

    try {
      const { error } = await supabase
        .from("not_to_do_items")
        .update({ status: newStatus })
        .eq("id", item.id);

      if (error) throw error;

      setNotTodos(notTodos.map(i => 
        i.id === item.id ? { ...i, status: newStatus } : i
      ));

      if (newStatus === "avoided") {
        toast({
          title: t("daily_planning.great_job"),
          description: t("daily_planning.avoided_negative"),
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("daily_planning.could_not_update_status"),
        variant: "destructive",
      });
    }
  };

  const isEmpty = allTodos.length === 0 && notTodos.length === 0;

  if (loading) return null;

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-border/60 dark:border-white/5 bg-card dark:bg-[#1a212e]/50 p-5 card-glow dark:card-lift">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 shadow-soft">
            <ListTodo className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-1">{t("dashboard.start_daily_plan")}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("dashboard.start_daily_plan_desc")}
          </p>
          <Button
            onClick={() => navigate("/daily-planning")}
            className="w-full"
          >
            {t("dashboard.open_daily_planning")}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const completedTodos = allTodos.filter(t => t.is_completed).length;
  const avoidedItems = notTodos.filter(i => i.status === "avoided").length;
  const totalItems = allTodos.length + notTodos.length;
  const completedItems = completedTodos + avoidedItems;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border/60 dark:border-white/5 bg-card dark:bg-[#1a212e]/50 p-5 card-glow dark:card-lift relative overflow-hidden">
      <div className="relative z-10">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 shadow-soft shrink-0">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
              <h2 className="truncate text-base font-semibold text-foreground">{t("daily_planning.title")}</h2>
              <button
                onClick={() => navigate("/daily-planning")}
                className="flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 font-medium shrink-0 ml-1 transition-colors"
              >
                {t("common.view_all", "Vedi tutto")}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="text-xs font-medium text-muted-foreground shrink-0">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* To-Do List */}
          {todos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-between">
                <span>{t("dashboard.todo_list")}</span>
                <span className="text-xs">
                  {completedTodos}/{allTodos.length}
                </span>
              </h3>
              <div className="space-y-2">
                {todos.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTodo(task)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      task.is_completed
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/50 hover:bg-muted border border-transparent"
                    }`}
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span
                      className={`flex-1 text-left text-sm font-medium truncate ${
                        task.is_completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {shouldTranslateContent ? display(task.title) : task.title}
                    </span>
                  </button>
                ))}
              </div>
              {allTodos.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  {t("today_overview.more_tasks", { count: allTodos.length - 5, defaultValue: `+${allTodos.length - 5} altre task` })}
                </p>
              )}
            </div>
          )}

          {/* Not-To-Do List */}
          {notTodos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-between">
                <span>{t("dashboard.not_todo_list")}</span>
                <span className="text-xs">
                  {avoidedItems}/{notTodos.length}
                </span>
              </h3>
              <div className="space-y-2">
                {notTodos.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleNotTodoStatus(item)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      item.status === "avoided"
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/50 hover:bg-muted border border-transparent"
                    }`}
                  >
                    {item.status === "avoided" ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={`flex-1 text-left text-sm font-medium truncate ${
                      item.status === "avoided"
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}>
                      {shouldTranslateContent ? display(item.title) : item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
