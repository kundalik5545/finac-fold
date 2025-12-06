import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TodoForm } from "../../_components/TodoForm";
import { getTodoById, getCategories, getTags } from "@/action/todo";
import BackButton from "@/components/custom-componetns/back-button";

export default async function EditTodoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/signin");
  }

  const { id } = await params;

  try {
    const todo = await getTodoById(id, session.user.id);
    const categories = await getCategories(session.user.id);
    const tags = await getTags(session.user.id);

    return (
      <div className="container mx-auto md:max-w-3xl px-2 md:px-0 pt-5">
        <div className="flex justify-between items-center pb-5">
          <div className="">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
              Edit Todo
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update your todo item
            </p>
          </div>

          <BackButton />
        </div>

        <TodoForm
          initialData={todo}
          userId={session.user.id}
          categories={categories}
          tags={tags}
        />
      </div>
    );
  } catch (error) {
    redirect("/todo");
  }
}

