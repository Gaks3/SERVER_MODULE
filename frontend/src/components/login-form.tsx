'use client';

import { Gamepad2Icon } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { passwordSchema } from '@/lib/schema/password-schema';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { PasswordInput } from './password-input';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().trim().min(1, 'Password required'),
});
type FormSchema = z.infer<typeof formSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormSchema) => {
    await authClient.signIn.email(
      {
        ...values,
      },
      {
        onSuccess: (req) => {
          if (req.response.ok) {
            toast.success('Sign in success');
            router.push('/');
          }
        },
        onError: (err) => {
          toast.error(err.error.message);
        },
      }
    );
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col items-center gap-2'>
              <Link
                href='/'
                className='flex flex-col items-center gap-2 font-medium'
              >
                <div className='flex items-center justify-center rounded-md size-8 bg-primary'>
                  <Gamepad2Icon className='size-6 stroke-primary-foreground' />
                </div>
                <span className='sr-only'>PlayX</span>
              </Link>
              <h1 className='text-xl font-bold'>Welcome to PlayX</h1>
              <div className='text-sm text-center'>
                Don&apos;t have an account?{' '}
                <Link href='/register' className='underline underline-offset-4'>
                  Register
                </Link>
              </div>
            </div>
            <div className='flex flex-col gap-6'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='Enter your email'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder='Enter your password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full cursor-pointer'
                disabled={form.formState.isSubmitting}
              >
                Login
              </Button>
            </div>
          </div>
        </form>
        <div className='text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4'>
          By clicking continue, you agree to our{' '}
          <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
        </div>
      </Form>
    </div>
  );
}
