import {
  Wallet,
  LayoutDashboard,
  ArrowUpDown,
  BanknoteIcon,
  Tags,
  Calendar,
  TrendingUp,
  Target,
  Building2,
  List,
  Upload,
  Download,
  Settings,
  Search,
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: ArrowUpDown,
  },
  {
    title: "Bank Accounts",
    url: "/bank-account",
    icon: BanknoteIcon,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: Tags,
  },
  {
    title: "Budgets",
    url: "/budgets",
    icon: Wallet,
  },
  {
    title: "Recurring Transactions",
    url: "/recurring-transactions",
    icon: Calendar,
  },
  {
    title: "Investments",
    url: "/investments",
    icon: TrendingUp,
  },
  {
    title: "Investment Analytics",
    url: "/investments/analytics",
    icon: TrendingUp,
  },
  {
    title: "Goals",
    url: "/investments/goals",
    icon: Target,
  },
  {
    title: "Assets",
    url: "/assets-tracking",
    icon: Building2,
  },
  {
    title: "To Do List",
    url: "/todo",
    icon: List,
  },
  {
    title: "Bulk Upload",
    url: "/bulk-upload",
    icon: Upload,
  },
  {
    title: "Download Reports",
    url: "/download-reports",
    icon: Download,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export const navQuick = [
  {
    title: "Search Transactions",
    url: "/search-transactions",
    icon: Search,
  },
  {
    title: "Schedule Transactions",
    url: "/schedule-transactions",
    icon: Calendar,
  },
];
