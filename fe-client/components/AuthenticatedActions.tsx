import { Button } from "@web3uikit/core";
import React from "react";
import { roll } from "../utils";

export type Statuses = "NONE" | "RUNNING" | "RAN";

interface AuthenticatedActionsProps {
  account: string;
  status: Statuses;
}
interface AuthenticatedActionsState {

}
export class AuthenticatedActions extends React.Component<
  AuthenticatedActionsProps,
  AuthenticatedActionsState
> {

  constructor(props: AuthenticatedActionsProps) {
    super(props);
    this.state = { status: undefined };
  }

  public async componentDidMount() {
    console.log("componentDidMount");
  }

  private handleClick = async () => {
    console.log('handleClick');
    const r = await roll();
  };

  public render() {
    const disabled = this.props.status === 'RUNNING';
    const loading = false;
    const buttonText = "Roll";
    return (
      <>
        <h2>Polled Status: {this.props.status}</h2>
        <h2>You are authenticated!</h2>
        <div>
          <Button
            theme="primary"
            onClick={this.handleClick}
            disabled={disabled}
            isLoading={loading}
            text={buttonText}
          />
        </div>
      </>
    );
  }
}