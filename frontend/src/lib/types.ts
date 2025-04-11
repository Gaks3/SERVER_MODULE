import type { ColumnDef } from '@tanstack/react-table';

export enum RoleEnum {
  USER = 'user',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
}

export enum SortByEnum {
  TITLE = 'title',
  POPULARITY = 'popularity',
  CREATEDAT = 'createdAt',
}

export enum SortDirEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultFilter: string;
}

export type UnwrapArray<T> = T extends Array<infer R> ? R : never;
