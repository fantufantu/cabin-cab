import { Collapse, Skeleton } from "musae";
import { Itinerary } from "../../../api/tourist-plan.types";
import { useMemo } from "react";

const DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const TENS = ["", "十", "二十", "三十", "四十", "五十", "六十", "七十", "八十", "九十"];

function toChineseNumber(n: number): string {
  if (n <= 0) return String(n);
  if (n < 10) return DIGITS[n];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return TENS[ten] + DIGITS[unit];
  }
  return String(n);
}

interface Props {
  itineraries?: Itinerary[];
  isLoading?: boolean;
}

function Itineraries({ itineraries, isLoading }: Props) {
  const items = useMemo(() => {
    return Array.from(
      (itineraries ?? [])
        .reduce((groups, item) => {
          const list = groups.get(item.dayFrom) ?? [];
          list.push(item);
          return groups.set(item.dayFrom, list);
        }, new Map<number, Itinerary[]>())
        .entries(),
    ).map(([day, itinerary]) => ({
      key: day,
      label: `第${toChineseNumber(day)}天`,
      children: (
        <div className="flex flex-col gap-3">
          {itinerary.map((item) => (
            <div key={item.id} className="p-4 rounded flex flex-col gap-2 shadow-lg">
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
