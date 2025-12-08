"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalFormSchema } from "@/lib/schema/goals-schema";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { IconPicker } from "@/components/custom-componetns/icon-picker";
import { ColorPicker } from "@/components/custom-componetns/color-picker";
import { Goal } from "@/lib/types/goals-types";

export function EditGoalForm({ goal }: { goal: Goal }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: goal.name,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      targetDate: formatDateForInput(goal.targetDate),
      description: goal.description,
      icon: goal.icon,
      color: goal.color,
    },
    mode: "onChange",
  });

  const iconValue = watch("icon");
  const colorValue = watch("color");

  const onSubmit = async (data: z.infer<typeof goalFormSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Goal updated successfully");
        router.push(`/goals/${goal.id}`);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update goal");
      }
    } catch (error) {
      toast.error("Failed to update goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    Goal Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Buy a House, Vacation Fund"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="targetAmount">
                    Target Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    {...register("targetAmount", { valueAsNumber: true })}
                    placeholder="Enter target amount"
                  />
                  {errors.targetAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.targetAmount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    step="0.01"
                    {...register("currentAmount", { valueAsNumber: true })}
                    placeholder="Enter current amount"
                  />
                  {errors.currentAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.currentAmount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="targetDate">
                    Target Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="targetDate"
                    type="date"
                    {...register("targetDate")}
                  />
                  {errors.targetDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.targetDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Customization */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Visual Customization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IconPicker
                  value={iconValue}
                  onChange={(icon) => setValue("icon", icon)}
                />
                {errors.icon && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.icon.message}
                  </p>
                )}

                <div>
                  <Label>Color (Optional)</Label>
                  <ColorPicker
                    value={colorValue}
                    onChange={(color) => setValue("color", color)}
                  />
                  {errors.color && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.color.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Add any notes about this goal"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Goal"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

