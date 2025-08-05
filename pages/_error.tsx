import React from "react";
import { NextPageContext } from "next";

interface ErrorProps {
  statusCode: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function Error({ statusCode, hasGetInitialPropsRun, err }: ErrorProps) {
  React.useEffect(() => {
    if (err) {
      console.error('Error page rendered with error:', err);
    }
    if (!hasGetInitialPropsRun) {
      console.warn('Error page rendered without getInitialProps');
    }
  }, [err, hasGetInitialPropsRun]);

  const getErrorMessage = () => {
    switch (statusCode) {
      case 404:
        return "This page could not be found.";
      case 500:
        return "Internal server error occurred.";
      default:
        return statusCode >= 400 && statusCode < 500
          ? "A client-side error occurred."
          : "A server-side error occurred.";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 60% 20%, #232b4d 0%, #0c0c0c 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#fff",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "rgba(30,34,54,0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "30px",
          maxWidth: "450px",
          width: "96vw",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 10px 0" }}>
          {statusCode} - Error
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", margin: "0 0 20px 0" }}>
          {getErrorMessage()}
        </p>
        
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={{
              padding: "12px 24px",
              background: "linear-gradient(45deg, #4fc3f7, #7b61ff)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </button>
          
          <button
            style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "12px",
              color: "#fff",
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && err && (
          <details style={{
            marginTop: "24px",
            textAlign: "left",
            color: "#b0b8d0",
            fontSize: "12px"
          }}>
            <summary style={{ cursor: "pointer", marginBottom: "8px", textAlign: "center" }}>
              Error Details (Development)
            </summary>
            <pre style={{
              background: "rgba(0,0,0,0.3)",
              padding: "12px",
              borderRadius: "8px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              maxHeight: "200px"
            }}>
              {err.stack || err.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  let statusCode;
  if (res) {
    statusCode = res.statusCode;
  } else if (err && (err as any).statusCode) {
    statusCode = (err as any).statusCode;
  } else {
    statusCode = 404;
  }
  
  console.log('Error.getInitialProps called with statusCode:', statusCode);
  
  return { 
    statusCode,
    hasGetInitialPropsRun: true,
    err: err || undefined
  };
};

export default Error;
