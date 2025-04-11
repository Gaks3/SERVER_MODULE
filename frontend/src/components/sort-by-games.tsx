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
import { FunnelIcon } from 'lucide-react';
import { SortByEnum } from '@/lib/types';

export default function SortByGames() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildLink = useCallback(
    (sortBy?: string) => {
      const key = 'sortBy';
      if (!searchParams) return `${pathname}?${key}=${sortBy}`;

      const newSearchParams = new URLSearchParams(searchParams);

      if (!sortBy) {
        newSearchParams.delete(key);

        return `${pathname}?${newSearchParams.toString()}`;
      }

      newSearchParams.set(key, String(sortBy));
      return `${pathname}?${newSearchParams.toString()}`;
    },
    [searchParams, pathname]
  );

  const onSortBy = (value?: SortByEnum) => {
    const link = buildLink(value);

    return router.replace(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size='lg' variant={'outline'}>
          <FunnelIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => onSortBy(undefined)}>
          None
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortBy(SortByEnum.TITLE)}>
          Title
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortBy(SortByEnum.POPULARITY)}>
          Popularity
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortBy(SortByEnum.CREATEDAT)}>
          Created
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
