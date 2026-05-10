import { gql, TypedDocumentNode } from "@apollo/client";

/**
 * 用户注册
 */
export const REGISTER: TypedDocumentNode<
  {
    register: string;
  },
  {
    input: {
      username: string;
    };
  }
> = gql`
  mutation Register($username: String!, $password: String!, $nickname: String!) {
    register(username: $username, password: $password, nickname: $nickname) {
      username
      nickname
    }
  }
`;
