import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, FileText, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [saving, setSaving] = useState(false);

  // Check admin role
  useEffect(() => {
    const check = async () => {
      if (!user) { setChecking(false); return; }
      try {
        const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
        setIsAdmin(!!data);
      } catch { setIsAdmin(false); }
      setChecking(false);
    };
    check();
  }, [user]);

  // Fetch all articles (including unpublished via service - admin has RLS access)
  const fetchArticles = async () => {
    setLoadingArticles(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false });
    if (!error && data) setArticles(data as Article[]);
    setLoadingArticles(false);
  };

  useEffect(() => {
    if (isAdmin) fetchArticles();
  }, [isAdmin]);

  const handleSave = async () => {
    if (!editingArticle?.title || !editingArticle?.content || !editingArticle?.summary) {
      toast({ title: "Error", description: "Fill in all fields", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title: editingArticle.title,
      content: editingArticle.content,
      summary: editingArticle.summary,
      title_it: editingArticle.title_it || "",
      content_it: editingArticle.content_it || "",
      summary_it: editingArticle.summary_it || "",
      is_published: editingArticle.is_published ?? true,
      published_at: editingArticle.published_at || new Date().toISOString(),
    };

    let error;
    if (editingArticle.id) {
      ({ error } = await supabase.from("articles").update(payload).eq("id", editingArticle.id));
    } else {
      ({ error } = await supabase.from("articles").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ Saved" });
      setEditingArticle(null);
      fetchArticles();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✓ Deleted" });
      fetchArticles();
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Access Denied</p>
          <p className="text-sm text-muted-foreground mb-4">You need admin privileges to access this page.</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Editing form
  if (editingArticle) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setEditingArticle(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">{editingArticle.id ? "Edit Article" : "New Article"}</h1>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* English Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">🇬🇧 English</h2>
            <div>
              <Label>Title</Label>
              <Input
                value={editingArticle.title || ""}
                onChange={e => setEditingArticle(p => ({ ...p, title: e.target.value }))}
                placeholder="Article title"
              />
            </div>
            <div>
              <Label>Summary</Label>
              <Textarea
                value={editingArticle.summary || ""}
                onChange={e => setEditingArticle(p => ({ ...p, summary: e.target.value }))}
                placeholder="Short summary..."
                rows={2}
              />
            </div>
            <div>
              <Label>Content (Markdown supported)</Label>
              <Textarea
                value={editingArticle.content || ""}
                onChange={e => setEditingArticle(p => ({ ...p, content: e.target.value }))}
                placeholder="Full article content..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Italian Section */}
          <div className="space-y-4 border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">🇮🇹 Italiano</h2>
            <div>
              <Label>Titolo</Label>
              <Input
                value={editingArticle.title_it || ""}
                onChange={e => setEditingArticle(p => ({ ...p, title_it: e.target.value }))}
                placeholder="Titolo dell'articolo"
              />
            </div>
            <div>
              <Label>Riassunto</Label>
              <Textarea
                value={editingArticle.summary_it || ""}
                onChange={e => setEditingArticle(p => ({ ...p, summary_it: e.target.value }))}
                placeholder="Breve riassunto..."
                rows={2}
              />
            </div>
            <div>
              <Label>Contenuto (Markdown supportato)</Label>
              <Textarea
                value={editingArticle.content_it || ""}
                onChange={e => setEditingArticle(p => ({ ...p, content_it: e.target.value }))}
                placeholder="Contenuto completo dell'articolo..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={editingArticle.is_published ?? true}
              onCheckedChange={v => setEditingArticle(p => ({ ...p, is_published: v }))}
            />
            <Label>Published</Label>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Article"}
          </Button>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  // Articles list
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Admin — Articles</h1>
          </div>
          <Button size="sm" onClick={() => setEditingArticle({ is_published: true })}>
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-3">
        {loadingArticles ? (
          <LoadingSpinner />
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No articles yet. Create your first one!</p>
          </div>
        ) : (
          articles.map(article => (
            <Card key={article.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm leading-tight">{article.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {article.is_published ? "Published" : "Draft"} · {new Date(article.published_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingArticle(article)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete article?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(article.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
              </CardContent>
            </Card>
          ))
        )}
      </main>
      <BottomNavigation />
    </div>
  );
}
