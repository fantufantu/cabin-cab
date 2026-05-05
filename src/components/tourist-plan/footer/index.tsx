import { stringify } from "@aiszlab/relax/class-name";
import { ReactNode } from "react";

interface Props {
  className?: string;
  children?: ReactNode;
}

const PlanFooter = ({ className, children }: Props) => {
  return (
    <div
      className={stringify(
        className,
        "sticky bottom-0 px-6 py-4 bg-color-on-primary border-t border-color-outline z-50",
      )}
    >
      {children}
    </div>
  );
};

export default PlanFooter;
