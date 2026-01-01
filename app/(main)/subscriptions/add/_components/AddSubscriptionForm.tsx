"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionFormSchema } from "@/lib/subscriptions-schema";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { IconPicker } from "@/components/ui/icon-picker";
import { ColorPicker } from "@/components/ui/color-picker";

export function AddSubscriptionForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<z.infer<typeof subscriptionFormSchema>>({
        resolver: zodResolver(subscriptionFormSchema),
        defaultValues: {
            name: "",
            amount: 0,
            frequency: "MONTHLY",
            startDate: new Date().toISOString().split("T")[0],
            nextDueDate: new Date().toISOString().split("T")[0],
            description: null,
            icon: null,
            color: null,
        },
        mode: "onChange",
    });

    const iconValue = watch("icon");
    const colorValue = watch("color");
    const frequencyValue = watch("frequency");

    const onSubmit = async (data: z.infer<typeof subscriptionFormSchema>) => {
        setIsSubmitting(true);
        try {
            const cleanedData = {
                ...data,
                description:
                    data.description && data.description.trim() !== ""
                        ? data.description.trim()
                        : null,
                icon: data.icon && data.icon.trim() !== "" ? data.icon.trim() : null,
                color:
                    data.color && data.color.trim() !== "" ? data.color.trim() : null,
            };

            const response = await fetch("/api/subscriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cleanedData),
            });

            const responseData = await response.json();

            if (response.ok) {
                toast.success("Subscription created successfully");
                router.push("/subscriptions");
                router.refresh();
            } else {
                toast.error(responseData.error || "Failed to create subscription");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to create subscription. Please try again.");
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
                                        Subscription Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        {...register("name")}
                                        placeholder="e.g., Netflix"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="amount">
                                        Amount <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        {...register("amount", { valueAsNumber: true })}
                                        placeholder="0.00"
                                    />
                                    {errors.amount && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.amount.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="frequency">
                                        Frequency <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={frequencyValue}
                                        onValueChange={(value) =>
                                            setValue("frequency", value as any)
                                        }
                                    >
                                        <SelectTrigger id="frequency">
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAILY">Daily</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="YEARLY">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.frequency && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.frequency.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="startDate">
                                        Start Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        {...register("startDate")}
                                    />
                                    {errors.startDate && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.startDate.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="nextDueDate">
                                        Next Due Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nextDueDate"
                                        type="date"
                                        {...register("nextDueDate")}
                                    />
                                    {errors.nextDueDate && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.nextDueDate.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Customization */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Customization</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="icon">Icon (Letter or Emoji)</Label>
                                    <IconPicker
                                        value={iconValue || ""}
                                        onChange={(value) => setValue("icon", value || null)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="color">Color</Label>
                                    <ColorPicker
                                        value={colorValue || ""}
                                        onChange={(value) => setValue("color", value || null)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Optional description..."
                                rows={3}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Subscription"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

