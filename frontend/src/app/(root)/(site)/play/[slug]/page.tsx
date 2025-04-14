import GameContainer from '@/components/game-container';
import GameShareButton from '@/components/game-share-button';
import Leaderboard from '@/components/leaderboard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { formatDate } from 'date-fns';
import { ClockIcon, FileCodeIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const gameRes = await apiClient.api.games[':slug'].$get(
    {
      param: {
        slug,
      },
    },
    {
      init: {
        headers: await headers(),
      },
    }
  );

  if (gameRes.status === 404) return notFound();

  const { data: gameData } = await gameRes.json();

  if (gameData.gameVersion.length === 0) return notFound();

  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  const user = session.data!.user;

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-4'>
      <div className='md:col-span-2'>
        <GameContainer game={gameData} />
      </div>
      <div>
        <Leaderboard
          scores={gameData.gameVersion[0].score}
          user={user}
          slug={slug}
        />
      </div>
      <Card className='md:col-span-2'>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='md:col-span-1'>
              <div className='aspect-square w-full overflow-hidden rounded-lg border bg-muted relative'>
                <Image
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${gameData.image}`}
                  alt={gameData.title}
                  fill
                  className='h-full w-full object-cover'
                />
              </div>
            </div>
            <div className='md:col-span-2 space-y-3'>
              <h3 className='text-xl font-bold'>{gameData.title}</h3>
              <div className='flex items-center gap-2 mt-1'>
                <Badge variant='outline'>
                  <ClockIcon className='h-3 w-3 mr-1' />
                  {formatDate(gameData.createdAt, 'PPP')}
                </Badge>
                <Badge variant='outline'>
                  Version {gameData.gameVersion[0].version}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>
                {gameData.description}
              </p>
              <GameShareButton game={gameData} />
            </div>
          </div>
          <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <FileCodeIcon className='h-5 w-5 text-blue-500' />
                <h4 className='font-medium'>Current Version</h4>
              </div>
              <div className='flex items-center justify-between p-3 border rounded-lg'>
                <div>
                  <div className='flex items-center gap-2'>
                    <p className='font-medium'>
                      {
                        gameData.gameVersion[gameData.gameVersion.length - 1]
                          .version
                      }
                    </p>
                    <Badge className='bg-green-500 hover:bg-green-600'>
                      Latest
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Released on{' '}
                    {formatDate(gameData.gameVersion[0].createdAt, 'PPP')}
                  </p>
                  {gameData.gameVersion.length > 1 && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {gameData.gameVersion.length - 1} previous version
                      {gameData.gameVersion.length > 2 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
