"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

interface TransactionSortDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sortOption: SortOption;
    onSort: (sort: SortOption) => void;
}

export function TransactionSortDialog({
    open,
    onOpenChange,
    sortOption,
    onSort,
}: TransactionSortDialogProps) {
    const [localSort, setLocalSort] = useState<SortOption>(sortOption);

    useEffect(() => {
        setLocalSort(sortOption);
    }, [sortOption, open]);

    const handleApply = () => {
        onSort(localSort);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sort Transactions</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <RadioGroup value={localSort} onValueChange={(value) => setLocalSort(value as SortOption)}>
                        <div className="flex items-center space-x-2 py-2">
                            <RadioGroupItem value="date-desc" id="date-desc" />
                            <Label htmlFor="date-desc" className="cursor-pointer">
                                Date (Newest First)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 py-2">
                            <RadioGroupItem value="date-asc" id="date-asc" />
                            <Label htmlFor="date-asc" className="cursor-pointer">
                                Date (Oldest First)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 py-2">
                            <RadioGroupItem value="amount-desc" id="amount-desc" />
                            <Label htmlFor="amount-desc" className="cursor-pointer">
                                Amount (High to Low)
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 py-2">
                            <RadioGroupItem value="amount-asc" id="amount-asc" />
                            <Label htmlFor="amount-asc" className="cursor-pointer">
                                Amount (Low to High)
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
                <DialogFooter>
                    <Button onClick={handleApply}>Apply</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

