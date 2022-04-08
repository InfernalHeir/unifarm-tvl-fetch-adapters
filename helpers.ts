import axios from 'axios';
import { isEmpty, result, sum, uniq } from 'lodash';
import { GRAPH_ENDPOINT, assetPlatforms, missingTokens, staticPrices } from './constants';
import { COHORTS_QUERY } from './query';

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

export const getCohortTokens = async (chainId: number): Promise<Token[] | undefined> => {
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
          'Content-Type': 'application/json',
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

export const getAllCohortTokens = async (): Promise<CohortResponse | undefined> => {
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

type MissingTokenPriceResponse = {
  [ticker: string]: {
    usd: string;
  };
};

export const getMissingTokenPrices = async (): Promise<MissingTokenPriceResponse> => {
  let tickers = Object.keys(missingTokens).map((key) => missingTokens[key]);
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tickers}&vs_currencies=usd`;
  const result = await axios(url);
  return result.data as MissingTokenPriceResponse;
};

type TokenPriceResponse = {
  [token: string]: {
    usd: string;
  };
};

export const getTokenPrice = async (
  chain: number,
  tokens: Token[] | undefined
): Promise<TokenPriceResponse | undefined> => {
  if (tokens !== undefined) {
    let tokenAddresses = tokens.map((tokenItems) => tokenItems.token.tokenId);
    let uniqueAddresses = uniq(tokenAddresses);
    const urls = `https://api.coingecko.com/api/v3/simple/token_price/${assetPlatforms[chain]}?contract_addresses=${uniqueAddresses}&vs_currencies=usd`;
    const data = await axios(urls);
    return data.data as TokenPriceResponse;
  }
};

export const calculateTvl = (
  tokenBalances: { [token: string]: number },
  tokenPrices: TokenPriceResponse,
  missingTokenPrices: MissingTokenPriceResponse
): number => {
  let tvls = [];
  for (const token in tokenBalances) {
    let balance = tokenBalances[token] >= 0 ? tokenBalances[token] : 0;
    // find price
    let { usd } = tokenPrices[token] || {};
    if (usd === undefined) {
      let ticker = missingTokens[token];
      usd =
        missingTokenPrices[ticker]?.usd === undefined
          ? staticPrices[token]
          : missingTokenPrices[ticker]?.usd;
    }
    tvls.push(Number(balance) * Number(usd));
  }
  return sum(tvls);
};
