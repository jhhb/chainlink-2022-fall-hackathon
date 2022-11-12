import { Loading } from "@web3uikit/core";
import * as React from "react";
import styles from "../styles/MagicEightBall.module.css";

interface Props {
  answer?: string;
  loading: boolean;
}

export class MagicEightBall extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { answer, loading } = this.props;

    const loadingInnerContent = loading && (
      <Loading fontSize={70} spinnerType="wave" spinnerColor={"black"} />
    );

    const answerInnerContent = answer || <div className={styles.eight}>8</div>;
    const innerContent = loadingInnerContent || answerInnerContent;

    return (
      <div className={styles.container}>
        <div className={styles["ball-container"]}>
          <div className={styles["ball-black-outer"]}>
            <div className={styles["ball-white-inner"]}>
              <div>{innerContent}</div>
            </div>
          </div>
          <div className={styles["ball-shadow"]}></div>
        </div>
      </div>
    );
  }
}

/*
jboyle: The CSS and JavaScript have been reproduced with some modifications from the original; the original
can be seen here (https://codepen.io/CarliBotes/pen/vMYLdq) and is mentioned in this comment pursuant to
the license of the original code.

Original code's license below in full:

Copyright (c) 2022 by Carli Botes (https://codepen.io/CarliBotes/pen/vMYLdq)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
