import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVerticalIcon } from 'lucide-react';
import UserUpdateDialog from './user-update-dialog';
import { DataType } from '../columns';
import { RoleEnum, UnwrapArray } from '@/lib/types';
import UserBanDialog from './user-ban-dialog';
import UserUnbanDialog from './user-unban-dialog';
import UserDeleteDialog from './user-delete-dialog';

export default function UserActionTable({
  user,
}: {
  user: UnwrapArray<DataType>;
}) {
  return (
    <div className='flex justify-end'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'ghost'}>
            <MoreVerticalIcon size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <UserUpdateDialog
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role as RoleEnum,
            }}
          />
          {user.banned ? (
            <UserUnbanDialog user={user} />
          ) : (
            <UserBanDialog user={user} />
          )}
          <UserDeleteDialog user={user} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
