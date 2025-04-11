import { Gamepad2Icon } from 'lucide-react';
import Link from 'next/link';
import ThemeButton from './theme-button';
import { Button } from './ui/button';
import HeaderUser from './header-user';

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined | undefined;
  role: string;
  banned: boolean | null | undefined;
  banReason?: string | null | undefined;
  banExpires?: Date | null | undefined;
};

export default function Header({ user }: { user: User | undefined }) {
  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background flex items-center justify-center'>
      <div className='container flex h-16 items-center justify-between px-4'>
        <div className='flex items-center gap-2'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='flex items-center justify-center rounded-md size-8 bg-primary'>
              <Gamepad2Icon className='size-6 stroke-primary-foreground' />
            </div>
            <span className='font-bold text-xl hidden sm:inline-block'>
              PlayX
            </span>
          </Link>
        </div>
        <div className='flex items-center gap-4'>
          <ThemeButton />
          <div className='flex items-center gap-2'>
            {user ? (
              <HeaderUser user={user} />
            ) : (
              <>
                <Link href={'/login'}>
                  <Button>Login</Button>
                </Link>
                <Button variant='outline'>Register</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
