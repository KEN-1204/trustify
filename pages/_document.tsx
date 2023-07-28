import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      {/* <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicons/Trustify_Logo_icon_bg-white@0.5x.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicons/Trustify_Logo_icon_bg-white@0.5x.png" />
      <link rel="manifest" href="/favicons/site.webmanifest" />
      <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#000000" /> */}
      <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#fff" />
      <meta name="msapplication-TileColor" content="#fff" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="shortcut icon" href="/favicons/favicon.ico" />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
