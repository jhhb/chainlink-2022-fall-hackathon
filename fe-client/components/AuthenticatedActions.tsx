import * as React from "react";
import { NO_ANSWER_RUNNING } from "../constants";
import { SupportedChain } from "../utils/config";
import { AnswerStruct } from "../utils/datasource";
import { AskButton } from "./AskButton";
import { MagicEightBall } from "./MagicEightBall";
import { QuestionInput } from "./QuestionInput";
import { answerIsNonStubValue, answersDiffer, askQuestion } from "../utils";
import styles from "../styles/AuthenticatedActions.module.css";

type InputState = "disabled" | "initial" | "error";

interface AuthenticatedActionsProps {
  currentChain: SupportedChain;
  answer: AnswerStruct;
}

interface AuthenticatedActionsState {
  awaitingClickResult: boolean;
  awaitingNewAnswer: boolean;
  inputValue: string;
  inputState: InputState;
}

export class AuthenticatedActions extends React.Component<
  AuthenticatedActionsProps,
  AuthenticatedActionsState
> {
  constructor(props: AuthenticatedActionsProps) {
    super(props);
    this.state = {
      awaitingClickResult: false,
      awaitingNewAnswer: false,
      inputValue: "",
      inputState: "initial",
    };
  }

  private handleClick = async () => {
    const { currentChain } = this.props;
    this.setState({
      awaitingClickResult: true,
      awaitingNewAnswer: true,
    });
    try {
      await askQuestion(currentChain);
    } catch (error: unknown) {
      handleError(error);
      this.setState({ awaitingNewAnswer: false });
    } finally {
      this.setState({ awaitingClickResult: false });
    }
  };

  public componentDidUpdate(prevProps: AuthenticatedActionsProps) {
    if (answersDiffer(prevProps.answer, this.props.answer)) {
      // This cancels the loading state.
      this.setState({ awaitingNewAnswer: false });
    }
  }

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const valueIsValid = inputLengthIsValid(value);
    const nextInputStateValue: InputState = valueIsValid ? "initial" : "error";
    const nextState = { inputValue: value, inputState: nextInputStateValue };

    this.setState(nextState);
  };

  public render() {
    const { answer, currentChain } = this.props;
    const { awaitingClickResult, inputValue, inputState, awaitingNewAnswer } =
      this.state;

    // Handles the case where we are currently running for a user,
    // and the case where a user has just initiated a request;
    const disabledStatus =
      awaitingClickResult ||
      awaitingNewAnswer ||
      answer.value === NO_ANSWER_RUNNING;
    const inputLengthIsInvalid = !inputLengthIsValid(inputValue);

    const buttonProps = {
      onClick: this.handleClick,
      disabled:
        disabledStatus || inputState === "error" || inputLengthIsInvalid,
      isLoading: awaitingClickResult,
      answer: answer.value,
    };

    const inputProps = {
      value: inputValue,
      handleChange: this.handleInputChange,
      state: disabledStatus ? "disabled" : inputState,
    };

    const answerForBall = answerIsNonStubValue(answer.value)
      ? answer
      : undefined;
    const ballProps = {
      answer: answerForBall?.value,
      loading: disabledStatus,
    };

    return (
      <>
        <h2>You are authenticated to the {currentChain.name} network!</h2>
        <MagicEightBall {...ballProps} />
        <div className={styles["input-and-button-wrapper"]}>
          <QuestionInput {...inputProps} />
          <div className={styles["button-wrapper"]}>
            <AskButton {...buttonProps} />
          </div>
        </div>
      </>
    );
  }
}

function inputLengthIsValid(value: string): boolean {
  // eslint-disable-next-line no-magic-numbers
  const [minValueLength, maxValueLength] = [1, 60];
  return value.length >= minValueLength && value.length <= maxValueLength;
}

function handleError(error: unknown): void {
  const message = `Got error with type: [${typeof error}]`;
  console.error(message);
  console.error(error);
}
