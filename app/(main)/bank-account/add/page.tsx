import React from "react";
import { BankAccountForm } from "./_components/BankAccountForm";

const AddBankAccountPage = () => {
  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
          Add Bank Account
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new bank account to track your finances
        </p>
      </div>
      <BankAccountForm />
    </div>
  );
};

export default AddBankAccountPage;

