'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/upload/image-upload';

interface Profile {
  userId: string;
  name?: string;
  avatar?: string;
  role: string;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
        setName(data.profile.name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      setSuccess('Profile updated successfully');
      await fetchProfile();
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (key: string, fileName: string, url: string) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update avatar');
        return;
      }

      setSuccess('Avatar updated successfully');
      await fetchProfile();
    } catch (error) {
      setError('An unexpected error occurred');
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
      <h1 className="mb-6 text-2xl font-bold">Profile Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                type="text"
                value={profile?.role || ''}
                disabled
                className="bg-gray-50 capitalize"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                {success}
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        {/* Avatar Upload */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Profile Picture</h2>

          {profile?.avatar && (
            <div className="mb-4">
              <img
                src={profile.avatar}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover"
              />
            </div>
          )}

          <ImageUpload
            onUploadComplete={handleAvatarUpload}
            folder="IMAGES"
          />
        </Card>
      </div>
    </div>
  );
}
