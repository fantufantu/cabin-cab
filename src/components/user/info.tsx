import { Avatar, Progress, Skeleton, Tag } from "musae";
import { IconAccountCircle } from "musae/icons";
import type { User } from "../../typings/user";
import { useMemo } from "react";

interface Props {
  user: User | null;
}

const UserInfo = ({ user }: Props) => {
  const quotaPercent = useMemo(() => {
    if (!user) return 0;
    if (!user.membership) return 0;

    return user
      ? Math.min(Math.round(((user.usedQuota ?? 0) / user.membership.quota) * 100), 100)
      : 0;
  }, [user]);

  if (!user) {
    return <Skeleton className="h-14 rounded" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {user.avatar ? (
          <Avatar size="large" src={user.avatar} alt={user.nickname} />
        ) : (
          <IconAccountCircle size={56} className="text-color-secondary" />
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

export default UserInfo;
