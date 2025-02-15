import Logo from "./logo";
import { AddAlert } from "musae/icons";
import { Space, IconButton } from "musae";

const Navigations = () => {
  return (
    <aside className="p-8">
      <Logo />

      <Space gutter={48} orientation="vertical" className="mt-20">
        <IconButton>
          <AddAlert size={28} />
        </IconButton>

        <IconButton variant="text">
          <AddAlert size={28} />
        </IconButton>

        <IconButton variant="text">
          <AddAlert size={28} />
        </IconButton>

        <IconButton variant="text">
          <AddAlert size={28} />
        </IconButton>
      </Space>
    </aside>
  );
};

export default Navigations;
