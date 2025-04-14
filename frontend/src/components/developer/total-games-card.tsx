import { CalendarIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { format } from 'date-fns';

export default function TotalGamesCard({ totalGames }: { totalGames: number }) {
  return (
    <Card className='@container/card'>
      <CardHeader className='relative'>
        <CardDescription>Total Games</CardDescription>
        <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
          {totalGames}
        </CardTitle>
        <div className='absolute right-4 top-4'></div>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1 text-sm'>
        <div className='line-clamp-1 flex gap-2 font-medium'>
          <Badge variant='outline' className='flex gap-1 rounded-lg text-xs'>
            <CalendarIcon className='size-3' />
            {format(new Date(), 'PPP')}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
