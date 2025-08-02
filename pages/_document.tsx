import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tags for better error handling */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#232b4d" />
        
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        
        {/* Error handling script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                console.error('Global error caught:', e.error);
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                console.error('Unhandled promise rejection:', e.reason);
              });
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        
        {/* Fallback error display - Raw HTML for maximum compatibility */}
        <div 
          id="error-fallback" 
          style={{ display: 'none' }}
          dangerouslySetInnerHTML={{
            __html: `
              <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #232b4d;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                font-family: system-ui, sans-serif;
                z-index: 9999;
              ">
                <h1>Something went wrong</h1>
                <p>Please refresh the page to continue.</p>
                <button 
                  onclick="window.location.reload()"
                  style="
                    padding: 12px 24px;
                    background-color: #7b61ff;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                  "
                >
                  Refresh Page
                </button>
              </div>
            `
          }}
        />
      </body>
    </Html>
  )
}