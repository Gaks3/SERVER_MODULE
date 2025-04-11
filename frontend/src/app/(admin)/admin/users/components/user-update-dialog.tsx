'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { passwordSchema } from '@/lib/schema/password-schema';
import { RoleEnum } from '@/lib/types';
import { PasswordInput } from '@/components/password-input';
import { UserRoundPenIcon } from 'lucide-react';

const updateUserSchema = z.object({
  name: z.string().trim().min(1, 'The name field is required'),
  email: z.string().email(),
  role: z.enum([RoleEnum.ADMIN, RoleEnum.DEVELOPER, RoleEnum.USER]),
  password: z.union([z.string(), z.undefined(), passwordSchema]),
});

type UpdateUserSchema = z.infer<typeof updateUserSchema>;

export default function UserUpdateDialog({
  user: { id, name, email, role },
}: {
  user: UpdateUserSchema & { id: string };
}) {
  const router = useRouter();

  const roles = Object.values(RoleEnum);

  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name,
      email,
      role,
      password: undefined,
    },
  });

  const onSubmit = async ({
    email,
    name,
    password,
    role,
  }: UpdateUserSchema) => {
    try {
      const res = await apiClient.api.users[':id'].$patch(
        {
          param: {
            id,
          },
          form: {
            email,
            name,
            role,
            ...(password && { password }),
          },
        },
        {
          init: {
            credentials: 'include',
          },
        }
      );

      const json = await res.json();

      if (res.ok) toast.success('Successfully to update user');
      else if ('message' in json) toast.error(json.message);

      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <UserRoundPenIcon className='mr-1' />
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] max-h-[calc(100vh-100px)]'>
        <DialogHeader>
          <DialogTitle>Update user</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='name'
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
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue
                          className='w-full capitalize'
                          placeholder='Select an role'
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((value, index) => (
                        <SelectItem
                          key={index}
                          value={value}
                          className='capitalize'
                        >
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password{' '}
                    <span className='text-xs text-muted-foreground'>
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder='Your strong password'
                    />
                  </FormControl>
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
