import axios from "axios";
import { isEmpty } from "lodash";
import { GRAPH_ENDPOINT } from "./constants";
import { COHORTS_QUERY } from "./query";

export interface Token {
  /** token details */
  token: {
    /** token decimal */
    decimals: number;
    /** token address */
    tokenId: string;
  };
  /** cohort details */
  cohort: {
    /** cohort address */
    cohortAddress: string;
    /** proxies in that cohort */
    proxies: string[];
  };
}

let log = console.log;

export const getCohortTokens = async (
  chainId: number
): Promise<Token[] | undefined> => {
  try {
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
    let response = results.data;
    return response.data.allPools.pools as Token[];
  } catch (err) {
    if (err instanceof Error) {
      log(`CohortError: ${err.message}`);
    }
  }
};

export interface CohortResponse {
  /** ethereum */
  ETH: Token[] | undefined;
  /** bsc */
  BSC: Token[] | undefined;
  /** polygon */
  POLYGON: Token[] | undefined;
  /** avax */
  AVAX: Token[] | undefined;
}

export const roundValue = (value: number, roundTo: number) => {
  return Math.floor(value * 10 ** roundTo) / 10 ** roundTo;
};

export const getAllCohortTokens = async (): Promise<
  CohortResponse | undefined
> => {
  try {
    let tokens = await Promise.all([
      getCohortTokens(1),
      getCohortTokens(56),
      getCohortTokens(137),
      getCohortTokens(43114),
    ]);
    if (isEmpty(tokens)) {
      return undefined;
    }
    let [ETH, BSC, POLYGON, AVAX] = tokens;
    return {
      ETH,
      BSC,
      POLYGON,
      AVAX,
    };
  } catch (err) {
    return Promise.reject(err);
  }
};
