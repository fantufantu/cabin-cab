import { Checkbox, Image } from "musae";
import type { Attraction } from "../../../api/attraction.types";
import { ChangeEvent } from "react";
import { useEvent } from "@aiszlab/relax";

interface Props {
  attraction: Attraction;
  checked?: boolean;
  onSelect?: (code: string) => void;
  onDeselect?: (code: string) => void;
}

const TouristAttractionCard = ({ attraction, onDeselect, onSelect, checked = false }: Props) => {
  const toggle = useEvent((event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelect?.(attraction.code);
    } else {
      onDeselect?.(attraction.code);
    }
  });

  return (
    <div className="rounded-lg shadow p-2 flex items-center gap-3">
      <Image
        src={attraction.image}
        alt={attraction.name}
        width={80}
        height={80}
        previewable={false}
      />
      <span className="text-sm flex-1 truncate">{attraction.name}</span>
      <Checkbox checked={checked} onChange={toggle} />
    </div>
  );
};

export default TouristAttractionCard;
