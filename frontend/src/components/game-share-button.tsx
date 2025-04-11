'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Button } from './ui/button';
import {
  CheckIcon,
  CopyIcon,
  FacebookIcon,
  LinkedinIcon,
  MailIcon,
  Share2Icon,
  TwitterIcon,
} from 'lucide-react';
import { type Game } from './game-container';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function GameShareButton({ game }: { game: Game }) {
  const [copied, setCopied] = useState(false);

  const gameShareUrl = `http://localhost:3000/games/${game.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameShareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareToSocial = (platform: string) => {
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(gameShareUrl);
    const encodedTitle = encodeURIComponent(`Play ${game.name} on PlayX!`);
    const encodedDescription = encodeURIComponent(
      game.description.substring(0, 100) + '...'
    );

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className='flex items-center gap-2 mt-2 mb-1'>
      <div className='flex-1'>
        <div className='flex'>
          <Input
            value={gameShareUrl}
            readOnly
            className='rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-muted'
          />
          <TooltipProvider>
            <Tooltip open={copied}>
              <TooltipTrigger asChild>
                <Button
                  onClick={copyToClipboard}
                  variant='secondary'
                  className='rounded-l-none'
                >
                  {copied ? (
                    <CheckIcon className='h-4 w-4' />
                  ) : (
                    <CopyIcon className='h-4 w-4' />
                  )}
                  <span className='sr-only'>Copy link</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copied!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='icon'>
            <Share2Icon className='h-4 w-4' />
            <span className='sr-only'>Share</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuItem
            onClick={() => shareToSocial('facebook')}
            className='cursor-pointer'
          >
            <FacebookIcon className='h-4 w-4 mr-2 text-blue-600' />
            <span>Facebook</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => shareToSocial('twitter')}
            className='cursor-pointer'
          >
            <TwitterIcon className='h-4 w-4 mr-2 text-sky-500' />
            <span>Twitter</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => shareToSocial('linkedin')}
            className='cursor-pointer'
          >
            <LinkedinIcon className='h-4 w-4 mr-2 text-blue-700' />
            <span>LinkedIn</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => shareToSocial('whatsapp')}
            className='cursor-pointer'
          >
            <svg
              className='h-4 w-4 mr-2 text-green-500'
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='currentColor'
              stroke='none'
            >
              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
            </svg>
            <span>WhatsApp</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => shareToSocial('email')}
            className='cursor-pointer'
          >
            <MailIcon className='h-4 w-4 mr-2 text-gray-500' />
            <span>Email</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
