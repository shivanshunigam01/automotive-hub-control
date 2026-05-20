import { useEffect, useState } from "react";
import { Search, Filter, Phone, Mail, Eye, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTableSkeleton } from "@/components/admin/DataTableSkeleton";
import { serviceKitEnquiriesApi, type ServiceKitEnquiry } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const KIT_FILTER_OPTIONS = [
  { value: "all", label: "All kits" },
  { value: "100-hrs", label: "100 HRS" },
  { value: "500-hrs", label: "500 HRS" },
  { value: "1000-hrs", label: "1000 HRS" },
  { value: "1500-hrs", label: "1500 HRS" },
  { value: "2000-hrs", label: "2000 HRS" },
];

function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ServiceKitEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ServiceKitEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kitFilter, setKitFilter] = useState("all");
  const [selected, setSelected] = useState<ServiceKitEnquiry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, kitFilter, searchQuery]);

  async function fetchEnquiries() {
    setIsLoading(true);
    try {
      const data = await serviceKitEnquiriesApi.getAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        kit_id: kitFilter !== "all" ? kitFilter : undefined,
        search: searchQuery || undefined,
      });
      setEnquiries(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch service kit enquiries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(
    id: string,
    status: ServiceKitEnquiry["status"]
  ) {
    try {
      const updated = await serviceKitEnquiriesApi.updateStatus(id, status);
      toast({ title: "Status updated" });
      fetchEnquiries();
      if (selected?.id === id) setSelected(updated);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Wrench className="h-8 w-8 text-accent" />
          Service Kit Enquiries
        </h1>
        <p className="text-muted-foreground">
          JCB parts kit enquiries from the Parts &amp; Lubricants page
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, mobile, reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={kitFilter} onValueChange={setKitFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Kit" />
                </SelectTrigger>
                <SelectContent>
                  {KIT_FILTER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enquiries ({enquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columns={8} rows={5} />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Service kit</TableHead>
                    <TableHead>Kit value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[70px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No service kit enquiries yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    enquiries.map((row) => (
                      <TableRow key={row.id} className="table-row-hover">
                        <TableCell className="font-mono text-xs">
                          {row.enquiryNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.customerName}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {row.customerMobile}
                            </div>
                            {row.customerEmail && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {row.customerEmail}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.intervalHours} HRS</Badge>
                        </TableCell>
                        <TableCell>{formatInr(row.totalValue)}</TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelected(row)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{row.kitTitle}</DialogTitle>
                                <DialogDescription>
                                  {row.enquiryNumber} · {row.customerName}
                                </DialogDescription>
                              </DialogHeader>

                              {selected && selected.id === row.id && (
                                <div className="space-y-6">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Mobile</p>
                                      <p className="font-medium">{selected.customerMobile}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">District</p>
                                      <p className="font-medium">
                                        {selected.customerDistrict || "—"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Machine model</p>
                                      <p className="font-medium">
                                        {selected.machineModel || "—"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Kit total</p>
                                      <p className="font-medium">{formatInr(selected.totalValue)}</p>
                                    </div>
                                  </div>

                                  {selected.message && (
                                    <>
                                      <Separator />
                                      <div>
                                        <p className="text-sm text-muted-foreground mb-1">Message</p>
                                        <p className="text-sm">{selected.message}</p>
                                      </div>
                                    </>
                                  )}

                                  <Separator />

                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Select
                                      value={selected.status}
                                      onValueChange={(v: ServiceKitEnquiry["status"]) =>
                                        handleStatusChange(selected.id, v)
                                      }
                                    >
                                      <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="contacted">Contacted</SelectItem>
                                        <SelectItem value="quoted">Quoted</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                        <SelectItem value="lost">Lost</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Separator />

                                  <div>
                                    <p className="text-sm font-medium mb-3">Parts in kit</p>
                                    <div className="rounded-md border overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Item No.</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selected.kitItems.map((item) => (
                                            <TableRow key={item.srNo}>
                                              <TableCell>{item.srNo}</TableCell>
                                              <TableCell className="font-mono text-xs">
                                                {item.itemNo}
                                              </TableCell>
                                              <TableCell>{item.description}</TableCell>
                                              <TableCell>{item.quantity}</TableCell>
                                              <TableCell className="text-right">
                                                {formatInr(item.value)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
