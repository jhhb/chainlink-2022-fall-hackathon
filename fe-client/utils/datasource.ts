import {
  CONTRACT_ABI,
  GET_STATUS_FUNCTION_NAME,
  LOCALHOST_CONTRACT_ADDRESS,
  START_FUNCTION_NAME,
} from "../constants";

import Moralis from "moralis-v1";
import { Statuses } from "../components/AuthenticatedActions";

export async function fetchStatus(address: string): Promise<Statuses> {
  // @ts-ignore
  const result: Statuses = await Moralis.executeFunction({
    abi: CONTRACT_ABI,
    contractAddress: LOCALHOST_CONTRACT_ADDRESS,
    functionName: GET_STATUS_FUNCTION_NAME,
    params: { addr: address },
  });
  return result;
}

export async function askQuestion(): Promise<
  ReturnType<Moralis["executeFunction"]>
> {
  return Moralis.executeFunction({
    abi: CONTRACT_ABI,
    contractAddress: LOCALHOST_CONTRACT_ADDRESS,
    functionName: START_FUNCTION_NAME,
    params: {},
  });
}
