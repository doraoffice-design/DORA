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
import { formatDate, formatINR } from "@/lib/format";
import { canCreateGrant, createGrant, type NewGrantInput } from "@/lib/csr-grants-actions";
import { useStore } from "@/lib/store";
import type { CSRGrant } from "@/lib/types";

const STATUS_OPTIONS = [
  "Draft",
  "PendingApproval",
  "Approved",
  "Active",
  "Completed",
  "Rejected",
] as const;

export default function CSRGrantsPage() {
  const router = useRouter();
  const { grants, setGrants, currentUser } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return grants.filter((g) => {
      const matchesSearch =
        g.companyName.toLowerCase().includes(search.toLowerCase()) ||
        g.grantTitle.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || g.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [grants, search, statusFilter]);

  const canCreate = currentUser && canCreateGrant(currentUser.role);

  const handleCreate = (grant: CSRGrant) => {
    setGrants((prev) => [grant, ...prev]);
    setOpen(false);
    toast.success("Grant submitted for approval", {
      description: `${grant.grantTitle} sent to Dean for review.`,
    });
    router.push(`/dashboard/csr-grants/${grant.id}`);
  };

  return (
    <PageShell title="CSR Grants & Milestones">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by company or grant title..."
              className="w-72 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "PendingApproval" ? "Pending Approval" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  New Grant
                </Button>
              }
            />
            <NewGrantDialog onCreate={handleCreate} />
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grant</TableHead>
                <TableHead>Total amount</TableHead>
                <TableHead>Disbursed</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((grant) => (
                <TableRow
                  key={grant.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/dashboard/csr-grants/${grant.id}`)}
                >
                  <TableCell>
                    <Link
                      href={`/dashboard/csr-grants/${grant.id}`}
                      className="font-medium hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {grant.grantTitle}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {grant.companyName} · {grant.csrActSection}
                    </p>
                  </TableCell>
                  <TableCell>{formatINR(grant.totalAmount)}</TableCell>
                  <TableCell>
                    {formatINR(grant.disbursedAmount)}
                    <span className="text-muted-foreground">
                      {" "}
                      / {formatINR(grant.sanctionedAmount || grant.totalAmount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(grant.startDate)} – {formatDate(grant.endDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={grant.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No grants match your filters.
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

function NewGrantDialog({ onCreate }: { onCreate: (grant: CSRGrant) => void }) {
  const { currentUser } = useStore();
  const [companyName, setCompanyName] = useState("");
  const [grantTitle, setGrantTitle] = useState("");
  const [csrActSection, setCsrActSection] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const submit = () => {
    if (!currentUser || !companyName || !grantTitle || !totalAmount || !startDate || !endDate) return;
    const input: NewGrantInput = {
      companyName,
      grantTitle,
      csrActSection,
      totalAmount: Number(totalAmount),
      startDate,
      endDate,
    };
    onCreate(createGrant(input, currentUser));
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New CSR Grant</DialogTitle>
        <DialogDescription>
          Submits for Dean approval — you (the maker) cannot approve your own grant.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="grant-company">Company / donor</Label>
          <Input
            id="grant-company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="grant-title">Grant title</Label>
          <Input
            id="grant-title"
            value={grantTitle}
            onChange={(e) => setGrantTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="grant-section">CSR Act Schedule VII section</Label>
          <Input
            id="grant-section"
            placeholder="Schedule VII (ii) — Education"
            value={csrActSection}
            onChange={(e) => setCsrActSection(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="grant-amount">Total amount (₹)</Label>
          <Input
            id="grant-amount"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="grant-start">Start date</Label>
            <Input
              id="grant-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grant-end">End date</Label>
            <Input
              id="grant-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>Submit for approval</Button>
      </DialogFooter>
    </DialogContent>
  );
}
