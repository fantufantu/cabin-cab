import { gql, TypedDocumentNode } from "@apollo/client";
import { TouristPlanItinerary, UpdateTouristPlanItineraryInput } from "./tourist-plan-itinerary.types";

/**
 * 更新行程明细项
 */
export const UPDATE_TOURIST_PLAN_ITINERARY: TypedDocumentNode<
  {
    updateTouristPlanItinerary: TouristPlanItinerary;
  },
  {
    id: string;
    input: UpdateTouristPlanItineraryInput;
  }
> = gql`
  mutation UpdateTouristPlanItinerary($id: String!, $input: UpdateTouristPlanItineraryInput!) {
    updateTouristPlanItinerary(id: $id, input: $input) {
      id
      dayFrom
      sortOrder
      name
      description
      tip
      duration
    }
  }
`;
