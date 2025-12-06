"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { useIsMobile } from "@/hooks/use-mobile";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/lib/goals-types";

type LoadingStates = {
  [key: string]: boolean;
};

export function GoalsTableView({ goals }: { goals: Goal[] }) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const isMobile = useIsMobile();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = (goal: Goal) => {
    if (goal.targetAmount === 0) return 0;
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getStatus = (goal: Goal) => {
    const progress = calculateProgress(goal);
    if (progress >= 100) return { label: "Completed", variant: "default" as const };
    if (!goal.isActive) return { label: "Inactive", variant: "secondary" as const };
    return { label: "Active", variant: "outline" as const };
  };

  const handleDelete = async (
    e: React.MouseEvent,
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

  const handleEdit = (e: React.MouseEvent, goalId: string) => {
    e.stopPropagation();
    router.push(`/goals/edit/${goalId}`);
  };

  const handleRowClick = (goalId: string) => {
    router.push(`/goals/${goalId}`);
  };

  if (!goals || goals.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-muted-foreground">
          No goals found. Add your first goal to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {!isMobile && <TableHead className="w-12">Icon</TableHead>}
            <TableHead>Name</TableHead>
            {!isMobile && <TableHead>Target Amount</TableHead>}
            {!isMobile && <TableHead>Current Amount</TableHead>}
            <TableHead>Progress</TableHead>
            {!isMobile && <TableHead>Target Date</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goals.map((goal) => {
            const progress = calculateProgress(goal);
            const status = getStatus(goal);
            return (
              <TableRow
                key={goal.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => handleRowClick(goal.id)}
              >
                {!isMobile && (
                  <TableCell>
                    {goal.icon && (
                      <span className="text-2xl" role="img" aria-label="Goal icon">
                        {goal.icon}
                      </span>
                    )}
                  </TableCell>
                )}
                <TableCell className="font-medium">{goal.name}</TableCell>
                {!isMobile && (
                  <TableCell>{formatCurrency(goal.targetAmount)}</TableCell>
                )}
                {!isMobile && (
                  <TableCell>{formatCurrency(goal.currentAmount)}</TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[150px]">
                    <Progress value={progress} className="flex-1" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                {!isMobile && (
                  <TableCell>{formatDate(goal.targetDate)}</TableCell>
                )}
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleEdit(e, goal.id)}
                      disabled={!!loadingStates[`edit-${goal.id}`]}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(e, goal.id, goal.name)}
                      disabled={!!loadingStates[`delete-${goal.id}`]}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

