import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Edit2, Check, X, ListTodo, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot, DraggableRubric } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";

interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  order_index?: number;
}

interface ToDoSectionProps {
  userId: string | undefined;
  targetDate: string;
  planningMode: "today" | "tomorrow";
}

// suggestions now pulled from translations inside component

export function ToDoSection({ userId, targetDate, planningMode }: ToDoSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();
  const dayLabel = planningMode === "today" ? t("activity_calendar.legend.today") : t("daily_planning.tomorrow");
  const dayLabelLower = dayLabel.charAt(0).toLowerCase() + dayLabel.slice(1);
  const SUGGESTED_TASKS = t("todo_section.suggested_tasks", { returnObjects: true }) as string[];

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId, targetDate]);

  const fetchTasks = async () => {
    if (!userId) return;
    
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

    const { data, error } = await supabase
      .from("daily_tasks")
      .insert({
        user_id: userId,
        title: taskTitle,
        target_date: targetDate,
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
      setTasks([...tasks, data]);
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const availableSuggestions = SUGGESTED_TASKS.filter(
    s => !tasks.some(t => t.title.toLowerCase() === s.toLowerCase())
  ).slice(0, 3);

  const allTasksComplete = tasks.length > 0 && tasks.every(t => t.is_completed);

  const renderTaskRow = (
    task: Task,
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    options?: { isClone?: boolean }
  ) => {
    const isClone = options?.isClone ?? false;

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        style={{
          ...provided.draggableProps.style,
          opacity: 1,
        }}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
          isClone ? "pointer-events-none" : ""
        } ${
          snapshot.isDragging
            ? "shadow-lg bg-card border-primary/30 z-50"
            : task.is_completed
              ? "bg-success/5 border-success/20"
              : "bg-muted/30 border-border/50 hover:border-border"
        }`}
      >
        <div {...provided.dragHandleProps} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
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
              {task.title}
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
        <div className="flex gap-2">
          <Input
            placeholder={t("todo_section.add_task")}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            className="flex-1"
          />
          <Button onClick={() => addTask()} size="icon" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

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

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="tasks"
            renderClone={(provided, snapshot, rubric: DraggableRubric) => {
              const task = tasks[rubric.source.index];
              return task ? renderTaskRow(task, provided, snapshot, { isClone: true }) : null;
            }}
          >
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 max-h-64 overflow-y-auto"
              >
                {loading ? (
                  <div className="flex items-center justify-center py-4"><LoadingSpinner /></div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>{t("todo_section.no_tasks")}</p>
                    <p className="text-sm">{t("todo_section.add_goals", { day: dayLabelLower })}</p>
                  </div>
                ) : (
                  tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => renderTaskRow(task, provided, snapshot)}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}