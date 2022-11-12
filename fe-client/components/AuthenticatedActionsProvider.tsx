import * as React from "react";
import { SupportedChain } from "../utils/config";
import { getAnswer } from "../utils/datasource";
import { AuthenticatedActions, Statuses } from "./AuthenticatedActions";
import { Poller, fetchStatus } from "../utils";

interface Props {
  account: string;
  currentChain: SupportedChain;
}

interface State {
  status: Statuses | undefined;
  answer?: string;
  loadingAnswer: boolean;
}
export class AuthenticatedActionsProvider extends React.Component<
  Props,
  State
> {
  private poller?: Poller;
  // TODO: JB -- maybe adjust this.
  private readonly POLL_INTERVAL = 3000;

  public constructor(props: Props) {
    super(props);
    this.state = { status: undefined, answer: undefined, loadingAnswer: false };
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

  private pollerCallback = (newStatus: Statuses) => {
    const { status: previousStatus } = this.state;
    const statusHasChanged = newStatus !== previousStatus;
    if (statusHasChanged) {
      console.debug("values differ");
      this.setState({ status: newStatus });
    } else {
      console.debug("values are the same");
    }
  };

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
