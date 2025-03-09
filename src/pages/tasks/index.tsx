import { Button, Table } from "musae";
import Editor, { EditorRef } from "./editor";
import { useCallback, useContext, useRef } from "react";
import TaskContext from "../../contexts/task";

const Tasks = () => {
  const editorRef = useRef<EditorRef>(null);
  const { taskStore } = useContext(TaskContext);

  const add = useCallback(() => {
    editorRef.current?.open();
  }, []);

  console.log(
    "tasks=====",
    taskStore?.store.length().then((size) => {
      console.log("size======", size);
    }),
  );

  return (
    <div>
      <Button onClick={add}>添加任务</Button>
      <Table />
      <Editor ref={editorRef} />
    </div>
  );
};

export default Tasks;
