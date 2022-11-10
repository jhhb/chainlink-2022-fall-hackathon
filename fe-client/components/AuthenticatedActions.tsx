import { Button, Input } from "@web3uikit/core";
import * as React from "react";
import { askQuestion } from "../utils";
import { AskButton } from "./AskButton";
import { MagicEightBall } from "./MagicEightBall";
import styles from "../styles/AuthenticatedActions.module.css";
import { QuestionInput } from "./QuestionInput";

export type Statuses = "NONE" | "RUNNING" | "RAN";

interface AuthenticatedActionsProps {
  account: string;
  status: Statuses;
}

type InputState = "disabled" | "initial" | "error";

interface AuthenticatedActionsState {
  awaitingClickResult: boolean;
  intendedNextStatus: Statuses | undefined;
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
      intendedNextStatus: undefined,
      inputValue: "",
      inputState: "initial",
    };
  }

  private handleClick = async () => {
    // TODO: JB - Add try / catch here in case user cancels transaction
    console.log("handleClick");
    const { status } = this.props;
    this.setState({
      awaitingClickResult: true,
      intendedNextStatus: nextStatus(status),
    });
    try {
      const r = await askQuestion();
      console.log(r);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      this.setState({ awaitingClickResult: false });
    }
  };

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
    const valueIsValid = value.length && value.length <= 60;
    const nextInputStateValue: InputState = valueIsValid ? "initial" : "error";
    const nextState = { inputValue: value, inputState: nextInputStateValue };

    this.setState(nextState);
  };

  public render() {
    const { awaitingClickResult, intendedNextStatus, inputValue, inputState } =
      this.state;
    const { status } = this.props;

    // Handles the case where we are currently running for a user,
    // and the case where a user has just initiated a request;
    const isButtonDisabled =
      awaitingClickResult || [intendedNextStatus, status].includes("RUNNING");

    const buttonProps = {
      onClick: this.handleClick,
      disabled: isButtonDisabled || inputState === "error",
      isLoading: awaitingClickResult,
      status,
      intendedNextStatus,
    };

    const inputProps = {
      value: inputValue,
      handleChange: this.handleInputChange,
      state: isButtonDisabled ? "disabled" : inputState,
    };

    return (
      <>
        <h2>Polled Status: {status}</h2>
        <h2>Intended Next status: {intendedNextStatus}</h2>
        <h2>You are authenticated!</h2>
        <MagicEightBall />
        <QuestionInput {...inputProps} />
        <div className={styles["button-wrapper"]}>
          <AskButton {...buttonProps} />
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
