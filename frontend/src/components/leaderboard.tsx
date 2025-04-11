import { AwardIcon, MedalIcon, TrophyIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
};

export default function Leaderboard({ scores }: LeaderboardProps) {
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
          {scores.map((score, index) => (
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
                <p className='text-sm font-medium leading-none'>
                  {score.user.name}
                </p>
              </div>

              <div className='text-sm font-medium'>
                {score.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
