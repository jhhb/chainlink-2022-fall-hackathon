export interface SupportedChain {
  chainId: number;
  chain: string;
  name: string;
  network: string;
  deployedContractAddress: string;
}

const LOCALHOST_CONTRACT_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const GOERLI_CONTRACT_ADDRESS = "0x4CaBae97ed6501DbAf6Bd7265D77c7EB86c332BB";

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
