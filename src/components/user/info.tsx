import { Suspense, use } from "react";
import { Avatar, Progress, Skeleton, Tag } from "musae";
import { AccountCircle } from "musae/icons";
import type { User } from "../../typings/user";

interface Props {
  user: Promise<User>;
}

const _UserInfo = ({ user: _user }: Props) => {
  const user = use(_user);

  console.log("user======", user);

  const quotaPercent = user.membership
    ? Math.min(Math.round(((user.usedQuota ?? 0) / user.membership.quota) * 100), 100)
    : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {user.avatar ? (
          <Avatar size="large" src={user.avatar} alt={user.nickname} />
        ) : (
          <AccountCircle size={56} className="text-color-secondary" />
        )}
        <h2 className="text-lg font-medium text-color-on-surface">{user.nickname}</h2>
      </div>

      {user.membership && (
        <div className="flex flex-col gap-2 px-4 py-3 rounded-xl border border-color-outline">
          <div className="flex items-center justify-between">
            <Tag>{user.membership.name}</Tag>
            <span className="text-sm text-color-secondary">
              已用 {user.usedQuota} / 总额 {user.membership.quota}
            </span>
          </div>
          <Progress value={quotaPercent} />
        </div>
      )}
    </div>
  );
};

const UserInfo = ({ user }: Props) => (
  <Suspense fallback={<Skeleton className="h-14 rounded" />}>
    <_UserInfo user={user} />
  </Suspense>
);

export default UserInfo;
