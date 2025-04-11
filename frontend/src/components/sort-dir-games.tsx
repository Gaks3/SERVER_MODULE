'use client';

import { SortDirEnum } from '@/lib/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ArrowDownIcon, ArrowDownUpIcon, ArrowUpIcon } from 'lucide-react';

export default function SortDirGames() {
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

  const onSortDir = (value?: SortDirEnum) => {
    const link = buildLink(value);

    return router.replace(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={'lg'} variant={'outline'}>
          <ArrowDownUpIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => onSortDir(SortDirEnum.ASC)}>
          <ArrowUpIcon /> Ascending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortDir(SortDirEnum.DESC)}>
          <ArrowDownIcon />
          Descending
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
