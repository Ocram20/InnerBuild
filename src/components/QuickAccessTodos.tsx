import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ListTodo, ShieldAlert, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { useTranslation } from "react-i18next";

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
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
  const [todos, setTodos] = useState<Task[]>([]);
  const [notTodos, setNotTodos] = useState<NotToDoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useTranslation();

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const targetDate = format(tomorrow, "yyyy-MM-dd");

  const fetchTodosAndNotTodos = async () => {
    if (!userId) return;
    
    try {
      const { data: todosData, error: todosError } = await supabase
        .from("daily_tasks")
        .select("id, title, is_completed")
        .eq("user_id", userId)
        .eq("target_date", targetDate)
        .order("created_at", { ascending: true })
        .limit(5);

      const { data: notTodosData, error: notTodosError } = await supabase
        .from("not_to_do_items")
        .select("id, title, status")
        .eq("user_id", userId)
        .eq("target_date", targetDate)
        .order("created_at", { ascending: true })
        .limit(5);

      if (todosError) console.error("Error fetching todos:", todosError);
      if (notTodosError) console.error("Error fetching not-to-do items:", notTodosError);

      setTodos(todosData || []);
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
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("dashboard.could_not_update"),
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
          title: t("dashboard.great_job"),
          description: t("dashboard.avoided_behavior"),
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("dashboard.could_not_update_status"),
        variant: "destructive",
      });
    }
  };

  const isEmpty = todos.length === 0 && notTodos.length === 0;

  if (loading) return null;

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
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

  const completedTodos = todos.filter(t => t.is_completed).length;
  const avoidedItems = notTodos.filter(i => i.status === "avoided").length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <ListTodo className="h-5 w-5 text-primary" />
          </div>
          <h2 className="truncate text-base font-semibold text-foreground">{t("dashboard.daily_planning")}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/daily-planning")}
          className="h-8 self-start text-muted-foreground hover:text-foreground sm:self-auto"
        >
          {t("common.view_all")}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* To-Do List */}
        {todos.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-between">
              <span>{t("dashboard.todo_list")}</span>
              <span className="text-xs">
                {completedTodos}/{todos.length}
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
                    {task.title}
                  </span>
                </button>
              ))}
            </div>
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
                  title={item.status === "avoided" ? "Mark as pending" : "Mark as avoided"}
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
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View Full Planning Button */}
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => navigate("/daily-planning")}
        >
          <ChevronRight className="mr-2 h-4 w-4" />
          {t("dashboard.edit_full_plan")}
        </Button>
      </div>
    </div>
  );
}
