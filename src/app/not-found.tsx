import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-state" style={{ margin: 40 }}>
      <h3 style={{ marginBottom: 8 }}>Not found</h3>
      <p style={{ marginBottom: 16 }}>That page or record doesn&apos;t exist.</p>
      <Link className="link" href="/">
        Back to dashboard
      </Link>
    </div>
  );
}
