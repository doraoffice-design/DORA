"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Handshake, Landmark, Mail } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DonorPortalPage() {
  const { donors, funds, grants } = useStore();
  const [donorId, setDonorId] = useState(donors[0]?.id);

  const donor = donors.find((d) => d.id === donorId) ?? donors[0];

  const supportedFunds = funds.filter((f) => f.donorName === donor.name);
  const supportedGrants = grants.filter((g) => g.companyName === donor.name);
  const hasGivingHistory = supportedFunds.length > 0 || supportedGrants.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Handshake className="size-4.5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">DORA</span>
              <span className="text-xs text-muted-foreground">Donor Portal</span>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="gap-2">
                  Viewing as: {donor.name}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Demo — switch donor</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {donors.map((d) => (
                  <DropdownMenuItem key={d.id} onClick={() => setDonorId(d.id)}>
                    {d.name}
                    {d.id === donor.id && (
                      <span className="ml-auto text-xs text-muted-foreground">current</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-6 py-10">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback>{initials(donor.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">Welcome back, {donor.name}</h1>
            <p className="text-sm text-muted-foreground">
              {donor.type} · Thank you for supporting IIT Mandi
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Your total contribution</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {formatINR(donor.totalGiving)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between gap-4 pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Your relationship manager</p>
                <p className="mt-1 font-medium">{donor.relationshipOwner}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                nativeButton={false}
                render={<a href="mailto:dora@iitmandi.ac.in" aria-label="Email your relationship manager" />}
              >
                <Mail className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">What your giving supports</h2>

          {!hasGivingHistory && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No active giving on record yet. Once your first contribution is
                processed, it will show up here.
              </CardContent>
            </Card>
          )}

          {supportedFunds.map((fund) => (
            <Card key={fund.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Landmark className="size-4 text-muted-foreground" />
                    {fund.name}
                  </CardTitle>
                  <StatusBadge status={fund.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{fund.purpose}</p>
                <p>
                  Established {formatDate(fund.establishedDate)} · Your gift:{" "}
                  {formatINR(fund.corpusValue)}
                </p>
              </CardContent>
            </Card>
          ))}

          {supportedGrants.map((grant) => {
            const completed = grant.milestones.filter((m) => m.status === "Disbursed").length;
            return (
              <Card key={grant.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{grant.grantTitle}</CardTitle>
                    <StatusBadge status={grant.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    {grant.csrActSection} · {formatINR(grant.totalAmount)} committed
                  </p>
                  {grant.milestones.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">
                        {completed} of {grant.milestones.length} milestones complete
                      </p>
                      <div className="space-y-1.5">
                        {grant.milestones.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                          >
                            <span>{m.title}</span>
                            <StatusBadge status={m.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Want to expand your impact or explore a new area to support?
            </p>
            <Button
              size="sm"
              className="gap-1.5"
              nativeButton={false}
              render={<a href="mailto:dora@iitmandi.ac.in" />}
            >
              Talk to DORA
              <ArrowRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-4xl px-6 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dean of Resources & Alumni Affairs, IIT Mandi
        </div>
      </footer>
    </div>
  );
}
