import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { useToast } from '@/hooks/use-toast';
import { offersApi, type Offer } from '@/lib/api';

export function OffersSchemesPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleHi: '',
    descriptionEn: '',
    descriptionHi: '',
    startDate: '',
    endDate: '',
    applicableBrand: '',
    applicableCategory: '',
    isActive: true,
    priority: 1,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    setIsLoading(true);
    try {
      const data = await offersApi.getAll();
      setOffers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch offers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingOffer(null);
    setFormData({
      titleEn: '',
      titleHi: '',
      descriptionEn: '',
      descriptionHi: '',
      startDate: '',
      endDate: '',
      applicableBrand: '',
      applicableCategory: '',
      isActive: true,
      priority: 1,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(offer: Offer) {
    setEditingOffer(offer);
    setFormData({
      titleEn: offer.titleEn,
      titleHi: offer.titleHi,
      descriptionEn: offer.descriptionEn,
      descriptionHi: offer.descriptionHi,
      startDate: offer.startDate.split('T')[0],
      endDate: offer.endDate.split('T')[0],
      applicableBrand: offer.applicableBrand || '',
      applicableCategory: offer.applicableCategory || '',
      isActive: offer.isActive,
      priority: offer.priority,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit() {
    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingOffer) {
        await offersApi.update(editingOffer.id, payload);
        toast({ title: 'Offer updated successfully' });
      } else {
        await offersApi.create(payload);
        toast({ title: 'Offer created successfully' });
      }
      setIsDialogOpen(false);
      fetchOffers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save offer',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await offersApi.delete(id);
      toast({ title: 'Offer deleted successfully' });
      fetchOffers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete offer',
        variant: 'destructive',
      });
    }
  }

  async function toggleStatus(offer: Offer) {
    try {
      await offersApi.update(offer.id, { isActive: !offer.isActive });
      toast({
        title: offer.isActive ? 'Offer deactivated' : 'Offer activated',
      });
      fetchOffers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  }

  const filteredOffers = offers.filter(
    (o) =>
      o.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.titleHi.includes(searchQuery)
  );

  const isOfferActive = (offer: Offer) => {
    const now = new Date();
    return (
      offer.isActive &&
      new Date(offer.startDate) <= now &&
      new Date(offer.endDate) >= now
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offers & Schemes</h1>
          <p className="text-muted-foreground">
            Manage promotional offers and schemes
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gradient-accent text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Offer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{offers.length}</p>
                <p className="text-sm text-muted-foreground">Total Offers</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {offers.filter(isOfferActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Now</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {offers.filter((o) => new Date(o.endDate) < new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            All Offers ({filteredOffers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columns={6} rows={5} />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offer</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Brand / Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No offers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOffers.map((offer) => (
                      <TableRow key={offer.id} className="table-row-hover">
                        <TableCell>
                          <div>
                            <p className="font-medium">{offer.titleEn}</p>
                            <p className="text-sm text-muted-foreground">{offer.titleHi}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(offer.startDate).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">
                              to {new Date(offer.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {offer.applicableBrand && (
                              <Badge variant="outline">{offer.applicableBrand}</Badge>
                            )}
                            {offer.applicableCategory && (
                              <Badge variant="secondary">{offer.applicableCategory}</Badge>
                            )}
                            {!offer.applicableBrand && !offer.applicableCategory && (
                              <span className="text-muted-foreground text-sm">All</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{offer.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          {isOfferActive(offer) ? (
                            <StatusBadge status="active" />
                          ) : new Date(offer.endDate) < new Date() ? (
                            <Badge variant="secondary">Expired</Badge>
                          ) : (
                            <StatusBadge status="inactive" />
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(offer)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleStatus(offer)}>
                                {offer.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(offer.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create Offer'}</DialogTitle>
            <DialogDescription>
              {editingOffer ? 'Update offer details' : 'Add a new promotional offer'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleEn">Title (English)</Label>
                <Input
                  id="titleEn"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="Offer title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleHi">Title (Hindi)</Label>
                <Input
                  id="titleHi"
                  value={formData.titleHi}
                  onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                  placeholder="ऑफर शीर्षक"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">Description (English)</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                placeholder="Offer description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionHi">Description (Hindi)</Label>
              <Textarea
                id="descriptionHi"
                value={formData.descriptionHi}
                onChange={(e) => setFormData({ ...formData, descriptionHi: e.target.value })}
                placeholder="ऑफर विवरण"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Applicable Brand (Optional)</Label>
                <Select
                  value={formData.applicableBrand}
                  onValueChange={(value) => setFormData({ ...formData, applicableBrand: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Brands</SelectItem>
                    <SelectItem value="JCB">JCB</SelectItem>
                    <SelectItem value="Ashok Leyland">Ashok Leyland</SelectItem>
                    <SelectItem value="Switch EV">Switch EV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min={1}
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gradient-accent text-accent-foreground">
              {editingOffer ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}