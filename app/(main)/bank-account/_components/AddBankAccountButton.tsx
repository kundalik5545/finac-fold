"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BankAccountFormModal } from "./BankAccountFormModal";
import { useState } from "react";

export function AddBankAccountButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} /> Add Bank Account
            </Button>
            <BankAccountFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
        </>
    );
}

