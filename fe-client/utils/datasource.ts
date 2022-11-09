import Moralis from "moralis-v1";
import { Statuses } from "../components/AuthenticatedActions";
import {
  CONTRACT_ABI,
  GET_STATUS_FUNCTION_NAME,
  LOCALHOST_CONTRACT_ADDRESS,
  START_FUNCTION_NAME,
} from "../constants";

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

// TODO: JB
export async function roll(): Promise<ReturnType<Moralis["executeFunction"]>> {
  return Moralis.executeFunction({
    abi: CONTRACT_ABI,
    contractAddress: LOCALHOST_CONTRACT_ADDRESS,
    functionName: START_FUNCTION_NAME,
    params: {},
  });
}
