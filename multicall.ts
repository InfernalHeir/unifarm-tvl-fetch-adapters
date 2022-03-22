import { ICall, IResponse, aggregate, IKeysValues } from "@makerdao/multicall";
import { ethers } from "ethers";
import { isEmpty } from "lodash";
import { roundValue, Token } from "./helpers";
import { multicallAddresses, rpcUrls } from "./rpc";

export const multicall = async (
  chainId: number,
  calls: ICall[]
): Promise<IResponse> => {
  const callResult = await aggregate(calls, {
    rpcUrl: rpcUrls[chainId],
    multicallAddress: multicallAddresses[chainId],
  });
  return callResult as IResponse;
};

export const createMulticall = (
  targetAddress: string,
  account: string
): ICall => {
  return {
    target: targetAddress,
    call: ["balanceOf(address)(uint256)", account],
    returns: [[`${targetAddress.toLowerCase()}-${account.toLowerCase()}`]],
  };
};

export const getTokenBalances = async (
  chainId: number,
  tokens: Token[]
): Promise<{ [tokenId: string]: number } | null> => {
  if (isEmpty(tokens)) return null;
  let calls = [] as ICall[];
  for (var k = 0; k < tokens.length; k++) {
    let { token, cohort } = tokens[k];
    calls.push(createMulticall(token.tokenId, cohort.cohortAddress));
    // when cohort have proxies smart contracts
    if (!isEmpty(cohort.proxies)) {
      for (var e = 0; e < cohort.proxies.length; e++) {
        var proxyAddress = cohort.proxies[e];
        calls.push(createMulticall(token.tokenId, proxyAddress));
      }
    }
  }

  // create call
  const callResult = await multicall(chainId, calls);
  let original = callResult.results.original as IKeysValues;
  let t = 0;

  let tokenBalances = {} as { [tokenId: string]: number };
  while (t < tokens.length) {
    let { token, cohort } = tokens[t];
    let tokenAddress = token.tokenId.toLowerCase();
    let cohortAddress = cohort.cohortAddress.toLowerCase();
    let proxies = cohort.proxies;

    // previous balance
    let previousBalance = !tokenBalances[tokenAddress]
      ? 0
      : tokenBalances[tokenAddress];
    let balance = original[`${tokenAddress}-${cohortAddress}`];
    let parsedBalance = roundValue(
      Number(ethers.utils.formatUnits(balance)),
      2
    );
    tokenBalances[tokenAddress] = previousBalance + parsedBalance;

    if (!isEmpty(proxies)) {
      let previousBalance = !tokenBalances[tokenAddress]
        ? 0
        : tokenBalances[tokenAddress];
      for (var e = 0; e < proxies.length; e++) {
        let proxyBalance =
          original[`${tokenAddress}-${proxies[e].toLowerCase()}`];
        let parsedProxyBalance = roundValue(
          Number(ethers.utils.formatUnits(proxyBalance)),
          2
        );
        tokenBalances[tokenAddress] = previousBalance + parsedProxyBalance;
      }
    }

    t++;
  }
  return tokenBalances;
};
