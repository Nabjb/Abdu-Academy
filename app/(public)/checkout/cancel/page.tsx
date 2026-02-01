'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <XCircle className="h-16 w-16 text-orange-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-gray-600">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">What happened?</h2>
            <p className="text-gray-600 text-sm">
              You chose to cancel the payment process. Your course selection has been saved,
              and you can complete your purchase at any time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="w-full sm:w-auto">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/dashboard/my-courses">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Courses
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-gray-600">
            <p>
              Need help? Contact our support team if you experienced any issues during checkout.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
