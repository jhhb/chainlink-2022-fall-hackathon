import BigNumber from "bignumber.js";
import Moralis from "moralis-v1";
import { Statuses } from "../components/AuthenticatedActions";
import {
  ALL_STATUSES,
  CONTRACT_ABI,
  GET_ANSWER_FUNCTION_NAME,
  GET_STATUS_FUNCTION_NAME,
  START_FUNCTION_NAME,
} from "../constants";
import { SupportedChain } from "./config";

export async function fetchStatus(
  address: string,
  chain: SupportedChain
): Promise<Statuses> {
  const result = await Moralis.executeFunction({
    abi: CONTRACT_ABI,
    contractAddress: chain.deployedContractAddress,
    functionName: GET_STATUS_FUNCTION_NAME,
    params: { addr: address },
  });
  assertIsStatuses(result);
  return result;
}

export async function askQuestion(
  chain: SupportedChain
): Promise<ReturnType<Moralis["executeFunction"]>> {
  return Moralis.executeFunction({
    abi: CONTRACT_ABI,
    contractAddress: chain.deployedContractAddress,
    functionName: START_FUNCTION_NAME,
    params: {},
  });
}

export async function getAnswer(
  userAddress: string,
  chain: SupportedChain
): Promise<AnswerStruct> {
  const result = await Moralis.executeFunction({
    abi: CONTRACT_ABI,
    contractAddress: chain.deployedContractAddress,
    functionName: GET_ANSWER_FUNCTION_NAME,
    params: { userAddress },
  });
  assertIsStruct(result);
  return result;
}

export async function getAnswerOrUndefined(
  userAddress: string,
  chain: SupportedChain
): Promise<AnswerStruct | undefined> {
  try {
    return await getAnswer(userAddress, chain);
  } catch (_err) {
    // If the user has never rolled, this case occurs
    return undefined;
  }
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

export interface AnswerStruct {
  id: BigNumber;
  answer: string;
}

function assertIsStruct(value: unknown): asserts value is AnswerStruct {
  const castValue = value as { answer: string; id: { _isBigNumber: true } };
  const idIsBigNumber = castValue.id._isBigNumber;
  const error = new Error(`Expected value [${value}] to be an AnswerStruct`);
  if (!idIsBigNumber) {
    throw error;
  }

  if (!castValue.answer.length) {
    throw error;
  }
}
