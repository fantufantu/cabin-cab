import { Input, Button, Progress } from "musae";
import { useEffect, useMemo, useState } from "react";
import { getDiskInfo, type DiskInfo } from "../../api/disk";

const Home = () => {
  const [diskInfo, setDiskInfo] = useState<DiskInfo>({ total: 0, used: 0 });

  useEffect(() => {
    getDiskInfo()
      .then(setDiskInfo)
      .catch(() => null);
  }, []);

  const usedDisk = useMemo(() => {
    if (!diskInfo.total) return 0;
    return Math.round((diskInfo.used / diskInfo.total) * 100);
  }, [diskInfo]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Input variant="standard" />
      </div>

      <div className="px-9 py-8 rounded-[20px] bg-color-on-primary">
        <h1 className="text-3xl">Today Task</h1>
        <p className="mt-2">Check your daily tasks and schedules</p>
        <Button className="mt-4" shape="rectangular">
          Today’s schedule
        </Button>
      </div>

      <div>
        硬盘占用
        <Progress variant="circular" value={usedDisk} />
      </div>
    </div>
  );
};

export default Home;
