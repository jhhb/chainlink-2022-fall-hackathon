import { Loading } from "@web3uikit/core";
import * as React from "react";
import { SupportedChain } from "../utils/config";
import { getAnswer } from "../utils/datasource";
import { AuthenticatedActions, Statuses } from "./AuthenticatedActions";
import { Poller, fetchStatus } from "../utils";
import { flushSync } from "react-dom";

interface Props {
  account: string;
  currentChain: SupportedChain;
}

interface State {
  status: Statuses | undefined;
  answer: string | undefined;
}

export class AuthenticatedActionsProvider extends React.Component<
  Props,
  State
> {
  private poller?: Poller;
  private readonly POLL_INTERVAL = 1000;

  public constructor(props: Props) {
    super(props);
    this.state = { status: undefined, answer: undefined };
  }

  public componentWillUnmount() {
    this.poller?.cleanup();
  }

  public async componentDidMount() {
    const { account, currentChain } = this.props;
    const initialStatus = await fetchStatus(account, currentChain);
    this.setState({ status: initialStatus });

    this.poller = this.buildAndStartPoller();
  }

  public componentDidUpdate(
    prevProps: Props,
    prevState: State,
    snapshot?: unknown
  ) {
    const { currentChain } = this.props;
    const connectedNetworkHasChanged =
      currentChain.chainId !== prevProps.currentChain.chainId;

    if (connectedNetworkHasChanged) {
      this.poller?.cleanup();
      this.poller = this.buildAndStartPoller();
    }
  }

  private pollerCallback = async (newStatus: Statuses) => {
    const { status: previousStatus } = this.state;
    const { account: address, currentChain } = this.props;
    const statusHasChanged = newStatus !== previousStatus;
    if (statusHasChanged) {
      flushSync(() => {
        this.setState({ status: newStatus });
      });

      if (newStatus === "RAN") {
        const answer = await getAnswer(address, currentChain);

        flushSync(() => {
          this.setState({ answer });
        });
      }
    } else {
      // Do nothing.
    }
  };

  private buildAndStartPoller(): Poller | undefined {
    const { account, currentChain } = this.props;
    return Poller.buildAndStart(
      account,
      this.POLL_INTERVAL,
      this.pollerCallback,
      currentChain
    );
  }

  public render() {
    if (this.state.status) {
      return (
        <AuthenticatedActions
          account={this.props.account}
          status={this.state.status}
          currentChain={this.props.currentChain}
          answer={this.state.answer}
        />
      );
    } else {
      // TODO: JB
      return <Loading spinnerColor={"black"} size={100} />;
    }
  }
}
