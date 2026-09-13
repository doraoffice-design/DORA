"use client";

import Link from "next/link";
import { ArrowRight, Handshake, HandCoins, Landmark, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function PublicHomePage() {
  const { funds, grants, donors } = useStore();

  const totalCorpus = funds.reduce((sum, f) => sum + f.currentBalance, 0);
  const activePartners = new Set(
    grants.filter((g) => g.status !== "Rejected" && g.status !== "Draft").map((g) => g.companyName),
  ).size;
  const totalDisbursed = grants.reduce((sum, g) => sum + g.disbursedAmount, 0);
  const activeRelationships = donors.filter((d) => d.status === "Active").length;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Handshake className="size-4.5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">DORA</span>
              <span className="text-xs text-muted-foreground">IIT Mandi</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              nativeButton={false}
              render={<Link href="/donor-portal" />}
            >
              Donor Login
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              nativeButton={false}
              render={<Link href="/staff" />}
            >
              Staff Portal
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Resources & Alumni Affairs
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The DORA office stewards IIT Mandi&apos;s endowments, corporate
            partnerships, and philanthropic relationships — turning
            contributions into scholarships, research, and campus innovation.
          </p>
        </section>

        <section className="border-y bg-muted/30">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden border-x bg-border sm:grid-cols-4">
            <StatTile
              icon={Landmark}
              label="Endowment corpus under management"
              value={formatINR(totalCorpus)}
            />
            <StatTile icon={HandCoins} label="Active CSR partnerships" value={String(activePartners)} />
            <StatTile
              icon={HandCoins}
              label="CSR funds disbursed to date"
              value={formatINR(totalDisbursed)}
            />
            <StatTile
              icon={Users}
              label="Active donor & partner relationships"
              value={String(activeRelationships)}
            />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold">Governance & Compliance</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We manage endowment funds, CSR grants and milestones, and
              scholarship disbursement under a maker-checker approval
              process, with every fund movement recorded in an audit trail —
              so contributions are governed with the same rigor as any
              institutional treasury.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Partnerships & Resource Generation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We build long-term relationships with alumni, corporates, and
              foundations — from first outreach through to signed
              partnerships — connecting donor interests with Institute
              priorities in research, scholarships, and infrastructure.
            </p>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">Partner with IIT Mandi</h2>
            <p className="text-sm text-muted-foreground">
              For CSR partnerships, endowments, or alumni giving, reach out to
              the DORA office — we&apos;ll help you find the right area of
              impact.
            </p>
            <Button
              className="gap-1.5"
              nativeButton={false}
              render={<a href="mailto:dora@iitmandi.ac.in" />}
            >
              Contact DORA
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dean of Resources & Alumni Affairs, IIT Mandi
        </div>
      </footer>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 bg-background p-6">
      <Icon className="size-4.5 text-muted-foreground" />
      <span className="text-xl font-semibold tracking-tight sm:text-2xl">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
