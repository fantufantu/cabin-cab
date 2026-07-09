import { Suspense, use } from "react";
import { Avatar, Skeleton } from "musae";
import { AccountCircle } from "musae/icons";
import type { User } from "../../typings/user";

interface Props {
  user: Promise<User>;
}

const UserInfo = ({ user }: Props) => (
  <Suspense fallback={<Skeleton className="h-14 rounded" />}>
    <_UserInfo user={user} />
  </Suspense>
);

const _UserInfo = ({ user: _user }: Props) => {
  const user = use(_user);

  return (
    <div className="flex items-center gap-4">
      {user.avatar ? (
        <Avatar size="large" src={user.avatar} alt={user.nickname} />
      ) : (
        <AccountCircle size={56} className="text-color-secondary" />
      )}
      <h2 className="text-lg font-medium text-color-on-surface">{user.nickname}</h2>
    </div>
  );
};

export default UserInfo;
