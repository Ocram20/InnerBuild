import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Plus, Pencil, Trash2, FileText, 
  BookOpen, Save, LayoutDashboard, Upload, Image as ImageIcon,
  Loader2, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { untypedTable } from "@/integrations/supabase/untyped-client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import LoadingSpinner from "@/components/LoadingSpinner";
import BottomNavigation from "@/components/BottomNavigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  title_it: string;
  content_it: string;
  summary_it: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
  category: "article" | "guide";
  cover_image_url?: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { hasAdminRole, loading: checkingAdmin } = useAdminAccess();
  
  const [activeTab, setActiveTab] = useState<"articles" | "guides">("articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all content
  const fetchContent = async () => {
    setLoadingArticles(true);
    const { data, error } = await untypedTable("articles")
      .select("*")
      .order("published_at", { ascending: false });
    if (!error && data) setArticles(data as Article[]);
    setLoadingArticles(false);
  };

  useEffect(() => {
    if (hasAdminRole) fetchContent();
  }, [hasAdminRole]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast({ title: "Errore", description: "Per favore carica solo immagini", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-covers')
        .getPublicUrl(filePath);

      setEditingArticle(prev => ({ ...prev, cover_image_url: publicUrl }));
      toast({ title: "✓ Immagine caricata" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Errore caricamento", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editingArticle?.title || !editingArticle?.content || !editingArticle?.summary) {
      toast({ title: "Errore", description: "Compila tutti i campi obbligatori", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title: editingArticle.title,
      content: editingArticle.content,
      summary: editingArticle.summary,
      // Legacy alignment
      title_it: editingArticle.title,
      content_it: editingArticle.content,
      summary_it: editingArticle.summary,
      is_published: editingArticle.is_published ?? true,
      published_at: editingArticle.published_at || new Date().toISOString(),
      category: editingArticle.category || "article",
      cover_image_url: editingArticle.cover_image_url || null,
    };

    let error;
    if (editingArticle.id) {
      ({ error } = await untypedTable("articles").update(payload).eq("id", editingArticle.id));
    } else {
      ({ error } = await untypedTable("articles").insert(payload));
    }

    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ Salvato con successo" });
      setEditingArticle(null);
      fetchContent();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await untypedTable("articles").delete().eq("id", id);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ Eliminato" });
      fetchContent();
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hasAdminRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Accesso Negato</p>
          <p className="text-sm text-muted-foreground mb-4">Solo gli amministratori possono accedere a questa pagina.</p>
          <Button onClick={() => navigate("/dashboard")}>Torna alla Dashboard</Button>
        </div>
      </div>
    );
  }

  // Editing form
  if (editingArticle) {
    return (
      <div className="min-h-screen bg-background pb-app-main">
        <header className="sticky top-0 safe-area-header z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setEditingArticle(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">
              {editingArticle.id ? "Modifica" : "Nuovo"} {editingArticle.category === "guide" ? "Guida" : "Articolo"}
            </h1>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo di Contenuto</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  value={editingArticle.category || "article"}
                  onChange={e => setEditingArticle(p => ({ ...p, category: e.target.value as "article" | "guide" }))}
                >
                  <option value="article">Articolo (Opinioni di vita)</option>
                  <option value="guide">Guida (Scientifica/Vera)</option>
                </select>
              </div>
              
              <div>
                <Label>Immagine di Copertina</Label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {editingArticle.cover_image_url ? (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border group">
                      <img 
                        src={editingArticle.cover_image_url} 
                        className="w-full h-full object-cover" 
                        alt="Cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setEditingArticle(p => ({ ...p, cover_image_url: "" }))}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full h-24 border-dashed flex flex-col gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          <span className="text-xs">Carica Immagine</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label>Titolo</Label>
                <Input
                  value={editingArticle.title || ""}
                  onChange={e => setEditingArticle(p => ({ ...p, title: e.target.value }))}
                  placeholder="Titolo del contenuto"
                  className="text-lg font-medium"
                />
              </div>
              <div>
                <Label>Riassunto (mostrato nella lista)</Label>
                <Textarea
                  value={editingArticle.summary || ""}
                  onChange={e => setEditingArticle(p => ({ ...p, summary: e.target.value }))}
                  placeholder="Una breve descrizione del contenuto..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Contenuto Completo (Markdown)</Label>
                <Textarea
                  value={editingArticle.content || ""}
                  onChange={e => setEditingArticle(p => ({ ...p, content: e.target.value }))}
                  placeholder="Scrivi qui il corpo principale..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={editingArticle.is_published ?? true}
                onCheckedChange={v => setEditingArticle(p => ({ ...p, is_published: v }))}
              />
              <Label htmlFor="published">Pubblicato (visibile agli utenti)</Label>
            </div>
            <Button onClick={handleSave} disabled={saving || isUploading} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvataggio..." : "Salva Contenuto"}
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const filtered = articles.filter(a => (activeTab === "guides" ? a.category === "guide" : a.category !== "guide"));

  return (
    <div className="min-h-screen bg-background pb-app-main">
      <header className="sticky top-0 safe-area-header z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Amministrazione Learn</h1>
          </div>
          <Button size="sm" onClick={() => setEditingArticle({ is_published: true, category: activeTab === "guides" ? "guide" : "article" })}>
            <Plus className="h-4 w-4 mr-1" /> Nuovo
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Articoli (Opinioni)</span>
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Guide (Scientifiche)</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 space-y-3">
            {loadingArticles ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                {activeTab === "guides" ? <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" /> : <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />}
                <p className="text-muted-foreground">Nessun contenuto in questa categoria.</p>
                <Button variant="link" onClick={() => setEditingArticle({ is_published: true, category: activeTab === "guides" ? "guide" : "article" })}>
                  Crea il primo ora
                </Button>
              </div>
            ) : (
              filtered.map(article => (
                <Card key={article.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${article.category === "guide" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                            {article.category === "guide" ? "Guida" : "Articolo"}
                          </span>
                          {!article.is_published && (
                            <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              Bozza
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-base line-clamp-1">{article.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pubblicato: {new Date(article.published_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingArticle(article)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminare questo contenuto?</AlertDialogTitle>
                              <AlertDialogDescription>Questa azione è irreversibile e il contenuto sparirà per tutti gli utenti.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Elimina Definitivamente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <BottomNavigation />
    </div>
  );
}
