import BackButton from "@/components/custom-componetns/back-button";
import { InvestmentForm } from "./_components/InvestmentForm";
import { Suspense } from "react";

export default function AddInvestmentPage() {
  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
      <div className="mb-4">
        <BackButton />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <InvestmentForm />
      </Suspense>
    </div>
  );
}

