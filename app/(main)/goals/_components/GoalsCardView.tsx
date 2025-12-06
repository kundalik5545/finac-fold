"use client";

import { GoalCard } from "./GoalCard";
import { Goal } from "@/lib/goals-types";

export function GoalsCardView({ goals }: { goals: Goal[] }) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}

