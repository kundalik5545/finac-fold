"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Check, X } from "lucide-react";
import { TodoTag } from "@/lib/todo-types";
import { createTag, deleteTag } from "@/action/todo";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TagsManagerProps {
  initialTags: TodoTag[];
  userId: string;
}

export function TagsManager({ initialTags, userId }: TagsManagerProps) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createTag({ name: newTagName }, userId);
      setTags([...tags, created]);
      setNewTagName("");
      setIsAdding(false);
      toast.success("Tag created successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteTag(id, userId);
      setTags(tags.filter((tag) => tag.id !== id));
      toast.success("Tag deleted successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tag");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tags</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding || isSubmitting}
          >
            <Plus size={16} className="mr-2" />
            Add Tag
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add New Tag Form */}
          {isAdding && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-tag-name">Tag Name</Label>
                <Input
                  id="new-tag-name"
                  placeholder="Enter tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddTag();
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddTag}
                  disabled={isSubmitting}
                >
                  <Check size={16} className="mr-2" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTagName("");
                  }}
                  disabled={isSubmitting}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Tags List */}
          {tags.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tags yet. Add your first tag to organize your todos.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm flex items-center gap-2"
                >
                  {tag.name}
                  <button
                    onClick={() => handleDeleteTag(tag.id, tag.name)}
                    disabled={isSubmitting}
                    className="hover:text-destructive transition-colors"
                  >
                    <Trash size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

