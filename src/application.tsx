import { type ApplicationProps } from "@aiszlab/bee";
import Layout from "./layout";

const Application = ({ children }: ApplicationProps) => {
  return <Layout>{children}</Layout>;
};

export default Application;
