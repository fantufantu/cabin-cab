import { gql, TypedDocumentNode } from "@apollo/client";
import type { District, FilterDistrictsInput } from "./district.types";
import type { Paginated } from "./pagination.types";
import { client } from "./index";

/**
 * 查询地区列表
 */
const DISTRICTS: TypedDocumentNode<
  {
    districts: Paginated<District>;
  },
  {
    pagination: { page: number; limit: number };
    filter?: FilterDistrictsInput;
  }
> = gql`
  query Districts($pagination: Pagination!, $filter: FilterDistrictsInput) {
    districts(pagination: $pagination, filter: $filter) {
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
 * 查询地区（分页，一页查询全部）
 */
async function queryDistricts(filter?: FilterDistrictsInput): Promise<District[]> {
  const { data } = await client.query({
    query: DISTRICTS,
    variables: {
      pagination: { page: 1, limit: 999 },
      ...(!!filter && { filter }),
    },
  });

  return data?.districts?.items ?? [];
}

export { queryDistricts };
