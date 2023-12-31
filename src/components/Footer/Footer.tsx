import packageJson from "package.json";
import styles from "./footer.module.scss";
import {
  IconBrandGithubFilled,
  IconBrandTwitch,
  IconMail,
} from "@tabler/icons-react";
import clsx from "clsx";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className={clsx(
        "body-font font-display relative mx-auto flex flex-col items-center border-t-2 border-brand-default bg-gray-800 px-5 py-6 text-gray-100 print:hidden sm:flex-row sm:py-2 print:hidden",
        styles.footerTerminal
      )}
    >
      <a
        title="Home"
        href="https://ochrefox.net"
        className="flex items-center justify-center shrink-0 md:justify-start"
      >
        <Image
          className="mx-2 rounded-full"
          src="/icon.png"
          alt="OchreFox"
          width="30"
          height="30"
        />
        <Image
          src="/ochrefox-logo-white.svg"
          alt="Logo"
          className="mt-1 mr-2"
          width="90"
          height="30"
        />
      </a>

      <span className="flex flex-col items-center justify-center px-0 shrink-0 sm:ml-auto sm:mt-0 sm:justify-start md:px-6">
        <div className="inline-flex flex-row mt-4 space-x-4">
          <a
            href="https://www.twitch.tv/ochrefox"
            className="text-gray-300 hover:text-white"
            title="Twitch"
          >
            <IconBrandTwitch width="24" />
          </a>
          <a
            href="mailto:contact@ochrefox.net"
            className="text-gray-300 hover:text-white"
            title="Contact"
          >
            <IconMail width="24" />
          </a>
          <a
            href="https://github.com/OchreFox/flashcard-template"
            className="text-gray-300 hover:text-white"
            title="GitHub"
          >
            <IconBrandGithubFilled width="24" />
          </a>
        </div>
        <div className="flex flex-row mt-2">
          <p className="text-xs text-center text-gray-300">
            v{packageJson.version}
          </p>
        </div>
      </span>
    </footer>
  );
}
