"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Calendar, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Goal } from "@/lib/goals-types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function GoalDetailView({ goal }: { goal: Goal }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const targetAmount = Number(goal.targetAmount);
  const currentAmount = Number(goal.currentAmount);
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const progressPercentage = Math.min(
    targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0,
    100
  );

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysRemaining = () => {
    const today = new Date();
    const target = new Date(goal.targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();
  const isCompleted = progressPercentage >= 100;
  const isOverdue = daysRemaining < 0 && !isCompleted;

  const handleEdit = () => {
    router.push(`/goals/edit/${goal.id}`);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${goal.name}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Goal deleted successfully");
        router.push("/goals");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete goal");
      }
    } catch (error) {
      toast.error("Failed to delete goal");
    } finally {
      setIsDeleting(false);
    }
  };

  const cardBgColor = goal.color || undefined;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {goal.icon && (
            <span className="text-4xl" role="img" aria-label="Goal icon">
              {goal.icon}
            </span>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{goal.name}</h1>
            <Badge
              variant={isCompleted ? "default" : goal.isActive ? "outline" : "secondary"}
              className="mt-2"
            >
              {isCompleted ? "Completed" : goal.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash size={16} className="mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <Card
        className={cn(cardBgColor && "border-0")}
        style={cardBgColor ? { backgroundColor: cardBgColor } : undefined}
      >
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm text-muted-foreground">Current Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(currentAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(targetAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Remaining Amount Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Remaining Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(remainingAmount)}</p>
          </CardContent>
        </Card>

        {/* Target Date Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Target Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{formatDate(goal.targetDate)}</p>
            {isOverdue && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Overdue by {Math.abs(daysRemaining)} days
              </p>
            )}
            {!isOverdue && !isCompleted && daysRemaining >= 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {daysRemaining} days remaining
              </p>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={isCompleted ? "default" : goal.isActive ? "outline" : "secondary"}
              className="text-lg px-3 py-1"
            >
              {isCompleted ? "Completed" : goal.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {goal.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{goal.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

