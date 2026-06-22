"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="empty-state" style={{ margin: 40 }}>
      <h3 style={{ marginBottom: 8 }}>Something went wrong</h3>
      <p style={{ marginBottom: 16 }}>{error.message || "Unexpected error."}</p>
      <button className="btn-navy" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
