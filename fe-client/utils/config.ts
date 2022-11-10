export const SUPPORTED_CHAINS = [
  {
    chainId: 0x5,
    chain: "Eth",
    name: "Goerli",
    network: "testnet",
  },
  {
    chainId: 0x7a69,
    chain: "Hardhat local dev",
    name: "Hardhat",
    network: "hardhat",
  },
];

function isSupportedChainId(chainId: number): boolean {
  if (typeof chainId !== "number") {
    throw new Error(`Chain ID must be a number`);
  }
  const chainIds: Array<number> = SUPPORTED_CHAINS.map((val) => val.chainId);
  return chainIds.includes(chainId);
}

export { isSupportedChainId };
