import axios from "axios";
import { isEmpty, result } from "lodash";
import { GRAPH_ENDPOINT, CHAIN_ID, missingEthereumTokens, missingBSCTokens, missingAvalancheTokens } from "./constants";
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

export const getEthRemainingTokenPrice = async () => {
  let tokens: string[] = [];
  let tokens1: string[] = [];
  let tokens2: string[] = [];
  for (const token in missingEthereumTokens) {
    tokens.push(missingEthereumTokens[token]);
  }

  for (const token in missingBSCTokens) {
    tokens1.push(missingBSCTokens[token]);
  }

  for (const token in missingAvalancheTokens) {
    tokens2.push(missingAvalancheTokens[token]);
  }

  const urls = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokens}&vs_currencies=usd`;
  const data = await axios(urls);
  
  const urls1 = `https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${tokens1}&vs_currencies=usd`;
  const data1 = await axios(urls1);

  const urls2 = `https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=${tokens2}&vs_currencies=usd`;
  const data2 = await axios(urls2);

  return {
    ...data.data,
    ...data1.data,
    ...data2.data
  }
}

export const getTokenPrice = async (chain, tokens) => {
  const urls = `https://api.coingecko.com/api/v3/simple/token_price/${CHAIN_ID[chain]}?contract_addresses=${tokens}&vs_currencies=usd`;
  const data = await axios(urls);
  return data.data;
}

const findToken = (token: string): string => {
  if (missingEthereumTokens[token] != null) {
    return missingEthereumTokens[token];
  }
  if (missingBSCTokens[token] != null) {
    return missingEthereumTokens[token];
  }
  if (missingAvalancheTokens[token] != null) {
    return missingAvalancheTokens[token];
  }
  return '';
}

export const calculateTvl = (tokenBalance, tokenPrice, remainingTokenPrice): number => {
  let tvl = 0;
  for (const bal in tokenBalance) {
    let balance = tokenBalance[bal] >= 0 ? tokenBalance[bal] : 0;
    let price = tokenPrice[bal]?.usd === undefined ? ( remainingTokenPrice[findToken(bal)]?.usd >= 0 ? remainingTokenPrice[findToken(bal)]?.usd: 0 ) : tokenPrice[bal]?.usd;
    tvl = tvl + ( Number(balance) * Number(price) );
  }
  return tvl;
}