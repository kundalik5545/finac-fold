"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Asset } from "@/lib/assets-tracking-types";

export function AssetDetailView({ asset }: { asset: Asset }) {
    const { formatCurrency } = useFormatCurrency("en-IN", "INR");
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const purchaseValue = Number(asset.purchaseValue);
    const currentValue = Number(asset.currentValue);
    const gainLoss = currentValue - purchaseValue;
    const gainLossPercent =
        purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
    const isGain = gainLoss >= 0;

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleEdit = () => {
        router.push(`/assets-tracking/edit/${asset.id}`);
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${asset.name}"?`)) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/assets-tracking/${asset.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Asset deleted successfully");
                router.push("/assets-tracking");
                router.refresh();
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to delete asset");
            }
        } catch (error) {
            toast.error("Failed to delete asset");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{asset.name}{asset?.icon}</h1>
                    <Badge className="mt-2">{asset.type}</Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit size={16} className="mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        <Trash size={16} className="mr-2" />
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </div>

            {/* Asset Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Current Value Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Current Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(currentValue)}</p>
                    </CardContent>
                </Card>

                {/* Purchase Value Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Purchase Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {formatCurrency(purchaseValue)}
                        </p>
                    </CardContent>
                </Card>

                {/* Gain/Loss Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Gain/Loss
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {isGain ? (
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                            <div>
                                <p
                                    className={`text-2xl font-bold ${isGain
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                        }`}
                                >
                                    {formatCurrency(Math.abs(gainLoss))}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {gainLossPercent.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Asset Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Purchase Date</p>
                            <p className="font-medium">{formatDate(asset.purchaseDate)}</p>
                        </div>
                        {asset.paymentMethod && (
                            <div>
                                <p className="text-sm text-muted-foreground">Payment Method</p>
                                <p className="font-medium">{asset.paymentMethod}</p>
                            </div>
                        )}
                        {asset.purchaseReason && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">Purchase Reason</p>
                                <p className="font-medium">{asset.purchaseReason}</p>
                            </div>
                        )}
                        {asset.description && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="font-medium">{asset.description}</p>
                            </div>
                        )}
                        {asset.sellDate && (
                            <div>
                                <p className="text-sm text-muted-foreground">Sell Date</p>
                                <p className="font-medium">{formatDate(asset.sellDate)}</p>
                            </div>
                        )}
                        {asset.sellPrice && (
                            <div>
                                <p className="text-sm text-muted-foreground">Sell Price</p>
                                <p className="font-medium">
                                    {formatCurrency(Number(asset.sellPrice))}
                                </p>
                            </div>
                        )}
                        {asset.transactionStatus && (
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Transaction Status
                                </p>
                                <Badge variant="outline">{asset.transactionStatus}</Badge>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

