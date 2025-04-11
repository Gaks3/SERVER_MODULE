'use client';

import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Gamepad2Icon } from 'lucide-react';

import { passwordSchema } from '@/lib/schema/password-schema';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { RoleEnum } from '@/lib/types';
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
import { PasswordInput } from './password-input';

const formSchema = z
  .object({
    name: z.string().trim().min(1, 'The name field is required'),
    email: z.string().email(),
    password: passwordSchema,
    confirm: z.string().trim().min(1, 'The confirm password field is required'),
  })
  .refine((values) => values.password === values.confirm, {
    message: 'The confirm password does not match',
    path: ['confirm'],
  });

type FormSchema = z.infer<typeof formSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm: '',
    },
  });

  const onSubmit = async (values: FormSchema) => {
    await authClient.signUp.email(
      {
        ...values,
        role: RoleEnum.USER,
      },
      {
        onSuccess: (ctx) => {
          if (ctx.response.ok) {
            toast.success('Sign up success');
            router.push('/');
          }
        },
        onError: (ctx) => {
          if (ctx.error.message.includes('User already exists'))
            form.setError('email', { message: 'Email already used' });
          else toast.error(ctx.error.message);
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
                <div className='flex items-center justify-center rounded-md size-8'>
                  <Gamepad2Icon className='size-6' />
                </div>
                <span className='sr-only'>PlayX</span>
              </Link>
              <h1 className='text-xl font-bold'>Welcome to PlayX</h1>
              <div className='text-sm text-center'>
                Already have an account?{' '}
                <Link href='/login' className='underline underline-offset-4'>
                  Login
                </Link>
              </div>
            </div>
            <div className='flex flex-col gap-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type='name' placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='m@example.com'
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
                        placeholder='Your strong password'
                      />
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder="Don't forget the password"
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
                Register
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
