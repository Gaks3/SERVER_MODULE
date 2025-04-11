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
          <PaginationItem aria-disabled>
            <PaginationPrevious onClick={() => onPage(page - 1)} />
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
              <PaginationLink href='#'>{page}</PaginationLink>
            </PaginationItem>
          ))}
        <PaginationItem>
          <PaginationLink
            isActive={page === Number(searchParams.get('page'))}
            href={`?page=${page}`}
          >
            {page + 1}
          </PaginationLink>
        </PaginationItem>
        {!(page + 1 >= totalPage) && (
          <PaginationItem>
            <PaginationLink href=''>{page + 2}</PaginationLink>
          </PaginationItem>
        )}
        {page + 2 <= totalPage && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {!isFirstPage ? (
          <PaginationItem aria-disabled>
            <PaginationNext onClick={() => onPage(page + 1)} />
          </PaginationItem>
        ) : (
          <Button disabled variant={'ghost'}>
            <ChevronRightIcon />
            <span className='hidden sm:block'>Previous</span>
          </Button>
        )}
      </PaginationContent>
    </Pagination>
  );
}
