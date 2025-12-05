import { BarChart, File, LayoutDashboard, Plus } from "lucide-react";

export const websiteDetails = {
  user: {
    name: "Kundalik Jadhav",
    email: "jk@fm.com",
    avatar: "https://avatars.githubusercontent.com/u/167022612",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Add Bank",
      url: "/add-bank",
      icon: Plus,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: BarChart,
    },
    {
      title: "File Handle",
      url: "/file-handle",
      icon: File,
    },
  ],
};
