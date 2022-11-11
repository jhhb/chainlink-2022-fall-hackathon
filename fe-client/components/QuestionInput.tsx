import { COLORS } from "../utils";
import { Input } from "@web3uikit/core";
import * as React from "react";

interface QuestionInputProps {
  value: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  state: "disabled" | "initial" | "error";
}

export function QuestionInput(props: QuestionInputProps) {
  const { value, state } = props;
  const staticProps = {
    errorMessage: "Question must be between 1 and 60 characters!",
    label: "Ask the Magic 8 Ball a question...",
    size: "large" as const,
    type: "text" as const,
    style: { background: COLORS.gray05 },
    labelBgColor: COLORS.gray05,
  };

  return (
    <Input
      {...staticProps}
      value={value}
      onChange={props.handleChange}
      state={state}
    />
  );
}
