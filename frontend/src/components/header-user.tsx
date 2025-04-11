'use client';

import {
  BellIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LogOutIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { RoleEnum } from '@/lib/types';
import Link from 'next/link';

export default function HeaderUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role: string;
  };
}) {
  const router = useRouter();

  const handleLogOut = async () => {
    const res = await authClient.signOut({
      fetchOptions: {
        credentials: 'include',
      },
    });

    if (res.error?.code) toast.error(res.error.message);
    if (res.data) router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className='grayscale'>
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className='rounded-lg'>
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align='end'>
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
            <Avatar className='h-8 w-8 rounded-lg'>
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className='rounded-lg'>
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>{user.name}</span>
              <span className='truncate text-xs text-muted-foreground'>
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user.role !== RoleEnum.USER && (
            <DropdownMenuItem asChild>
              <Link
                href={user.role === RoleEnum.ADMIN ? '/admin' : '/developer'}
              >
                <LayoutDashboardIcon />
                Dashboard
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleLogOut()}
          className='!text-destructive'
        >
          <LogOutIcon className='text-destructive' />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
