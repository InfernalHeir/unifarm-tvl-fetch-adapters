import { ICall, IResponse, aggregate, IKeysValues } from '@makerdao/multicall';
import { ethers } from 'ethers';
import { isEmpty } from 'lodash';
import { roundValue, Token } from './helpers';
import { multicallAddresses, rpcUrls } from './rpc';

export const multicall = async (chainId: number, calls: ICall[]): Promise<IResponse> => {
  const callResult = await aggregate(calls, {
    rpcUrl: rpcUrls[chainId],
    multicallAddress: multicallAddresses[chainId],
  });
  return callResult as IResponse;
};

export const createMulticall = (targetAddress: string, account: string): ICall => {
  return {
    target: targetAddress,
    call: ['balanceOf(address)(uint256)', account],
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
    let tokenId = token.tokenId;
    if (
      chainId === 1 &&
      token.tokenId.toLowerCase() === '0x8c8687fc965593dfb2f0b4eaefd55e9d8df348df'.toLowerCase()
    ) {
      tokenId = '0x1614F18Fc94f47967A3Fbe5FfcD46d4e7Da3D787';
    }
    calls.push(createMulticall(tokenId, cohort.cohortAddress.toLowerCase()));
    // when cohort have proxies smart contracts
    if (!isEmpty(cohort.proxies)) {
      for (var e = 0; e < cohort.proxies.length; e++) {
        var proxyAddress = cohort.proxies[e].toLowerCase();
        calls.push(createMulticall(tokenId, proxyAddress));
      }
    }
  }

  // create call
  const callResult = await multicall(chainId, calls);
  let original = callResult.results.original as IKeysValues;
  //console.log('original', original);

  let t = 0;

  let tokenBalances = {} as { [tokenId: string]: number };
  while (t < tokens.length) {
    let { token, cohort } = tokens[t];

    // fields
    let tokenId = token.tokenId.toLowerCase();
    if (
      chainId === 1 &&
      token.tokenId.toLowerCase() === '0x8c8687fc965593dfb2f0b4eaefd55e9d8df348df'.toLowerCase()
    ) {
      tokenId = '0x1614F18Fc94f47967A3Fbe5FfcD46d4e7Da3D787'.toLowerCase();
    }

    let cohortId = cohort.cohortAddress.toLowerCase();
    let proxies = cohort.proxies;

    // previous balance
    let previousBalance = !tokenBalances[tokenId] ? 0 : tokenBalances[tokenId];
    let balance = original[`${tokenId}-${cohortId}`];

    let parsedBalance = roundValue(Number(ethers.utils.formatUnits(balance, token.decimals)), 6);
    tokenBalances[tokenId] = previousBalance + parsedBalance;

    if (!isEmpty(proxies)) {
      let proxyPreviousBalance = !tokenBalances[tokenId] ? 0 : tokenBalances[tokenId];
      for (var e = 0; e < proxies.length; e++) {
        let proxyBalance = original[`${tokenId}-${proxies[e].toLowerCase()}`];
        let parsedProxyBalance = roundValue(
          Number(ethers.utils.formatUnits(proxyBalance, token.decimals)),
          6
        );
        tokenBalances[tokenId] = proxyPreviousBalance + parsedProxyBalance;
      }
    }

    t++;
  }
  return tokenBalances;
};
