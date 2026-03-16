import { useEffect, useState } from "react";
import { getDiskInfo, type DiskInfo } from "../../api/disk";

const Home = () => {
  const [, setDiskInfo] = useState<DiskInfo>({ total: 0, used: 0 });

  useEffect(() => {
    getDiskInfo()
      .then(setDiskInfo)
      .catch(() => null);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1706067167279-755e2a63269b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080)",
        }}
      ></div>
    </div>
  );
};

export default Home;
