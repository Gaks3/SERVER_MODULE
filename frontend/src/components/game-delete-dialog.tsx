'use client';

import { apiClient } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Trash2Icon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

export default function GameDeleteDialog({
  game,
}: {
  game: { id: string; title: string; slug: string };
}) {
  const router = useRouter();

  const schema = z.object({
    verify: z
      .string()
      .trim()
      .min(1, 'The verify field is required')
      .refine((value) => value === `Delete ${game.title}`, {
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
    const res = await apiClient.api.games[':slug'].$delete(
      {
        param: {
          slug: game.slug,
        },
      },
      {
        init: {
          credentials: 'include',
        },
      }
    );

    if (res.status === 204) {
      toast.success('Successfully to delete game');
      router.push('/developer/games');
    }
    if (res.status === 404) toast.warning('Game not found');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='p-5 text-destructive' variant={'outline'}>
          <Trash2Icon className='!text-destructive' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This action will permanently delete
            this game from the server.
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
                    <span className='font-bold'>Delete {game.title}</span>{' '}
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
