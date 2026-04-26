import { useLazyQuery, useQuery } from "@apollo/client/react";
import { listenTouristPlanProposal, TOURIST_PLAN } from "../../api/tourist-plan.api";
import { useParams } from "@aiszlab/bee/router";
import { RichTextEditor } from "musae";
import { useMounted } from "@aiszlab/relax";
import { useState } from "react";
import { TouristPlan as TouristPlanType } from "../../api/tourist-plan.types";

function TouristPlan() {
  const { id = "" } = useParams();
  const [queryTouristPlan] = useLazyQuery(TOURIST_PLAN);
  const [touristPlan, setTouristPlan] = useState<TouristPlanType>();

  useMounted(async () => {
    if (!id) return;
    const _touristPlan = (await queryTouristPlan({ variables: { id } }).catch(() => null))?.data
      ?.touristPlan;

    setTouristPlan(_touristPlan);
    if (!_touristPlan) return;
    if (_touristPlan.proposal) return;

    listenTouristPlanProposal({
      onProposal: (proposal) => {
        setTouristPlan((prev) => {
          return {
            ...prev,
            ..._touristPlan,
            proposal: (prev?.proposal ?? "") + proposal,
          };
        });
      },
    });
  });

  console.log("touristPlan?.proposal======", touristPlan?.proposal);

  return (
    <div>
      <RichTextEditor value={touristPlan?.proposal} use="markdown" disabled />
      <div>{touristPlan?.proposal}</div>
    </div>
  );
}

export default TouristPlan;
