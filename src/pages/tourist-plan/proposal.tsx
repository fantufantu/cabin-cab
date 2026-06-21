import { RichTextEditor, Skeleton } from "musae";
import { useTouristPlanContext } from "../../contexts/tourist-plan.context";

function TouristPlanProposal() {
  const { touristPlan } = useTouristPlanContext();

  if (!touristPlan?.proposal) {
    return (
      <div className="flex flex-col gap-4 px-5">
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-5/6 rounded" />
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-2/3 rounded" />
        <Skeleton className="h-20 w-full rounded mt-4" />
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-4/5 rounded" />
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-3/5 rounded" />
        <Skeleton className="h-20 w-full rounded mt-4" />
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-5/6 rounded" />
        <Skeleton className="h-5 w-2/4 rounded" />
      </div>
    );
  }

  return <RichTextEditor value={touristPlan.proposal} use="markdown" disabled />;
}

export default TouristPlanProposal;
