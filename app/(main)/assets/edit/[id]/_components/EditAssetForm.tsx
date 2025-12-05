"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAssetSchema } from "@/lib/form-schema";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Field/value options based on prisma Asset model
const assetTypes = [
  { label: "Property", value: "PROPERTY" },
  { label: "Vehicle", value: "VEHICLE" },
  { label: "Jewelry", value: "JEWELRY" },
  { label: "Electronics", value: "ELECTRONICS" },
  { label: "Other", value: "OTHER" },
];

const paymentMethods = [
  { label: "Cash", value: "CASH" },
  { label: "UPI", value: "UPI" },
  { label: "Card", value: "CARD" },
  { label: "Online", value: "ONLINE" },
  { label: "Other", value: "OTHER" },
];

const transactionStatuses = [
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
];

export default function EditAssetForm({ asset }: { asset: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof updateAssetSchema>>({
    resolver: zodResolver(updateAssetSchema),
    defaultValues: {
      name: asset.name || "",
      type: asset.type || "OTHER",
      icon: asset.icon || null,
      color: asset.color || null,
      currentValue: Number(asset.currentValue) || 0,
      purchaseValue: Number(asset.purchaseValue) || 0,
      purchaseDate: asset.purchaseDate
        ? new Date(asset.purchaseDate).toISOString().split("T")[0]
        : "",
      purchaseReason: asset.purchaseReason || null,
      paymentMethod: asset.paymentMethod || null,
      sellDate: asset.sellDate
        ? new Date(asset.sellDate).toISOString().split("T")[0]
        : null,
      sellPrice: asset.sellPrice ? Number(asset.sellPrice) : null,
      profitLoss: asset.profitLoss ? Number(asset.profitLoss) : null,
      sellReason: asset.sellReason || null,
      transactionStatus: asset.transactionStatus || null,
      description: asset.description || null,
    },
  });

  const onSubmit = async (data: z.infer<typeof updateAssetSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Asset updated successfully");
        router.push("/assets");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update asset");
      }
    } catch (error) {
      toast.error("Failed to update asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto container max-w-4xl min-h-screen flex flex-col items-center justify-center p-2 pt-6 pb-24">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5"
          >
            {/* Asset Name */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., My Car"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="type">Asset Type *</Label>
              <Select
                defaultValue={asset.type || "OTHER"}
                onValueChange={(value) =>
                  setValue("type", value as z.infer<typeof updateAssetSchema>["type"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Current Value */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="currentValue">Current Value *</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                {...register("currentValue", { valueAsNumber: true })}
                placeholder="e.g., 15000.00"
              />
              {errors.currentValue && (
                <p className="text-sm text-red-500">
                  {errors.currentValue.message}
                </p>
              )}
            </div>

            {/* Purchase Value */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="purchaseValue">Purchase Value *</Label>
              <Input
                id="purchaseValue"
                type="number"
                step="0.01"
                {...register("purchaseValue", { valueAsNumber: true })}
                placeholder="e.g., 12000.00"
              />
              {errors.purchaseValue && (
                <p className="text-sm text-red-500">
                  {errors.purchaseValue.message}
                </p>
              )}
            </div>

            {/* Purchase Date */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date *</Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register("purchaseDate")}
              />
              {errors.purchaseDate && (
                <p className="text-sm text-red-500">
                  {errors.purchaseDate.message}
                </p>
              )}
            </div>

            {/* Icon (optional) */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="icon">Icon (URL or Name, Optional)</Label>
              <Input
                id="icon"
                {...register("icon", { setValueAs: (v) => v === "" ? null : v })}
                placeholder="e.g., car, https://.../icon.png"
              />
              {errors.icon && (
                <p className="text-sm text-red-500">{errors.icon.message}</p>
              )}
            </div>

            {/* Color (optional) */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="color">Color (Optional)</Label>
              <Input
                id="color"
                {...register("color", { setValueAs: (v) => v === "" ? null : v })}
                placeholder="e.g., #FFAA00"
                type="text"
              />
              {errors.color && (
                <p className="text-sm text-red-500">{errors.color.message}</p>
              )}
            </div>

            {/* Purchase Reason (optional) */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="purchaseReason">Purchase Reason (Optional)</Label>
              <Input
                id="purchaseReason"
                {...register("purchaseReason", { setValueAs: (v) => v === "" ? null : v })}
                placeholder="e.g., Commute to office"
              />
              {errors.purchaseReason && (
                <p className="text-sm text-red-500">{errors.purchaseReason.message}</p>
              )}
            </div>

            {/* Payment Method (optional) */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                defaultValue={asset.paymentMethod || ""}
                onValueChange={(value) =>
                  setValue("paymentMethod", value ? (value as z.infer<typeof updateAssetSchema>["paymentMethod"]) : null, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
              )}
            </div>

            {/* Sell Date (optional) */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="sellDate">Sell Date</Label>
              <Input
                id="sellDate"
                type="date"
                {...register("sellDate", { setValueAs: (v) => v === "" ? null : v })}
              />
              {errors.sellDate && (
                <p className="text-sm text-red-500">
                  {errors.sellDate.message}
                </p>
              )}
            </div>

            {/* Sell Price (optional) */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="sellPrice">Sell Price</Label>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                {...register("sellPrice", { valueAsNumber: true })}
                placeholder="e.g., 15500.00"
              />
              {errors.sellPrice && (
                <p className="text-sm text-red-500">
                  {errors.sellPrice.message}
                </p>
              )}
            </div>

            {/* Profit/Loss (optional) */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="profitLoss">Profit/Loss</Label>
              <Input
                id="profitLoss"
                type="number"
                step="0.01"
                {...register("profitLoss", { valueAsNumber: true })}
                placeholder="e.g., 500.00"
              />
              {errors.profitLoss && (
                <p className="text-sm text-red-500">
                  {errors.profitLoss.message}
                </p>
              )}
            </div>

            {/* Sell Reason (optional) */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="sellReason">Sell Reason</Label>
              <Input
                id="sellReason"
                {...register("sellReason", { setValueAs: (v) => v === "" ? null : v })}
                placeholder="Why was the asset sold?"
              />
              {errors.sellReason && (
                <p className="text-sm text-red-500">
                  {errors.sellReason.message}
                </p>
              )}
            </div>

            {/* Transaction Status (optional) */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="transactionStatus">Transaction Status</Label>
              <Select
                defaultValue={asset.transactionStatus || ""}
                onValueChange={(value) =>
                  setValue("transactionStatus", value ? (value as z.infer<typeof updateAssetSchema>["transactionStatus"]) : null, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Transaction Status" />
                </SelectTrigger>
                <SelectContent>
                  {transactionStatuses.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.transactionStatus && (
                <p className="text-sm text-red-500">
                  {errors.transactionStatus.message}
                </p>
              )}
            </div>

            {/* Description (optional/col-span) */}
            <div className="md:col-span-2 flex flex-col space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description", { setValueAs: (v) => v === "" ? null : v })}
                placeholder="Add further details about the asset..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Responsive Buttons */}
            <div className="md:col-span-2 flex flex-col-reverse md:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="md:w-40 flex-1 md:flex-initial"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="md:w-64 flex-1 md:flex-initial"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Asset"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
