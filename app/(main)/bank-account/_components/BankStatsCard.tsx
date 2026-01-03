import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BankStatsCardProps {
    cardTitle: string;
    number: number | string;
    description: string;
    icon: React.ElementType;
}

const BankStatsCard: React.FC<BankStatsCardProps> = ({ cardTitle, number, description, icon: Icon }) => {
    const colorMap: Record<string, string> = {
        "Total Accounts": "bg-blue-100 dark:bg-blue-900/30",
        "Total Balance": "bg-orange-100 dark:bg-orange-900/30",
        "Total Spending": "bg-red-100 dark:bg-red-900/30",
        "Total Income": "bg-green-100 dark:bg-green-900/30",
    };
    const defaultBg = "bg-blue-100 dark:bg-blue-900/30";
    const iconBg = colorMap[cardTitle] || defaultBg;

    // Sizes, padding, and roundness for icon background
    const iconWrapperClasses = `flex items-center justify-center rounded-full p-2 ${iconBg}`;

    return (
        <div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between ">
                    <CardTitle className="text-sm font-medium">{cardTitle}</CardTitle>
                    <span className={iconWrapperClasses}>
                        <Icon className="h-6 w-6 text-muted-foreground" />
                    </span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl md:text-4xl font-bold">{number}</div>
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default BankStatsCard
