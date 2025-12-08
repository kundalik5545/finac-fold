"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { todoFormSchema } from "@/lib/schema/todo-schema";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TodoWithRelations, TodoCategory, TodoTag } from "@/lib/types/todo-types";
import { createTodo, updateTodo } from "@/action/todo";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TodoFormProps {
  initialData?: TodoWithRelations;
  userId: string;
  categories: TodoCategory[];
  tags: TodoTag[];
}

const priorities = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

export function TodoForm({
  initialData,
  userId,
  categories,
  tags,
}: TodoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags?.map((t) => t.id) || []
  );

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<z.infer<typeof todoFormSchema>>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || null,
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate).toISOString().slice(0, 16)
        : null,
      priority: initialData?.priority || "MEDIUM",
      completed: initialData?.completed || false,
      categoryId: initialData?.categoryId || null,
      tagIds: initialData?.tags?.map((t) => t.id) || [],
    },
  });

  const onSubmit = async (data: z.infer<typeof todoFormSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = {
        ...data,
        tagIds: selectedTags,
      };

      if (isEditing) {
        await updateTodo(initialData.id, formData, userId);
        toast.success("Todo updated successfully");
      } else {
        await createTodo(formData, userId);
        toast.success("Todo created successfully");
      }

      router.push("/todo");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditing ? "update" : "create"} todo`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter todo title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter todo description (optional)"
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date & Time</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.priority && (
                  <p className="text-sm text-destructive">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="space-y-2">
                {tags.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={selectedTags.includes(tag.id)}
                            onCheckedChange={() => handleTagToggle(tag.id)}
                          />
                          <label
                            htmlFor={`tag-${tag.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {tag.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedTags.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {selectedTags.map((tagId) => {
                          const tag = tags.find((t) => t.id === tagId);
                          return (
                            tag && (
                              <Badge key={tagId} variant="secondary">
                                {tag.name}
                                <button
                                  type="button"
                                  onClick={() => handleTagToggle(tagId)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X size={14} />
                                </button>
                              </Badge>
                            )
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tags available. Create tags in the categories & tags management
                    section.
                  </p>
                )}
              </div>
            </div>

            {/* Completed Checkbox (only for editing) */}
            {isEditing && (
              <div className="flex items-center space-x-2">
                <Controller
                  name="completed"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="completed"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="completed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Mark as completed
                </Label>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Todo"
                    : "Create Todo"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

