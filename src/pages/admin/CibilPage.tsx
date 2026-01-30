import { useEffect, useState } from 'react';
import { Search, Filter, Shield, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTableSkeleton } from '@/components/admin/DataTableSkeleton';
import { cibilApi, type CibilCheck } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const scoreBandConfig: Record<string, { color: string; bg: string }> = {
  Excellent: { color: 'text-success', bg: 'bg-success/10' },
  Good: { color: 'text-info', bg: 'bg-info/10' },
  Average: { color: 'text-warning', bg: 'bg-warning/10' },
  Fair: { color: 'text-warning', bg: 'bg-warning/10' },
  Poor: { color: 'text-destructive', bg: 'bg-destructive/10' },
  Unknown: { color: 'text-muted-foreground', bg: 'bg-muted' },
};

export function CibilPage() {
  const [checks, setChecks] = useState<CibilCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchChecks();
  }, []);

  async function fetchChecks() {
    setIsLoading(true);
    try {
      const data = await cibilApi.getAll();
      setChecks(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch CIBIL checks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredChecks = checks.filter((check) => {
    const matchesSearch =
      check.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.mobile.includes(searchQuery);
    
    if (scoreFilter === 'all') return matchesSearch;
    if (scoreFilter === 'excellent') return matchesSearch && check.score >= 750;
    if (scoreFilter === 'good') return matchesSearch && check.score >= 650 && check.score < 750;
    if (scoreFilter === 'fair') return matchesSearch && check.score >= 550 && check.score < 650;
    if (scoreFilter === 'poor') return matchesSearch && check.score < 550;
    return matchesSearch;
  });

  const averageScore = checks.length > 0
    ? Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CIBIL Score Checks</h1>
        <p className="text-muted-foreground">
          View and manage customer credit score checks
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{checks.length}</p>
                <p className="text-sm text-muted-foreground">Total Checks</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{averageScore}</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {checks.filter((c) => c.score >= 750).length}
                </p>
                <p className="text-sm text-muted-foreground">Excellent Scores</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <span className="text-success font-bold">A+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {checks.filter((c) => c.score < 550).length}
                </p>
                <p className="text-sm text-muted-foreground">Poor Scores</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive font-bold">!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Score Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="excellent">Excellent (750+)</SelectItem>
                <SelectItem value="good">Good (650-749)</SelectItem>
                <SelectItem value="fair">Fair (550-649)</SelectItem>
                <SelectItem value="poor">Poor (&lt;550)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CIBIL Checks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All CIBIL Checks ({filteredChecks.length})</CardTitle>
          <CardDescription>Customer credit score verification history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columns={6} rows={5} />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>PAN</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Band</TableHead>
                    <TableHead>Checked At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No CIBIL checks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredChecks.map((check) => (
                      <TableRow key={check.id} className="table-row-hover">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {check.customerName.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium">{check.customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{check.mobile}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                       {check.panNumber}
                          </code>
                        </TableCell>
                        <TableCell>
                          {new Date(check.dateOfBirth).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`text-2xl font-bold ${scoreBandConfig[check.scoreBand]?.color || ''}`}>
                            {check.score}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${scoreBandConfig[check.scoreBand]?.bg} ${scoreBandConfig[check.scoreBand]?.color} border-0`}
                          >
                            {check.scoreBand}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(check.checkedAt).toLocaleString()}
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
