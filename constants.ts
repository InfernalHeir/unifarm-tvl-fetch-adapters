interface Tokenlist {
  [chainId: number]: string;
}

export const tokenlistUrls: Tokenlist = {
  1: "https://raw.githubusercontent.com/InfernalHeir/tokenlist/mainnet-01/unifarm-tokenlist.json",
  56: "https://raw.githubusercontent.com/InfernalHeir/tokenlist/mainnet-01/unifarm.tokenlist.56.json",
  137: "https://raw.githubusercontent.com/InfernalHeir/tokenlist/mainnet-01/unifarm.tokenlist.137.json",
};

export const GRAPH_ENDPOINT: string = "https://graph.unifarm.co/graphql";
