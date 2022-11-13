import { Statuses } from "../components/AuthenticatedActions";
import { SupportedChain } from "./config";
import { fetchStatus } from "./index";

export type PollerCallback = (value: Statuses) => void;

export class Poller {
  private readonly interval: number;
  private id?: NodeJS.Timer;
  private readonly account: string;
  private readonly chain: SupportedChain;

  public constructor(account: string, interval: number, chain: SupportedChain) {
    this.account = account;
    this.interval = interval;
    this.chain = chain;
  }

  static instance?: Poller;
  static isRunning: boolean;

  public static buildAndStart(
    account: string,
    interval: number,
    callback: PollerCallback,
    chain: SupportedChain
  ): Poller | undefined {
    if (Poller.isRunning) {
      return Poller.instance;
    } else {
      this.isRunning = true;
      Poller.instance = new Poller(account, interval, chain);
      Poller.instance.start(callback);
      return Poller.instance;
    }
  }

  // Network changes currently break the poller, hence the try/catch.
  // We assume that the consumer of the poller will rebuild the poller as
  // needed to get it working for the new network.
  public start(callback: PollerCallback) {
    this.id = setInterval(async () => {
      let latestValue;
      try {
        latestValue = await fetchStatus(this.account, this.chain);
      } catch (err) {
        console.debug(err);
        this.cleanup();
      }

      if (latestValue) {
        callback(latestValue);
      }
    }, this.interval);
  }

  public cleanup() {
    clearInterval(this.id);
    Poller.instance = undefined;
    Poller.isRunning = false;
  }
}
