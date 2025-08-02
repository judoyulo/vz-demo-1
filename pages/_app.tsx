import type { AppProps } from "next/app";
import Head from "next/head";
import React from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    // Global error handler for unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Head>
        <title>VerseZ - Digital Self Platform</title>
        <meta name="description" content="Step into your digital self. Define it. Live it. Play it." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* 👇 Load Google's official model-viewer script */}
        <script
          type="module"
          src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        ></script>
      </Head>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
