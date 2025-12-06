"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { GoalTransaction } from "@/lib/goals-types";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GoalProgressAreaChart } from "./GoalProgressAreaChart";

export function GoalTransactionHistory({
  goalId,
  transactions: initialTransactions,
}: {
  goalId: string;
  transactions: GoalTransaction[];
}) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<GoalTransaction | null>(null);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    amount: "",
    date: "",
    notes: "",
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/goals/${goalId}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          date: new Date(formData.date),
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions([data.transaction, ...transactions]);
        toast.success("Transaction added successfully");
        setIsDialogOpen(false);
        setFormData({
          amount: "",
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

  const handleEdit = (transaction: GoalTransaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      amount: transaction.amount.toString(),
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
        `/api/goals/${goalId}/transactions/${editingTransaction.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(editFormData.amount),
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

  const handleDelete = async (
    transactionId: string,
    transactionAmount: number
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete this transaction of ${formatCurrency(transactionAmount)}?`
      )
    ) {
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [`delete-${transactionId}`]: true }));

    try {
      const response = await fetch(
        `/api/goals/${goalId}/transactions/${transactionId}`,
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
    <div className="space-y-6">
      {/* Progress Chart */}
      <GoalProgressAreaChart transactions={transactions} />

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                  <DialogDescription>
                    Record a new amount added to this goal
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Add any notes about this transaction"
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
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet. Add your first transaction to track progress.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(transaction)}
                            disabled={!!loadingStates[`edit-${transaction.id}`]}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(transaction.id, transaction.amount)
                            }
                            disabled={
                              !!loadingStates[`delete-${transaction.id}`]
                            }
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update transaction details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={editFormData.amount}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, amount: e.target.value })
                }
                placeholder="Enter amount"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-date">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={editFormData.date}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, notes: e.target.value })
                }
                placeholder="Add any notes about this transaction"
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
  );
}

