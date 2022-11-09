import { Button } from "@web3uikit/core";
import React from "react";
import { roll } from "../utils";
import { MagicEightBall } from "./MagicEightBall";

export type Statuses = "NONE" | "RUNNING" | "RAN";

interface AuthenticatedActionsProps {
  account: string;
  status: Statuses;
}

interface AuthenticatedActionsState {
  awaitingClickResult: boolean;
  intendedNextStatus: Statuses | undefined;
}

export class AuthenticatedActions extends React.Component<
  AuthenticatedActionsProps,
  AuthenticatedActionsState
> {
  constructor(props: AuthenticatedActionsProps) {
    super(props);
    this.state = { awaitingClickResult: false, intendedNextStatus: undefined };
  }

  private handleClick = async () => {
    const { status } = this.props;
    this.setState({
      awaitingClickResult: true,
      intendedNextStatus: nextStatus(status),
    });
    try {
      const r = await roll();
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

  public render() {
    const { awaitingClickResult, intendedNextStatus } = this.state;
    const { status } = this.props;

    // Handles the case where we are currently running for a user,
    // and the case where a user has just initiated a request;
    const disabled =
      awaitingClickResult || [intendedNextStatus, status].includes("RUNNING");
    const loading = awaitingClickResult;
    const text = buttonText(status, intendedNextStatus);
    return (
      <>
        <h2>Polled Status: {status}</h2>
        <h2>Intended Next status: {intendedNextStatus}</h2>
        <h2>You are authenticated!</h2>
        <MagicEightBall />
        <div>
          <Button
            theme="primary"
            onClick={this.handleClick}
            disabled={disabled}
            isLoading={loading}
            text={text}
          />
        </div>
      </>
    );
  }
}

function buttonText(
  currentStatus: Statuses,
  intendedNextStatus: Statuses | undefined
): string {
  const statusToConsult = intendedNextStatus || currentStatus;
  switch (statusToConsult) {
    case "RUNNING":
      return "Awaiting Completion...";
    case "RAN":
      return "Run again?";
    case "NONE":
      return "Run";
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
