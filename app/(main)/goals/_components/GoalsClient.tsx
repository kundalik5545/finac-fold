"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table2, LayoutGrid } from "lucide-react";
import { GoalsTableView } from "./GoalsTableView";
import { GoalsCardView } from "./GoalsCardView";
import { GoalsDonutChart } from "./GoalsDonutChart";
import { GoalsBarChart } from "./GoalsBarChart";
import { GoalsAreaChart } from "./GoalsAreaChart";
import { Goal } from "@/lib/goals-types";

export function GoalsClient({ goals }: { goals: Goal[] }) {
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  return (
    <div className="space-y-8">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
          All Goals
        </h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table2 size={16} className="mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid size={16} className="mr-2" />
            Card
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "table" ? (
        <GoalsTableView goals={goals} />
      ) : (
        <GoalsCardView goals={goals} />
      )}

      {/* Charts Section */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoalsDonutChart goals={goals} />
          <GoalsBarChart goals={goals} />
        </div>
      )}

      {goals.length > 0 && (
        <div className="w-full">
          <GoalsAreaChart goals={goals} />
        </div>
      )}
    </div>
  );
}

