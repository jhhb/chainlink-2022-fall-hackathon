import { Button } from "@web3uikit/core";
import { COLORS } from "../utils";
import { Statuses } from "./AuthenticatedActions";

interface Props {
  onClick: () => void;
  status: Statuses;
  intendedNextStatus: Statuses | undefined;
  disabled: boolean;
  isLoading: boolean;
}

export function AskButton(props: Props) {
  const { disabled, isLoading } = props;

  const staticProps = {
    theme: "custom" as const,
    size: "large" as const,
    customize: {
      backgroundColor: COLORS.primary,
      textColor: COLORS.white,
    },
    text: buttonText(props.status, props.intendedNextStatus),
  };

  return (
    <Button
      {...staticProps}
      disabled={disabled}
      isLoading={isLoading}
      onClick={props.onClick}
    />
  );
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
