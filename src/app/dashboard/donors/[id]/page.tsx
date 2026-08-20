"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatINR } from "@/lib/format";
import { canEditDonor, logInteraction } from "@/lib/donors-actions";
import { useStore } from "@/lib/store";
import type { DonorInteraction } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DonorDetailPage({ params }: PageProps<"/dashboard/donors/[id]">) {
  const { id } = use(params);
  const { donors, setDonors, opportunities, currentUser } = useStore();
  const [open, setOpen] = useState(false);

  const donor = donors.find((d) => d.id === id);
  if (!donor) notFound();
  if (!currentUser) return null;

  const linkedOpportunities = opportunities.filter((o) => o.donorName === donor.name);
  const canEdit = canEditDonor(currentUser.role);

  const addInteraction = (type: DonorInteraction["type"], summary: string) => {
    setDonors((prev) =>
      prev.map((d) => (d.id === donor.id ? logInteraction(d, type, summary, currentUser.name) : d)),
    );
    setOpen(false);
    toast.success("Interaction logged");
  };

  return (
    <PageShell title={donor.name}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback>{initials(donor.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{donor.name}</h2>
              <StatusBadge status={donor.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {donor.type} · Owned by {donor.relationshipOwner}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {donor.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  Log interaction
                </Button>
              }
            />
            <LogInteractionDialog onCreate={addInteraction} />
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total giving" value={formatINR(donor.totalGiving)} />
        <SummaryCard label="Last contact" value={formatDate(donor.lastContactDate)} />
        <Card>
          <CardContent className="space-y-1.5 pt-6 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5" /> {donor.email || "—"}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-3.5" /> {donor.phone || "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {linkedOpportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {linkedOpportunities.map((o) => (
              <Link
                key={o.id}
                href="/dashboard/pipeline"
                className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{o.opportunityName}</p>
                  <p className="text-muted-foreground">
                    {formatINR(o.estimatedAmount)} · {o.probability}% probability
                  </p>
                </div>
                <StatusBadge status={o.stage} />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interaction history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {donor.interactions.map((interaction) => (
            <div
              key={interaction.id}
              className="flex items-start justify-between gap-3 border-b pb-3 text-sm last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">
                  {interaction.type}
                  <span className="ml-2 font-normal text-muted-foreground">
                    by {interaction.by}
                  </span>
                </p>
                <p className="text-muted-foreground">{interaction.summary}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(interaction.date)}
              </span>
            </div>
          ))}
          {donor.interactions.length === 0 && (
            <p className="text-sm text-muted-foreground">No interactions logged yet.</p>
          )}
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

function LogInteractionDialog({
  onCreate,
}: {
  onCreate: (type: DonorInteraction["type"], summary: string) => void;
}) {
  const [type, setType] = useState<DonorInteraction["type"]>("Call");
  const [summary, setSummary] = useState("");

  const submit = () => {
    if (!summary) return;
    onCreate(type, summary);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Log interaction</DialogTitle>
        <DialogDescription>Recorded against today&apos;s date.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="interaction-type">Type</Label>
          <Select
            value={type}
            onValueChange={(v) => v && setType(v as DonorInteraction["type"])}
          >
            <SelectTrigger id="interaction-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Call">Call</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="interaction-summary">Summary</Label>
          <Textarea
            id="interaction-summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}
