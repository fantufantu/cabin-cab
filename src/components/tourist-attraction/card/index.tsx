import { Checkbox } from "musae";
import type { Poi } from "../../../api/amap.types";
import { ChangeEvent } from "react";
import { useEvent } from "@aiszlab/relax";

interface Props {
  poi: Poi;
  checked?: boolean;
  onSelect?: (poiId: string) => void;
  onDeselect?: (poiId: string) => void;
}

const TouristAttractionCard = ({ poi, onDeselect, onSelect, checked = false }: Props) => {
  const toggle = useEvent((event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      onSelect?.(poi.id);
    } else {
      onDeselect?.(poi.id);
    }
  });

  return (
    <div className="rounded shadow p-2">
      <div className="flex items-center">
        <span>{poi.name}</span>
        <Checkbox checked={checked} onChange={toggle} />
      </div>
    </div>
  );
};

export default TouristAttractionCard;
