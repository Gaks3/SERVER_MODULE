'use client';

import { authClient } from '@/lib/auth-client';
import { UnwrapArray } from '@/lib/types';
import { DataType } from '../columns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { UserRoundCheckIcon } from 'lucide-react';

export default function UserUnbanDialog({
  user,
}: {
  user: UnwrapArray<DataType>;
}) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const unBanUser = async () => {
    setIsSubmitting(true);

    await authClient.admin.unbanUser(
      {
        userId: user.id,
      },
      {
        credentials: 'include',
        onSuccess: (ctx) => {
          if (ctx.response.ok) {
            toast.success('User unbanned successfully');
            router.refresh();
          }
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );

    setIsSubmitting(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <UserRoundCheckIcon className='mr-1' />
          Unban user
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Unban User: {user.name}</DialogTitle>
          <DialogDescription>
            This action will restore the user's access to the platform.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'outline'}>Cancel</Button>
          </DialogClose>
          <Button onClick={unBanUser} disabled={isSubmitting}>
            Unban user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
