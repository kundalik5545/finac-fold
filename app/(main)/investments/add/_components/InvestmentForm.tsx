"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { investmentFormSchema } from "@/lib/schema/investments-schema";
import { useState } from "react";
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
import { InvestmentType } from "@/lib/types/investments-types";
import { getInvestmentIcon } from "@/lib/utils/investment-utils";

export function InvestmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof investmentFormSchema>>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      name: "",
      type: (typeParam?.toUpperCase() as InvestmentType) || InvestmentType.STOCKS,
      symbol: null,
      icon: null,
      color: null,
      currentPrice: undefined,
      investedAmount: 0,
      quantity: undefined,
      purchaseDate: new Date().toISOString().split("T")[0],
      description: null,
    },
    mode: "onChange",
  });

  const iconValue = watch("icon");
  const colorValue = watch("color");
  const typeValue = watch("type");

  // Set default icon based on type if not set
  if (!iconValue && typeValue) {
    setValue("icon", getInvestmentIcon(typeValue as InvestmentType));
  }

  const onSubmit = async (data: z.infer<typeof investmentFormSchema>) => {
    setIsSubmitting(true);
    try {
      const cleanedData = {
        ...data,
        currentPrice: data.currentPrice || 0,
        quantity: data.quantity || 0,
        description:
          data.description && data.description.trim() !== ""
            ? data.description.trim()
            : null,
        icon: data.icon && data.icon.trim() !== "" ? data.icon.trim() : null,
        color: data.color && data.color.trim() !== "" ? data.color.trim() : null,
        symbol: data.symbol && data.symbol.trim() !== "" ? data.symbol.trim() : null,
      };

      const response = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Investment created successfully");
        router.push("/investments");
        router.refresh();
      } else {
        toast.error(responseData.error || "Failed to create investment");
        if (responseData.details) {
          console.error("Validation details:", responseData.details);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to create investment. Please try again.");
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
                    Investment Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Reliance Industries, SBI Bluechip Fund"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">
                    Investment Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={typeValue}
                    onValueChange={(value: InvestmentType) =>
                      setValue("type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={InvestmentType.STOCKS}>
                        Stocks
                      </SelectItem>
                      <SelectItem value={InvestmentType.MUTUAL_FUNDS}>
                        Mutual Funds
                      </SelectItem>
                      <SelectItem value={InvestmentType.GOLD}>Gold</SelectItem>
                      <SelectItem value={InvestmentType.FIXED_DEPOSIT}>
                        Fixed Deposit
                      </SelectItem>
                      <SelectItem value={InvestmentType.NPS}>NPS</SelectItem>
                      <SelectItem value={InvestmentType.PF}>PF</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                {(typeValue === InvestmentType.STOCKS ||
                  typeValue === InvestmentType.MUTUAL_FUNDS) && (
                  <div>
                    <Label htmlFor="symbol">Symbol/Ticker (Optional)</Label>
                    <Input
                      id="symbol"
                      {...register("symbol")}
                      placeholder="e.g., RELIANCE, SBIBC"
                    />
                    {errors.symbol && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.symbol.message}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="investedAmount">
                    Invested Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="investedAmount"
                    type="number"
                    step="0.01"
                    {...register("investedAmount", { valueAsNumber: true })}
                    placeholder="Enter invested amount"
                  />
                  {errors.investedAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.investedAmount.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity/Units</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.0001"
                    {...register("quantity", { valueAsNumber: true })}
                    placeholder="Enter quantity or units"
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currentPrice">Current Price (Optional)</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step="0.01"
                    {...register("currentPrice", { valueAsNumber: true })}
                    placeholder="Enter current price per unit"
                  />
                  {errors.currentPrice && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.currentPrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="purchaseDate">
                    Purchase Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    {...register("purchaseDate")}
                  />
                  {errors.purchaseDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.purchaseDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Customization */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Visual Customization
              </h3>
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

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Add any additional notes about this investment"
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
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Investment"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

