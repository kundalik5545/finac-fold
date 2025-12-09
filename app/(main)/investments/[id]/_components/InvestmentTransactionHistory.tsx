"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import {
  InvestmentTransaction,
  InvestmentPriceHistory,
  InvestmentType,
} from "@/lib/types/investments-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requiresManualTransactions } from "@/lib/utils/investment-utils";

interface InvestmentTransactionHistoryProps {
  investmentId: string;
  transactions: InvestmentTransaction[];
  priceHistory: InvestmentPriceHistory[];
  investmentType: InvestmentType;
}

export function InvestmentTransactionHistory({
  investmentId,
  transactions: initialTransactions,
  priceHistory,
  investmentType,
}: InvestmentTransactionHistoryProps) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    transactionType: "INVEST" as "INVEST" | "WITHDRAW",
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
      const response = await fetch(`/api/investments/${investmentId}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          date: new Date(formData.date),
          transactionType: formData.transactionType,
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
          transactionType: "INVEST",
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

  const showManualTransactions = requiresManualTransactions(investmentType);

  return (
    <div className="space-y-6">
      {/* Price History Table */}
      {priceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{formatDate(history.date)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(history.price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{history.source}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {showManualTransactions && (
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
                      Record a new transaction for this investment
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="transactionType">
                        Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.transactionType}
                        onValueChange={(value: "INVEST" | "WITHDRAW") =>
                          setFormData({ ...formData, transactionType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INVEST">Invest</SelectItem>
                          <SelectItem value="WITHDRAW">Withdraw</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                No transactions yet. Add your first transaction.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.transactionType === "INVEST"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {transaction.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

