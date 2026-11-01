import { gql, TypedDocumentNode } from "@apollo/client";
import { client } from "./index";

export interface AmapCredential {
  apiKey: string;
  apiSecret: string;
}

const AMAP_CREDENTIAL: TypedDocumentNode<{ amapCredential: AmapCredential | null }> = gql`
  query AmapCredential {
    amapCredential {
      apiKey
      apiSecret
    }
  }
`;

export async function getAmapCredential(): Promise<AmapCredential> {
  const { data } = await client.query({
    query: AMAP_CREDENTIAL,
    fetchPolicy: "no-cache",
    context: { suppressErrorNotification: true },
  });
  if (!data?.amapCredential?.apiKey?.trim() || !data.amapCredential.apiSecret?.trim()) {
    throw new Error("地图凭证暂不可用");
  }
  return data.amapCredential;
}
