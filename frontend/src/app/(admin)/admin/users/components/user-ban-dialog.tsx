'use client';

import { authClient } from '@/lib/auth-client';
import { UnwrapArray } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UserRoundXIcon } from 'lucide-react';

const userBanSchema = z.object({
  banReason: z.string().trim().min(1, 'Ban reason required'),
});

type UserBanSchema = z.infer<typeof userBanSchema>;

export default function UserBanDialog({
  user,
}: {
  user: UnwrapArray<DataType>;
}) {
  const router = useRouter();

  const form = useForm<UserBanSchema>({
    resolver: zodResolver(userBanSchema),
    defaultValues: {
      banReason: '',
    },
  });

  const onSubmit = async ({ banReason }: UserBanSchema) => {
    await authClient.admin.banUser(
      {
        userId: user.id,
        banReason,
      },
      {
        credentials: 'include',
        onSuccess: (ctx) => {
          if (ctx.response.ok) {
            toast.success('User banned successfully');
            router.refresh();
          }
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          className='!text-destructive'
          onSelect={(e) => e.preventDefault()}
        >
          <UserRoundXIcon className='mr-1 text-destructive' />
          Ban user
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Ban User: {user.name}</DialogTitle>
          <DialogDescription>
            This action will prevent the user from accessing the platform.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='banReason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ban reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Please provide a reason for this action...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'outline'}>Cancel</Button>
          </DialogClose>
          <Button
            variant={'destructive'}
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            Ban user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
