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
    const { account } = this.props;
    const initialStatus = await fetchStatus(account);
    this.setState({ status: initialStatus });

    this.poller = Poller.buildAndStart(
      this.props.account,
      this.POLL_INTERVAL,
      this.pollerCallback
    );
  }

  private pollerCallback = async (newStatus: Statuses) => {
    const { status: previousStatus } = this.state;
    const { account: address } = this.props;
    const statusHasChanged = newStatus !== previousStatus;
    if (statusHasChanged) {
      flushSync(() => {
        this.setState({ status: newStatus });
      });

      if (newStatus === "RAN") {
        console.debug("fetching answer...");
        const answer = await getAnswer(address);
        console.debug(`Got answer: ${answer}`);

        flushSync(() => {
          this.setState({ answer });
        });
      }
    } else {
      // Do nothing.
    }
  };

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
