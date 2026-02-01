'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Purchase {
  purchaseId: string;
  userId: string;
  courseId: string;
  stripePaymentId: string;
  stripeSessionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded';
  purchasedAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, [currentPage, statusFilter]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', ITEMS_PER_PAGE.toString());
      params.append('offset', ((currentPage - 1) * ITEMS_PER_PAGE).toString());
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/purchases?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPurchases(data.purchases);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      refunded: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return <Badge className={colors[status] || colors.pending}>{status}</Badge>;
  };

  // Calculate totals
  const completedPurchases = purchases.filter((p) => p.status === 'completed');
  const totalRevenue = completedPurchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Purchase Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedPurchases.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 100).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Purchases</CardTitle>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading purchases...</div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No purchases found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purchase ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Stripe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.purchaseId}>
                      <TableCell className="font-mono text-sm">
                        {purchase.purchaseId.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {purchase.userId.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {purchase.courseId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        ${(purchase.amount / 100).toFixed(2)}{' '}
                        <span className="text-gray-500 uppercase text-xs">
                          {purchase.currency}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      <TableCell>
                        {format(new Date(purchase.purchasedAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        {purchase.stripePaymentId && (
                          <a
                            href={`https://dashboard.stripe.com/test/payments/${purchase.stripePaymentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} purchases
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
