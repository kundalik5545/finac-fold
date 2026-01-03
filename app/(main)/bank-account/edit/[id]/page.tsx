"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BankAccountEditModal } from "../../_components/BankAccountEditModal";

export default function EditBankAccountPage() {
    const params = useParams();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const bankAccountId = params?.id as string | undefined;

    const handleClose = () => {
        setIsOpen(false);
        router.push("/bank-account");
    };

    if (!bankAccountId) {
        router.push("/bank-account");
        return null;
    }

    return (
        <BankAccountEditModal
            open={isOpen}
            onOpenChange={handleClose}
            bankAccountId={bankAccountId}
        />
    );
}

