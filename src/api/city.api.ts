import { gql, TypedDocumentNode } from "@apollo/client";
import type { City } from "./city.types";
import type { Paginated } from "./pagination.types";
import { client } from "./index";

/**
 * 查询城市列表
 */
const CITIES: TypedDocumentNode<
  {
    cities: Paginated<City>;
  },
  {
    pagination: { page: number; limit: number };
    filter?: { keyword?: string };
  }
> = gql`
  query Cities($pagination: Pagination!, $filter: FilterCitiesInput) {
    cities(pagination: $pagination, filter: $filter) {
      items {
        code
        name
        image
      }
      total
    }
  }
`;

/**
 * 查询城市（分页，一页查询全部）
 */
async function queryCities(): Promise<City[]> {
  const { data } = await client.query({
    query: CITIES,
    variables: {
      pagination: { page: 1, limit: 999 },
    },
  });

  return data?.cities?.items ?? [];
}

export { queryCities };
