import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBankAccount } from "@/action/bank-account";
import { BankAccountEditForm } from "./_components/BankAccountEditForm";
import BackButton from "@/components/custom-componetns/back-button";

type ParamsType = { params: Promise<{ id: string }> };

export default async function EditBankAccountPage({ params }: ParamsType) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;

  if (!session?.user) {
    notFound();
  }

  let bankAccount;
  try {
    bankAccount = await getBankAccount(id, session.user.id);
  } catch (error) {
    console.error("Error fetching bank account:", error);
    notFound();
  }

  if (!bankAccount) {
    notFound();
  }

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
      <div className="mb-6">
        <BackButton />
      </div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
          Edit Bank Account
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update bank account details
        </p>
      </div>
      <BankAccountEditForm bankAccount={bankAccount} />
    </div>
  );
}

