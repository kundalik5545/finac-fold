"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Calendar, CreditCard, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Subscription, formatCurrency, formatFrequency } from "@/lib/subscriptions-types";
import { cn } from "@/lib/utils";

export function SubscriptionDetailView({
  subscription,
}: {
  subscription: Subscription;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(subscription.nextDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = calculateDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const icon = subscription.icon || subscription.name.charAt(0).toUpperCase();
  const color = subscription.color || "#6b7280";

  const handleEdit = () => {
    router.push(`/subscriptions/edit/${subscription.id}`);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${subscription.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Subscription deleted successfully");
        router.push("/subscriptions");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete subscription");
      }
    } catch (error) {
      toast.error("Failed to delete subscription");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {subscription.name}
            </h1>
            <Badge
              variant={subscription.isActive ? "outline" : "secondary"}
              className="mt-2"
            >
              {subscription.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
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

      {/* Subscription Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Amount Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(subscription.amount)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatFrequency(subscription.frequency)}
            </p>
          </CardContent>
        </Card>

        {/* Next Due Date Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Due Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatDate(subscription.nextDueDate)}
            </p>
            {isOverdue && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Overdue by {Math.abs(daysUntilDue)} days
              </p>
            )}
            {!isOverdue && daysUntilDue >= 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {daysUntilDue === 0
                  ? "Due today"
                  : `${daysUntilDue} days remaining`}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Start Date Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Start Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {formatDate(subscription.startDate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {subscription.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{subscription.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

