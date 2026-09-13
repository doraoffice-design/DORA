"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/roles";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardTopbar({ title }: { title: string }) {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useStore();

  if (!currentUser) return null;

  const switchRole = (role: Role) => {
    setCurrentUser({ ...currentUser, role });
  };

  const logout = () => {
    setCurrentUser(null);
    router.push("/");
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-medium">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Mock UI · no backend
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-2">
                Viewing as: {ROLE_LABELS[currentUser.role]}
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Demo — switch role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_ROLES.map((role) => (
                <DropdownMenuItem key={role} onClick={() => switchRole(role)}>
                  {ROLE_LABELS[role]}
                  {role === currentUser.role && (
                    <span className="ml-auto text-xs text-muted-foreground">current</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {initials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <span className="font-medium">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {ROLE_LABELS[currentUser.role]}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} variant="destructive">
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
