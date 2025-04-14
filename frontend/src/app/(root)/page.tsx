import PaginationGames from '@/components/pagination-games';
import SearchDeveloperGames from '@/components/search-developer-games';
import SortByGames from '@/components/sort-by-games';
import SortDirGames from '@/components/sort-dir-games';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { ListParamsSchema } from '@/lib/schema/game-schema';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { search, sortBy, sortDir, page, pageSize } =
    (await searchParams) as unknown as ListParamsSchema;

  const games = await apiClient.api.games.$get({
    query: {
      search,
      sortBy,
      sortDir,
      page,
      pageSize,
    },
  });

  const data = await games.json();

  return (
    <div className='container mx-auto px-4 py-8 space-y-5'>
      <h1 className='text-3xl font-bold mb-2'>Game Center</h1>
      <p className='text-muted-foreground'>
        Discover and play hundreds of free online games
      </p>
      <div className='flex justify-between gap-x-10'>
        <SearchDeveloperGames className='max-w-md' />
        <div className='flex items-center gap-x-3'>
          <SortByGames />
          <SortDirGames />
        </div>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
        {data.data.map((game) => (
          <Card
            key={game.id}
            className='overflow-hidden transition-all hover:shadow-md gap-0 py-0'
          >
            <div className='relative aspect-square overflow-hidden'>
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${game.image}`}
                alt={game.title}
                fill
                className='h-full w-full object-cover transition-transform duration-300 hover:scale-105'
              />
            </div>
            <CardContent className='p-3'>
              <h3 className='font-medium text-sm line-clamp-1 text-center'>
                {game.title}
              </h3>
            </CardContent>
            <CardFooter className='p-3 pt-0'>
              <Button className='w-full text-sm py-1 h-8' asChild>
                <Link href={`/play/${game.slug}`}>Play</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {data.data.length === 0 && (
        <div className='flex w-full items-center justify-center'>
          <p className='font-semibold text-xl'>Games not found</p>
        </div>
      )}
      <PaginationGames
        page={data.page}
        pageSize={data.pageSize}
        isFirstPage={data.isFirstPage}
        isLastPage={data.isLastPage}
        totalPage={data.totalPage}
      />
    </div>
  );
}
