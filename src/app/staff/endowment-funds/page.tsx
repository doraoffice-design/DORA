"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatINR } from "@/lib/format";
import { canRecordFundYield, createFund } from "@/lib/endowment-funds-actions";
import { useStore } from "@/lib/store";
import type { CorpusType, EndowmentFund } from "@/lib/types";

export default function EndowmentFundsPage() {
  const router = useRouter();
  const { funds, setFunds, currentUser } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return funds.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.code.toLowerCase().includes(search.toLowerCase()) ||
        f.donorName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [funds, search, statusFilter]);

  const canCreate = currentUser && canRecordFundYield(currentUser);

  const handleCreate = (fund: EndowmentFund) => {
    setFunds((prev) => [fund, ...prev]);
    setOpen(false);
    toast.success("Fund created", { description: `${fund.name} added as a draft record.` });
    router.push(`/staff/endowment-funds/${fund.id}`);
  };

  return (
    <PageShell title="Endowment Funds">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or donor..."
              className="w-72 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Frozen">Frozen</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  New Fund
                </Button>
              }
            />
            <NewFundDialog onCreate={handleCreate} />
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fund</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Corpus Value</TableHead>
                <TableHead>Current Balance</TableHead>
                <TableHead>Established</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((fund) => (
                <TableRow
                  key={fund.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/staff/endowment-funds/${fund.id}`)}
                >
                  <TableCell>
                    <Link
                      href={`/staff/endowment-funds/${fund.id}`}
                      className="font-medium hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {fund.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {fund.code} · {fund.donorName}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fund.corpusType}</TableCell>
                  <TableCell>{formatINR(fund.corpusValue)}</TableCell>
                  <TableCell className="font-medium">{formatINR(fund.currentBalance)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(fund.establishedDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={fund.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No funds match your filters.
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

function NewFundDialog({ onCreate }: { onCreate: (fund: EndowmentFund) => void }) {
  const [name, setName] = useState("");
  const [donorName, setDonorName] = useState("");
  const [corpusType, setCorpusType] = useState<CorpusType>("Restricted");
  const [corpusValue, setCorpusValue] = useState("");
  const [purpose, setPurpose] = useState("");

  const submit = () => {
    if (!name || !donorName || !corpusValue) return;
    onCreate(
      createFund({
        name,
        donorName,
        corpusType,
        corpusValue: Number(corpusValue),
        purpose,
      }),
    );
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Endowment Fund</DialogTitle>
        <DialogDescription>
          Draft record for the demo — nothing is persisted to a database yet.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fund-name">Fund name</Label>
          <Input id="fund-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fund-donor">Donor / source</Label>
          <Input
            id="fund-donor"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fund-type">Corpus type</Label>
            <Select
              value={corpusType}
              onValueChange={(v) => v && setCorpusType(v as CorpusType)}
            >
              <SelectTrigger id="fund-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Restricted">Restricted</SelectItem>
                <SelectItem value="Unrestricted">Unrestricted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fund-value">Corpus value (₹)</Label>
            <Input
              id="fund-value"
              type="number"
              value={corpusValue}
              onChange={(e) => setCorpusValue(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fund-purpose">Purpose</Label>
          <Textarea
            id="fund-purpose"
            rows={3}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>Create fund</Button>
      </DialogFooter>
    </DialogContent>
  );
}
