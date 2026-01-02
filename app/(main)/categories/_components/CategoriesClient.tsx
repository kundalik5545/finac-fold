"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoriesTableView } from "./CategoriesTableView";
import { CategoriesCardView } from "./CategoriesCardView";
import { AddCategoryDialog } from "./AddCategoryDialog";
import { Category } from "@/lib/schema/bank-account-types";
import { CategoryType } from "@/lib/schema/bank-account-types";

/**
 * CategoriesClient Component
 * Main client component that handles view toggle between table and card views
 */
export function CategoriesClient({ categories }: { categories: Category[] }) {
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    let filtered = categories;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(
        (cat) => cat.type.toLowerCase() === filterType
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(query) ||
          cat.subCategories?.some((sub) =>
            sub.name.toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  }, [categories, filterType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your transaction structure.
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-2 rounded-xl border border-border shadow-sm">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 px-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-all whitespace-nowrap ${filterType === "all"
              ? "bg-muted text-foreground font-semibold shadow-sm"
              : "font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
          >
            all
          </button>
          <button
            onClick={() => setFilterType("expense")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${filterType === "expense"
              ? "bg-muted text-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
          >
            expense
          </button>
          <button
            onClick={() => setFilterType("income")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${filterType === "income"
              ? "bg-muted text-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
          >
            income
          </button>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto px-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-1 border-l border-border pl-3">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${viewMode === "table"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted"
                }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-md transition-colors ${viewMode === "card"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted"
                }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "table" ? (
        <CategoriesTableView categories={filteredCategories} />
      ) : (
        <CategoriesCardView categories={filteredCategories} />
      )}

      {/* Add Category Dialog */}
      <AddCategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}

