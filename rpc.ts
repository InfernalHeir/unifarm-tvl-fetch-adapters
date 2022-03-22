import { config } from "dotenv";

config({ path: ".env" });

/// ETH RPC URL
export const ETH_RPC_URL = process.env.ETHEREUM_RPC_URL as string;
/// BSC RPC URL
export const BSC_RPC_URL = process.env.BSC_RPC_URL as string;
/// POLYGON RPC URL
export const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL as string;
/// AVAX RPC URL
export const AVAX_RPC_URL = process.env.AVAX_RPC_URL as string;

interface RPC {
  /** rpc's mapping */
  [chainId: number]: string;
}

interface MulticallAddress {
  /** multicall address mapping */
  [chainId: number]: string;
}

export const rpcUrls: RPC = {
  1: ETH_RPC_URL,
  56: BSC_RPC_URL,
  137: POLYGON_RPC_URL,
  43114: AVAX_RPC_URL,
};

export const multicallAddresses: MulticallAddress = {
  1: "0xeefba1e63905ef1d7acba5a8513c70307c1ce441",
  56: "0x41263cba59eb80dc200f3e2544eda4ed6a90e76c",
  137: "0x11ce4B23bD875D7F5C6a31084f55fDe1e9A87507",
  43114: "0xed386Fe855C1EFf2f843B910923Dd8846E45C5A4",
};
