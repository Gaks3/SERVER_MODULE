'use client';

import { SearchIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

export default function SearchDeveloperGames({
  search,
  className,
}: {
  search?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(
    search ?? searchParams.get('search') ?? ''
  );

  const buildLink = useCallback(
    (search?: string) => {
      const key = 'search';
      if (!searchParams) return `${pathname}?${key}=${search}`;

      const newSearchParams = new URLSearchParams(searchParams);

      if (!search || search.trim() === '') {
        newSearchParams.delete(key);

        return `${pathname}?${newSearchParams.toString()}`;
      }

      newSearchParams.set(key, String(search));
      return `${pathname}?${newSearchParams.toString()}`;
    },
    [searchParams, pathname]
  );

  const onSearch = () => {
    const link = buildLink(value);

    return router.replace(link);
  };

  return (
    <div className={cn('w-full relative max-w-xs group', className)}>
      <SearchIcon
        className='w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400'
        onClick={onSearch}
      />
      <Input
        type='search'
        placeholder='Search'
        className='p-5 pl-8'
        value={value}
        onChange={(value) => setValue(value.target.value)}
        onKeyUp={(event) => {
          if (event.code === 'Enter') {
            onSearch();
          }
        }}
      />
    </div>
  );
}
