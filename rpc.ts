import { config } from "dotenv";

config({ path: ".env" });

export const ETH_RPC_URL = process.env.ETHEREUM_RPC_URL;

export const BSC_RPC_URL = process.env.BSC_RPC_URL;

export const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
