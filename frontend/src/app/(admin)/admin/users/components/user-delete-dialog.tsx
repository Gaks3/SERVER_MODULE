'use client';

import { UnwrapArray } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { DataType } from '../columns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@/lib/auth-client';
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
import { TrashIcon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function UserDeleteDialog({
  user,
}: {
  user: UnwrapArray<DataType>;
}) {
  const router = useRouter();

  const schema = z.object({
    verify: z
      .string()
      .trim()
      .min(1, 'The verify field is required')
      .refine((value) => value === `Delete ${user.email}`, {
        message: 'The verification text does not match',
      }),
  });
  type Schema = z.infer<typeof schema>;

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      verify: '',
    },
  });

  const onSubmit = async () => {
    await authClient.admin.removeUser(
      {
        userId: user.id,
      },
      {
        credentials: 'include',
        onSuccess: (ctx) => {
          if (ctx.response.ok) {
            toast.success('Successfully to delete user');
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
          onSelect={(e) => e.preventDefault()}
          className='!text-destructive'
        >
          <TrashIcon className='mr-1 !text-destructive' />
          Delete user
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This action will permanently delete
            this user and remove their data from the server.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name={'verify'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    To verify, type{' '}
                    <span className='font-bold'>Delete {user.email}</span>{' '}
                    below:
                  </FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete='off' />
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
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
