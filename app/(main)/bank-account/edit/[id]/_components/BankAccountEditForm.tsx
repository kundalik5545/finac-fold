"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { IconPicker } from "@/components/custom-componetns/icon-picker";
import { ColorPicker } from "@/components/custom-componetns/color-picker";

import { bankAccountFormSchema } from "@/lib/schema/bank-account-schema";
import { BankAccount } from "@/lib/schema/bank-account-types";

interface BankAccountEditFormProps {
  bankAccount: BankAccount;
}

type FormValues = z.infer<typeof bankAccountFormSchema>;

export function BankAccountEditForm({ bankAccount }: BankAccountEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(bankAccountFormSchema),
    mode: "onChange",
    defaultValues: {
      name: bankAccount.name ?? "",
      bankName: bankAccount.bankName ?? "",
      accountNumber: bankAccount.accountNumber ?? "",
      accountType: bankAccount.accountType as "SAVINGS" | "CHECKING" | "CURRENT" | "OTHER" | null,
      ifscCode: bankAccount.ifscCode ?? "",
      branch: bankAccount.branch ?? "",
      startingBalance: bankAccount.startingBalance ?? 0,
      icon: bankAccount.icon ?? "",
      color: bankAccount.color ?? "",
      description: bankAccount.description ?? "",
      isActive: bankAccount.isActive ?? true,
      accountOpeningDate: bankAccount.accountOpeningDate
        ? new Date(bankAccount.accountOpeningDate).toISOString().split("T")[0]
        : "",
      isInsuranceActive: bankAccount.isInsuranceActive ?? false,
      insuranceAmount: bankAccount.insuranceAmount ?? null,
    },
  });

  /** ✅ ALL controlled values via watch */
  const accountType = watch("accountType") as "SAVINGS" | "CHECKING" | "CURRENT" | "OTHER" | null;
  const icon = watch("icon") as string | null;
  const color = watch("color") as string | null;
  const isInsuranceActive = watch("isInsuranceActive") as boolean | null;
  const isActive = watch("isActive") as boolean | null;

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        ...data,
        accountNumber: data.accountNumber?.trim() || null,
        bankName: data.bankName?.trim() || null,
        ifscCode: data.ifscCode?.trim() || null,
        branch: data.branch?.trim() || null,
        color: data.color?.trim() || null,
        icon: data.icon?.trim() || null,
        description: data.description?.trim() || null,
        accountOpeningDate: data.accountOpeningDate
          ? new Date(data.accountOpeningDate).toISOString()
          : null,
        insuranceAmount:
          data.isInsuranceActive && data.insuranceAmount && data.insuranceAmount > 0
            ? data.insuranceAmount
            : null,
      };

      const res = await fetch(`/api/bank-account/${bankAccount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Update failed");
      }

      toast.success("Account updated successfully");
      router.push("/bank-account");
    } catch (err: any) {
      const msg = err.message || "Server error";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Account Name *</Label>
              <Input {...register("name")} />
              {errors.name && <p className="error">{errors.name.message}</p>}
            </div>

            <div>
              <Label>Bank Name</Label>
              <Input {...register("bankName")} />
            </div>

            <div>
              <Label>Account Number</Label>
              <Input {...register("accountNumber")} />
            </div>

            <div>
              <Label>Account Type</Label>
              <Select
                value={accountType ?? undefined}
                onValueChange={(v) =>
                  setValue("accountType", v as FormValues["accountType"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                  <SelectItem value="CHECKING">Checking</SelectItem>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>IFSC Code</Label>
              <Input maxLength={11} {...register("ifscCode")} />
            </div>

            <div>
              <Label>Branch</Label>
              <Input {...register("branch")} />
            </div>

            <div>
              <Label>Starting Balance</Label>
              <Input
                type="number"
                step="0.01"
                {...register("startingBalance", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label>Account Opening Date</Label>
              <Input type="date" {...register("accountOpeningDate")} />
            </div>
          </div>

          {/* ICON + COLOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Icon</Label>
              <IconPicker value={icon} onChange={(v) => setValue("icon", v)} />
            </div>

            <div>
              <Label>Color</Label>
              <ColorPicker value={color} onChange={(v) => setValue("color", v)} />
            </div>
          </div>

          {/* INSURANCE */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isInsuranceActive ?? false}
                onCheckedChange={(v) =>
                  setValue("isInsuranceActive", Boolean(v))
                }
              />
              <Label>Has Insurance?</Label>
            </div>

            {isInsuranceActive && (
              <div>
                <Label>Insurance Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("insuranceAmount", { valueAsNumber: true })}
                />
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isActive ?? false}
              onCheckedChange={(v) => setValue("isActive", Boolean(v))}
            />
            <Label>Active</Label>
          </div>

          {/* DESCRIPTION */}
          <div>
            <Label>Description</Label>
            <Textarea rows={3} {...register("description")} />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
