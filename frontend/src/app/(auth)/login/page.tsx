import type { Metadata } from 'next';

import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Login Page',
};

export default function LoginPage() {
  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <LoginForm />
      </div>
    </div>
  );
}
