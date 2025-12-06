"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Edit, Trash, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/lib/goals-types";
import { cn } from "@/lib/utils";

export function GoalCard({ goal }: { goal: Goal }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = () => {
    if (goal.targetAmount === 0) return 0;
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getStatus = () => {
    const progress = calculateProgress();
    if (progress >= 100) return { label: "Completed", variant: "default" as const };
    if (!goal.isActive) return { label: "Inactive", variant: "secondary" as const };
    return { label: "Active", variant: "outline" as const };
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    goalId: string,
    goalName: string
  ) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${goalName}"?`)) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [`delete-${goalId}`]: true }));

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Goal deleted successfully");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete goal");
      }
    } catch (error) {
      toast.error("Failed to delete goal");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`delete-${goalId}`]: false }));
    }
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>, goalId: string) => {
    e.stopPropagation();
    router.push(`/goals/edit/${goalId}`);
  };

  const handleCardClick = () => {
    router.push(`/goals/${goal.id}`);
  };

  const progress = calculateProgress();
  const status = getStatus();
  const cardBgColor = goal.color || undefined;

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-shadow",
        cardBgColor && "border-0"
      )}
      style={cardBgColor ? { backgroundColor: cardBgColor } : undefined}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {goal.icon && (
              <span className="text-3xl" role="img" aria-label="Goal icon">
                {goal.icon}
              </span>
            )}
            <h3 className="font-semibold text-lg">{goal.name}</h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handleEdit(e, goal.id)}
              disabled={!!loadingStates[`edit-${goal.id}`]}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handleDelete(e, goal.id, goal.name)}
              disabled={!!loadingStates[`delete-${goal.id}`]}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Amounts */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current</span>
            <span className="font-semibold">
              {formatCurrency(goal.currentAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target</span>
            <span className="font-semibold">
              {formatCurrency(goal.targetAmount)}
            </span>
          </div>
        </div>

        {/* Target Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Target: {formatDate(goal.targetDate)}
          </span>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2">
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

