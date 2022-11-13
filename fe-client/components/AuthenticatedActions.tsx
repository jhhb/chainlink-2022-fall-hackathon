import { BannerStrip } from "@web3uikit/core";
import * as React from "react";
import { SupportedChain } from "../utils/config";
import { getAnswerOrUndefined } from "../utils/datasource";
import { AskButton } from "./AskButton";
import { MagicEightBall } from "./MagicEightBall";
import { QuestionInput } from "./QuestionInput";
import { askQuestion, COLORS } from "../utils";
import styles from "../styles/AuthenticatedActions.module.css";

export type Statuses = "NONE" | "RUNNING" | "RAN";

type InputState = "disabled" | "initial" | "error";

interface AuthenticatedActionsProps {
  account: string;
  status: Statuses;
  currentChain: SupportedChain;
  answer?: string;
}

interface AuthenticatedActionsState {
  awaitingClickResult: boolean;
  intendedNextStatus: Statuses | undefined;
  inputValue: string;
  inputState: InputState;
  localAnswer: string | undefined;
}

export class AuthenticatedActions extends React.Component<
  AuthenticatedActionsProps,
  AuthenticatedActionsState
> {
  constructor(props: AuthenticatedActionsProps) {
    super(props);
    this.state = {
      awaitingClickResult: false,
      intendedNextStatus: undefined,
      inputValue: "",
      inputState: "initial",
      localAnswer: undefined,
    };
  }

  private handleClick = async () => {
    const { status, currentChain } = this.props;
    this.setState({
      awaitingClickResult: true,
      intendedNextStatus: nextStatus(status),
    });
    try {
      await askQuestion(currentChain);
    } catch (error: unknown) {
      handleError(error);
      this.setState({ intendedNextStatus: undefined });
    } finally {
      this.setState({ awaitingClickResult: false });
    }
  };

  public async componentDidMount() {
    const { account, currentChain } = this.props;
    const localAnswer = await getAnswerOrUndefined(account, currentChain);
    this.setState({ localAnswer });
  }

  public componentDidUpdate(
    prevProps: AuthenticatedActionsProps,
    prevState: AuthenticatedActionsState
  ) {
    // Once we get an up-to-date value on status from our contract, use that as our source of truth rather than the
    // intendedNextStatus.
    if (prevProps.status !== this.props.status) {
      this.setState({ intendedNextStatus: undefined });
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
    const {
      awaitingClickResult,
      intendedNextStatus,
      inputValue,
      inputState,
      localAnswer,
    } = this.state;
    const { status, answer } = this.props;

    // Handles the case where we are currently running for a user,
    // and the case where a user has just initiated a request;
    const disabledStatus =
      awaitingClickResult || [intendedNextStatus, status].includes("RUNNING");
    const inputLengthIsInvalid = !inputLengthIsValid(inputValue);

    const buttonProps = {
      onClick: this.handleClick,
      disabled:
        disabledStatus || inputState === "error" || inputLengthIsInvalid,
      isLoading: awaitingClickResult,
      status,
      intendedNextStatus,
    };

    const inputProps = {
      value: inputValue,
      handleChange: this.handleInputChange,
      state: disabledStatus ? "disabled" : inputState,
    };

    const ballProps = {
      answer,
      loading: disabledStatus,
    };

    const latestAnswer = answer || localAnswer;
    const previousAnswerInfoProps = {
      answer: latestAnswer,
    };

    return (
      <>
        <MagicEightBall {...ballProps} />
        <div className={styles["input-and-button-wrapper"]}>
          {latestAnswer && <PreviousAnswerInfo {...previousAnswerInfoProps} />}
          <QuestionInput {...inputProps} />
          <div className={styles["button-wrapper"]}>
            <AskButton {...buttonProps} />
          </div>
        </div>
      </>
    );
  }
}

function nextStatus(currentStatus: Statuses) {
  switch (currentStatus) {
    case "RUNNING":
      return "RAN";
    case "RAN":
      return "RUNNING";
    case "NONE":
      return "RUNNING";
  }
}

function inputLengthIsValid(value: string): boolean {
  return value.length > 0 && value.length <= 60;
}

function handleError(error: unknown): void {
  const message = `Got error with type: [${typeof error}]`;
  console.error(message);
  console.error(error);
}

interface BannerStripProps {
  answer?: string;
}

function PreviousAnswerInfo(props: BannerStripProps) {
  const { answer } = props;
  return (
    <div className={styles["previous-answer-container"]}>
      <BannerStrip
        id={"banner-strip-last-answer"}
        borderRadius={"16px"}
        width={"400px"}
        isCloseBtnVisible={false}
        text={
          <div className={styles["last-answer-container"]}>
            <span>Your last answer was: </span>
            <span className={styles["last-answer-text"]}>{answer}</span>
          </div>
        }
        position={"relative"}
        type="custom"
        bgColor={COLORS.lavender}
      />
    </div>
  );
}

function devDebuggerContent(
  status: Statuses,
  intendedNextStatus: Statuses | undefined
) {
  const shouldRender = false;
  if (shouldRender) {
    return (
      <>
        <h2>Polled Status: {status}</h2>
        <h2>Intended Next status: {intendedNextStatus}</h2>
      </>
    );
  } else {
    return undefined;
  }
}
