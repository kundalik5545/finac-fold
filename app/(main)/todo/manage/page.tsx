import { getCategories, getTags } from "@/action/todo";
import BackButton from "@/components/custom-componetns/back-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CategoriesManager } from "../_components/CategoriesManager";
import { TagsManager } from "../_components/TagsManager";

export default async function ManageTodoPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/signin");
  }

  const categories = await getCategories(session.user.id);
  const tags = await getTags(session.user.id);

  return (
    <div className="container mx-auto md:max-w-5xl px-2 md:px-0">
      <div className="flex justify-between items-center pb-5">
        <div className="">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Manage Categories & Tags
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your todos with categories and tags
          </p>
        </div>
        <BackButton />
      </div >

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoriesManager
          initialCategories={categories}
          userId={session.user.id}
        />
        <TagsManager initialTags={tags} userId={session.user.id} />
      </div>
    </div >
  );
}

