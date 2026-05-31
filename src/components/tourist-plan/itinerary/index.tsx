import { Skeleton } from "musae";
import { Itinerary as ItineraryType } from "../../../api/tourist-plan.types";

interface Props {
  itinerary?: ItineraryType;
  isLoading?: boolean;
}

function Itinerary({ itinerary, isLoading }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {isLoading && (
        <>
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </>
      )}

      {!isLoading &&
        itinerary?.items.map((item, index) => (
          <div key={index} className="p-4 rounded flex flex-col gap-2 shadow-lg">
            <div className="text-lg font-semibold">{item.itineraryName}</div>
            <div className="text-sm">{item.itineraryDescription}</div>
            <div className="text-sm">小贴士：{item.itineraryTip}</div>
            <div className="text-sm">
              开始时间：{new Date(item.itineraryStartAt).toLocaleString()}
            </div>
            <div className="text-sm">持续时间：{item.itineraryDuration / 1000 / 60 / 60}小时</div>
          </div>
        ))}
    </div>
  );
}

export default Itinerary;
