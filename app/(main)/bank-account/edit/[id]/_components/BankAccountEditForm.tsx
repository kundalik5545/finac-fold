"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankAccountFormSchema } from "@/lib/bank-account-schema";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { IconPicker } from "@/components/custom-componetns/icon-picker";
import { ColorPicker } from "@/components/custom-componetns/color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BankAccount } from "@/lib/bank-account-types";

interface BankAccountEditFormProps {
  bankAccount: BankAccount;
}

export function BankAccountEditForm({ bankAccount }: BankAccountEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof bankAccountFormSchema>>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: {
      name: bankAccount.name,
      accountNumber: bankAccount.accountNumber,
      bankName: bankAccount.bankName,
      accountType: bankAccount.accountType,
      ifscCode: bankAccount.ifscCode,
      branch: bankAccount.branch,
      startingBalance: bankAccount.startingBalance,
      icon: bankAccount.icon,
      color: bankAccount.color,
      description: bankAccount.description,
      isActive: bankAccount.isActive,
      accountOpeningDate: bankAccount.accountOpeningDate
        ? new Date(bankAccount.accountOpeningDate).toISOString().split("T")[0]
        : null,
      isInsuranceActive: bankAccount.isInsuranceActive ?? false,
      insuranceAmount: bankAccount.insuranceAmount,
    },
    mode: "onChange",
  });

  const iconValue = watch("icon");
  const colorValue = watch("color");
  const accountTypeValue = watch("accountType");
  const isActiveValue = watch("isActive");
  const isInsuranceActiveValue = watch("isInsuranceActive");

  const onSubmit = async (data: z.infer<typeof bankAccountFormSchema>) => {
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

      console.log("Updating bank account data:", cleanedData);

      const response = await fetch(`/api/bank-account/${bankAccount.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Bank account updated successfully");
        router.push("/bank-account");
        router.refresh();
      } else {
        console.error("Error response:", responseData);
        toast.error(responseData.error || "Failed to update bank account");
        if (responseData.details) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    Account Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., HDFC Savings, SBI Salary"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    {...register("bankName")}
                    placeholder="e.g., HDFC Bank, State Bank of India"
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.bankName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    {...register("accountNumber")}
                    placeholder="Enter account number"
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.accountNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select
                    value={accountTypeValue || ""}
                    onValueChange={(value) => setValue("accountType", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                      <SelectItem value="SALARY">Salary</SelectItem>
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
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    {...register("ifscCode")}
                    placeholder="e.g., HDFC0001234"
                    maxLength={11}
                  />
                  {errors.ifscCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ifscCode.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    {...register("branch")}
                    placeholder="Enter branch name"
                  />
                  {errors.branch && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.branch.message}
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
                  />
                  {errors.startingBalance && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startingBalance.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="accountOpeningDate">Account Opening Date</Label>
                  <Input
                    id="accountOpeningDate"
                    type="date"
                    {...register("accountOpeningDate")}
                  />
                  {errors.accountOpeningDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.accountOpeningDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Customization */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Visual Customization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IconPicker
                  value={iconValue}
                  onChange={(icon) => setValue("icon", icon)}
                />
                {errors.icon && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.icon.message}
                  </p>
                )}

                <div>
                  <Label>Color (Optional)</Label>
                  <ColorPicker
                    value={colorValue}
                    onChange={(color) => setValue("color", color)}
                  />
                  {errors.color && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.color.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Insurance Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isInsuranceActive"
                    checked={isInsuranceActiveValue || false}
                    onCheckedChange={(checked) => setValue("isInsuranceActive", checked as boolean)}
                  />
                  <Label htmlFor="isInsuranceActive" className="cursor-pointer">
                    Account has insurance coverage
                  </Label>
                </div>

                {isInsuranceActiveValue && (
                  <div>
                    <Label htmlFor="insuranceAmount">Insurance Amount</Label>
                    <Input
                      id="insuranceAmount"
                      type="number"
                      step="0.01"
                      {...register("insuranceAmount", { valueAsNumber: true })}
                      placeholder="0.00"
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

            {/* Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Status</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActiveValue ?? true}
                  onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Account is active
                </Label>
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
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Bank Account"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

