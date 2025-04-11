'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { Button } from './ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export default function PaginationGames({
  page = 0,
  pageSize,
  totalPage,
  isFirstPage,
  isLastPage,
}: {
  page: number;
  pageSize: number;
  totalPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildLink = useCallback(
    (page: number) => {
      const key = 'page';

      const newSearchParams = new URLSearchParams(searchParams);

      newSearchParams.set(key, String(page));
      return `${pathname}?${newSearchParams.toString()}`;
    },
    [searchParams, pathname]
  );

  const onPage = (value: number) => {
    const link = buildLink(value);

    return router.replace(link);
  };

  return (
    <Pagination>
      <PaginationContent>
        {!isFirstPage ? (
          <PaginationItem>
            <PaginationPrevious href={buildLink(page - 1)} />
          </PaginationItem>
        ) : (
          <Button disabled variant={'ghost'}>
            <ChevronLeftIcon />
            <span className='hidden sm:block'>Previous</span>
          </Button>
        )}
        {page - 1 !== 0 ||
          (page !== 0 && (
            <PaginationItem>
              <PaginationLink href={buildLink(page - 1)}>{page}</PaginationLink>
            </PaginationItem>
          ))}
        <PaginationItem>
          <PaginationLink
            isActive={page === Number(searchParams.get('page'))}
            href={`${buildLink(page)}`}
          >
            {page + 1}
          </PaginationLink>
        </PaginationItem>
        {!(page + 1 >= totalPage) && (
          <PaginationItem>
            <PaginationLink href={buildLink(page + 1)}>
              {page + 2}
            </PaginationLink>
          </PaginationItem>
        )}
        {page + 2 <= totalPage && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {!isLastPage ? (
          <PaginationItem>
            <PaginationNext href={buildLink(page + 1)} />
          </PaginationItem>
        ) : (
          <Button disabled variant={'ghost'}>
            <ChevronRightIcon />
            <span className='hidden sm:block'>Next</span>
          </Button>
        )}
      </PaginationContent>
    </Pagination>
  );
}
