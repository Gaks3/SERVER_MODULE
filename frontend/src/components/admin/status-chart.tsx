'use client';

import { Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../ui/chart';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const chartConfig = {
  active: {
    label: 'Active',
    color: 'var(--chart-3)',
  },
  banned: {
    label: 'Banned',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

export default function StatusChart({
  status,
}: {
  status: {
    status: string;
    total: number;
  }[];
}) {
  const chartData = status.map((status, index) => ({
    ...status,
    fill: `var(--chart-${index + 3}`,
  }));

  return (
    <Card className='flex flex-col col-span-2 lg:col-span-1'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Status User</CardTitle>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey='total' nameKey='status' />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex gap-2 text-sm justify-center items-center'>
        {status.map((status, index) => (
          <Badge variant={'outline'} className={cn('capitalize')} key={index}>
            {status.status} : {status.total}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
}
