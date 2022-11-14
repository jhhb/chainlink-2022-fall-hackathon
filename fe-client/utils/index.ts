import { NO_ANSWER_NONE, NO_ANSWER_RUNNING } from "../constants";
import { SUPPORTED_CHAINS } from "./config";
import { AnswerStruct, askQuestion, fetchStatus } from "./datasource";
import { COLORS } from "./colors";
import { Poller } from "./poller";

function answerIsNonStubValue(answer: string): boolean {
  return answer !== NO_ANSWER_NONE && answer !== NO_ANSWER_RUNNING;
}

function answersDiffer(
  answer: AnswerStruct,
  otherAnswer: AnswerStruct
): boolean {
  return answer.id.toString() !== otherAnswer.id.toString();
}

export {
  fetchStatus,
  askQuestion,
  Poller,
  COLORS,
  SUPPORTED_CHAINS,
  answerIsNonStubValue,
  answersDiffer,
};
