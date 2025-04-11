'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserX } from 'lucide-react';

interface TotalUsersCardProps {
  totalUsers: number;
}

interface BannedUsersCardProps {
  bannedUsers: number;
}

export function TotalUsersCard({ totalUsers = 1254 }: TotalUsersCardProps) {
  return (
    <Card className='w-full gap-0'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl font-semibold'>Total Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center'>
          <div className='flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
            <Users className='w-6 h-6 text-primary' />
          </div>
          <div className='ml-4'>
            <h3 className='text-3xl font-bold tracking-tight'>
              {totalUsers.toLocaleString()}
            </h3>
            <p className='text-sm text-muted-foreground'>Registered accounts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BannedUsersCard({ bannedUsers = 42 }: BannedUsersCardProps) {
  return (
    <Card className='w-full gap-0'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl font-semibold'>Banned Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center'>
          <div className='flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10'>
            <UserX className='w-6 h-6 text-destructive' />
          </div>
          <div className='ml-4'>
            <h3 className='text-3xl font-bold tracking-tight'>
              {bannedUsers.toLocaleString()}
            </h3>
            <p className='text-sm text-muted-foreground'>Suspended accounts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
