export const GRAPH_ENDPOINT: string = 'https://graph.unifarm.co/graphql';

type AssetPlatform = {
  [chainId: number]: string;
};

export const assetPlatforms: AssetPlatform = {
  1: 'ethereum',
  56: 'binance-smart-chain',
  137: 'polygon-pos',
  43114: 'avalanche',
};

interface MissingTokens {
  [legacyTokenAddress: string]: string;
}

export const staticPrices: { [token: string]: string } = {
  '0x1e933ecc8251259d473827dfed48c19f2ed1889d': '0.095',
};

export const missingTokens: MissingTokens = {
  '0x00d46727c2e4a6e358a8c0d638137a3d91b19be6': 'dragonvein',
  '0xe4fa3c576c31696322e8d7165c5965d5a1f6a1a5': 'gamyfi-token',
  '0x8c8687fc965593dfb2f0b4eaefd55e9d8df348df': 'paid-network',
  '0x1614f18fc94f47967a3fbe5ffcd46d4e7da3d787': 'paid-network',
  '0x3ff2348e44d09f07017bcdaacc4be575c0ec467f': 'oro',
  '0xc7d8d35eba58a0935ff2d5a33df105dd9f071731': 'hedget',
  '0x04ae5cb48b8f968ed821972c5480b5b850f55554': 'startfi',
  '0xeaf7d8395cce52daef138d39a1cefa51b97c15ae': 'terablock',
  '0x40986a85b4cfcdb054a6cbfb1210194fee51af88': 'unifarm',
  '0x9f998d62b81af019e3346af141f90cccd679825e': 'oro',
  '0xfd004a476a395108eb1a6e960c962bd856e5b3c6': 'unido-ep',
  '0x6fc13eace26590b80cccab1ba5d51890577d83b2': 'umbrella-network',
  '0x1e289178612f5b6d32f692e312dcf783c74b2162': 'ispolink',
  '0x2651b9c63290e543902da4eb63c34029382ff552': 'oro',
  '0xfc5a11d0fe8b5ad23b8a643df5eae60b979ce1bf': 'omniwhirl',
  '0x438b28c5aa5f00a817b7def7ce2fb3d5d1970974': 'bluzelle',
  '0xa947239adc5d53aa03e5f661a2e16d7b009fc5a6': 'raze-network',
  '0x612b6f08d7a149a668ef9ab16ea3147969b2e85b': 'oro',
  '0xa0f5505dc06ebe8ee8cbdc2059eade0b9f35cbc2': 'bxmi-token',
  '0xa1ed0364d53394209d61ae8bfdb8ff50484d8c91': 'terablock',
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': 'elk-finance',
};
