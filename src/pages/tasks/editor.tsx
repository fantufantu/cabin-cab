import { Drawer, Form, Input } from "musae";
import { forwardRef, useCallback, useContext, useImperativeHandle, useState } from "react";
import TaskContext from "../../contexts/task";

export interface EditorRef {
  open: () => void;
}

const { Item } = Form;

const Editor = forwardRef<EditorRef, {}>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const { taskStore } = useContext(TaskContext);

  useImperativeHandle(ref, () => {
    return {
      open: () => {
        setIsOpen(true);
      },
    };
  });

  const cancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const submit = useCallback(() => {
    taskStore?.add("1", { name: "1" });
  }, []);

  return (
    <Drawer open={isOpen} onClose={cancel} onConfirm={submit}>
      <Form>
        <Item label="任务名称">
          <Input />
        </Item>
      </Form>
    </Drawer>
  );
});

export default Editor;
