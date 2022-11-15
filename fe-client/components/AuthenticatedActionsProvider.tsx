import { Loading } from "@web3uikit/core";
import * as React from "react";
import { SupportedChain } from "../utils/config";
import { AnswerStruct, getAnswer } from "../utils/datasource";
import { AuthenticatedActions } from "./AuthenticatedActions";
import { answersDiffer, Poller } from "../utils";

interface Props {
  address: string;
  currentChain: SupportedChain;
}

interface State {
  answerStruct: AnswerStruct | undefined;
}

export class AuthenticatedActionsProvider extends React.Component<
  Props,
  State
> {
  private poller?: Poller;
  private readonly POLL_INTERVAL = 1000;

  public constructor(props: Props) {
    super(props);
    this.state = { answerStruct: undefined };
  }

  public componentWillUnmount() {
    this.poller?.cleanup();
  }

  public async componentDidMount() {
    const { address, currentChain } = this.props;
    const answerStruct = await getAnswer(address, currentChain);
    this.setState({ answerStruct });

    this.poller = this.buildAndStartPoller();
  }

  public componentDidUpdate(prevProps: Props) {
    const { currentChain } = this.props;
    const connectedNetworkHasChanged =
      currentChain.chainId !== prevProps.currentChain.chainId;

    if (connectedNetworkHasChanged) {
      this.poller?.cleanup();
      this.poller = this.buildAndStartPoller();
    }
  }

  private pollerCallback = async (newAnswer: AnswerStruct) => {
    const { answerStruct: previousAnswer } = this.state;

    // TODO: JB - This is done to appease TS but we can probably simplify.
    if (!previousAnswer) {
      this.setState({ answerStruct: newAnswer });
    } else {
      if (answersDiffer(previousAnswer, newAnswer)) {
        this.setState({ answerStruct: newAnswer });
      }
    }
  };

  private buildAndStartPoller(): Poller | undefined {
    const { address, currentChain } = this.props;
    return Poller.buildAndStart(
      address,
      this.POLL_INTERVAL,
      this.pollerCallback,
      currentChain
    );
  }

  public render() {
    if (this.state.answerStruct) {
      return (
        <AuthenticatedActions
          address={this.props.address}
          currentChain={this.props.currentChain}
          answer={this.state.answerStruct}
        />
      );
    } else {
      // TODO: JB
      return <Loading spinnerColor={"black"} size={100} />;
    }
  }
}
