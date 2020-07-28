import { EthereumProvider } from "@nomiclabs/buidler/types";


type NetworkMap = {
  [networkID in NetworkID]: string;
}

// See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md#list-of-chain-ids
enum NetworkID {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
}

const networkIDtoEndpoint: NetworkMap = {
  [NetworkID.Mainnet]: "https://api.etherscan.io/api",
  [NetworkID.Ropsten]: "https://api-ropsten.etherscan.io/api",
  [NetworkID.Rinkeby]: "https://api-rinkeby.etherscan.io/api",
  [NetworkID.Goerli]: "https://api-goerli.etherscan.io/api",
  [NetworkID.Kovan]: "https://api-kovan.etherscan.io/api",
};

export class NetworkProberError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function getEtherscanEndpoint(provider: EthereumProvider) {
  const { result: networkID } = await provider.send("eth_chainID");

  const endpoint = networkIDtoEndpoint[networkID as NetworkID];
  if (endpoint) {
    return new URL(endpoint);
  } else {
    throw new NetworkProberError("An etherscan endpoint could not be found for this network.");
  }
}

export async function retrieveContractBytecode(address: string, provider: EthereumProvider) {
  const { result: deployedBytecode } = await provider.send("eth_getCode", [ address, "latest" ]);
  return deployedBytecode;
}