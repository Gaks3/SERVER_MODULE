'use client';

import { z } from 'zod';
import { createGameSchema } from './game-create-dialog';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { ImageIcon, SquarePenIcon, XIcon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import Image from 'next/image';

const updateGameSchema = createGameSchema.partial();

type UpdateGameSchema = z.infer<typeof updateGameSchema>;

export default function GameUpdateDialog({
  game,
}: {
  game: {
    id: string;
    slug: string;
    title: string;
    description: string;
    image: string | null;
  };
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    game.image ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${game.image}` : null
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const form = useForm<UpdateGameSchema>({
    resolver: zodResolver(updateGameSchema),
    defaultValues: {
      title: game.title,
      description: game.description,
    },
  });

  const onSubmit = async (values: UpdateGameSchema) => {
    try {
      const res = await apiClient.api.games[':slug'].$put(
        {
          param: {
            slug: game.slug,
          },
          form: {
            title: values.title,
            description: values.description,
            image: values.image,
          },
        },
        {
          init: {
            credentials: 'include',
          },
        }
      );

      if (res.ok) toast.success('Success to update game');
      else if (!res.ok) toast.error('Failed to update game');

      form.reset();
      setImagePreview(null);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    form.setValue('image', file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    form.resetField('image');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='p-5' variant={'outline'}>
          <SquarePenIcon />
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] max-h-[calc(100vh-100px)] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Update Game</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='image'
              render={() => (
                <FormItem>
                  <FormLabel>Game Image (1 x 1)</FormLabel>
                  <>
                    {!imagePreview ? (
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors ${
                          isDragging ? 'border-primary bg-primary/10' : ''
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <ImageIcon className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
                        <p className='text-sm font-medium mb-1'>
                          Click to upload or drag and drop
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          PNG, JPG or GIF (max 5MB)
                        </p>
                        <FormControl>
                          <Input
                            ref={fileInputRef}
                            type='file'
                            accept='image/*'
                            onChange={handleFileChange}
                            className='hidden'
                          />
                        </FormControl>
                      </div>
                    ) : (
                      <div className='relative'>
                        <div className='aspect-square w-full overflow-hidden rounded-lg'>
                          <Image
                            src={imagePreview}
                            alt='Game cover preview'
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <Button
                          type='button'
                          variant='destructive'
                          size='icon'
                          className='absolute top-2 right-2 h-8 w-8 rounded-full'
                          onClick={handleRemoveImage}
                        >
                          <XIcon className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'outline'}>Cancel</Button>
          </DialogClose>
          <Button
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
