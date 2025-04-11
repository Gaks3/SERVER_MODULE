import { headers } from 'next/headers';

import { apiClient } from '@/lib/api';
import { BannedUsersCard, TotalUsersCard } from './components/user-cards';
import { DataTable } from './data-table';
import { columns } from './columns';
import UserCreateDialog from './components/user-create-dialog';

export default async function UsersPage() {
  const users = await apiClient.api.users.$get(void 0, {
    init: {
      headers: await headers(),
    },
  });

  const { data: usersData } = await users.json();

  const totalUsers = usersData.length;
  const bannedUsers = usersData.filter(({ banned }) => banned === true).length;

  return (
    <div className='p-5'>
      <div className='grid gap-6 md:grid-cols-2'>
        <TotalUsersCard totalUsers={totalUsers} />
        <BannedUsersCard bannedUsers={bannedUsers} />
      </div>
      <div className='flex justify-between mt-5 items-center'>
        <h2 className='text-xl font-semibold line-clamp-1'>Users Management</h2>
        <UserCreateDialog />
      </div>
      <DataTable columns={columns} data={usersData} defaultFilter='name' />
    </div>
  );
}
