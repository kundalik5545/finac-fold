"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table2, LayoutGrid } from "lucide-react";
import { AssetsTrackingTable } from "./AssetsTrackingTable";
import { AssetsTrackingCard } from "./AssetsTrackingCard";
import { AssetsPieChart } from "./AssetsPieChart";
import { AssetsLineChart } from "./AssetsLineChart";
import { Asset } from "@/lib/assets-tracking-types";

export function AssetsTrackingClient({ assets }: { assets: Asset[] }) {
    const [viewMode, setViewMode] = useState<"table" | "card">("table");

    return (
        <div className="space-y-8">
            {/* View Toggle */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
                    All Assets
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                    >
                        <Table2 size={16} className="mr-2" />
                        Table
                    </Button>
                    <Button
                        variant={viewMode === "card" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("card")}
                    >
                        <LayoutGrid size={16} className="mr-2" />
                        Card
                    </Button>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === "table" ? (
                <AssetsTrackingTable assets={assets} />
            ) : (
                <AssetsTrackingCard assets={assets} />
            )}

            {/* Charts Section - Only show if there are assets */}
            {assets && assets.length > 0 && (
                <div className="mt-12 space-y-8">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
                        Asset Analytics
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pie Chart */}
                        <div className="space-y-4">
                            <h3 className="text-md md:text-lg font-semibold">
                                Asset Distribution
                            </h3>
                            <AssetsPieChart assets={assets} />
                        </div>

                        {/* Line Chart */}
                        <div className="space-y-4">
                            <h3 className="text-md md:text-lg font-semibold">
                                Value Over Time
                            </h3>
                            <AssetsLineChart assets={assets} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

