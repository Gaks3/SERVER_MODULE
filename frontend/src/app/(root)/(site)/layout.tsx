import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default async function SiteLayout({ children }: PropsWithChildren) {
  const user = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!user.data?.user) return redirect('/login');

  return <>{children}</>;
}
