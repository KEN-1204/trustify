import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        // sizes="480x480"
        href="/favicons/Trustify_Logo_icon_bg-white@0.5x.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        // sizes="48x48"
        href="/favicons/Trustify_Logo_icon_bg-white@0.5x.png"
      />
      <link rel="manifest" href="/favicons/site.webmanifest" />
      <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#000000" />
      <link rel="shortcut icon" href="/favicons/favicon.ico" />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
