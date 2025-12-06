import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getGoal } from "@/action/goals";
import { EditGoalForm } from "./_components/EditGoalForm";
import BackButton from "@/components/custom-componetns/back-button";

type ParamsType = { params: { id: string } };

export default async function EditGoalPage({ params }: ParamsType) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  let goal;
  try {
    goal = await getGoal(id, session.user.id);
  } catch (error) {
    console.error("Error fetching goal:", error);
    notFound();
  }

  if (!goal) {
    notFound();
  }

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Goal</h1>
        <EditGoalForm goal={goal} />
      </div>
    </div>
  );
}

