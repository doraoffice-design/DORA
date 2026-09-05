"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  Handshake,
  HandCoins,
  LayoutDashboard,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useStore } from "@/lib/store";

const partA = [
  { title: "Overview", url: "/staff", icon: LayoutDashboard },
  { title: "Endowment Funds", url: "/staff/endowment-funds", icon: Banknote },
  { title: "CSR Grants & Milestones", url: "/staff/csr-grants", icon: HandCoins },
];

const partB = [
  { title: "Donor CRM", url: "/staff/donors", icon: Users },
  { title: "Fundraising Pipeline", url: "/staff/pipeline", icon: TrendingUp },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser } = useStore();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Handshake className="size-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-tight">DRMP</span>
            <span className="text-xs text-muted-foreground leading-tight">
              DORA · IIT Mandi
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Governance & Compliance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {partA.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Resource Generation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {partB.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Signed in as{" "}
          <span className="font-medium text-foreground">{currentUser?.name}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
