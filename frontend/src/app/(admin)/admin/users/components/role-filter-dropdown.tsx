import { Column, type Table } from '@tanstack/react-table';
import { ChevronDown, EyeOffIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { RoleEnum } from '@/lib/types';

export default function RoleFilterDropdown<TData, TValue>({
  table,
  column,
}: {
  table: Table<TData>;
  column: Column<TData, TValue>;
}) {
  const roles = Object.values(RoleEnum);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-sans data-[state=open]:bg-accent'
        >
          Role
          <ChevronDown className='w-4 h-4 ml-2' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => table.getColumn('role')?.setFilterValue('')}
        >
          None
        </DropdownMenuItem>
        {roles.map((role, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => table.getColumn('role')?.setFilterValue(role)}
          >
            {role}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
          <EyeOffIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
