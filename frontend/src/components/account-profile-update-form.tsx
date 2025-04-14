'use client';

import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'The name field is required'),
});

type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export default function AccountProfileUpdateForm({
  name,
}: UpdateProfileSchema) {
  const router = useRouter();

  const form = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name,
    },
  });

  const onSubmit = async (values: UpdateProfileSchema) => {
    await authClient.updateUser(
      {
        ...values,
      },
      {
        credentials: 'include',
        onSuccess: () => {
          toast.success('Successfully to update name');
          router.refresh();
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
        <CardTitle>Update Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
