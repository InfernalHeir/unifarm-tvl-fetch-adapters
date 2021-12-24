import { soliditySha3 } from "web3-utils";
export const createMulticall = (targetAddress: string, account: string) => {
  return {
    target: targetAddress,
    call: ["balanceOf(address)(uint256)", account],
    returns: [],
  };
};
