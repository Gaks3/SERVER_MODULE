'use client';

import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { passwordSchema } from '@/lib/schema/password-schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { PasswordInput } from './password-input';
import { Button } from './ui/button';

const updatePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .trim()
      .min(1, 'The confirm password field is required'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Password doesn't match",
    path: ['confirm'],
  });

type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

export default function AccountPasswordUpdateForm() {
  const form = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: UpdatePasswordSchema) => {
    await authClient.changePassword(
      {
        ...values,
      },
      {
        credentials: 'include',
        onSuccess: () => {
          toast.success('Successfully to change password');
          form.reset();
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
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Time for a password change? Enhance your security with a new, stronger
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex gap-x-3 justify-end'>
              <Button
                type='button'
                onClick={() => form.reset()}
                variant={'outline'}
              >
                Cancel
              </Button>
              <Button disabled={form.formState.isSubmitting}>
                Update name
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
