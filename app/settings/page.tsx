'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Edit2, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AlertTitle, AlertDescription } from '@/components/ui/alert';
import withAuth from '@/components/withAuth';

interface UserProfile {
  fullName: string;
  nickname: string;
  email: string;
  whatsapp: string;
  pixKey: string;
  birthDate: string;
  avatar?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    whatsapp: boolean;
  };
  lastLogin?: string;
}

const formatBirthDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};

const BirthSection = ({ birthDate }: { birthDate: string }) => {
  const { day, month, year } = formatBirthDate(birthDate);
  return (
    <div>
      <strong>Date of Birth:</strong> {`${day}/${month}/${year}`}
    </div>
  );
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await fetch('/api/home/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to load profile'
        );
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = (section: string) => {
    setEditMode((prev) => ({ ...prev, [section]: true }));
  };

  const handleSave = async (section: string) => {
    // Implementation for saving changes
    setEditMode((prev) => ({ ...prev, [section]: false }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">
          {error || 'Profile not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <Card className="max-w-3xl mx-auto w-full p-6">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="personal">
            <AccordionTrigger>Personal Information</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    {!editMode.personal ? (
                      <>
                        <p>
                          <strong>Name:</strong> {profile.fullName}
                        </p>
                        <p>
                          <strong>Nickname:</strong> {profile.nickname}
                        </p>
                        <p>
                          <strong>Email:</strong> {profile.email}
                        </p>
                        <p>
                          <strong>WhatsApp:</strong> {profile.whatsapp}
                        </p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          defaultValue={profile.fullName}
                          placeholder="Full Name"
                        />
                        <Input
                          defaultValue={profile.nickname}
                          placeholder="Nickname"
                        />
                        <Input
                          defaultValue={profile.whatsapp}
                          placeholder="WhatsApp"
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      editMode.personal
                        ? handleSave('personal')
                        : handleEdit('personal')
                    }
                  >
                    {editMode.personal ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="financial">
            <AccordionTrigger>Financial Information</AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  {!editMode.financial ? (
                    <p>
                      <strong>PIX Key:</strong> {profile.pixKey}
                    </p>
                  ) : (
                    <Input
                      defaultValue={profile.pixKey}
                      placeholder="PIX Key"
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    editMode.financial
                      ? handleSave('financial')
                      : handleEdit('financial')
                  }
                >
                  {editMode.financial ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Edit2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="birth">
            <AccordionTrigger>Birth Information</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <BirthSection birthDate={profile.birthDate} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="avatar">
            <AccordionTrigger>Profile Picture</AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center space-x-4">
                <Image
                  src={profile.avatar || '/default-avatar.png'}
                  alt="Profile"
                  className="rounded-full object-cover"
                  width={96}
                  height={96}
                  priority
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-0 right-0"
                  onClick={() => {
                    /* Handle upload */
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notifications">
            <AccordionTrigger>Notification Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <Switch
                    checked={profile.notifications?.email}
                    onCheckedChange={(checked) => {
                      /* Handle change */
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>WhatsApp Notifications</span>
                  <Switch
                    checked={profile.notifications?.whatsapp}
                    onCheckedChange={(checked) => {
                      /* Handle change */
                    }}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="appearance">
            <AccordionTrigger>Appearance</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Theme</span>
                  <Select
                    value={profile.theme}
                    onValueChange={(value) => {
                      /* Handle change */
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security" className="border-b">
            <AccordionTrigger>Security</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Last changed: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Recent Activity</h4>
                    <p className="text-sm text-muted-foreground">
                      Last login:{' '}
                      {new Date(profile.lastLogin || '').toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline">View Activity</Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="danger" className="border-red-200">
            <AccordionTrigger className="text-red-500">
              Danger Zone
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    This action cannot be undone. This will permanently delete
                    your account.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="destructive"
                  onClick={() => {
                    /* Handle account deletion */
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
};

export default withAuth(ProfilePage);
