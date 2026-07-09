import { Avatar, IconButton } from "musae";
import { AccountCircle } from "musae/icons";
import { useAuthStore } from "../../stores/auth.store";
import type { CSSProperties } from "react";

interface UserAvatarProps {
  className?: string;
  style?: CSSProperties;
}

const UserAvatar = ({ className, style }: UserAvatarProps) => {
  const { me } = useAuthStore();

  if (!me) {
    return (
      <IconButton className={className} style={style} size="small">
        <AccountCircle />
      </IconButton>
    );
  }

  return (
    <Avatar className={className} style={style} src={me.avatar} alt={me.nickname || me.username} />
  );
};

export default UserAvatar;
