import { Checkbox, Tag } from "musae";
import type { Poi } from "../../../api/amap.types";
import { ChangeEvent, useMemo } from "react";
import { toArray, unique, useEvent } from "@aiszlab/relax";

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

  const tags = useMemo(() => unique(poi.type.split(";")), [poi.type]);

  return (
    <div className="rounded-lg shadow p-2 flex flex-col">
      <div className="flex items-center">
        <span className="text-sm">{poi.name}</span>
        <Checkbox className="ml-auto" checked={checked} onChange={toggle} />
      </div>

      <p className="text-color-secondary text-xs">{poi.address}</p>

      <div className="flex gap-2 mt-2">
        {tags.map((tag) => (
          <Tag key={tag} size="small">
            {tag}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default TouristAttractionCard;
