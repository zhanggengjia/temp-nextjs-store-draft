import { LuUser } from 'react-icons/lu';
import { currentUser, auth } from '@clerk/nextjs/server';

async function UserIcon() {
  // const {userId} = await auth();

  const user = await currentUser();

  const profileImage = user?.imageUrl;

  if (profileImage) {
    return (
      <img src={profileImage} className="!size-6 rounded-full object-cover" />
    );
  }

  return (
    <div className="size-6 rounded-full bg-primary grid place-items-center text-white shrink-0">
      <LuUser className="size-4" />
    </div>
  );
}

export default UserIcon;
