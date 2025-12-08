import { EditCategoryForm } from "./_components/EditCategoryForm";
import BackButton from "@/components/custom-componetns/back-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getCategories } from "@/action/bank-account";
import { notFound } from "next/navigation";

type ParamsType = { params: Promise<{ id: string }> };

/**
 * Edit Category Page
 * Page for editing an existing category
 */
export default async function EditCategoryPage({ params }: ParamsType) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    notFound();
  }

  const categories = await getCategories(session.user.id);
  const category = categories.find((c) => c.id === id);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Category</h1>
        <EditCategoryForm category={category} />
      </div>
    </div>
  );
}

