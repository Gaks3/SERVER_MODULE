'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import {
  Calendar1Icon,
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
} from 'lucide-react';

export default function SortDeveloperGames() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildLink = useCallback(
    (sort?: string) => {
      const key = 'sortDir';
      if (!searchParams) return `${pathname}?${key}=${sort}`;

      const newSearchParams = new URLSearchParams(searchParams);

      if (!sort) {
        newSearchParams.delete(key);
      }

      newSearchParams.set(key, String(sort));
      return `${pathname}?${newSearchParams.toString()}`;
    },
    [searchParams, pathname]
  );

  const onSort = (sort: string) => {
    const link = buildLink(sort);

    return router.replace(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'outline'} className='p-5'>
          <Calendar1Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onSort('desc')}>
          <CalendarArrowDownIcon />
          Newest
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('asc')}>
          <CalendarArrowUpIcon />
          Oldest
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
