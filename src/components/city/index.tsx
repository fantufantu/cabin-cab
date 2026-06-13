import { stringify } from "@aiszlab/relax/class-name";
import type { City } from "../../api/city.types";
import styles from "./style.module.css";
import { useEvent } from "@aiszlab/relax";
import { CheckCircle } from "musae/icons";
import { Tag } from "musae";

interface Props {
  item: City;
  onClick: (code: string) => void;
  isSelected: boolean;
}

/**
 * 城市卡片
 */
function City({ item, onClick, isSelected }: Props) {
  const click = useEvent(() => {
    onClick(item.code);
  });

  return (
    <div
      key={item.code}
      className={stringify(
        styles.city,
        "bg-cover h-40 rounded-2xl flex flex-col text-color-on-primary",
        "p-3 relative overflow-hidden",
      )}
      style={{
        "--image": `url(${item.image})`,
      }}
      onClick={click}
    >
      <Tag size="small">约3天</Tag>

      <div className="mt-auto font-medium">
        <h5>{item.name}</h5>
      </div>

      {isSelected && (
        <>
          <div className={stringify(styles["city--selected"], "absolute inset-0 z-10")} />
          <CheckCircle
            className="absolute top-3.5 right-3"
            color="var(--color-success)"
            size={20}
          />
        </>
      )}
    </div>
  );
}

export default City;
