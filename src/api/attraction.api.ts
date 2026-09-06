import { gql, TypedDocumentNode } from "@apollo/client";
import type { Attraction } from "./attraction.types";
import type { Paginated } from "./pagination.types";
import { client } from "./index";

/**
 * 查询景点列表
 */
const ATTRACTIONS: TypedDocumentNode<
  {
    attractions: Paginated<Attraction>;
  },
  {
    pagination: { page: number; limit: number };
    filter?: { districtCode?: string; keyword?: string };
  }
> = gql`
  query Attractions($pagination: Pagination!, $filter: FilterAttractionsInput) {
    attractions(pagination: $pagination, filter: $filter) {
      items {
        code
        name
        districtCode
        image
      }
      total
    }
  }
`;

/**
 * 查询景点（分页，一页查询全部）
 */
async function queryAttractions(districtCode: string): Promise<Attraction[]> {
  const { data } = await client.query({
    query: ATTRACTIONS,
    variables: {
      pagination: { page: 1, limit: 999 },
      filter: { districtCode },
    },
  });

  return data?.attractions?.items ?? [];
}

export { queryAttractions };
