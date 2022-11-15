import BigNumber from "bignumber.js";
import Moralis from "moralis-v1";
import {
  CONTRACT_ABI,
  GET_ANSWER_FUNCTION_NAME,
  START_FUNCTION_NAME,
} from "../constants";
import { SupportedChain } from "./config";

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
