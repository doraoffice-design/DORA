"use client";

import Link from "next/link";
import { ArrowUpRight, Banknote, HandCoins, TrendingUp, Users } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatDate, formatINR } from "@/lib/format";

export default function StaffOverviewPage() {
  const { funds, grants, donors, opportunities } = useStore();

  const totalCorpus = funds.reduce((sum, f) => sum + f.currentBalance, 0);
  const activeGrants = grants.filter((g) => g.status === "Active");
  const openPipeline = opportunities.filter(
    (o) => o.stage !== "ClosedWon" && o.stage !== "ClosedLost",
  );
  const pipelineValue = openPipeline.reduce((sum, o) => sum + o.estimatedAmount, 0);
  const grantsAwaitingApproval = grants.filter((g) => g.status === "PendingApproval");
  const milestonesAwaitingReview = grants.flatMap((g) =>
    g.milestones
      .filter((m) => m.status === "Submitted" || m.status === "UnderReview")
      .map((m) => ({ grant: g, milestone: m })),
  );

  return (
    <PageShell title="Overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Banknote}
          label="Total Endowment Corpus"
          value={formatINR(totalCorpus)}
          sub={`${funds.filter((f) => f.status === "Active").length} active funds`}
        />
        <KpiCard
          icon={HandCoins}
          label="Active CSR Grants"
          value={String(activeGrants.length)}
          sub={`${formatINR(activeGrants.reduce((s, g) => s + g.sanctionedAmount, 0))} sanctioned`}
        />
        <KpiCard
          icon={TrendingUp}
          label="Open Pipeline Value"
          value={formatINR(pipelineValue)}
          sub={`${openPipeline.length} open opportunities`}
        />
        <KpiCard
          icon={Users}
          label="Donors & Partners"
          value={String(donors.length)}
          sub={`${donors.filter((d) => d.status === "Active").length} active relationships`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Awaiting your review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grantsAwaitingApproval.length === 0 && milestonesAwaitingReview.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing pending right now.</p>
            )}
            {grantsAwaitingApproval.map((g) => (
              <Link
                key={g.id}
                href={`/staff/csr-grants/${g.id}`}
                className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{g.grantTitle}</p>
                  <p className="text-muted-foreground">{g.companyName} — grant approval</p>
                </div>
                <StatusBadge status={g.status} />
              </Link>
            ))}
            {milestonesAwaitingReview.map(({ grant, milestone }) => (
              <Link
                key={milestone.id}
                href={`/staff/csr-grants/${grant.id}`}
                className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{milestone.title}</p>
                  <p className="text-muted-foreground">{grant.companyName} — milestone review</p>
                </div>
                <StatusBadge status={milestone.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent donor activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {donors
              .flatMap((d) => d.interactions.map((i) => ({ donor: d, interaction: i })))
              .sort(
                (a, b) =>
                  new Date(b.interaction.date).getTime() - new Date(a.interaction.date).getTime(),
              )
              .slice(0, 5)
              .map(({ donor, interaction }) => (
                <Link
                  key={interaction.id}
                  href={`/staff/donors/${donor.id}`}
                  className="flex items-start justify-between gap-3 rounded-md border p-3 text-sm hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{donor.name}</p>
                    <p className="text-muted-foreground">{interaction.summary}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">
                    <p>{interaction.type}</p>
                    <p>{formatDate(interaction.date)}</p>
                  </div>
                </Link>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base">Fundraising pipeline snapshot</CardTitle>
          <Link
            href="/staff/pipeline"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View board <ArrowUpRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                "Identification",
                "Cultivation",
                "Solicitation",
                "Negotiation",
                "ClosedWon",
                "ClosedLost",
              ] as const
            ).map((stage) => {
              const items = opportunities.filter((o) => o.stage === stage);
              const value = items.reduce((s, o) => s + o.estimatedAmount, 0);
              return (
                <div key={stage} className="rounded-md border p-3">
                  <StatusBadge status={stage} />
                  <p className="mt-2 text-lg font-semibold">{items.length}</p>
                  <p className="text-xs text-muted-foreground">{formatINR(value)}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4.5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
