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

export function AddGoalForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: "",
      description: null,
      icon: null,
      color: null,
    },
    mode: "onChange",
  });

  const iconValue = watch("icon");
  const colorValue = watch("color");

  const onSubmit = async (data: z.infer<typeof goalFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Clean up the data before sending
      const cleanedData = {
        ...data,
        currentAmount: data.currentAmount || 0,
        description: data.description && data.description.trim() !== "" ? data.description.trim() : null,
        icon: data.icon && data.icon.trim() !== "" ? data.icon.trim() : null,
        color: data.color && data.color.trim() !== "" ? data.color.trim() : null,
      };

      console.log("Submitting goal data:", cleanedData);

      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Goal created successfully");
        router.push("/goals");
        router.refresh();
      } else {
        console.error("Error response:", responseData);
        toast.error(responseData.error || "Failed to create goal");
        if (responseData.details) {
          console.error("Validation details:", responseData.details);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to create goal. Please try again.");
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
                  <Label htmlFor="currentAmount">Current Amount (Optional)</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    step="0.01"
                    {...register("currentAmount", { valueAsNumber: true })}
                    placeholder="Enter current amount if any"
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
                {isSubmitting ? "Creating..." : "Create Goal"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

