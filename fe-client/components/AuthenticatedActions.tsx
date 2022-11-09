import { Button } from '@web3uikit/core';
import React from 'react';
import { fetchStatus, roll } from '../utils';

type Statuses = 'NONE' | 'RUNNING' | 'RAN'

interface AuthenticatedActionsProps {
  account: string;
}
interface AuthenticatedActionsState {
  status: Statuses | undefined;
}
export class AuthenticatedActions extends React.Component<AuthenticatedActionsProps, AuthenticatedActionsState> {
  constructor(props: AuthenticatedActionsProps) {
    super(props);
    this.state = {status: undefined};
  }

  public async componentDidMount() {
    const status = await fetchStatus(this.props.account);
    // TODO: JB
    // @ts-ignore
    this.setState({status})
  }

  handleClick = async () => {
    const r = await roll();

    // TODO: JB
    // This can be used for reading events if needed
    // const nextResult = await r.wait(1)
  }

  public render() {
    const disabled = false
    const loading = false;
    const buttonText = 'Roll';
    return (
      <>
        <h2>Status: {this.state.status}</h2>
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
    )
  }
}