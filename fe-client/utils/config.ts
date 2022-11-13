export interface SupportedChain {
  chainId: number;
  chain: string;
  name: string;
  network: string;
  deployedContractAddress: string;
}

const LOCALHOST_CONTRACT_ADDRESS = "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9";
const GOERLI_CONTRACT_ADDRESS = "0xe087f2d069b711d839DbD3b2324ac09bae21c9d1";

const SUPPORTED_CHAINS: Array<SupportedChain> = [
  {
    chainId: 5,
    chain: "Eth",
    name: "Goerli",
    network: "testnet",
    deployedContractAddress: GOERLI_CONTRACT_ADDRESS,
  },
  {
    chainId: 31337,
    chain: "Hardhat local dev",
    name: "Hardhat",
    network: "hardhat",
    deployedContractAddress: LOCALHOST_CONTRACT_ADDRESS,
  },
];

function isSupportedChainId(chainId: number): boolean {
  if (typeof chainId !== "number") {
    throw new Error(`Chain ID must be a number`);
  }
  const chainIds: Array<number> = SUPPORTED_CHAINS.map((val) => val.chainId);
  return chainIds.includes(chainId);
}

function findSupportedChain(chainId?: number): SupportedChain | undefined {
  if (chainId) {
    return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId);
  } else {
    return undefined;
  }
}

export { findSupportedChain, SUPPORTED_CHAINS };
