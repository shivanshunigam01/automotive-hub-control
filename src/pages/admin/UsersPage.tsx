import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCog,
  Shield,
  KeyRound,
  Settings2,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { useToast } from '@/hooks/use-toast';
import { usersApi, type AdminUser } from '@/lib/api';
import { getRoleDisplayName, ALL_MODULES, type UserRole, type ModulePermissions, type Permission } from '@/lib/rbac';

interface UserPermissions {
  [key: string]: Permission;
}

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<AdminUser | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({});
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'sales_user' as UserRole,
    isActive: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      mobile: '',
      role: 'sales_user',
      isActive: true,
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(user: AdminUser) {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  }

  function openPermissionsDialog(user: AdminUser) {
    setSelectedUserForPermissions(user);
    const initialPermissions: UserPermissions = {};
    ALL_MODULES.forEach((module) => {
      initialPermissions[module.key] = user.permissions?.[module.key as keyof ModulePermissions] || {
        view: false,
        create: false,
        edit: false,
        delete: false,
        export: false,
      };
    });
    setUserPermissions(initialPermissions);
    setIsPermissionsDialogOpen(true);
  }

  function toggleModuleAccess(moduleKey: string, enabled: boolean) {
    setUserPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        view: enabled,
        create: enabled,
        edit: enabled,
        delete: enabled,
        export: enabled,
      },
    }));
  }

  function togglePermission(moduleKey: string, permType: keyof Permission, enabled: boolean) {
    setUserPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [permType]: enabled,
      },
    }));
  }

  async function handleSavePermissions() {
    if (!selectedUserForPermissions) return;
    try {
      // Build complete permissions object from userPermissions state
      const completePermissions: ModulePermissions = {
        dashboard: userPermissions['dashboard'] || { view: false, create: false, edit: false, delete: false, export: false },
        products: userPermissions['products'] || { view: false, create: false, edit: false, delete: false, export: false },
        certifiedRefurbished: userPermissions['certifiedRefurbished'] || { view: false, create: false, edit: false, delete: false, export: false },
        leads: userPermissions['leads'] || { view: false, create: false, edit: false, delete: false, export: false },
        finance: userPermissions['finance'] || { view: false, create: false, edit: false, delete: false, export: false },
        cibil: userPermissions['cibil'] || { view: false, create: false, edit: false, delete: false, export: false },
        analytics: userPermissions['analytics'] || { view: false, create: false, edit: false, delete: false, export: false },
        banners: userPermissions['banners'] || { view: false, create: false, edit: false, delete: false, export: false },
        settings: userPermissions['settings'] || { view: false, create: false, edit: false, delete: false, export: false },
        dealers: userPermissions['dealers'] || { view: false, create: false, edit: false, delete: false, export: false },
        users: userPermissions['users'] || { view: false, create: false, edit: false, delete: false, export: false },
        mediaLibrary: userPermissions['mediaLibrary'] || { view: false, create: false, edit: false, delete: false, export: false },
        offersSchemes: userPermissions['offersSchemes'] || { view: false, create: false, edit: false, delete: false, export: false },
        contentPages: userPermissions['contentPages'] || { view: false, create: false, edit: false, delete: false, export: false },
      };
      await usersApi.update(selectedUserForPermissions.id, { 
        permissions: completePermissions
      });
      toast({ title: 'Permissions updated successfully' });
      setIsPermissionsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update permissions',
        variant: 'destructive',
      });
    }
  }

  async function handleSubmit() {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData);
        toast({ title: 'User updated successfully' });
      } else {
        await usersApi.create(formData);
        toast({ title: 'User created successfully' });
      }
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save user',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await usersApi.delete(id);
      toast({ title: 'User deleted successfully' });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  }

  async function toggleStatus(user: AdminUser) {
    try {
      await usersApi.update(user.id, { isActive: !user.isActive });
      toast({
        title: `User ${!user.isActive ? 'activated' : 'deactivated'}`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobile.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage admin users and their roles
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gradient-accent text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCog className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === 'master_admin').length}
                </p>
                <p className="text-sm text-muted-foreground">Master Admins</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-accent" />
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
              placeholder="Search by name, email, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            All Users ({filteredUsers.length})
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
                    <TableHead>User</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="table-row-hover">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.mobile}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.role === 'master_admin'
                                ? 'bg-accent/10 text-accent border-accent/20'
                                : user.role === 'admin'
                                ? 'bg-info/10 text-info border-info/20'
                                : 'bg-muted'
                            }
                          >
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openPermissionsDialog(user)}>
                                <Settings2 className="mr-2 h-4 w-4" />
                                Manage Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleStatus(user)}>
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(user.id)}
                                className="text-destructive"
                                disabled={user.role === 'master_admin'}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Update user information and role'
                : 'Add a new admin user to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Enter mobile number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="master_admin">Master Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sales_user">Sales User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Active Status</Label>
              <Switch
                id="status"
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
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Manage Permissions
            </DialogTitle>
            <DialogDescription>
              Configure module access for{' '}
              <span className="font-medium text-foreground">
                {selectedUserForPermissions?.name}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {ALL_MODULES.map((module, index) => {
                const modulePerms = userPermissions[module.key] || {
                  view: false,
                  create: false,
                  edit: false,
                  delete: false,
                  export: false,
                };
                const hasAnyAccess = modulePerms.view || modulePerms.create || 
                  modulePerms.edit || modulePerms.delete || modulePerms.export;

                return (
                  <div key={module.key}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-3">
                      {/* Module Header with Main Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{module.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {hasAnyAccess ? 'Access granted' : 'No access'}
                          </p>
                        </div>
                        <Switch
                          checked={hasAnyAccess}
                          onCheckedChange={(checked) => toggleModuleAccess(module.key, checked)}
                        />
                      </div>
                      
                      {/* Individual Permissions */}
                      {hasAnyAccess && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pl-4 pt-2">
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">View</span>
                            <Switch
                              checked={modulePerms.view}
                              onCheckedChange={(checked) => togglePermission(module.key, 'view', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Create</span>
                            <Switch
                              checked={modulePerms.create}
                              onCheckedChange={(checked) => togglePermission(module.key, 'create', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Edit</span>
                            <Switch
                              checked={modulePerms.edit}
                              onCheckedChange={(checked) => togglePermission(module.key, 'edit', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Delete</span>
                            <Switch
                              checked={modulePerms.delete}
                              onCheckedChange={(checked) => togglePermission(module.key, 'delete', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">Export</span>
                            <Switch
                              checked={modulePerms.export || false}
                              onCheckedChange={(checked) => togglePermission(module.key, 'export', checked)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} className="gradient-accent text-accent-foreground">
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}