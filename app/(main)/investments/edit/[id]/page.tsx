import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getInvestment } from "@/action/investments";
import { EditInvestmentForm } from "./_components/EditInvestmentForm";
import BackButton from "@/components/custom-componetns/back-button";

type ParamsType = { params: Promise<{ id: string }> };

export default async function EditInvestmentPage({ params }: ParamsType) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  let investment;
  try {
    investment = await getInvestment(id, session.user.id);
  } catch (error) {
    console.error("Error fetching investment:", error);
    notFound();
  }

  if (!investment) {
    notFound();
  }

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Investment</h1>
        <EditInvestmentForm investment={investment} />
      </div>
    </div>
  );
}

