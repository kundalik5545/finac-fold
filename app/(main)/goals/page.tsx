import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GoalsClient } from "./_components/GoalsClient";
import { getGoals } from "@/action/goals";
import { Goal } from "@/lib/types/goals-types";

const GoalsPage = async () => {
  let goals: Goal[] = [];

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      goals = await getGoals(session.user.id);
    }
  } catch (error) {
    console.error("Error fetching goals:", error);
  }

  // Calculate total target amount and current amount
  const totalTargetAmount = goals.reduce((sum, goal) => {
    return sum + Number(goal.targetAmount);
  }, 0);

  const totalCurrentAmount = goals.reduce((sum, goal) => {
    return sum + Number(goal.currentAmount);
  }, 0);

  const overallProgress =
    totalTargetAmount > 0
      ? (totalCurrentAmount / totalTargetAmount) * 100
      : 0;

  return (
    <div className="goals-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
      {/* Heading Section */}
      <section className="flex justify-between items-center pb-5">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Investment Goals
          </h1>
          {totalTargetAmount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Total Progress: ₹
              {totalCurrentAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              / ₹
              {totalTargetAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ({overallProgress.toFixed(1)}%)
            </p>
          )}
        </div>
        <Button>
          <Link
            href="/goals/add"
            className="flex items-center justify-around"
          >
            <Plus size={16} /> Add Goal
          </Link>
        </Button>
      </section>

      {/* Goals List and Charts Section */}
      <section className="py-5">
        <GoalsClient goals={goals} />
      </section>
    </div>
  );
};

export default GoalsPage;

