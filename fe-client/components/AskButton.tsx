import { Button } from "@web3uikit/core";
import { NO_ANSWER_NONE, NO_ANSWER_RUNNING } from "../constants";
import { COLORS } from "../utils";

interface Props {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  answer: string;
}

export function AskButton(props: Props) {
  const { disabled, isLoading, answer } = props;

  const staticProps = {
    theme: "custom" as const,
    size: "large" as const,
    customize: {
      backgroundColor: COLORS.primary,
      textColor: COLORS.white,
    },
    text: buttonText(answer),
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

function buttonText(answer: string): string {
  switch (answer) {
    case NO_ANSWER_RUNNING:
      return "Awaiting an answer";
    case NO_ANSWER_NONE:
      return "Ask";
    default:
      return "Ask";
  }
}
