import GameCreateDialog from '@/components/game-create-dialog';
import SearchDeveloperGames from '@/components/search-developer-games';
import SortDeveloperGames from '@/components/sort-developer-games';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { SortDirEnum } from '@/lib/types';
import { UsersIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { search, sortDir } = await searchParams;

  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      credentials: 'include',
    },
  });

  const games = await apiClient.api.games.$get(
    {
      query: {
        userId: session.data!.user.id,
        search,
        sortDir: sortDir as SortDirEnum | undefined,
      },
    },
    {
      init: {
        headers: await headers(),
      },
    }
  );

  const { data: gamesData } = await games.json();

  return (
    <div className='space-y-6 p-5'>
      <h2 className='text-3xl font-bold tracking-tight'>Your Games</h2>
      <div className='flex md:items-center md:justify-between flex-col-reverse md:flex-row gap-3'>
        <div className='flex gap-3'>
          <SearchDeveloperGames search={search} />
          <SortDeveloperGames />
        </div>
        <GameCreateDialog />
      </div>
      <div className='grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {gamesData.map((game, index) => (
          <Link key={index} href={`/developer/games/${game.slug}`}>
            <Card className='overflow-hidden py-0 gap-0'>
              <div className='aspect-square w-full overflow-hidden relative'>
                <Image
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${game.image}`}
                  fill
                  alt={game.title}
                  className='object-cover transition-all hover:scale-105'
                />
              </div>
              <CardHeader className='p-4'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-2xl tracking-tight line-clamp-1'>
                      {game.title}
                    </CardTitle>
                    <CardDescription className='line-clamp-2'>
                      {game.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className='flex items-center justify-center border-t p-4'>
                <div className='flex flex-col items-center'>
                  <div className='flex items-center text-muted-foreground'>
                    <UsersIcon className='mr-1 h-3 w-3' />
                    <span className='text-xs'>Players</span>
                  </div>
                  <p className='font-medium'>{game.totalPlayers}</p>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
