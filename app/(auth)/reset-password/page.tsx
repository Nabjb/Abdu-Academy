'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState('');
  const [secret, setSecret] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    const secretParam = searchParams.get('secret');

    if (!userIdParam || !secretParam) {
      setError('Invalid reset link');
      return;
    }

    setUserId(userIdParam);
    setSecret(secretParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!userId || !secret) {
      setError('Invalid reset link');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, secret, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      // Redirect to login
      router.push('/login?reset=success');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!userId || !secret) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <h1 className="mb-6 text-2xl font-bold">Invalid Reset Link</h1>
          <p className="mb-4 text-gray-600">
            This password reset link is invalid or has expired.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full">Request New Reset Link</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="mb-6 text-2xl font-bold">Reset Password</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={8}
            />
            <p className="text-xs text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
