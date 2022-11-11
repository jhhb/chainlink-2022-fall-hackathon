import {
  ALL_STATUSES,
  CONTRACT_ABI,
  GET_ANSWER_FUNCTION_NAME,
  GET_STATUS_FUNCTION_NAME,
  LOCALHOST_CONTRACT_ADDRESS,
  START_FUNCTION_NAME,
} from "../constants";

import Moralis from "moralis-v1";
import { Statuses } from "../components/AuthenticatedActions";

export async function fetchStatus(address: string): Promise<Statuses> {
  const result = await Moralis.executeFunction({
    abi: CONTRACT_ABI,
    contractAddress: LOCALHOST_CONTRACT_ADDRESS,
    functionName: GET_STATUS_FUNCTION_NAME,
    params: { addr: address },
  });
  assertIsStatuses(result);
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

export async function getAnswer(address: string): Promise<string> {
  const result = await Moralis.executeFunction({
    abi: CONTRACT_ABI,
    contractAddress: LOCALHOST_CONTRACT_ADDRESS,
    functionName: GET_ANSWER_FUNCTION_NAME,
    params: { userAddress: address },
  });
  assertIsString(result);
  return result;
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(
      `Expected value [${value}] to be a string; got: [${typeof value}]`
    );
  }
}

function assertIsStatuses(value: unknown): asserts value is Statuses {
  assertIsString(value);

  const castValue = value as Statuses;
  if (!ALL_STATUSES.includes(castValue)) {
    throw new Error(
      `Expected value [${value}] to be a Statuses; got: [${value}]`
    );
  }
}
