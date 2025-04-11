import GameContainer from '@/components/game-container';
import GameShareButton from '@/components/game-share-button';
import Leaderboard from '@/components/leaderboard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { formatDate } from 'date-fns';
import { ClockIcon, FileCodeIcon, UserIcon } from 'lucide-react';
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

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-4'>
      <div className='md:col-span-2'>
        <GameContainer game={gameData} />
      </div>
      <div>
        <Leaderboard scores={gameData.gameVersion[0].score} />
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
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <UserIcon className='h-5 w-5 text-purple-500' />
                <h4 className='font-medium'>Developer</h4>
              </div>

              <div className='p-3 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage
                      src={gameData.user.image || ''}
                      alt={gameData.user.name}
                    />
                    <AvatarFallback>
                      {gameData.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{gameData.user.name}</p>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='capitalize text-xs'>
                        {gameData.user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
