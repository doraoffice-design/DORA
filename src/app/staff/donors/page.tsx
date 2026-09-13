"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { canEditDonor, createDonor } from "@/lib/donors-actions";
import { useStore } from "@/lib/store";
import type { Donor, DonorType } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DonorsPage() {
  const router = useRouter();
  const { donors, setDonors, currentUser } = useStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return donors.filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || d.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [donors, search, typeFilter]);

  const canCreate = currentUser && canEditDonor(currentUser.role);

  const handleCreate = (donor: Donor) => {
    setDonors((prev) => [donor, ...prev]);
    setOpen(false);
    toast.success("Donor added", { description: `${donor.name} added to the CRM.` });
    router.push(`/staff/donors/${donor.id}`);
  };

  return (
    <PageShell title="Donor CRM">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search donors..."
              className="w-72 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Alumni">Alumni</SelectItem>
              <SelectItem value="Foundation">Foundation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  New Donor
                </Button>
              }
            />
            <NewDonorDialog onCreate={handleCreate} />
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total giving</TableHead>
                <TableHead>Relationship owner</TableHead>
                <TableHead>Last contact</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((donor) => (
                <TableRow
                  key={donor.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/staff/donors/${donor.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">{initials(donor.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/staff/donors/${donor.id}`}
                          className="font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {donor.name}
                        </Link>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {donor.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{donor.type}</TableCell>
                  <TableCell className="font-medium">{formatINR(donor.totalGiving)}</TableCell>
                  <TableCell className="text-muted-foreground">{donor.relationshipOwner}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(donor.lastContactDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={donor.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No donors match your filters.
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

function NewDonorDialog({ onCreate }: { onCreate: (donor: Donor) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<DonorType>("Individual");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const submit = () => {
    if (!name) return;
    onCreate(createDonor({ name, type, email, phone }));
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Donor</DialogTitle>
        <DialogDescription>Added as a Prospect by default.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="donor-name">Name</Label>
          <Input id="donor-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="donor-type">Type</Label>
          <Select value={type} onValueChange={(v) => v && setType(v as DonorType)}>
            <SelectTrigger id="donor-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Alumni">Alumni</SelectItem>
              <SelectItem value="Foundation">Foundation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="donor-email">Email</Label>
            <Input id="donor-email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="donor-phone">Phone</Label>
            <Input id="donor-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>Add donor</Button>
      </DialogFooter>
    </DialogContent>
  );
}
