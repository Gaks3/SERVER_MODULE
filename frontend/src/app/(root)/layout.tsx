import Header from '@/components/header';
import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { PropsWithChildren } from 'react';

export default async function SiteLayout({ children }: PropsWithChildren) {
  const user = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  return (
    <>
      <Header user={user.data?.user} />
      {children}
    </>
  );
}
