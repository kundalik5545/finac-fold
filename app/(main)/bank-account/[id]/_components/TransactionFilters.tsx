"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/lib/schema/bank-account-types";

interface TransactionFiltersProps {
  filters: {
    startDate?: string;
    endDate?: string;
    transactionType?: "CREDIT" | "DEBIT" | null;
    categoryId?: string | null;
    subCategoryId?: string | null;
  };
  categories: Category[];
  subCategories: { id: string; name: string; categoryId: string }[];
  onApplyFilters: (filters: TransactionFiltersProps["filters"]) => void;
  onClearFilters: () => void;
}

export function TransactionFilters({
  filters,
  categories,
  subCategories,
  onApplyFilters,
  onClearFilters,
}: TransactionFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      startDate: undefined,
      endDate: undefined,
      transactionType: null,
      categoryId: null,
      subCategoryId: null,
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  // Filter subcategories based on selected category
  const filteredSubCategories = localFilters.categoryId
    ? subCategories.filter((sc) => sc.categoryId === localFilters.categoryId)
    : [];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={localFilters.startDate || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, startDate: e.target.value || undefined })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={localFilters.endDate || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, endDate: e.target.value || undefined })
              }
            />
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select
              value={localFilters.transactionType || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  transactionType: value === "all" ? null : (value as "CREDIT" | "DEBIT"),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="CREDIT">Credit</SelectItem>
                <SelectItem value="DEBIT">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={localFilters.categoryId || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  categoryId: value === "all" ? null : value,
                  subCategoryId: null, // Reset subcategory when category changes
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          <div className="space-y-2">
            <Label>Subcategory</Label>
            <Select
              value={localFilters.subCategoryId || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  subCategoryId: value === "all" ? null : value,
                })
              }
              disabled={!localFilters.categoryId || filteredSubCategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subcategories</SelectItem>
                {filteredSubCategories.map((subCategory) => (
                  <SelectItem key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button onClick={handleApply}>Apply Filters</Button>
          <Button variant="outline" onClick={handleClear}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

