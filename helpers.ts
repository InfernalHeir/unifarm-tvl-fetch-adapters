import axios from "axios";
import { GRAPH_ENDPOINT, tokenlistUrls } from "./constants";
import { COHORTS_QUERY } from "./query";

interface Cohort {
  cohortAddress: string;
  proxies: string[];
}

export interface TokenMetaData {
  name: string;
  symbol: string;
  address: string;
  icon: string;
  decimals: number;
  price: number;
  chainId: number;
  tags: string[] | [];
}

export const getCohortAndProxies = async (
  chainId: number
): Promise<Cohort[]> => {
  const results = await axios.post(
    GRAPH_ENDPOINT,
    JSON.stringify({
      query: COHORTS_QUERY,
      variables: {
        where: {
          chainId,
        },
      },
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return results.data.data.allCohortsAndProxies as Cohort[];
};

export const getCohortTokens = async (
  chainId: number
): Promise<TokenMetaData[]> => {
  const results = await axios.get(tokenlistUrls[chainId]);
  return results.data.tokenlist as TokenMetaData[];
};
