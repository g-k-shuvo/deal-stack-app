import { signInAction } from "./actions";

export default function LoginPage() {
  return (
    <div style={{ maxWidth: 360, margin: "60px auto" }}>
      <div className="settings-section">
        <h3>Sign in</h3>
        <form action={signInAction}>
          <div className="field-row">
            <label className="field-label">Email</label>
            <input name="email" type="email" className="field-input" required />
          </div>
          <div className="field-row">
            <label className="field-label">Password</label>
            <input name="password" type="password" className="field-input" required />
          </div>
          <button className="btn-navy" type="submit">
            Sign in
          </button>
        </form>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 12 }}>
          Authentication is active only when USE_SUPABASE_AUTH=1.
        </p>
      </div>
    </div>
  );
}
