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
import { recurringTodoFormSchema } from "@/lib/schema/todo-schema";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { TodoCategory, TodoTag } from "@/lib/types/todo-types";
import { createRecurringTodo } from "@/action/todo";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface RecurringTodoFormProps {
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

const frequencies = [
  { label: "Daily", value: "DAILY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
];

export function RecurringTodoForm({
  userId,
  categories,
  tags,
}: RecurringTodoFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<z.infer<typeof recurringTodoFormSchema>>({
    resolver: zodResolver(recurringTodoFormSchema),
    defaultValues: {
      title: "",
      description: null,
      frequency: "DAILY",
      interval: 1,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: null,
      priority: "MEDIUM",
      categoryId: null,
      tagIds: [],
    },
  });

  const onSubmit = async (data: z.infer<typeof recurringTodoFormSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = {
        ...data,
        tagIds: selectedTags,
      };

      await createRecurringTodo(formData, userId);
      toast.success("Recurring todo created successfully");
      router.push("/todo");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create recurring todo");
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

  const frequency = watch("frequency");
  const interval = watch("interval");

  const getFrequencyDescription = () => {
    if (!interval || interval < 1) return "";
    const unit =
      interval === 1
        ? frequency.toLowerCase().slice(0, -2)
        : frequency.toLowerCase();
    return `Repeats every ${interval === 1 ? "" : interval + " "}${unit}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Recurrence Pattern Section */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <h3 className="font-semibold">Recurrence Pattern</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="frequency">
                    Frequency <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="frequency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.frequency && (
                    <p className="text-sm text-destructive">
                      {errors.frequency.message}
                    </p>
                  )}
                </div>

                {/* Interval */}
                <div className="space-y-2">
                  <Label htmlFor="interval">
                    Interval <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    placeholder="1"
                    {...register("interval", { valueAsNumber: true })}
                  />
                  {errors.interval && (
                    <p className="text-sm text-destructive">
                      {errors.interval.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Frequency Description */}
              {getFrequencyDescription() && (
                <p className="text-sm text-muted-foreground">
                  {getFrequencyDescription()}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Start Date & Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...register("startDate")}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                {/* End Date (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time (Optional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register("endDate")}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Todo Details Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Todo Details</h3>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
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
                      No tags available. Create tags in the management section.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Recurring Todo"}
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

