import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Edit2, Check, X, ListTodo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { cleanupExpiredDailyPlanningItems } from "@/lib/dailyPlanningCleanup";
import { useDynamicTranslation } from "@/hooks/useDynamicTranslation";

interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  original_language?: string | null;
}

type TaskPriority = "focus" | "standard" | "quick";

interface ToDoSectionProps {
  userId: string | undefined;
  targetDate: string;
  planningMode: "today" | "tomorrow";
}

// suggestions now pulled from translations inside component

export function ToDoSection({ userId, targetDate, planningMode }: ToDoSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("standard");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const dayLabel = planningMode === "today" ? t("activity_calendar.legend.today") : t("daily_planning.tomorrow");
  const dayLabelLower = dayLabel.charAt(0).toLowerCase() + dayLabel.slice(1);
  const SUGGESTED_TASKS = t("todo_section.suggested_tasks", { returnObjects: true }) as string[];
  
  const rawTaskTitles = useMemo(() => tasks.map((task) => task.title).filter((v): v is string => typeof v === "string" && v.trim().length > 0), [tasks]);
  const { display } = useDynamicTranslation(rawTaskTitles, tasks[0]?.original_language);
  const priorityCycle: TaskPriority[] = ["focus", "standard", "quick"];

  const getPriority = (task: Pick<Task, "description">): TaskPriority => {
    const raw = (task.description || "").trim();
    if (raw === "__priority:focus") return "focus";
    if (raw === "__priority:quick") return "quick";
    return "standard";
  };

  const encodePriority = (priority: TaskPriority): string => `__priority:${priority}`;
  const priorityOrder: Record<TaskPriority, number> = { focus: 0, standard: 1, quick: 2 };
  const priorityAccent: Record<TaskPriority, string> = {
    focus: "border-l-[#ff7f6e]",
    standard: "border-l-primary",
    quick: "border-l-zinc-500",
  };

  const priorityTitle = (priority: TaskPriority) => {
    if (priority === "focus") {
      return t("todo_section.priority_focus_title");
    }
    if (priority === "quick") {
      return t("todo_section.priority_quick_title");
    }
    return t("todo_section.priority_standard_title");
  };

  const priorityHint = (priority: TaskPriority) => {
    if (priority === "focus") {
      return t("todo_section.priority_focus_hint");
    }
    if (priority === "quick") {
      return t("todo_section.priority_quick_hint");
    }
    return t("todo_section.priority_standard_hint");
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const pa = priorityOrder[getPriority(a)];
      const pb = priorityOrder[getPriority(b)];
      if (pa !== pb) return pa - pb;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [tasks]);

  const focusTasks = sortedTasks.filter((task) => getPriority(task) === "focus");
  const standardTasks = sortedTasks.filter((task) => getPriority(task) === "standard");
  const quickTasks = sortedTasks.filter((task) => getPriority(task) === "quick");

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId, targetDate]);

  const fetchTasks = async () => {
    if (!userId) return;
    await cleanupExpiredDailyPlanningItems(userId);
    
    const { data, error } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("target_date", targetDate)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data || []);
      setShowSuggestions((data || []).length === 0);
    }
    setLoading(false);
  };

  const addTask = async (title?: string) => {
    if (!userId) return;
    const taskTitle = title || newTask.trim();
    if (!taskTitle) return;
    if (newTaskPriority === "focus" && focusTasks.length >= 3) {
      toast({
        title: t("todo_section.focus_limit_title"),
        description: t("todo_section.focus_limit_desc"),
      });
      return;
    }

    const { data, error } = await supabase
      .from("daily_tasks")
      .insert({
        user_id: userId,
        title: taskTitle,
        description: encodePriority(newTaskPriority),
        target_date: targetDate,
        original_language: i18n.resolvedLanguage || i18n.language || "it",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: t("common.error"),
        description: t("todo_section.error_add"),
        variant: "destructive",
      });
    } else if (data) {
      setTasks([...tasks, data as Task]);
      setNewTask("");
      setShowSuggestions(false);
      toast({
        title: t("todo_section.task_added"),
        description: t("todo_section.plan_tomorrow", { day: dayLabelLower }),
      });
    }
  };

  const toggleTask = async (task: Task) => {
    const newCompleted = !task.is_completed;

    const { error } = await supabase
      .from("daily_tasks")
      .update({ 
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq("id", task.id);

    if (error) {
      toast({
        title: t("common.error"),
        description: t("todo_section.error_update"),
        variant: "destructive",
      });
    } else {
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, is_completed: newCompleted } : t
      ));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from("daily_tasks")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: t("common.error"),
        description: t("todo_section.error_delete"),
        variant: "destructive",
      });
    } else {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = async () => {
    if (!editingId || !editingTitle.trim()) return;

    const { error } = await supabase
      .from("daily_tasks")
      .update({ title: editingTitle.trim() })
      .eq("id", editingId);

    if (error) {
      toast({
        title: t("common.error"),
        description: t("daily_planning.could_not_edit_task"),
        variant: "destructive",
      });
    } else {
      setTasks(tasks.map(t => t.id === editingId ? { ...t, title: editingTitle.trim() } : t));
      setEditingId(null);
      setEditingTitle("");
    }
  };
  const cyclePriority = () => {
    const currentIndex = priorityCycle.indexOf(newTaskPriority);
    const next = priorityCycle[(currentIndex + 1) % priorityCycle.length];
    setNewTaskPriority(next);
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const availableSuggestions = SUGGESTED_TASKS.filter(
    s => !tasks.some(t => t.title.toLowerCase() === s.toLowerCase())
  ).slice(0, 3);

  const allTasksComplete = tasks.length > 0 && tasks.every(t => t.is_completed);

  const renderTaskRow = (task: Task) => {
    const priority = getPriority(task);
    return (
      <div
        key={task.id}
        className={`flex items-center gap-3 p-3 rounded-lg border border-l-2 transition-colors ${
          task.is_completed ? "bg-success/5 border-success/20" : "bg-muted/30 border-border/50 hover:border-border"
        } ${priorityAccent[priority]}`}
      >
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={() => toggleTask(task)}
          className="shrink-0"
        />

        {editingId === task.id ? (
          <div className="flex-1 flex gap-2">
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && saveEdit()}
              className="flex-1 h-8"
              autoFocus
            />
            <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <span className={`flex-1 ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
              {display(task.title)}
            </span>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => startEditing(task)} className="h-8 w-8">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteTask(task.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Card className={`glass shadow-card animate-slide-up ${allTasksComplete ? 'ring-2 ring-success/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className={`p-2 rounded-lg ${allTasksComplete ? 'bg-success/20' : 'bg-primary/10'}`}>
              <ListTodo className={`h-5 w-5 ${allTasksComplete ? 'text-success' : 'text-primary'}`} />
            </div>
            {t("todo_section.title", { day: dayLabelLower })}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{completedCount}</span>
            <span>/</span>
            <span>{tasks.length}</span>
          </div>
        </div>
        {tasks.length > 0 && (
          <div className="mt-3">
            <Progress value={progressPercent} className={`h-2 ${allTasksComplete ? '[&>div]:bg-success' : ''}`} />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {Math.round(progressPercent)}% {t("todo_section.tasks_done")}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showSuggestions && availableSuggestions.length > 0 && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t("todo_section.quick_add_suggestions")}
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => addTask(suggestion)}
                  className="text-xs h-7"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder={t("todo_section.add_task")}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={cyclePriority}
            className="shrink-0 min-w-[124px] text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            title={priorityHint(newTaskPriority)}
          >
            {priorityTitle(newTaskPriority)}
          </Button>
          <Button onClick={() => addTask()} size="icon" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-4"><LoadingSpinner /></div>
          ) : sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>{t("todo_section.no_tasks")}</p>
              <p className="text-sm">{t("todo_section.add_goals", { day: dayLabelLower })}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                    {priorityTitle("focus")}
                  </p>
                  <span className="text-[11px] text-muted-foreground/70">{focusTasks.length}/3</span>
                </div>
                <div className="space-y-2 border-t border-border/40 pt-2">
                  {focusTasks.length > 0 ? (
                    focusTasks.map(renderTaskRow)
                  ) : (
                    <p className="text-xs text-muted-foreground/70">{t("todo_section.empty_focus")}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                  {priorityTitle("standard")}
                </p>
                <div className="space-y-2 border-t border-border/40 pt-2">
                  {standardTasks.length > 0 ? (
                    standardTasks.map(renderTaskRow)
                  ) : (
                    <p className="text-xs text-muted-foreground/70">{t("todo_section.empty_standard")}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                  {priorityTitle("quick")}
                </p>
                <div className="space-y-2 border-t border-border/40 pt-2">
                  {quickTasks.length > 0 ? (
                    quickTasks.map(renderTaskRow)
                  ) : (
                    <p className="text-xs text-muted-foreground/70">{t("todo_section.empty_quick")}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}