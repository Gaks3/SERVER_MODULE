'use client';

import { AwardIcon, MedalIcon, TrophyIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User } from 'better-auth/types';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

type LeaderboardProps = {
  scores: Array<{
    id: number;
    createdAt: string;
    score: number;
    userId: string;
    gameVersionId: string;
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image: string | null;
      createdAt: string;
      updatedAt: string;
      role: string;
      banned: boolean | null;
      banReason: string | null;
      banExpires: string | null;
    };
  }>;
  user: User;
  slug: string;
};

export default function Leaderboard({
  scores: scoresData,
  user,
  slug,
}: LeaderboardProps) {
  const [scores, setScores] = useState(scoresData);

  useEffect(() => {
    window.addEventListener('message', async (event) => {
      const data = event.data as { event_type: string; score: number };

      if (data.event_type === 'game_run_end' && data.score) {
        setTimeout(async () => {
          const res = await apiClient.api.games[':slug'].scores.$get(
            {
              param: {
                slug,
              },
            },
            {
              init: {
                credentials: 'include',
              },
            }
          );

          if (res.ok) {
            const json = await res.json();
            if ('data' in json) setScores(json.data);
          }
        }, 500);
      }
    });

    // eslint-disable-next-line
  }, []);

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrophyIcon className='h-5 w-5 text-yellow-500' />
          Leaderboard
        </CardTitle>
        <CardDescription>Top players ranked by score</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {scores.slice(0, 10).map((score, index) => (
            <div
              key={index}
              className='flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50'
            >
              <div className='flex h-8 w-8 items-center justify-center'>
                {index === 0 ? (
                  <TrophyIcon className='h-5 w-5 text-yellow-500' />
                ) : index === 1 ? (
                  <MedalIcon className='h-5 w-5 text-gray-400' />
                ) : index === 2 ? (
                  <AwardIcon className='h-5 w-5 text-amber-700' />
                ) : (
                  <span className='text-sm font-medium text-muted-foreground'>
                    {index + 1}
                  </span>
                )}
              </div>

              <Avatar>
                {score.user.image && (
                  <AvatarImage src={score.user.image} alt={score.user.name} />
                )}
                <AvatarFallback>
                  {score.user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1'>
                <p
                  className={cn(
                    'text-sm leading-none',
                    user.id === score.userId ? 'font-bold' : 'font-medium'
                  )}
                >
                  {score.user.name}
                </p>
              </div>

              <div className='text-sm font-medium'>
                {score.score.toLocaleString()}
              </div>
            </div>
          ))}
          {scores.slice(10).map((score, index) => {
            if (score.userId === user.id)
              return (
                <div
                  key={index}
                  className='flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50'
                >
                  <div className='flex h-8 w-8 items-center justify-center'>
                    <span className='text-sm font-medium text-muted-foreground'>
                      ...
                    </span>
                  </div>

                  <Avatar>
                    {score.user.image && (
                      <AvatarImage
                        src={score.user.image}
                        alt={score.user.name}
                      />
                    )}
                    <AvatarFallback>
                      {score.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1'>
                    <p
                      className={cn(
                        'text-sm leading-none',
                        user.id === score.userId ? 'font-bold' : 'font-medium'
                      )}
                    >
                      {score.user.name}
                    </p>
                  </div>

                  <div className='text-sm font-medium'>
                    {score.score.toLocaleString()}
                  </div>
                </div>
              );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
