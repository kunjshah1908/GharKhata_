import { useState } from "react";
import { Plus, StickyNote, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFamily } from "@/contexts/FamilyContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Notes = () => {
  const { currentFamily } = useFamily();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", currentFamily?.id],
    queryFn: async () => {
      if (!currentFamily?.id) return [];
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("family_id", currentFamily.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!currentFamily?.id,
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (newNote: { title: string; content: string }) => {
      if (!currentFamily?.id) throw new Error("No family selected");

      const { data, error } = await supabase
        .from("notes")
        .insert({
          family_id: currentFamily.id,
          title: newNote.title,
          content: newNote.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", currentFamily?.id] });
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create note",
        variant: "destructive",
      });
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", currentFamily?.id] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const handleCreateNote = async () => {
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    await createMutation.mutateAsync({ title, content });
    setIsDialogOpen(false);
    setTitle("");
    setContent("");
  };

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please select or create a family first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Family Notes</h1>
          <p className="text-muted-foreground">Keep track of important family financial notes</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 mr-2 animate-spin" />
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(note.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                  </Button>
                </div>
                <CardDescription>
                  {new Date(note.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <StickyNote className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No Notes Yet</p>
            <p className="text-muted-foreground text-center mb-4">
              Start by creating your first note
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Note
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Note Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Note</AlertDialogTitle>
            <AlertDialogDescription>
              Add a note for your family to reference
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Monthly Budget Meeting Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your note here..."
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateNote} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notes;
