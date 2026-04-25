import { gql, TypedDocumentNode } from "@apollo/client";
import { CreateTouristPlanInput, TouristPlan } from "./tourist-plan.types";

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
`