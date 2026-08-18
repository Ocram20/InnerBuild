import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, ShieldX, ShieldCheck, ShieldAlert, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot, DraggableRubric } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";
import { cleanupExpiredDailyPlanningItems } from "@/lib/dailyPlanningCleanup";
import { useDynamicTranslation } from "@/hooks/useDynamicTranslation";
import { useMemo } from "react";

interface NotToDoItem {
  id: string;
  title: string;
  status: "pending" | "avoided" | "broken";
  log_id?: string | null;
  original_language?: string | null;
}

interface NotToDoSectionProps {
  userId: string | undefined;
  targetDate: string;
  planningMode: "today" | "tomorrow";
}

// suggestion items will come from translations
const SUGGESTED_NOT_TO_DO_KEY = "not_to_do_section.suggested_items";


export function NotToDoSection({ userId, targetDate, planningMode }: NotToDoSectionProps) {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<NotToDoItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const dayLabel = planningMode === "today" ? t("activity_calendar.legend.today") : t("daily_planning.tomorrow");
  const dayLabelLower = dayLabel.charAt(0).toLowerCase() + dayLabel.slice(1);
  
  const rawItemTitles = useMemo(() => items.map((item) => item.title).filter((v): v is string => typeof v === "string" && v.trim().length > 0), [items]);
  // We take the first item's original_language as a representative for the batch, 
  // or we could handle them individually, but since it's a section, usually they share the same origin.
  // Actually, useDynamicTranslation takes one originalLanguage.
  const { display } = useDynamicTranslation(rawItemTitles, items[0]?.original_language);
  useEffect(() => {
    if (userId) {
      fetchItems();
    }
  }, [userId, targetDate]);

  const fetchItems = async () => {
    if (!userId) return;
    await cleanupExpiredDailyPlanningItems(userId);
    
    const { data: itemsData, error: itemsError } = await untypedTable("not_to_do_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    const { data: logsData, error: logsError } = await untypedTable("not_to_do_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", targetDate);

    if (itemsError) {
      console.error("Error fetching not-to-do items:", itemsError);
    } else {
      const typedData: NotToDoItem[] = (itemsData || []).map((item: any) => {
        const log = logsData?.find((l: any) => l.not_to_do_id === item.id || l.item_id === item.id);
        return {
          id: item.id,
          title: item.title,
          status: log ? (log.status as "avoided" | "broken" | "pending") : "pending",
          log_id: log ? log.id : null,
          original_language: item.original_language,
        };
      });
      setItems(typedData);
      setShowSuggestions(typedData.length === 0);
    }
    setLoading(false);
  };

  const addItem = async (title?: string) => {
    if (!userId) return;
    const itemTitle = title || newItem.trim();
    if (!itemTitle) return;

    const { data, error } = await untypedTable("not_to_do_items")
      .insert({
        user_id: userId,
        title: itemTitle,
        is_active: true,
        original_language: i18n.resolvedLanguage || i18n.language || "it",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: t("common.error"),
        description: t("not_to_do_section.error_add"),
        variant: "destructive",
      });
    } else if (data) {
      setItems([...items, { 
        id: data.id, 
        title: data.title, 
        status: "pending", 
        log_id: null,
        original_language: data.original_language
      }]);
      setNewItem("");
      setShowSuggestions(false);
      toast({
        title: t("not_to_do_section.item_added"),
        description: t("not_to_do_section.avoid_behavior", { day: dayLabelLower }),
      });
    }
  };

  const updateStatus = async (item: NotToDoItem, newStatus: "avoided" | "broken") => {
    let error = null;
    let newLogId = item.log_id;

    if (item.log_id) {
      const res = await untypedTable("not_to_do_logs")
        .update({ status: newStatus })
        .eq("id", item.log_id)
        .select()
        .single();
      error = res.error;
      if (res.data) newLogId = res.data.id;
    } else {
      // Check if a log already exists for this not_to_do item on this target date to prevent 409 Conflict
      const { data: existingLog } = await untypedTable("not_to_do_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("not_to_do_id", item.id)
        .eq("log_date", targetDate)
        .maybeSingle();

      if (existingLog) {
        const res = await untypedTable("not_to_do_logs")
          .update({ status: newStatus })
          .eq("id", existingLog.id)
          .select()
          .single();
        error = res.error;
        if (res.data) newLogId = res.data.id;
      } else {
        const res = await untypedTable("not_to_do_logs")
          .insert({
            not_to_do_id: item.id,
            user_id: userId,
            log_date: targetDate,
            status: newStatus,
          })
          .select()
          .single();
        error = res.error;
        if (res.data) newLogId = res.data.id;
      }
    }

    if (error) {
      toast({
        title: t("common.error"),
        description: t("not_to_do_section.error_update"),
        variant: "destructive",
      });
    } else {
      setItems(items.map(i => 
        i.id === item.id ? { ...i, status: newStatus, log_id: newLogId } : i
      ));
      if (newStatus === "avoided") {
        toast({
          title: t("common.success"),
          description: t("not_to_do_section.avoid_behavior", { day: dayLabelLower }),
        });
      }
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await untypedTable("not_to_do_items")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      toast({
        title: t("common.error"),
        description: t("not_to_do_section.error_delete"),
        variant: "destructive",
      });
    } else {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    setItems(reorderedItems);
  };

  const avoidedCount = items.filter(i => i.status === "avoided").length;
  const progressPercent = items.length > 0 ? (avoidedCount / items.length) * 100 : 0;

  const allSuggestions = t(SUGGESTED_NOT_TO_DO_KEY, { returnObjects: true }) as string[];
  const availableSuggestions = allSuggestions
    .filter(s => !items.some(i => i.title.toLowerCase() === s.toLowerCase()))
    .slice(0, 3);

  const renderItemRow = (
    item: NotToDoItem,
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
            : item.status === "avoided"
              ? "bg-success/5 border-success/20"
              : item.status === "broken"
                ? "bg-destructive/5 border-destructive/20"
                : "bg-muted/30 border-border/50 hover:border-border"
        }`}
      >
        <div {...provided.dragHandleProps} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="flex-1 text-sm">{display(item.title)}</span>

        <div className="flex gap-1">
          <Button
            size="icon"
            variant={item.status === "avoided" ? "default" : "ghost"}
            onClick={() => updateStatus(item, "avoided")}
            className={`h-8 w-8 ${item.status === "avoided" ? "bg-success hover:bg-success/90" : ""}`}
            title={t("not_to_do_section.avoided")}
          >
            <ShieldCheck className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={item.status === "broken" ? "default" : "ghost"}
            onClick={() => updateStatus(item, "broken")}
            className={`h-8 w-8 ${item.status === "broken" ? "bg-destructive hover:bg-destructive/90" : ""}`}
            title={t("not_to_do_section.not_avoided")}
          >
            <ShieldAlert className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => deleteItem(item.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="glass shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-destructive/10">
              <ShieldX className="h-5 w-5 text-destructive" />
            </div>
            {t("not_to_do_section.title")}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="font-semibold text-success">{avoidedCount}</span>
            <span>/</span>
            <span>{items.length}</span>
            <span className="ml-1">{t("not_to_do_section.avoided")}</span>
          </div>
        </div>
        {items.length > 0 && (
          <div className="mt-3">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {Math.round(progressPercent)}% {t("not_to_do_section.avoided").toLowerCase()}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={t("daily_planning.what_to_avoid", { day: dayLabelLower })}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addItem()}
            className="flex-1"
          />
          <Button onClick={() => addItem()} size="icon" className="shrink-0" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {showSuggestions && availableSuggestions.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t("not_to_do_section.quick_suggestions")}
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => addItem(suggestion)}
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
            droppableId="not-to-do"
            renderClone={(provided, snapshot, rubric: DraggableRubric) => {
              const item = items[rubric.source.index];
              return item ? renderItemRow(item, provided, snapshot, { isClone: true }) : null;
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
                ) : items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShieldX className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>{t("not_to_do_section.no_behaviors")}</p>
                    <p className="text-sm">{t("not_to_do_section.add_negative_habits")}</p>
                  </div>
                ) : (
                    items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => renderItemRow(item, provided, snapshot)}
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