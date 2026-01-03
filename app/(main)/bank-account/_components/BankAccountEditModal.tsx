"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankAccountFormSchema } from "@/lib/schema/bank-account-schema";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ColorPicker } from "@/components/custom-componetns/color-picker";
import { IconPicker } from "@/components/custom-componetns/icon-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BANK_ACCOUNT_CARD_THEME_COLORS } from "@/data/AppData";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { BankAccount } from "@/lib/schema/bank-account-types";

interface BankAccountEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bankAccountId: string | null;
}

export function BankAccountEditModal({
    open,
    onOpenChange,
    bankAccountId,
}: BankAccountEditModalProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<z.infer<typeof bankAccountFormSchema>>({
        resolver: zodResolver(bankAccountFormSchema),
        defaultValues: {
            name: "",
            accountNumber: null,
            bankName: null,
            accountType: null,
            ifscCode: null,
            branch: null,
            startingBalance: 0,
            icon: null,
            color: null,
            description: null,
            isActive: true,
            accountOpeningDate: null,
            isInsuranceActive: false,
            insuranceAmount: null,
        },
        mode: "onChange",
    });

    const colorValue = watch("color");
    const accountTypeValue = watch("accountType");
    const iconValue = watch("icon");
    const isActiveValue = watch("isActive");
    const isInsuranceActiveValue = watch("isInsuranceActive");

    // Extract color hex values from BANK_ACCOUNT_CARD_THEME_COLORS
    const cardThemeColors = BANK_ACCOUNT_CARD_THEME_COLORS.map((c) => c.hex);

    // Fetch bank account data when modal opens
    useEffect(() => {
        if (open && bankAccountId) {
            setIsLoading(true);
            fetch(`/api/bank-account/${bankAccountId}`)
                .then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(errorData.error || "Failed to fetch bank account");
                    }
                    const response = await res.json();
                    // API returns { bankAccount: {...} }
                    const data = response.bankAccount || response;
                    setBankAccount(data);
                    
                    // Set form values
                    reset({
                        name: data.name ?? "",
                        accountNumber: data.accountNumber ?? null,
                        bankName: data.bankName ?? null,
                        accountType: data.accountType as "SAVINGS" | "CHECKING" | "CURRENT" | "OTHER" | null,
                        ifscCode: data.ifscCode ?? null,
                        branch: data.branch ?? null,
                        startingBalance: data.startingBalance ? Number(data.startingBalance) : 0,
                        icon: data.icon ?? null,
                        color: data.color ?? null,
                        description: data.description ?? null,
                        isActive: data.isActive ?? true,
                        accountOpeningDate: data.accountOpeningDate
                            ? new Date(data.accountOpeningDate).toISOString().split("T")[0]
                            : null,
                        isInsuranceActive: data.isInsuranceActive ?? false,
                        insuranceAmount: data.insuranceAmount ? Number(data.insuranceAmount) : null,
                    });
                })
                .catch((error) => {
                    console.error("Error fetching bank account:", error);
                    toast.error(error.message || "Failed to load bank account data");
                    onOpenChange(false);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else if (!open) {
            // Reset form when modal closes
            reset();
            setBankAccount(null);
        }
    }, [open, bankAccountId, reset, onOpenChange]);

    const onSubmit = async (data: z.infer<typeof bankAccountFormSchema>) => {
        if (!bankAccountId) return;
        
        setIsSubmitting(true);
        try {
            // Clean up the data before sending
            const cleanedData = {
                ...data,
                startingBalance: data.startingBalance || 0,
                description: data.description && data.description.trim() !== "" ? data.description.trim() : null,
                icon: data.icon && data.icon.trim() !== "" ? data.icon.trim() : null,
                color: data.color && data.color.trim() !== "" ? data.color.trim() : null,
                accountNumber: data.accountNumber && data.accountNumber.trim() !== "" ? data.accountNumber.trim() : null,
                bankName: data.bankName && data.bankName.trim() !== "" ? data.bankName.trim() : null,
                ifscCode: data.ifscCode && data.ifscCode.trim() !== "" ? data.ifscCode.trim() : null,
                branch: data.branch && data.branch.trim() !== "" ? data.branch.trim() : null,
                accountOpeningDate: data.accountOpeningDate ? new Date(data.accountOpeningDate) : null,
                isActive: data.isActive ?? true,
                isInsuranceActive: data.isInsuranceActive ?? false,
                insuranceAmount: data.insuranceAmount && data.insuranceAmount > 0 ? data.insuranceAmount : null,
            };

            const response = await fetch(`/api/bank-account/${bankAccountId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cleanedData),
            });

            // Parse response JSON if available
            let responseData: any = {};
            const contentType = response.headers.get("content-type");

            try {
                const text = await response.text();
                if (text && contentType && contentType.includes("application/json")) {
                    responseData = JSON.parse(text);
                } else if (text) {
                    responseData = { error: text };
                }
            } catch (parseError) {
                console.error("Error parsing response:", parseError);
                responseData = { error: "Failed to parse server response" };
            }

            if (response.ok) {
                toast.success("Bank account updated successfully");
                onOpenChange(false);
                router.refresh();
                // Update URL to remove edit param
                router.push("/bank-account");
            } else {
                const errorMessage =
                    responseData?.error ||
                    `Failed to update bank account (${response.status} ${response.statusText})`;
                toast.error(errorMessage);

                if (responseData?.details) {
                    console.error("Validation details:", responseData.details);
                }
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to update bank account. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            reset();
            setBankAccount(null);
            onOpenChange(false);
            // Update URL to remove edit param
            router.push("/bank-account");
        }
    };

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl md:min-w-4xl max-h-[96vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Bank Account</DialogTitle>
                        <DialogDescription>
                            Update bank account details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl md:min-w-4xl max-h-[96vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Bank Account</DialogTitle>
                    <DialogDescription>
                        Update bank account details
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information - Two Column Layout */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">
                                        Account Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        {...register("name")}
                                        placeholder="e.g., SBI Bank"
                                        className="mt-1"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="accountNumber">Account Number</Label>
                                    <Input
                                        id="accountNumber"
                                        {...register("accountNumber")}
                                        placeholder="Enter account number"
                                        className="mt-1"
                                    />
                                    {errors.accountNumber && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.accountNumber.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="ifscCode">IFSC Code</Label>
                                    <Input
                                        id="ifscCode"
                                        {...register("ifscCode")}
                                        placeholder="e.g., HDFC0001234"
                                        maxLength={11}
                                        className="mt-1"
                                    />
                                    {errors.ifscCode && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.ifscCode.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="startingBalance">Starting Balance</Label>
                                    <Input
                                        id="startingBalance"
                                        type="number"
                                        step="0.01"
                                        {...register("startingBalance", { valueAsNumber: true })}
                                        placeholder="0.00"
                                        className="mt-1"
                                    />
                                    {errors.startingBalance && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.startingBalance.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <IconPicker
                                        label="Select Icon"
                                        value={iconValue}
                                        onChange={(icon) => setValue("icon", icon)}
                                        className="mt-1"
                                        isPVisible={false}
                                    />
                                    {errors.icon && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.icon.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="bankName">Bank Name</Label>
                                    <Input
                                        id="bankName"
                                        {...register("bankName")}
                                        placeholder="e.g., HDFC Bank, State Bank of India"
                                        className="mt-1"
                                    />
                                    {errors.bankName && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.bankName.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="accountType">Account Type</Label>
                                    <Select
                                        value={accountTypeValue || ""}
                                        onValueChange={(value) => setValue("accountType", value as any)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select account type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SAVINGS">Savings</SelectItem>
                                            <SelectItem value="CHECKING">Checking</SelectItem>
                                            <SelectItem value="CURRENT">Current</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.accountType && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.accountType.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="branch">Branch</Label>
                                    <Input
                                        id="branch"
                                        {...register("branch")}
                                        placeholder="Enter branch name"
                                        className="mt-1"
                                    />
                                    {errors.branch && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.branch.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="accountOpeningDate">Account Opening Date</Label>
                                    <Input
                                        id="accountOpeningDate"
                                        type="date"
                                        {...register("accountOpeningDate")}
                                        className="mt-1"
                                    />
                                    {errors.accountOpeningDate && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.accountOpeningDate.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Color</Label>
                                    <ColorPicker
                                        value={colorValue}
                                        onChange={(color) => setValue("color", color)}
                                        colors={cardThemeColors}
                                        variant="circular"
                                        className="mt-1"
                                    />
                                    {errors.color && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.color.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Insurance Information */}
                    <div className="border border-primary/30 rounded-lg bg-primary/5 px-4 py-3 mb-4 mt-4">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="isInsuranceActive"
                                checked={isInsuranceActiveValue ?? false}
                                onCheckedChange={(checked) => setValue("isInsuranceActive", checked as boolean)}
                                className="mt-1"
                            />
                            <div>
                                <Label htmlFor="isInsuranceActive" className="font-semibold cursor-pointer">
                                    Has Insurance?
                                </Label>
                                <div className="text-muted-foreground text-sm mt-0.5">
                                    Mark if this account is insured (e.g. by DICGC etc.).
                                </div>
                                {isInsuranceActiveValue && (
                                    <div className="mt-3">
                                        <Label htmlFor="insuranceAmount">Insurance Amount</Label>
                                        <Input
                                            id="insuranceAmount"
                                            type="number"
                                            step="0.01"
                                            {...register("insuranceAmount", { valueAsNumber: true })}
                                            placeholder="0.00"
                                            className="mt-1"
                                        />
                                        {errors.insuranceAmount && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.insuranceAmount.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status: Enable/Disable Bank Account */}
                    <div className="border border-primary/30 rounded-lg bg-primary/5 px-4 py-3 mb-4 mt-4">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="isActive"
                                checked={isActiveValue ?? true}
                                onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
                                className="mt-1"
                            />
                            <div>
                                <Label htmlFor="isActive" className="font-semibold cursor-pointer">
                                    Enable account
                                </Label>
                                <div className="text-muted-foreground text-sm mt-0.5">
                                    You can enable or disable your bank account at any time.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Description</h3>
                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Add any notes about this bank account"
                                rows={3}
                                className="mt-1"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

