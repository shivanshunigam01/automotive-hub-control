import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, Phone, Mail, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { dealersApi, type Dealer } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

const emptyDealer: Omit<Dealer, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  address: '',
  city: '',
  district: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  latitude: 0,
  longitude: 0,
  isActive: true,
};

export function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [formData, setFormData] = useState(emptyDealer);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermissions();

  useEffect(() => {
    fetchDealers();
  }, []);

  async function fetchDealers() {
    setIsLoading(true);
    try {
      const data = await dealersApi.getAll();
      setDealers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch dealers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredDealers = dealers.filter((dealer) => {
    const matchesSearch =
      dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || dealer.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const cities = [...new Set(dealers.map((d) => d.city))];

  function openCreateDialog() {
    setEditingDealer(null);
    setFormData(emptyDealer);
    setIsDialogOpen(true);
  }

  function openEditDialog(dealer: Dealer) {
    setEditingDealer(dealer);
    setFormData({
      name: dealer.name,
      address: dealer.address,
      city: dealer.city,
      district: dealer.district,
      state: dealer.state,
      pincode: dealer.pincode,
      phone: dealer.phone,
      email: dealer.email,
      latitude: dealer.latitude,
      longitude: dealer.longitude,
      isActive: dealer.isActive,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingDealer) {
        await dealersApi.update(editingDealer.id, formData);
        toast({
          title: 'Dealer updated',
          description: 'Dealer information has been updated.',
        });
      } else {
        await dealersApi.create(formData);
        toast({
          title: 'Dealer created',
          description: 'New dealer has been added.',
        });
      }
      setIsDialogOpen(false);
      fetchDealers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save dealer',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this dealer?')) return;

    try {
      await dealersApi.delete(id);
      toast({
        title: 'Dealer deleted',
        description: 'The dealer has been removed.',
      });
      fetchDealers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete dealer',
        variant: 'destructive',
      });
    }
  }

  async function toggleActive(dealer: Dealer) {
    try {
      await dealersApi.update(dealer.id, { isActive: !dealer.isActive });
      toast({
        title: 'Status updated',
        description: `Dealer is now ${dealer.isActive ? 'inactive' : 'active'}.`,
      });
      fetchDealers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dealer Locator</h1>
          <p className="text-muted-foreground">
            Manage dealer locations for the website
          </p>
        </div>
        {canCreate('dealers') && (
          <Button onClick={openCreateDialog} className="gradient-accent text-accent-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Add Dealer
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dealers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Dealers ({filteredDealers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columns={6} rows={5} />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDealers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No dealers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDealers.map((dealer) => (
                      <TableRow key={dealer.id} className="table-row-hover">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-accent" />
                            </div>
                            <span className="font-medium">{dealer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{dealer.city}, {dealer.district}</p>
                            <p className="text-muted-foreground">{dealer.state} - {dealer.pincode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {dealer.phone}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {dealer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {dealer.latitude.toFixed(4)}, {dealer.longitude.toFixed(4)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={dealer.isActive ? 'default' : 'secondary'}>
                            {dealer.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {canEdit('dealers') && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleActive(dealer)}
                                  title={dealer.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {dealer.isActive ? (
                                    <ToggleRight className="h-4 w-4 text-success" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(dealer)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {canDelete('dealers') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(dealer.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDealer ? 'Edit Dealer' : 'Add New Dealer'}</DialogTitle>
            <DialogDescription>
              {editingDealer ? 'Update dealer information' : 'Add a new dealer location'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Dealer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Patliputra Motors - Main Branch"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="dealer@patliputra-motors.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Road, Near Landmark"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Patna"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g., Patna"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., Bihar"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g., 800001"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 25.6102"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 85.1415"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="gradient-accent text-accent-foreground">
                {isSaving ? 'Saving...' : editingDealer ? 'Update Dealer' : 'Add Dealer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
