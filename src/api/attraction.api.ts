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
    filter?: { cityCode?: string; keyword?: string };
  }
> = gql`
  query Attractions($pagination: Pagination!, $filter: FilterAttractionsInput) {
    attractions(pagination: $pagination, filter: $filter) {
      items {
        code
        name
        cityCode
        image
      }
      total
    }
  }
`;

/**
 * 查询景点（分页，一页查询全部）
 */
async function queryAttractions(cityCode: string): Promise<Attraction[]> {
  const { data } = await client.query({
    query: ATTRACTIONS,
    variables: {
      pagination: { page: 1, limit: 999 },
      filter: { cityCode },
    },
  });

  return data?.attractions?.items ?? [];
}

export { queryAttractions };
