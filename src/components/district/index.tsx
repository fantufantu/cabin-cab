import { stringify } from "@aiszlab/relax/class-name";
import type { District as DistrictType } from "../../api/district.types";
import styles from "./style.module.css";
import { useEvent } from "@aiszlab/relax";
import { useState } from "react";
import { IconCheckCircle } from "musae/icons";

interface Props {
  item: DistrictType;
  onClick: (code: string) => void;
  isSelected: boolean;
}

/**
 * 地区卡片
 */
function District({ item, onClick, isSelected }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const click = useEvent(() => {
    onClick(item.code);
  });

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${isSelected ? "取消选择" : "选择"}${item.name}`}
      className={stringify(
        styles.district,
        !item.image || imageFailed ? styles["district--placeholder"] : "",
        "bg-cover h-40 rounded-2xl flex flex-col text-left text-color-on-primary",
        "p-3 relative overflow-hidden cursor-pointer",
      )}
      style={{
        "--image": item.image && !imageFailed ? `url(${JSON.stringify(item.image)})` : "none",
      }}
      onError={() => setImageFailed(true)}
      onClick={click}
    >
      {(!item.image || imageFailed) && (
        <span className={styles["district__initial"]} aria-hidden="true">
          {item.name.slice(0, 1)}
        </span>
      )}
      <div className="mt-auto relative z-20">
        <h3 className="font-semibold">{item.name}</h3>
        <span className="text-xs opacity-90">{isSelected ? "已选择" : "点击选择"}</span>
      </div>

      {isSelected && (
        <>
          <div className={stringify(styles["district--selected"], "absolute inset-0 z-10")} />
          <IconCheckCircle
            className="absolute top-3.5 right-3 z-20"
            color="var(--color-success)"
            size={20}
          />
        </>
      )}
    </button>
  );
}

export default District;
