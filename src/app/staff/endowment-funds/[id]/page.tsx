"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatINR } from "@/lib/format";
import {
  canRecordFundYield,
  computeClosingBalance,
  recordFundYield,
} from "@/lib/endowment-funds-actions";
import { useStore } from "@/lib/store";

export default function FundDetailPage({ params }: PageProps<"/staff/endowment-funds/[id]">) {
  const { id } = use(params);
  const { funds, setFunds, currentUser } = useStore();
  const [open, setOpen] = useState(false);

  const fund = funds.find((f) => f.id === id);
  if (!fund) notFound();
  if (!currentUser) return null;

  const canRecord = canRecordFundYield(currentUser);

  const addYieldRecord = (year: string, interestEarned: number, disbursed: number) => {
    setFunds((prev) =>
      prev.map((f) =>
        f.id === fund.id ? recordFundYield(f, year, interestEarned, disbursed, currentUser) : f,
      ),
    );
    setOpen(false);
    toast.success("Yield record added", { description: `FY ${year} recorded for ${fund.name}.` });
  };

  return (
    <PageShell title={fund.name}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{fund.name}</h2>
            <StatusBadge status={fund.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {fund.code} · {fund.corpusType} · Established {formatDate(fund.establishedDate)}
          </p>
        </div>
        {canRecord && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  Record Yield
                </Button>
              }
            />
            <RecordYieldDialog
              openingBalance={fund.currentBalance}
              onCreate={addYieldRecord}
            />
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Corpus Value" value={formatINR(fund.corpusValue)} />
        <SummaryCard label="Current Balance" value={formatINR(fund.currentBalance)} />
        <SummaryCard label="Donor / Source" value={fund.donorName} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purpose</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{fund.purpose}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yield records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>FY</TableHead>
                <TableHead>Opening balance</TableHead>
                <TableHead>Interest earned</TableHead>
                <TableHead>Disbursed</TableHead>
                <TableHead>Closing balance</TableHead>
                <TableHead>Recorded by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fund.yieldRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.year}</TableCell>
                  <TableCell>{formatINR(r.openingBalance)}</TableCell>
                  <TableCell className="text-emerald-700 dark:text-emerald-400">
                    +{formatINR(r.interestEarned)}
                  </TableCell>
                  <TableCell className="text-rose-700 dark:text-rose-400">
                    -{formatINR(r.disbursed)}
                  </TableCell>
                  <TableCell className="font-medium">{formatINR(r.closingBalance)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.recordedBy} · {formatDate(r.recordedAt)}
                  </TableCell>
                </TableRow>
              ))}
              {fund.yieldRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No yield records yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function RecordYieldDialog({
  openingBalance,
  onCreate,
}: {
  openingBalance: number;
  onCreate: (year: string, interestEarned: number, disbursed: number) => void;
}) {
  const [year, setYear] = useState("");
  const [interestEarned, setInterestEarned] = useState("");
  const [disbursed, setDisbursed] = useState("");

  const interest = Number(interestEarned) || 0;
  const disb = Number(disbursed) || 0;
  const closingBalance = computeClosingBalance(openingBalance, interest, disb);

  const submit = () => {
    if (!year) return;
    onCreate(year, interest, disb);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Record Fund Yield</DialogTitle>
        <DialogDescription>
          Opening balance is carried forward automatically from the current balance.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="yield-year">Financial year</Label>
          <Input
            id="yield-year"
            placeholder="2025-26"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Opening balance</Label>
          <Input value={formatINR(openingBalance)} disabled />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="yield-interest">Interest earned (₹)</Label>
            <Input
              id="yield-interest"
              type="number"
              value={interestEarned}
              onChange={(e) => setInterestEarned(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yield-disbursed">Disbursed (₹)</Label>
            <Input
              id="yield-disbursed"
              type="number"
              value={disbursed}
              onChange={(e) => setDisbursed(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Closing balance</Label>
          <Input value={formatINR(closingBalance)} disabled />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>Save yield record</Button>
      </DialogFooter>
    </DialogContent>
  );
}
