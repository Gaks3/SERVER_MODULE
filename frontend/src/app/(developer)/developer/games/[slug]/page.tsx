import GameDeleteDialog from '@/components/game-delete-dialog';
import GameUpdateDialog from '@/components/game-update-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import VersionCreateDialog from '@/components/version-create-dialog';
import VersionDeleteDialog from '@/components/version-delete-dialog';
import { apiClient } from '@/lib/api';
import { CalendarIcon, FileArchiveIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
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

  const { data } = await gameRes.json();

  return (
    <div className='p-5 space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>{data.title}</h2>
        <div className='flex gap-2'>
          <GameUpdateDialog game={data} />
          <GameDeleteDialog game={data} />
        </div>
      </div>
      <div className='grid gap-6 md:grid-cols-3'>
        <Card className='md:col-span-1'>
          <CardHeader>
            <CardTitle>Game Cover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='relative'>
              <div className='aspect-square w-full overflow-hidden rounded-lg relative'>
                <Image
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${data.image}`}
                  alt={data.title}
                  className='w-full h-full object-cover'
                  fill
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
            <CardDescription>Basic information about your game</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4'>
              <div className='col-span-2'>
                <p className='text-sm font-medium text-muted-foreground'>ID</p>
                <p className='line-clamp-1 hover:underline'>#{data.id}</p>
              </div>
              <div className='col-span-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  Slug
                </p>
                <Link
                  href={`/play/${data.slug}`}
                  className='line-clamp-1 hover:underline'
                >
                  #{data.slug}
                </Link>
              </div>
              <div className='grid grid-cols-2 gap-4 col-span-2'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Created Date
                  </p>
                  <div className='flex items-center gap-1'>
                    <CalendarIcon className='h-3 w-3 text-muted-foreground' />
                    <p>{new Date(data.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Created Time
                  </p>
                  <p>
                    {new Date(data.createdAt)
                      .toLocaleTimeString()
                      .replaceAll('.', ':')}
                  </p>
                </div>
              </div>
              <div className='col-span-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  Description
                </p>
                <p>{data.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold'>Game Versions</h3>
        <VersionCreateDialog slug={data.slug} />
      </div>
      {data.gameVersion.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-10'>
            <FileArchiveIcon className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-lg font-medium mb-1'>No versions yet</p>
            <p className='text-muted-foreground mb-4'>
              Upload your first game version
            </p>
            <VersionCreateDialog slug={data.slug} />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                Manage your game builds and releases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.gameVersion.map((version, index) => (
                <div key={index} className='space-y-4'>
                  <div className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'>
                    <div className='flex items-center gap-3'>
                      <FileArchiveIcon className='h-10 w-10 text-muted-foreground p-1 border rounded-md' />
                      <div>
                        <p className='font-medium'>
                          Version : {version.version}
                        </p>
                        <div className='flex gap-4 mt-1'>
                          <p className='text-xs text-muted-foreground'>
                            {new Date(version.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <VersionDeleteDialog version={version} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
