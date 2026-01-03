import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CategoriesClient } from "./_components/CategoriesClient";
import { getCategories } from "@/action/bank-account";
import { Category } from "@/lib/schema/bank-account-types";

/**
 * Categories Page
 * Main page for managing categories and subcategories
 */
const CategoriesPage = async () => {
  let categories: Category[] = [];

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      categories = await getCategories(session.user.id);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-8">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        {/* Header Section */}
        <CategoriesClient categories={categories} />
      </div>
    </div>
  );
};

export default CategoriesPage;

