import { gql, TypedDocumentNode } from "@apollo/client";
import { CreateTouristPlanInput, TouristPlan } from "./tourist-plan.types";
import { BASE_URL, STATUS_CODE, StatusCode } from "../constants/api.constant";
import { tryParse } from "@aiszlab/relax";

/**
 * 创建出行计划
 */
export const CREATE_TOURIST_PLAN: TypedDocumentNode<
  {
    createTouristPlan: TouristPlan;
  },
  {
    input: CreateTouristPlanInput;
  }
> = gql`
  mutation CreateTouristPlan($input: CreateTouristPlanInput!) {
    createTouristPlan(input: $input) {
      id
    }
  }
`;

/**
 * 查询出行计划详情
 */
export const TOURIST_PLAN: TypedDocumentNode<
  {
    touristPlan: TouristPlan;
  },
  {
    id: string;
  }
> = gql`
  query TouristPlan($id: String!) {
    touristPlan(id: $id) {
      id
      cities {
        code
        name
      }
      depatureAt
      attractions {
        code
        name
        belongTo
      }
      duration
    }
  }
`;

/**
 * 用`SSE`方式获取出行计划方案
 */
export function listenTouristPlanProposal({
  onProposal,
}: {
  onProposal?: (proposal: string) => void;
} = {}) {
  const proposal$ = new EventSource(
    BASE_URL + "/cabin-cab/tourist-plan/proposal/f07eb426-032f-45de-920b-90ea7ac98e50",
  );

  proposal$.addEventListener("message", (event) => {
    const data: {
      statusCode: StatusCode;
      proposal?: string;
    } = tryParse(event.data);

    if (data.statusCode !== STATUS_CODE.CONTINUE) {
      proposal$.close();
      return;
    }

    onProposal?.(data.proposal ?? "");
  });
}
