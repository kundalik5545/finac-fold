"use client";

import { CategoryCard } from "./CategoryCard";
import { Category } from "@/lib/schema/bank-account-types";

/**
 * CategoriesCardView Component
 * Displays categories in a card grid format
 */
export function CategoriesCardView({
  categories,
}: {
  categories: Category[];
}) {
  if (!categories || categories.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-muted-foreground">
          No categories found. Add your first category to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

