'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-5'>
      <h1 className='text-2xl font-bold'>Something went wrong!</h1>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
