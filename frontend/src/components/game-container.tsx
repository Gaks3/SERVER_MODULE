'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';

export type Game = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  gameVersion: {
    id: string;
    createdAt: string;
    updatedAt: string;
    path: string;
    gameId: string;
    version: string;
  }[];
};

export default function GameContainer({ game }: { game: Game }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
        setIsFullscreen(true);
      }
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const data = event.data as { event_type: string; score: number };

      if (data.event_type === 'game_run_end' && data.score) {
        apiClient.api.games[':slug'].scores.$post(
          {
            param: {
              slug: game.slug,
            },
            json: {
              score: data.score,
              gameVersionId: game.gameVersion[0].id,
            },
          },
          {
            init: {
              credentials: 'include',
            },
          }
        );
      }
    });

    // eslint-disable-next-line
  }, []);

  return (
    <div
      className='relative'
      ref={containerRef}
      onKeyDown={(event) => {
        console.log(event.key);
        if (event.key === 'Escape') setIsFullscreen(false);
      }}
    >
      <div
        className={cn(
          'w-full overflow-hidden border bg-muted',
          isFullscreen ? 'h-screen w-screen' : 'aspect-video'
        )}
      >
        <iframe
          ref={iframeRef}
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${game.gameVersion[0].path}`}
          className='h-full w-full border-0'
          title={game.title}
          sandbox='allow-scripts allow-same-origin allow-forms'
          onKeyDown={(event) => {
            console.log(event.key);
            if (event.key === 'Escape') setIsFullscreen(false);
          }}
          allowFullScreen
        />
      </div>
      <div className='flex items-center justify-between p-2 border-x border-b'>
        <h2 className='font-bold text-xl'>{game.title}</h2>
        <Button
          variant='ghost'
          size='icon'
          className='bg-background/80 hover:bg-background'
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className='h-4 w-4' />
          ) : (
            <Maximize2 className='h-4 w-4' />
          )}
          <span className='sr-only'>
            {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          </span>
        </Button>
      </div>
    </div>
  );
}
