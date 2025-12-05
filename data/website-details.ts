import {
  BarChart,
  DollarSign,
  File,
  LayoutDashboard,
  Plus,
} from "lucide-react";

type WebsiteDetails = {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  websiteName: string;
  websiteDescription: string;
  websiteIcon: React.ElementType;
  navMain: NavMain[];
};

type NavMain = {
  title: string;
  url: string;
  icon: React.ElementType;
};

export const websiteDetails: WebsiteDetails = {
  user: {
    name: "Kundalik Jadhav",
    email: "jk@fm.com",
    avatar: "https://avatars.githubusercontent.com/u/167022612",
  },
  websiteName: "Finac Fold",
  websiteDescription:
    "Take control of your finances with our powerful personal finance tracker",
  websiteIcon: DollarSign,
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
