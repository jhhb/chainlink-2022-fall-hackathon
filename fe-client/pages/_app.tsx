import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import { StrictMode } from "react";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <StrictMode>
      <MoralisProvider initializeOnMount={false}>
        <Component {...pageProps} />
      </MoralisProvider>
    </StrictMode>
  );
}
