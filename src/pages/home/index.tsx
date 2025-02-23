import { Input, Button } from "musae";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

const Home = () => {
  useEffect(() => {
    invoke("my_custom_command");
  }, []);

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
    </div>
  );
};

export default Home;
