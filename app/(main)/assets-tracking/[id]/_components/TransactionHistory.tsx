"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { AssetsTransaction } from "@/lib/assets-tracking-types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TransactionHistory({
    assetId,
    transactions: initialTransactions,
}: {
    assetId: string;
    transactions: AssetsTransaction[];
}) {
    const { formatCurrency } = useFormatCurrency("en-IN", "INR");
    const router = useRouter();
    const [transactions, setTransactions] = useState(initialTransactions);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingStates, setLoadingStates] = useState<{
        [key: string]: boolean;
    }>({});

    // Form state
    const [formData, setFormData] = useState({
        value: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
    });

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(
                `/api/assets-tracking/${assetId}/transactions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        value: parseFloat(formData.value),
                        date: new Date(formData.date),
                        notes: formData.notes || null,
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setTransactions([data.transaction, ...transactions]);
                toast.success("Transaction added successfully");
                setIsDialogOpen(false);
                setFormData({
                    value: "",
                    date: new Date().toISOString().split("T")[0],
                    notes: "",
                });
                router.refresh();
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to add transaction");
            }
        } catch (error) {
            toast.error("Failed to add transaction");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDateForInput = (date: Date | string) => {
        const d = new Date(date);
        return d.toISOString().split("T")[0];
    };

    const handleEdit = (transaction: AssetsTransaction) => {
        setEditingTransaction(transaction);
        setEditFormData({
            value: transaction.value.toString(),
            date: formatDateForInput(transaction.date),
            notes: transaction.notes || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTransaction) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(
                `/api/assets-tracking/${assetId}/transactions/${editingTransaction.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        value: parseFloat(editFormData.value),
                        date: new Date(editFormData.date),
                        notes: editFormData.notes || null,
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setTransactions(
                    transactions.map((t) =>
                        t.id === editingTransaction.id ? data.transaction : t
                    )
                );
                toast.success("Transaction updated successfully");
                setIsEditDialogOpen(false);
                setEditingTransaction(null);
                router.refresh();
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to update transaction");
            }
        } catch (error) {
            toast.error("Failed to update transaction");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (transactionId: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) {
            return;
        }

        setLoadingStates((prev) => ({
            ...prev,
            [`delete-${transactionId}`]: true,
        }));

        try {
            const response = await fetch(
                `/api/assets-tracking/${assetId}/transactions/${transactionId}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                setTransactions(transactions.filter((t) => t.id !== transactionId));
                toast.success("Transaction deleted successfully");
                router.refresh();
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to delete transaction");
            }
        } catch (error) {
            toast.error("Failed to delete transaction");
        } finally {
            setLoadingStates((prev) => ({
                ...prev,
                [`delete-${transactionId}`]: false,
            }));
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Transaction History</CardTitle>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus size={16} className="mr-2" />
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Transaction</DialogTitle>
                                <DialogDescription>
                                    Record a new value for this asset
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="value">Value *</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.value}
                                        onChange={(e) =>
                                            setFormData({ ...formData, value: e.target.value })
                                        }
                                        placeholder="Enter asset value"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="date">Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, date: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData({ ...formData, notes: e.target.value })
                                        }
                                        placeholder="Optional notes about this transaction"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Adding..." : "Add Transaction"}
                                    </Button>
                                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Transaction Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Transaction</DialogTitle>
                <DialogDescription>
                  Update the transaction details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-value">Value *</Label>
                  <Input
                    id="edit-value"
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.value}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, value: e.target.value })
                    }
                    placeholder="Enter asset value"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-date">Date *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editFormData.notes}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, notes: e.target.value })
                    }
                    placeholder="Optional notes about this transaction"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingTransaction(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Transaction"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
                {!transactions || transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No transactions yet. Add one to track value changes over time.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="font-semibold text-lg">
                                                {formatCurrency(Number(transaction.value))}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(transaction.date)}
                                            </p>
                                        </div>
                                    </div>
                                    {transaction.notes && (
                                        <p className="text-sm mt-2 text-muted-foreground">
                                            {transaction.notes}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(transaction.id)}
                                    disabled={!!loadingStates[`delete-${transaction.id}`]}
                                >
                                    <Trash size={16} className="text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

