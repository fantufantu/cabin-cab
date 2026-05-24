import { Avatar, IconButton } from "musae";
import { AccountCircle } from "musae/icons";
import { useNavigate } from "@aiszlab/bee/router";
import { useAuthStore } from "../../stores/auth.store";
import type { CSSProperties } from "react";

interface UserAvatarProps {
  className?: string;
  style?: CSSProperties;
}

const UserAvatar = ({ className, style }: UserAvatarProps) => {
  const navigate = useNavigate();
  const { me } = useAuthStore();

  const toLogin = () => {
    navigate("/login");
  };

  if (!me) {
    return (
      <IconButton className={className} style={style} onClick={toLogin} size="small">
        <AccountCircle />
      </IconButton>
    );
  }

  return (
    <Avatar className={className} style={style} src={me.avatar} alt={me.nickname || me.username} />
  );
};

export default UserAvatar;
