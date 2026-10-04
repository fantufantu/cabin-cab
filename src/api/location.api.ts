import { gql, TypedDocumentNode } from "@apollo/client";
import { client } from "./index";

export interface ReverseGeocodeInput {
  latitude: number;
  longitude: number;
}

export interface ReverseGeocodeResult {
  districtCode: string;
  districtName: string;
}

/**
 * 根据当前位置坐标查询城市。
 */
const REVERSE_GEOCODE: TypedDocumentNode<
  { reverseGeocode: ReverseGeocodeResult },
  { input: ReverseGeocodeInput }
> = gql`
  query ReverseGeocode($input: ReverseGeocodeInput!) {
    reverseGeocode(input: $input) {
      districtCode
      districtName
    }
  }
`;

export async function reverseGeocode(
  input: ReverseGeocodeInput,
): Promise<ReverseGeocodeResult | undefined> {
  const { data } = await client.query({
    query: REVERSE_GEOCODE,
    variables: { input },
    fetchPolicy: "no-cache",
    context: { suppressErrorNotification: true },
  });

  return data?.reverseGeocode;
}
