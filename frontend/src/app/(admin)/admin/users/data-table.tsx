'use client';

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  CaseUpperIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ColumnsIcon,
  IdCardIcon,
  MailIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type DataTableProps } from '@/lib/types';
import { Label } from '@/components/ui/label';

export function DataTable<TData, TValue>({
  columns,
  data,
  defaultFilter,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filterBy, setFilterBy] = useState(defaultFilter);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div>
        <div className='flex flex-col items-center gap-2 py-4 sm:flex-row'>
          <div className='flex justify-center w-full md:w-auto'>
            <div className='flex'>
              <Select
                onValueChange={(value) => setFilterBy(value)}
                value={filterBy}
              >
                <SelectTrigger
                  size='sm'
                  className='capitalize max-w-24 rounded-e-none'
                  icon='chevron up down'
                >
                  {filterBy === 'id' && <IdCardIcon />}
                  {filterBy === 'name' && <CaseUpperIcon />}
                  {filterBy === 'email' && <MailIcon />}
                </SelectTrigger>
                <SelectContent>
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanFilter())
                    .filter((column) => column.getIsVisible())
                    .map((column, index) => (
                      <SelectItem
                        key={index}
                        value={column.id}
                        className='capitalize'
                      >
                        {column.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={`Search by ${filterBy}...`}
                value={
                  (table.getColumn(filterBy)?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table.getColumn(filterBy)?.setFilterValue(event.target.value)
                }
                className='flex-1 flex-grow w-full h-8 sm:max-w-xs rounded-s-none'
                data-size='sm'
              />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='ml-auto'>
                <ColumnsIcon />
                <span className='hidden lg:inline'>Customize Columns</span>
                <span className='lg:hidden'>Columns</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='overflow-hidden border rounded-lg'>
          <Table>
            <TableHeader className='sticky top-0 z-[1] **:data-[slot=table-head]:first:pl-5 bg-muted'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className='**:data-[slot=table-cell]:first:pl-5'>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className='flex items-center w-full gap-8'>
        <div className='flex items-center justify-center text-sm font-medium w-fit'>
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className='flex items-center justify-end ml-auto space-x-2'>
          <Label htmlFor='rows-per-page' className='text-sm font-medium'>
            Rows per page
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className='w-20' id='rows-per-page'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='flex items-center justify-end py-4 ml-4 space-x-2'>
            <Button
              variant='outline'
              className='size-8'
              size='icon'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className='sr-only'>Go to previous page</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant='outline'
              className='size-8'
              size='icon'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className='sr-only'>Go to next page</span>
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
