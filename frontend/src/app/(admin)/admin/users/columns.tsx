'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import RoleFilterDropdown from '@/app/(admin)/admin/users/components/role-filter-dropdown';
import SortColumnHeader from '@/components/sort-column-header';

import type { apiClient } from '@/lib/api';
import { RoleEnum } from '@/lib/types';
import BanFilterDropdown from '@/app/(admin)/admin/users/components/ban-filter-dropdown';
import { Badge } from '@/components/ui/badge';
import UserActionTable from './components/user-action-table';

export type DataType = Awaited<
  ReturnType<Awaited<ReturnType<typeof apiClient.api.users.$get>>['json']>
>['data'];

export const columns: ColumnDef<DataType[number]>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <SortColumnHeader column={column} title='Id' />,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <SortColumnHeader column={column} title='Name' />,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <SortColumnHeader column={column} title='Email' />,
  },
  {
    accessorKey: 'role',
    header: ({ table, column }) => (
      <RoleFilterDropdown table={table} column={column} />
    ),
    cell: ({ row }) => <RoleBadge role={row.original.role} />,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'banned',
    header: ({ table, column }) => (
      <BanFilterDropdown table={table} column={column} />
    ),
    cell: ({ row }) => <StatusBadge banned={row.original.banned} />,
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === undefined) return true;

      if (filterValue === 'banned') return row.getValue(columnId) === true;

      if (filterValue === 'active') return row.getValue(columnId) === null;

      return true;
    },
    enableColumnFilter: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <SortColumnHeader column={column} title='Created At' />
    ),
    accessorFn: ({ createdAt }) => format(createdAt, 'PPP'),
    enableColumnFilter: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <UserActionTable user={row.original} />,
    enableColumnFilter: false,
  },
];

export const RoleBadge = ({ role }: { role: string }) => (
  <Badge
    variant={'outline'}
    className={`capitalize ${
      role === RoleEnum.ADMIN
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : role === RoleEnum.DEVELOPER
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-gray-50 text-gray-700 border-gray-200'
    }`}
  >
    {role}
  </Badge>
);

export const StatusBadge = ({ banned }: { banned: boolean | null }) => (
  <Badge
    variant={'outline'}
    className={
      banned
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-green-50 text-green-700 border-green-200'
    }
  >
    {banned ? 'Banned' : 'Active'}
  </Badge>
);
