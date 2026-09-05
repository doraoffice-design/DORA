"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDate, formatINR } from "@/lib/format";
import { createOpportunity, moveStage } from "@/lib/pipeline-actions";
import { useStore } from "@/lib/store";
import type { PipelineOpportunity, PipelineStage } from "@/lib/types";

const STAGES: { id: PipelineStage; label: string }[] = [
  { id: "Identification", label: "Identification" },
  { id: "Cultivation", label: "Cultivation" },
  { id: "Solicitation", label: "Solicitation" },
  { id: "Negotiation", label: "Negotiation" },
  { id: "ClosedWon", label: "Closed – Won" },
  { id: "ClosedLost", label: "Closed – Lost" },
];

export default function PipelinePage() {
  const { opportunities, setOpportunities } = useStore();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = opportunities.find((o) => o.id === selectedId) ?? null;

  const handleCreate = (opp: PipelineOpportunity) => {
    setOpportunities((prev) => [opp, ...prev]);
    setOpen(false);
    toast.success("Opportunity added", { description: opp.opportunityName });
  };

  const handleMoveStage = (id: string, stage: PipelineStage) => {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? moveStage(o, stage) : o)));
    toast.success("Stage updated");
  };

  return (
    <PageShell title="Fundraising Pipeline">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {opportunities.length} opportunities ·{" "}
          {formatINR(opportunities.reduce((s, o) => s + o.estimatedAmount, 0))} total value
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                New Opportunity
              </Button>
            }
          />
          <NewOpportunityDialog onCreate={handleCreate} />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage) => {
          const items = opportunities.filter((o) => o.stage === stage.id);
          const value = items.reduce((s, o) => s + o.estimatedAmount, 0);
          return (
            <div key={stage.id} className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center justify-between px-0.5">
                <StatusBadge status={stage.id} />
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <p className="px-0.5 text-xs text-muted-foreground">{formatINR(value)}</p>
              <div className="flex flex-col gap-2">
                {items.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className="rounded-lg border bg-card p-3 text-left text-sm shadow-xs transition hover:bg-accent"
                  >
                    <p className="font-medium">{o.opportunityName}</p>
                    <p className="text-xs text-muted-foreground">{o.donorName}</p>
                    <p className="mt-1.5 font-medium">{formatINR(o.estimatedAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.probability}% · {o.owner}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={selected !== null} onOpenChange={(v) => !v && setSelectedId(null)}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.opportunityName}</SheetTitle>
                <SheetDescription>{selected.donorName}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <div className="grid grid-cols-2 gap-4">
                  <Detail label="Estimated amount" value={formatINR(selected.estimatedAmount)} />
                  <Detail label="Probability" value={`${selected.probability}%`} />
                  <Detail label="Expected close" value={formatDate(selected.expectedCloseDate)} />
                  <Detail label="Owner" value={selected.owner} />
                </div>
                {selected.notes && <Detail label="Notes" value={selected.notes} />}
                <div className="space-y-1.5">
                  <Label htmlFor="stage-select">Stage</Label>
                  <Select
                    value={selected.stage}
                    onValueChange={(v) => v && handleMoveStage(selected.id, v as PipelineStage)}
                  >
                    <SelectTrigger id="stage-select" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setSelectedId(null)}>
                  Close
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function NewOpportunityDialog({ onCreate }: { onCreate: (opp: PipelineOpportunity) => void }) {
  const [donorName, setDonorName] = useState("");
  const [opportunityName, setOpportunityName] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");

  const submit = () => {
    if (!donorName || !opportunityName || !estimatedAmount) return;
    onCreate(
      createOpportunity({
        donorName,
        opportunityName,
        estimatedAmount: Number(estimatedAmount),
        expectedCloseDate,
      }),
    );
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Opportunity</DialogTitle>
        <DialogDescription>Starts in the Identification stage.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="opp-donor">Donor</Label>
          <Input id="opp-donor" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="opp-name">Opportunity name</Label>
          <Input
            id="opp-name"
            value={opportunityName}
            onChange={(e) => setOpportunityName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="opp-amount">Estimated amount (₹)</Label>
            <Input
              id="opp-amount"
              type="number"
              value={estimatedAmount}
              onChange={(e) => setEstimatedAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opp-close">Expected close</Label>
            <Input
              id="opp-close"
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>Add opportunity</Button>
      </DialogFooter>
    </DialogContent>
  );
}
