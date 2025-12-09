import { ChartConfig } from "@/components/ui/chart";

export type ResponseType = "TEXT" | "TABLE" | "CHART";
export type ChartType = "line" | "bar" | "pie" | "donut";

export interface TableData {
  columns: string[];
  rows: Record<string, any>[];
}

export interface ChartData {
  type: ChartType;
  data: any[];
  config: ChartConfig;
  xAxisKey?: string;
  yAxisKey?: string;
  dataKey?: string;
  nameKey?: string;
  title?: string;
  description?: string;
}

export interface FormattedResponse {
  type: ResponseType;
  content?: string;
  table?: TableData;
  chart?: ChartData;
}

const PIE_COLORS = [
  "#14b8a6", // teal-500
  "#f43f5e", // rose-500
  "#a855f7", // purple-500
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f472b6", // pink-400
  "#fbbf24", // yellow-400
  "#6366f1", // indigo-500
  "#ef4444", // red-500
  "#f59e42", // orange-400
  "#8b5cf6", // violet-500
  "#22d3ee", // cyan-400
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function formatAsTable(data: any[]): TableData {
  if (!Array.isArray(data) || data.length === 0) {
    return { columns: [], rows: [] };
  }
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (!key.startsWith("_") && key !== "fill") {
        allKeys.add(key);
      }
    });
  });
  const columns = Array.from(allKeys);

  const rows = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      const val = item[col];
      if (val instanceof Date) {
        row[col] = val.toLocaleDateString();
      } else if (
        typeof val === "number" &&
        (col.toLowerCase().includes("amount") ||
          col.toLowerCase().includes("value") ||
          col.toLowerCase().includes("price") ||
          col.toLowerCase().includes("total"))
      ) {
        row[col] = formatCurrency(val);
      } else {
        row[col] = val;
      }
    });
    return row;
  });

  return { columns, rows };
}

export function formatAsLineChart(
  data: any[],
  xAxisKey: string = "date",
  yAxisKey: string = "total",
  title?: string,
  description?: string
): ChartData {
  const chartData = data.map((item) => ({
    ...item,
    [xAxisKey]: item[xAxisKey] ?? item.date ?? item.name,
    [yAxisKey]:
      typeof item[yAxisKey] === "number"
        ? item[yAxisKey]
        : Number(item[yAxisKey]) || 0,
  }));

  const config: ChartConfig = {
    [yAxisKey]: {
      label: yAxisKey,
      color: "hsl(var(--chart-1))",
    },
  };

  return {
    type: "line",
    data: chartData,
    config,
    xAxisKey,
    yAxisKey,
    title,
    description,
  };
}

export function formatAsBarChart(
  data: any[],
  xAxisKey: string = "name",
  yAxisKeys: string[] = ["value"],
  title?: string,
  description?: string
): ChartData {
  const chartData = data.map((item) => {
    const result: Record<string, any> = {
      [xAxisKey]: item[xAxisKey] ?? item.name ?? item.category ?? item.type,
    };
    yAxisKeys.forEach((key) => {
      result[key] =
        typeof item[key] === "number" ? item[key] : Number(item[key]) || 0;
    });
    return result;
  });

  const config: ChartConfig = {};
  yAxisKeys.forEach((key, idx) => {
    config[key] = {
      label: key,
      color: `hsl(var(--chart-${(idx % 5) + 1}))`,
    };
  });

  return {
    type: "bar",
    data: chartData,
    config,
    xAxisKey,
    yAxisKey: yAxisKeys[0],
    title,
    description,
  };
}

export function formatAsPieChart(
  data: any[],
  nameKey: string = "name",
  valueKey: string = "value",
  type: "pie" | "donut" = "donut",
  title?: string,
  description?: string
): ChartData {
  const chartData = data.map((item, idx) => ({
    name:
      item[nameKey] ??
      item.name ??
      item.category ??
      item.type ??
      `Item ${idx + 1}`,
    value:
      typeof item[valueKey] === "number"
        ? item[valueKey]
        : Number(item[valueKey]) || 0,
    fill: item.color || item.fill || PIE_COLORS[idx % PIE_COLORS.length],
  }));

  const config: ChartConfig = {};
  chartData.forEach((item) => {
    config[item.name] = {
      label: item.name,
      color: item.fill,
    };
  });

  return {
    type,
    data: chartData,
    config,
    nameKey: "name",
    dataKey: "value",
    title,
    description,
  };
}

export function formatResponse(
  queryType: ResponseType,
  data: any,
  chartType?: ChartType,
  explanation?: string
): FormattedResponse {
  if (queryType === "TEXT") {
    return {
      type: "TEXT",
      content: explanation || JSON.stringify(data, null, 2),
    };
  }

  if (queryType === "TABLE") {
    const tableData = Array.isArray(data) ? data : [data];
    return {
      type: "TABLE",
      content: explanation,
      table: formatAsTable(tableData),
    };
  }

  if (queryType === "CHART") {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        type: "TEXT",
        content: explanation || "No data available for chart",
      };
    }

    // We'll need keys for bar/pie chart types
    let keys: string[] = [];
    if (data[0] && typeof data[0] === "object") {
      keys = Object.keys(data[0]);
    }

    let chart: ChartData;
    switch (chartType) {
      case "line":
        chart = formatAsLineChart(data, "date", "total", explanation);
        break;
      case "bar": {
        const yAxisCandidates = keys.filter(
          (k) =>
            k !== "date" &&
            k !== "name" &&
            k !== "category" &&
            k !== "type" &&
            typeof data[0][k] === "number"
        );
        const xAxisCandidate =
          keys.find(
            (k) =>
              k === "date" || k === "name" || k === "category" || k === "type"
          ) || "name";
        chart = formatAsBarChart(
          data,
          xAxisCandidate,
          yAxisCandidates.length > 0 ? yAxisCandidates : ["value"],
          explanation
        );
        break;
      }
      case "pie":
      case "donut": {
        const nameCandidate =
          keys.find((k) => k === "name" || k === "category" || k === "type") ||
          "name";
        const valueCandidate =
          keys.find((k) => k === "value" || k === "total" || k === "amount") ||
          "value";
        chart = formatAsPieChart(
          data,
          nameCandidate,
          valueCandidate,
          chartType,
          explanation
        );
        break;
      }
      default:
        chart = formatAsBarChart(data, undefined, undefined, explanation);
    }

    return {
      type: "CHART",
      content: explanation,
      chart,
    };
  }

  return {
    type: "TEXT",
    content: explanation || JSON.stringify(data, null, 2),
  };
}

export function generateSummary(data: any, entity: string): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return `No ${entity} found.`;
    if (data.length === 1) return `Found 1 ${entity}.`;
    return `Found ${data.length} ${entity}${data.length > 1 ? "s" : ""}.`;
  }
  if (typeof data === "number") {
    return `Total: ${formatCurrency(data)}`;
  }
  return `Data retrieved successfully.`;
}
