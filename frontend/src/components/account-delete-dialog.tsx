'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'better-auth/types';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { authClient } from '@/lib/auth-client';
import { passwordSchema } from '@/lib/schema/password-schema';
import { Input } from './ui/input';
import { useRef } from 'react';
import { PasswordInput } from './password-input';
import { toast } from 'sonner';

export default function AccountDeleteDialog({ user }: { user: User }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();

  const schema = z.object({
    password: passwordSchema,
    confirm: z.literal(`Delete ${user.email}`, {
      errorMap: () => ({
        message: 'Type correctly, if you want delete your account',
      }),
    }),
  });
  type Schema = z.infer<typeof schema>;

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (values: Schema) => {
    await authClient.deleteUser(
      {
        password: values.password,
      },
      {
        credentials: 'include',
        onSuccess: () => {
          toast.success('Successfully to delete account');
          router.push('/login');
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          Once you delete your account, there is no going back. Please be
          certain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button className='mt-5' variant={'destructive'}>
              Delete your account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='text-destructive'>
                Delete account
              </DialogTitle>
              <DialogDescription>
                Are you sure to delete your account? All your data will be
                deleted to.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-3'
              >
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirm'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        To verify, type &quot;Delete {user.email}&quot; below
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <DialogFooter>
              <DialogClose asChild>
                <Button ref={closeButtonRef} variant={'destructive'}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={form.formState.isSubmitting}
                variant={'outline'}
              >
                {form.formState.isSubmitting ? 'Loading...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
