'use client';

import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';

export default function ThemeButton() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant='ghost'
      type='button'
      size='icon'
      className='px-2'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      name='mode-toggle'
      role='button'
      aria-label='mode-toggle'
    >
      <SunIcon className='h-[1.2rem] w-[1.2rem] text-neutral-800 dark:hidden dark:text-neutral-200' />
      <MoonIcon className='hidden h-[1.2rem] w-[1.2rem] text-neutral-800 dark:block dark:text-neutral-200' />
    </Button>
  );
}
