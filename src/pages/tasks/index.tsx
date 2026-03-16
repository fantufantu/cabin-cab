import { Button, Table } from "musae";
import Editor, { EditorRef } from "./editor";
import { useCallback, useRef } from "react";

const Tasks = () => {
  const editorRef = useRef<EditorRef>(null);

  const add = useCallback(() => {
    editorRef.current?.open();
  }, []);

  return (
    <div>
      <Button onClick={add}>添加任务</Button>
      <Table />
      <Editor ref={editorRef} />
    </div>
  );
};

export default Tasks;
