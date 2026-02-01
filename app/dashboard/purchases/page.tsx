'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface Purchase {
  purchaseId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: string;
  purchasedAt: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/user/purchases');
      const data = await response.json();

      if (data.success) {
        setPurchases(data.purchases);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Purchase History</h1>

      {purchases.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No purchases yet</p>
          <Link href="/courses" className="mt-4 inline-block text-blue-600 hover:underline">
            Browse Courses
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.purchaseId} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Course ID: {purchase.courseId}</p>
                  <p className="text-sm text-gray-600">
                    Purchased on {format(new Date(purchase.purchasedAt), 'PPP')}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      purchase.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : purchase.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {purchase.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {purchase.currency.toUpperCase()} ${purchase.amount.toFixed(2)}
                  </p>
                  <Link
                    href={`/learn/${purchase.courseId}`}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
