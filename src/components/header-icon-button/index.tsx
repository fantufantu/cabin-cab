import { IconButton } from "musae";
import type { ComponentProps } from "react";
import { stringify } from "@aiszlab/relax/class-name";
import styles from "./style.module.css";

type Props = Omit<ComponentProps<typeof IconButton>, "color" | "variant" | "size"> & {
  tone?: "primary" | "surface";
};

const HeaderIconButton = ({ tone = "surface", className, ...props }: Props) => (
  <IconButton
    {...props}
    size="small"
    variant="text"
    className={stringify(styles.button, styles[tone], className)}
  />
);

export default HeaderIconButton;
