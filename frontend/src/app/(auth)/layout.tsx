import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';

import { authClient } from '@/lib/auth-client';

export default async function AuthLayout({ children }: PropsWithChildren) {
  const user = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (user.data?.session) return redirect('/');

  return children;
}
