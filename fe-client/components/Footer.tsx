import { LinkTo } from "@web3uikit/core";
import styles from "../styles/Footer.module.css";

interface Props {}

export function Footer(_props: Props) {
  return (
    <footer>
      <div className={styles.top}>
        <Item>
          <span>
            See the
            <LinkInNewTab
              href="https://github.com/jhhb/vrf8ball.link"
              text=" code on Github"
            />
          </span>
        </Item>
        <Item className={styles["link-to"]}>
          <strong>Contact + Email</strong>
          <span>
            Made by
            <LinkInNewTab
              href="https://www.linkedin.com/in/jhhb"
              text=" James Boyle"
            />
          </span>
          <LinkTo
            address="jboyle_cl_hack2022@fastmail.com"
            iconLayout="none"
            text="Email me and let's work together!"
            type="email"
          />
        </Item>
        <Item>
          <LinkInNewTab
            href="https://chain.link/vrf"
            text="Built with Chainlink VRF V2"
          />
        </Item>
      </div>
    </footer>
  );
}

interface LinkInNewTabProps {
  href: string;
  text: string;
}
function LinkInNewTab(props: LinkInNewTabProps) {
  const { href, text } = props;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {text}
    </a>
  );
}

interface ItemProps {
  children: Array<JSX.Element> | JSX.Element;
  className?: string;
}
function Item(props: ItemProps) {
  const classes = [styles.item, " ", props.className].join(" ");
  return <div className={classes}>{props.children}</div>;
}
