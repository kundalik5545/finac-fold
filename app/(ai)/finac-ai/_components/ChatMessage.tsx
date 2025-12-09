"use client";

import { ChatMessage as ChatMessageType } from "@/action/ai-chat";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Legend
} from "recharts";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === "USER";

    return (
        <div className={`flex gap-4 p-4 ${isUser ? "bg-muted/50" : ""} w-full`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className="flex-1 space-y-2 min-w-0 max-w-full">
                <div className="text-sm font-medium">{isUser ? "You" : "AI Assistant"}</div>
                {message.responseType === "TABLE" && message.metadata?.table ? (
                    <div className="border rounded-lg overflow-hidden w-full">
                        <div className="overflow-x-auto -mx-1">
                            <div className="inline-block min-w-full px-1">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {message.metadata.table.columns.map((col: string) => (
                                                <TableHead key={col} className="whitespace-nowrap px-4">{col}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {message.metadata.table.rows.map((row: any, idx: number) => (
                                            <TableRow key={idx}>
                                                {message.metadata.table.columns.map((col: string) => {
                                                    const cellValue = row[col];
                                                    // Safely render cell value - handle objects, null, undefined
                                                    let displayValue: string;
                                                    if (cellValue === null || cellValue === undefined) {
                                                        displayValue = "-";
                                                    } else if (typeof cellValue === "object" && !Array.isArray(cellValue)) {
                                                        // Handle objects that might have slipped through
                                                        if (cellValue.name !== undefined) {
                                                            displayValue = String(cellValue.name);
                                                        } else if (cellValue.id !== undefined) {
                                                            displayValue = String(cellValue.id);
                                                        } else {
                                                            displayValue = JSON.stringify(cellValue);
                                                        }
                                                    } else {
                                                        displayValue = String(cellValue);
                                                    }
                                                    return (
                                                        <TableCell key={col} className="whitespace-nowrap px-4">
                                                            {displayValue}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                ) : message.responseType === "CHART" && message.metadata?.chart ? (
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[600px]">
                            <ChartMessage chart={message.metadata.chart} />
                        </div>
                    </div>
                ) : (
                    <div className="text-sm whitespace-pre-wrap wrap-break-word overflow-wrap-anywhere">{message.content}</div>
                )}
            </div>
        </div>
    );
}

// Helper for picking what to render in chart responsive container for proper TS
function getChartContent(chart: any, formatCurrency: (value: number) => string) {
    if (chart.type === "line") {
        return (
            <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={chart.xAxisKey} className="text-xs" />
                <YAxis tickFormatter={formatCurrency} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Line type="monotone" dataKey={chart.yAxisKey} stroke="hsl(var(--chart-1))" strokeWidth={2} />
            </LineChart>
        );
    }
    if (chart.type === "bar") {
        return (
            <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={chart.xAxisKey} className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={formatCurrency} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Legend />
                {Object.keys(chart.config || {}).map((key, idx) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        fill={`hsl(var(--chart-${(idx % 5) + 1}))`}
                        radius={[4, 4, 0, 0]}
                    />
                ))}
            </BarChart>
        );
    }
    if (chart.type === "pie" || chart.type === "donut") {
        return (
            <PieChart>
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Pie
                    data={chart.data}
                    dataKey={chart.dataKey || "value"}
                    nameKey={chart.nameKey || "name"}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={chart.type === "donut" ? 54 : 0}
                    label={({ name, value }: any) => `${name}: ${formatCurrency(value)}`}
                >
                    {chart.data.map((entry: any, index: number) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.fill || `hsl(var(--chart-${(index % 5) + 1}))`}
                        />
                    ))}
                </Pie>
                <Legend />
            </PieChart>
        );
    }
    // Return a fallback (empty fragment is valid ReactElement)
    return <></>;
}

function ChartMessage({ chart }: { chart: any }) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card>
            {chart.title && (
                <CardHeader>
                    <CardTitle>{chart.title}</CardTitle>
                    {chart.description && <CardDescription>{chart.description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent>
                <ChartContainer config={chart.config} className="min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        {getChartContent(chart, formatCurrency)}
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

