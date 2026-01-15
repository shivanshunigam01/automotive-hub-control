import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { usedVehiclesApi, type UsedVehicle } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function UsedVehiclesPage() {
  const [vehicles, setVehicles] = useState<UsedVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    setIsLoading(true);
    try {
      const data = await usedVehiclesApi.getAll();
      setVehicles(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch vehicles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await usedVehiclesApi.delete(id);
      toast({
        title: 'Vehicle deleted',
        description: 'The vehicle has been removed successfully.',
      });
      fetchVehicles();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle',
        variant: 'destructive',
      });
    }
  }

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Used Vehicles</h1>
          <p className="text-muted-foreground">
            Manage your used vehicle inventory
          </p>
        </div>
        <Button asChild className="gradient-accent text-accent-foreground">
          <Link to="/admin/used-vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by brand or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            All Vehicles ({filteredVehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columns={7} rows={5} />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No vehicles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} className="table-row-hover">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                              <img
                                src={vehicle.images[0] || '/placeholder.svg'}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                className="h-10 w-10 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.vehicleType} • {vehicle.ownership}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {vehicle.kilometers > 0 && (
                              <p>{vehicle.kilometers.toLocaleString()} km</p>
                            )}
                            {vehicle.hours && vehicle.hours > 0 && (
                              <p>{vehicle.hours.toLocaleString()} hrs</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{vehicle.price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              variant="outline"
                              className={
                                vehicle.condition.engine === 'Good'
                                  ? 'status-active'
                                  : vehicle.condition.engine === 'Fair'
                                  ? 'status-pending'
                                  : 'status-closed'
                              }
                            >
                              Engine: {vehicle.condition.engine}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={vehicle.isActive ? 'active' : 'inactive'} />
                            {vehicle.certifications.inspection150Point && (
                              <Badge variant="secondary" className="text-[10px]">
                                150-Point Certified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/used-vehicles/${vehicle.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/used-vehicles/${vehicle.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(vehicle.id)}
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
    </div>
  );
}
