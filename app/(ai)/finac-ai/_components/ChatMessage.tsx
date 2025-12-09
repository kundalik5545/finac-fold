"use client";

import { ChatMessage as ChatMessageType } from "@/action/ai-chat";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === "USER";

    return (
        <div className={`flex gap-4 p-4 ${isUser ? "bg-muted/50" : ""}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">{isUser ? "You" : "AI Assistant"}</div>
                {message.responseType === "TABLE" && message.metadata?.table ? (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {message.metadata.table.columns.map((col: string) => (
                                        <TableHead key={col}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {message.metadata.table.rows.map((row: any, idx: number) => (
                                    <TableRow key={idx}>
                                        {message.metadata.table.columns.map((col: string) => (
                                            <TableCell key={col}>{row[col] ?? "-"}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : message.responseType === "CHART" && message.metadata?.chart ? (
                    <ChartMessage chart={message.metadata.chart} />
                ) : (
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                )}
            </div>
        </div>
    );
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
                        {chart.type === "line" ? (
                            <LineChart data={chart.data}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey={chart.xAxisKey} className="text-xs" />
                                <YAxis tickFormatter={formatCurrency} className="text-xs" />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                                <Line type="monotone" dataKey={chart.yAxisKey} stroke="hsl(var(--chart-1))" strokeWidth={2} />
                            </LineChart>
                        ) : chart.type === "bar" ? (
                            <BarChart data={chart.data}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey={chart.xAxisKey} className="text-xs" angle={-45} textAnchor="end" height={80} />
                                <YAxis tickFormatter={formatCurrency} className="text-xs" />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                                <Legend />
                                {Object.keys(chart.config).map((key, idx) => (
                                    <Bar key={key} dataKey={key} fill={`hsl(var(--chart-${(idx % 5) + 1}))`} radius={[4, 4, 0, 0]} />
                                ))}
                            </BarChart>
                        ) : chart.type === "pie" || chart.type === "donut" ? (
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
                                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                                >
                                    {chart.data.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill || `hsl(var(--chart-${(index % 5) + 1}))`} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        ) : null}
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

