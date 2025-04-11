import { PropsWithChildren } from 'react';
import { headers as getHeaders } from 'next/headers';
import { authClient } from '@/lib/auth-client';
import { notFound } from 'next/navigation';
import { RoleEnum } from '@/lib/types';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { DeveloperSidebar } from '@/components/developer-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { items } from '@/components/items-developer-sidebar';
import ThemeButton from '@/components/theme-button';

export default async function DeveloperLayout({ children }: PropsWithChildren) {
  const headers = await getHeaders();

  const user = await authClient.getSession({
    fetchOptions: {
      headers,
    },
  });

  if (
    !user.data ||
    (user.data?.user && user.data.user.role !== RoleEnum.DEVELOPER)
  )
    return notFound();

  const indexItem = items.findIndex(
    ({ url }) => url === headers.get('x-current-path')
  );

  return (
    <SidebarProvider>
      <DeveloperSidebar user={user.data.user} />
      <SidebarInset>
        <header className='flex items-center h-16 gap-2 border-b shrink-0 justify-between px-4'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='-ml-1 cursor-pointer' />
            <Separator orientation='vertical' className='mr-2 !h-4' />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className='text-base font-medium'>
                    {items[indexItem]
                      ? items[indexItem].title
                      : 'Admin Dashboard'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeButton />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
