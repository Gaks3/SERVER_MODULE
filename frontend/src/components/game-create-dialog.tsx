'use client';

import { apiClient } from '@/lib/api';
import { imageSchema } from '@/lib/schema/image-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { ImageIcon, PlusIcon, XIcon } from 'lucide-react';
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
import { useRef, useState } from 'react';
import Image from 'next/image';

export const createGameSchema = z.object({
  title: z.string().trim().min(1, 'The title field is required'),
  description: z.string().trim().min(1, 'The description field is required'),
  image: imageSchema,
});

type CreateGameSchema = z.infer<typeof createGameSchema>;

export default function GameCreateDialog() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const form = useForm<CreateGameSchema>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (values: CreateGameSchema) => {
    try {
      const res = await apiClient.api.games.$post(
        {
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

      const json = await res.json();

      if (res.ok) {
        toast.success('Success to create new game');

        form.reset();
        setImagePreview(null);
        router.refresh();
      } else if (!res.ok) {
        toast.error(
          'message' in json ? json.message : 'Failed to create new game'
        );
      }
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
        <Button className='p-5'>
          <PlusIcon />
          Add New Game
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] max-h-[calc(100vh-100px)] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add New Game</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
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
                            src={
                              imagePreview ||
                              '/placeholder.svg?height=350&width=350'
                            }
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
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
