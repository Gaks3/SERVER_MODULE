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
  user: {
    label: 'User',
    color: 'var(--chart-1)',
  },
  developer: {
    label: 'Developer',
    color: 'var(--chart-2)',
  },
  admin: {
    label: 'Admin',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export default function RolesChart({
  roles,
}: {
  roles: {
    role: 'user' | 'developer' | 'admin';
    total: number;
  }[];
}) {
  const chartData = roles.map((role, index) => ({
    ...role,
    fill: `var(--chart-${index + 1}`,
  }));

  return (
    <Card className='flex flex-col col-span-2 lg:col-span-1'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>User by Role</CardTitle>
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
            <Pie data={chartData} dataKey='total' nameKey='role' />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex gap-2 text-sm justify-center items-center'>
        {roles.map((role, index) => (
          <Badge variant={'outline'} className={cn('capitalize')} key={index}>
            {role.role} : {role.total}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  );
}
