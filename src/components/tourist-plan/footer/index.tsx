import { stringify } from "@aiszlab/relax/class-name";
import { Divider } from "musae";
import type { ReactNode, Ref } from "react";

interface Props {
  className?: string;
  children?: ReactNode;
  gap?: number;
  contentRef?: Ref<HTMLDivElement>;
}

const TouristPlanFooter = ({ className, children, gap = 2, contentRef }: Props) => {
  return (
    <div className="sticky bottom-0 z-50 mt-auto">
      <Divider />

      <div
        ref={contentRef}
        className={stringify(
          className,
          "px-6 py-4 bg-color-on-primary",
          "flex items-center",
          `gap-${gap}`,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default TouristPlanFooter;
