import { AddGoalForm } from "./_components/AddGoalForm";
import BackButton from "@/components/custom-componetns/back-button";

export default function AddGoalPage() {
  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold">Add New Goal</h1>
        <AddGoalForm />
      </div>
    </div>
  );
}

