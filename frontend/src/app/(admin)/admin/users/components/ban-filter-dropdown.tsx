import { Column, Table } from '@tanstack/react-table';
import { ChevronDown, EyeOffIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function BanFilterDropdown<TData, TValue>({
  table,
  column,
}: {
  table: Table<TData>;
  column: Column<TData, TValue>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-sans data-[state=open]:bg-accent'
        >
          Status
          <ChevronDown className='w-4 h-4 ml-2' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => table.getColumn('banned')?.setFilterValue(undefined)}
        >
          None
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => table.getColumn('banned')?.setFilterValue('banned')}
        >
          Banned
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => table.getColumn('banned')?.setFilterValue('active')}
        >
          Active
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
          <EyeOffIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
