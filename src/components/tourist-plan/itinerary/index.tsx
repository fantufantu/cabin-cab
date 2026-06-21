import { Collapse, Skeleton } from "musae";
import { TouristPlanItinerary } from "../../../api/tourist-plan-itinerary.types";
import { useMemo } from "react";
import { useNavigate, useParams } from "@aiszlab/bee/router";

interface Props {
  itineraries?: TouristPlanItinerary[];
  isLoading?: boolean;
}

function Itineraries({ itineraries, isLoading }: Props) {
  const navigate = useNavigate();
  const { id } = useParams();

  const items = useMemo(() => {
    return Array.from(
      (itineraries ?? [])
        .reduce((groups, item) => {
          const list = groups.get(item.dayFrom) ?? [];
          list.push(item);
          return groups.set(item.dayFrom, list);
        }, new Map<number, TouristPlanItinerary[]>())
        .entries(),
    ).map(([day, itinerary]) => ({
      key: day,
      label: `第${day}天`,
      children: (
        <div className="flex flex-col gap-3">
          {itinerary.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded flex flex-col gap-2 shadow-lg cursor-pointer"
              onClick={() => navigate(`/tourist-plan/${id}/itinerary/${item.id}/edit`)}
            >
              <div className="text-lg font-semibold">{item.name}</div>
              {!!item.description && <div className="text-sm">{item.description}</div>}
              {!!item.tip && <div className="text-sm">小贴士：{item.tip}</div>}
              <div className="text-sm">建议时长：{item.duration / 1000 / 60 / 60}小时</div>
            </div>
          ))}
        </div>
      ),
    }));
  }, [itineraries]);

  return (
    <div className="flex flex-col gap-6">
      {isLoading && (
        <>
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </>
      )}

      {!isLoading && <Collapse items={items} defaultActiveKey={items.length > 0 ? [items[0].key] : []} />}
    </div>
  );
}

export default Itineraries;
