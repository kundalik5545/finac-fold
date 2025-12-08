"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateInvestmentSchema } from "@/lib/schema/investments-schema";
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
import { Investment, InvestmentType } from "@/lib/types/investments-types";

interface EditInvestmentFormProps {
  investment: Investment;
}

export function EditInvestmentForm({ investment }: EditInvestmentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof updateInvestmentSchema>>({
    resolver: zodResolver(updateInvestmentSchema),
    defaultValues: {
      name: investment.name,
      type: investment.type,
      symbol: investment.symbol || null,
      icon: investment.icon || null,
      color: investment.color || null,
      currentPrice: investment.currentPrice,
      investedAmount: investment.investedAmount,
      quantity: investment.quantity,
      purchaseDate: new Date(investment.purchaseDate)
        .toISOString()
        .split("T")[0],
      description: investment.description || null,
    },
    mode: "onChange",
  });

  const iconValue = watch("icon");
  const colorValue = watch("color");
  const typeValue = watch("type");

  const onSubmit = async (data: z.infer<typeof updateInvestmentSchema>) => {
    setIsSubmitting(true);
    try {
      const cleanedData: any = {};
      if (data.name !== undefined) cleanedData.name = data.name.trim();
      if (data.type !== undefined) cleanedData.type = data.type;
      if (data.symbol !== undefined)
        cleanedData.symbol =
          data.symbol && data.symbol.trim() !== "" ? data.symbol.trim() : null;
      if (data.icon !== undefined)
        cleanedData.icon =
          data.icon && data.icon.trim() !== "" ? data.icon.trim() : null;
      if (data.color !== undefined)
        cleanedData.color =
          data.color && data.color.trim() !== "" ? data.color.trim() : null;
      if (data.currentPrice !== undefined)
        cleanedData.currentPrice = data.currentPrice;
      if (data.investedAmount !== undefined)
        cleanedData.investedAmount = data.investedAmount;
      if (data.quantity !== undefined) cleanedData.quantity = data.quantity;
      if (data.purchaseDate !== undefined) cleanedData.purchaseDate = data.purchaseDate;
      if (data.description !== undefined)
        cleanedData.description =
          data.description && data.description.trim() !== ""
            ? data.description.trim()
            : null;

      const response = await fetch(`/api/investments/${investment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Investment updated successfully");
        router.push(`/investments/${investment.id}`);
        router.refresh();
      } else {
        toast.error(responseData.error || "Failed to update investment");
        if (responseData.details) {
          console.error("Validation details:", responseData.details);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to update investment. Please try again.");
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
                  <Label htmlFor="name">Investment Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Reliance Industries"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Investment Type</Label>
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
                    <Label htmlFor="symbol">Symbol/Ticker</Label>
                    <Input
                      id="symbol"
                      {...register("symbol")}
                      placeholder="e.g., RELIANCE"
                    />
                    {errors.symbol && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.symbol.message}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="investedAmount">Invested Amount</Label>
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
                  <Label htmlFor="currentPrice">Current Price</Label>
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
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
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
                  <Label>Color</Label>
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
                <Label htmlFor="description">Description</Label>
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
                {isSubmitting ? "Updating..." : "Update Investment"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

