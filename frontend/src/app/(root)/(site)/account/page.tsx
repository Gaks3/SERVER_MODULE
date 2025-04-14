import AccountDeleteDialog from '@/components/account-delete-dialog';
import AccountPasswordUpdateForm from '@/components/account-password-update-form';
import AccountProfileUpdateForm from '@/components/account-profile-update-form';
import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';

export default async function AccountPage() {
  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  const user = data!.user;

  return (
    <div className='container mx-auto p-5 space-y-5 max-w-[59rem]'>
      <h1 className='text-2xl font-semibold'>Your Profile</h1>
      <AccountProfileUpdateForm name={user.name} />
      <AccountPasswordUpdateForm />
      <AccountDeleteDialog user={user} />
    </div>
  );
}
