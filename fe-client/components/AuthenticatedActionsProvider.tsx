import * as React from "react";
import { SupportedChain } from "../utils/config";
import { AuthenticatedActions, Statuses } from "./AuthenticatedActions";
import { Poller, fetchStatus } from "../utils";

interface Props {
  account: string;
  currentChain: SupportedChain;
}

export class AuthenticatedActionsProvider extends React.Component<
  Props,
  { status: Statuses | undefined }
> {
  private poller?: Poller;
  private readonly POLL_INTERVAL = 3000;

  public constructor(props: Props) {
    super(props);
    this.state = { status: undefined };
  }

  public componentWillUnmount() {
    this.poller?.cleanup();
  }

  public async componentDidMount() {
    const initialStatus = await fetchStatus(this.props.account);
    this.setState({ status: initialStatus });

    const callback = (value: Statuses) => {
      console.log("callback");
      console.log(this);
      if (value !== this.state.status) {
        this.setState({ status: value });
      } else {
        console.log("values are the same");
      }
    };
    this.poller = Poller.buildAndStart(
      this.props.account,
      this.POLL_INTERVAL,
      callback
    );
  }

  public render() {
    if (this.state.status) {
      return (
        <AuthenticatedActions
          account={this.props.account}
          status={this.state.status}
          currentChain={this.props.currentChain}
        />
      );
    } else {
      return <></>;
    }
  }
}
