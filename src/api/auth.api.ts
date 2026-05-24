import { gql, TypedDocumentNode } from "@apollo/client";
import { User } from "../typings/user";
import { client } from ".";

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

/**
 * 用户登录
 */
export const LOGIN: TypedDocumentNode<
  { login: string },
  { input: { username: string; password: string } }
> = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

/**
 * 查询当前用户信息
 */
export const WHO_AM_I: TypedDocumentNode<{ whoAmI: User }> = gql`
  query WhoAmI {
    whoAmI {
      id
      username
      nickname
      avatar
      emailAddress
    }
  }
`;

/**
 * 用户登录
 */
export async function login(input: { username: string; password: string }) {
  const result = await client.mutate({ mutation: LOGIN, variables: { input } });
  return result.data?.login ?? null;
}

/**
 * 查询当前用户信息
 */
export async function whoAmI() {
  return (
    (await client.query({ query: WHO_AM_I, fetchPolicy: "no-cache" }).catch(() => null))?.data
      ?.whoAmI ?? null
  );
}
