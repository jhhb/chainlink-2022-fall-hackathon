import { Statuses } from "../components/AuthenticatedActions";
import { fetchStatus } from "./index";

export type PollerCallback = (value: Statuses) => void;

export class Poller {
  private readonly interval: number;
  private id?: NodeJS.Timer;
  private readonly account: string;

  public constructor(account: string, interval: number) {
    this.account = account;
    this.interval = interval;
  }

  static instance?: Poller;
  static isRunning: boolean;

  public static buildAndStart(
    account: string,
    interval: number,
    callback: PollerCallback
  ): Poller | undefined {
    if (Poller.isRunning) {
      return Poller.instance;
    } else {
      this.isRunning = true;
      Poller.instance = new Poller(account, interval);
      Poller.instance.start(callback);
      return Poller.instance;
    }
  }

  public start(callback: PollerCallback) {
    this.id = setInterval(async () => {
      const latestValue = await fetchStatus(this.account);
      callback(latestValue);
    }, this.interval);
  }

  public cleanup() {
    clearInterval(this.id);
    Poller.instance = undefined;
    Poller.isRunning = false;
  }
}
