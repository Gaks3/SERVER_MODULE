import BannedUsersCard from '@/components/admin/banned-users-card';
import RolesChart from '@/components/admin/roles-chart';
import StatusChart from '@/components/admin/status-chart';
import TotalGamesCard from '@/components/admin/total-games-card';
import TotalScoresCard from '@/components/admin/total-scores-card';
import TotalUsersCard from '@/components/admin/total-users-card';
import { apiClient } from '@/lib/api';
import { headers } from 'next/headers';

export const metadata = {
  title: 'Admin',
};

export default async function AdminPage() {
  const res = await apiClient.api.users.stats.$get(void 0, {
    init: {
      headers: await headers(),
    },
  });

  const { data } = await res.json();

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
          <div className='*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-2 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6'>
            <TotalUsersCard totalUsers={data.totalUsers} />
            <BannedUsersCard bannedUsers={data.bannedUsers} />
            <RolesChart roles={data.roles} />
            <StatusChart status={data.status} />
            <TotalGamesCard totalGames={data.totalGames} />
            <TotalScoresCard totalScores={data.totalScores} />
          </div>
        </div>
      </div>
    </div>
  );
}
