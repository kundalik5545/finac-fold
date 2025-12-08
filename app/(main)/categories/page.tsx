import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CategoriesClient } from "./_components/CategoriesClient";
import { getCategories } from "@/action/bank-account";
import { Category } from "@/lib/bank-account-types";

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
    <div className="categories-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
      {/* Heading Section */}
      <section className="flex justify-between items-center pb-5">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Categories & Subcategories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your transaction categories and subcategories
          </p>
        </div>
        <Button>
          <Link
            href="/categories/add"
            className="flex items-center justify-around"
          >
            <Plus size={16} /> Add Category
          </Link>
        </Button>
      </section>

      {/* Categories List Section */}
      <section className="py-5">
        <CategoriesClient categories={categories} />
      </section>
    </div>
  );
};

export default CategoriesPage;

