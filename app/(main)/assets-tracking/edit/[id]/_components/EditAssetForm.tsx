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
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assetFormSchema } from "@/lib/schema/assets-tracking-schema";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Asset } from "@/lib/types/assets-tracking-types";

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

export function EditAssetForm({ asset }: { asset: Asset }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDateForInput = (date: Date | string) => {
        const d = new Date(date);
        return d.toISOString().split("T")[0];
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<z.infer<typeof assetFormSchema>>({
        resolver: zodResolver(assetFormSchema),
        defaultValues: {
            name: asset.name,
            type: asset.type,
            currentValue: Number(asset.currentValue),
            purchaseValue: Number(asset.purchaseValue),
            icon: asset.icon,
            color: asset.color,
            purchaseReason: asset.purchaseReason,
            paymentMethod: asset.paymentMethod,
            purchaseDate: formatDateForInput(asset.purchaseDate),
            sellDate: asset.sellDate ? formatDateForInput(asset.sellDate) : null,
            sellPrice: asset.sellPrice ? Number(asset.sellPrice) : null,
            profitLoss: asset.profitLoss ? Number(asset.profitLoss) : null,
            sellReason: asset.sellReason,
            transactionStatus: asset.transactionStatus,
            description: asset.description,
        },
    });

    const onSubmit = async (data: z.infer<typeof assetFormSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/assets-tracking/${asset.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success("Asset updated successfully");
                router.push(`/assets-tracking/${asset.id}`);
                router.refresh();
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
                                        Asset Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        {...register("name")}
                                        placeholder="e.g., My House, Car, Gold Ring"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="type">
                                        Asset Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(value) => setValue("type", value as any)}
                                        defaultValue={watch("type")}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select asset type" />
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
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.type.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Purchase Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Purchase Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="purchaseValue">
                                        Purchase Value <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="purchaseValue"
                                        type="number"
                                        step="0.01"
                                        {...register("purchaseValue", { valueAsNumber: true })}
                                        placeholder="Enter purchase value"
                                    />
                                    {errors.purchaseValue && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.purchaseValue.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="currentValue">
                                        Current Value <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="currentValue"
                                        type="number"
                                        step="0.01"
                                        {...register("currentValue", { valueAsNumber: true })}
                                        placeholder="Enter current value"
                                    />
                                    {errors.currentValue && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.currentValue.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="purchaseDate">
                                        Purchase Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
                                    {errors.purchaseDate && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.purchaseDate.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("paymentMethod", value as any)
                                        }
                                        defaultValue={watch("paymentMethod") || undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods.map((method) => (
                                                <SelectItem key={method.value} value={method.value}>
                                                    {method.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="purchaseReason">Purchase Reason</Label>
                                    <Textarea
                                        id="purchaseReason"
                                        {...register("purchaseReason")}
                                        placeholder="Why did you purchase this asset?"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Optional: Sell Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Sell Information (Optional)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="sellDate">Sell Date</Label>
                                    <Input id="sellDate" type="date" {...register("sellDate")} />
                                </div>

                                <div>
                                    <Label htmlFor="sellPrice">Sell Price</Label>
                                    <Input
                                        id="sellPrice"
                                        type="number"
                                        step="0.01"
                                        {...register("sellPrice", { valueAsNumber: true })}
                                        placeholder="Enter sell price"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="transactionStatus">Transaction Status</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setValue("transactionStatus", value as any)
                                        }
                                        defaultValue={watch("transactionStatus") || undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transactionStatuses.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="sellReason">Sell Reason</Label>
                                    <Textarea
                                        id="sellReason"
                                        {...register("sellReason")}
                                        placeholder="Why are you selling this asset?"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Additional Information
                            </h3>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    {...register("description")}
                                    placeholder="Any additional notes about this asset"
                                    rows={4}
                                />
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
                                {isSubmitting ? "Updating..." : "Update Asset"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

