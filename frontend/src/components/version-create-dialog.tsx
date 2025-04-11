'use client';

import { apiClient } from '@/lib/api';
import { zipSchema } from '@/lib/schema/zip-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
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
import { FileArchiveIcon, PlusIcon, UploadIcon, XIcon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { formatBytes } from '@/lib/utils';

const createGameVersionSchema = z.object({
  file: zipSchema,
});

type CreateGameVersionSchema = z.infer<typeof createGameVersionSchema>;

export default function VersionCreateDialog({ slug }: { slug: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();

  const form = useForm<CreateGameVersionSchema>({
    resolver: zodResolver(createGameVersionSchema),
  });

  const onSubmit = async (values: CreateGameVersionSchema) => {
    try {
      const res = await apiClient.api.games[':slug'].$post(
        {
          param: {
            slug,
          },
          form: {
            file: values.file,
          },
        },
        {
          init: {
            credentials: 'include',
          },
        }
      );

      const json = await res.json();

      if (res.status === 201) {
        closeRef.current?.click();
        toast.success('Successfully to create new version');
        router.refresh();
        form.reset();
      } else if ('message' in json) toast.error(json.message);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveFile = () => {
    form.resetField('file');
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
      form.setValue('file', e.dataTransfer.files[0], {
        shouldValidate: true,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Create New Version
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='file'
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Game File (ZIP)</FormLabel>
                  <>
                    {!value ? (
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors ${
                          isDragging ? 'border-primary bg-primary/10' : ''
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <UploadIcon className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
                        <p className='text-sm font-medium mb-1'>
                          Click to upload or drag and drop
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          \ ZIP files only (max 100MB)
                        </p>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type='file'
                            accept='.zip,application/zip,application/x-zip-compressed'
                            onChange={(e) => {
                              onChange(e.target.files?.[0]);
                            }}
                            className='hidden'
                            ref={fileInputRef}
                          />
                        </FormControl>
                      </div>
                    ) : (
                      <div className='flex items-center gap-3 border rounded-lg p-3'>
                        <FileArchiveIcon className='h-10 w-10 text-muted-foreground p-1 border rounded-md' />
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium truncate'>{value.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {formatBytes(value.size)}
                          </p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={handleRemoveFile}
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
            <Button ref={closeRef} variant={'outline'}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
