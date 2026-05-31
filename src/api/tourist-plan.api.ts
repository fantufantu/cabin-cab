import { gql, TypedDocumentNode } from "@apollo/client";
import { CreateTouristPlanInput, TouristPlan } from "./tourist-plan.types";
import { BASE_URL, STATUS_CODE, StatusCode } from "../constants/api.constant";
import { tryParse } from "@aiszlab/relax";
import { Paginated } from "./pagination.types";

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
        cityCode
      }
      duration
      itinerary {
        items {
          itineraryName
          itineraryDescription
          itineraryTip
          itineraryStartAt
          itineraryDuration
        }
      }
    }
  }
`;

/**
 * 查询出行计划列表
 */
export const TOURIST_PLANS: TypedDocumentNode<
  {
    touristPlans: Paginated<TouristPlan>;
  },
  {
    filter: {
      belongToId: string;
    };
  }
> = gql`
  query TouristPlans($filter: FilterTouristPlansInput!) {
    touristPlans(filter: $filter) {
      items {
        id
        cities {
          code
          name
        }
        depatureAt
        attractions {
          code
          name
          cityCode
        }
        duration
      }
      total
    }
  }
`;

/**
 * 用`SSE`方式获取出行计划方案
 */
export function listenTouristPlanProposal({
  onProposal,
  onSuccess,
  id,
}: {
  onProposal?: (proposal: string) => void;
  onSuccess?: () => void;
  id: string;
}) {
  const proposal$ = new EventSource(BASE_URL + `/cabin-cab/tourist-plan/proposal/${id}`);

  proposal$.addEventListener("message", (event) => {
    const data: {
      statusCode: StatusCode;
      proposal?: string;
    } = tryParse(event.data);

    if (data.statusCode !== STATUS_CODE.CONTINUE) {
      proposal$.close();

      if (data.statusCode === STATUS_CODE.SUCCESS) {
        onSuccess?.();
      }

      return;
    }

    onProposal?.(data.proposal ?? "");
  });
}
