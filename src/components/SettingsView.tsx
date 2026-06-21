"use client";
import { useState } from "react";
import {
  updateFirmAction,
  updateAiInstructionsAction,
  setApiKeyAction,
  verifyKeyAction,
  updateProfileAction,
  updateDefaultsAction,
  setNotificationAction,
  addStyleExampleAction,
  resetWorkspaceAction,
} from "@/app/actions";
import { skillsByTrack } from "@/lib/skills/registry";

interface FirmProps {
  name: string;
  website: string;
  address: string;
  marketFocus: string;
  industrySpecializations: string;
  description: string;
  advisorBio: string;
  aiInstructions: string;
}
interface UserProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  yearsExperience: string;
}
interface Props {
  firm: FirmProps;
  defaults: Record<string, string>;
  user: UserProps;
  hasKey: boolean;
  verified: boolean;
  storageUsed: number;
  storageLimit: number;
  notifications: { key: string; enabled: boolean }[];
  styleExampleKeys: string[];
}

const NAV: { group: string; items: [string, string][] }[] = [
  { group: "Account", items: [["profile", "Profile"], ["firm", "Firm profile"], ["apikey", "Claude API key"], ["membership", "Membership"]] },
  { group: "Preferences", items: [["ai", "AI instructions"], ["defaults", "Defaults"], ["notifications", "Notifications"]] },
  { group: "Data", items: [["storage", "Storage"], ["security", "Security"]] },
];
const NOTIF_LABEL: Record<string, string> = {
  skill_run_completion: "Skill run completion",
  new_updated_skills: "New or updated skills",
  storage_warnings: "Storage warnings",
  api_key_issues: "API key issues",
};

function gb(bytes: number): string {
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function SettingsView(props: Props) {
  const [section, setSection] = useState("profile");
  const [aiLen, setAiLen] = useState(props.firm.aiInstructions.length);
  const [notifs, setNotifs] = useState(props.notifications);
  const usedPct = Math.round((props.storageUsed / props.storageLimit) * 100);
  const exampleSet = new Set(props.styleExampleKeys);
  const allSkills = [...skillsByTrack("sell"), ...skillsByTrack("buy")];

  async function toggle(key: string) {
    const next = notifs.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n));
    setNotifs(next);
    await setNotificationAction(key, next.find((n) => n.key === key)!.enabled);
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Settings</div>
      </div>
      <div className="settings-layout">
        <div className="settings-nav">
          {NAV.map((g) => (
            <div key={g.group}>
              <div className="nav-label" style={{ padding: "8px 14px 4px" }}>
                {g.group}
              </div>
              {g.items.map(([key, label]) => (
                <div key={key} className={`sn-item${section === key ? " active" : ""}`} onClick={() => setSection(key)}>
                  {label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div>
          {section === "profile" && (
            <form action={updateProfileAction} className="settings-section">
              <h3>Profile</h3>
              <div className="field-row-two">
                <div>
                  <label className="field-label">First name</label>
                  <input name="firstName" className="field-input" defaultValue={props.user.firstName} />
                </div>
                <div>
                  <label className="field-label">Last name</label>
                  <input name="lastName" className="field-input" defaultValue={props.user.lastName} />
                </div>
              </div>
              <div className="field-row">
                <label className="field-label">Email</label>
                <input name="email" className="field-input" defaultValue={props.user.email} />
              </div>
              <div className="field-row-two">
                <div>
                  <label className="field-label">Phone</label>
                  <input name="phone" className="field-input" defaultValue={props.user.phone} />
                </div>
                <div>
                  <label className="field-label">Title</label>
                  <input name="title" className="field-input" defaultValue={props.user.title} />
                </div>
              </div>
              <div className="field-row">
                <label className="field-label">Years of experience</label>
                <input name="yearsExperience" className="field-input" defaultValue={props.user.yearsExperience} />
              </div>
              <button className="btn-navy" type="submit">
                Save changes
              </button>
            </form>
          )}

          {section === "firm" && (
            <form action={updateFirmAction} className="settings-section">
              <h3>Firm profile</h3>
              <div className="field-row">
                <label className="field-label">Firm name</label>
                <input name="name" className="field-input" defaultValue={props.firm.name} />
              </div>
              <div className="field-row-two">
                <div>
                  <label className="field-label">Website</label>
                  <input name="website" className="field-input" defaultValue={props.firm.website} />
                </div>
                <div>
                  <label className="field-label">Address</label>
                  <input name="address" className="field-input" defaultValue={props.firm.address} />
                </div>
              </div>
              <div className="field-row">
                <label className="field-label">Market focus</label>
                <input name="marketFocus" className="field-input" defaultValue={props.firm.marketFocus} />
              </div>
              <div className="field-row">
                <label className="field-label">Industry specializations</label>
                <input name="industrySpecializations" className="field-input" defaultValue={props.firm.industrySpecializations} />
              </div>
              <div className="field-row">
                <label className="field-label">Firm description (third person)</label>
                <textarea name="description" className="field-textarea" defaultValue={props.firm.description} />
              </div>
              <div className="field-row">
                <label className="field-label">Advisor bio (third person)</label>
                <textarea name="advisorBio" className="field-textarea" defaultValue={props.firm.advisorBio} />
              </div>
              <button className="btn-navy" type="submit">
                Save changes
              </button>
            </form>
          )}

          {section === "apikey" && (
            <div className="settings-section">
              <h3>Claude API key</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 18, lineHeight: 1.6 }}>
                Your key is stored encrypted and used to authenticate Claude requests. Usage costs accrue to your
                Anthropic account — not your DCC subscription.
              </p>
              {props.hasKey && (
                <div className="field-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input className="field-input" value="sk-ant-api03-•••••••••••••••••••" readOnly />
                  {props.verified ? (
                    <span className="verified-pill">✓ Verified</span>
                  ) : (
                    <span className="badge badge-onhold">Unverified</span>
                  )}
                </div>
              )}
              <form action={setApiKeyAction} style={{ marginTop: 8 }}>
                <label className="field-label">{props.hasKey ? "Update key" : "Add key"}</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input name="apiKey" className="field-input" placeholder="sk-ant-api03-..." />
                  <button className="btn-navy" type="submit">
                    Save
                  </button>
                </div>
              </form>
              {props.hasKey && (
                <form action={verifyKeyAction} style={{ marginTop: 10 }}>
                  <button className="btn-outline" type="submit">
                    {props.verified ? "Re-verify" : "Verify"}
                  </button>
                </form>
              )}
            </div>
          )}

          {section === "membership" && (
            <div className="settings-section">
              <h3>Membership</h3>
              <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Solo Advisor</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                  $297/month · 1 user · Unlimited projects · 10 GB storage · GoHighLevel CRM included
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 12 }}>
                Billing is managed externally in GoHighLevel.
              </p>
            </div>
          )}

          {section === "ai" && (
            <>
              <form action={updateAiInstructionsAction} className="settings-section">
                <h3>AI output instructions</h3>
                <div className="field-row">
                  <label className="field-label">Written instructions ({aiLen}/2000)</label>
                  <textarea
                    name="aiInstructions"
                    className="field-textarea"
                    style={{ minHeight: 120 }}
                    maxLength={2000}
                    defaultValue={props.firm.aiInstructions}
                    onChange={(e) => setAiLen(e.target.value.length)}
                  />
                </div>
                <button className="btn-navy" type="submit">
                  Save instructions
                </button>
              </form>
              <div className="settings-section">
                <h3>Document style examples</h3>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14 }}>
                  Upload a redacted sample per skill. The AI studies its structure and tone for future outputs.
                </p>
                {allSkills.map((s) => (
                  <form
                    key={s.key}
                    action={addStyleExampleAction}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}
                  >
                    <input type="hidden" name="skillKey" value={s.key} />
                    <span style={{ flex: 1, fontSize: 13 }}>{s.name}</span>
                    {exampleSet.has(s.key) ? (
                      <span className="verified-pill">✓ Example attached</span>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>No example</span>
                    )}
                    <input type="file" name="file" required style={{ fontSize: 11, width: 150 }} />
                    <button className="btn-outline" type="submit">
                      Upload
                    </button>
                  </form>
                ))}
              </div>
            </>
          )}

          {section === "defaults" && (
            <form action={updateDefaultsAction} className="settings-section">
              <h3>Defaults</h3>
              <div className="field-row-two">
                <div>
                  <label className="field-label">Default engagement type</label>
                  <select name="default_type" className="field-select" defaultValue={props.defaults.default_type ?? "sell"}>
                    <option value="sell">Sell-side</option>
                    <option value="buy">Buy-side</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Default project status</label>
                  <select name="default_status" className="field-select" defaultValue={props.defaults.default_status ?? "prospect"}>
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
              <div className="field-row-two">
                <div>
                  <label className="field-label">Success fee (%)</label>
                  <input name="success_fee" className="field-input" defaultValue={props.defaults.success_fee ?? ""} />
                </div>
                <div>
                  <label className="field-label">Retainer (monthly)</label>
                  <input name="retainer" className="field-input" defaultValue={props.defaults.retainer ?? ""} />
                </div>
              </div>
              <div className="field-row-two">
                <div>
                  <label className="field-label">Exclusivity period</label>
                  <input name="exclusivity" className="field-input" defaultValue={props.defaults.exclusivity ?? ""} />
                </div>
                <div>
                  <label className="field-label">Deal size range</label>
                  <input name="deal_size_range" className="field-input" defaultValue={props.defaults.deal_size_range ?? ""} />
                </div>
              </div>
              <button className="btn-navy" type="submit">
                Save defaults
              </button>
            </form>
          )}

          {section === "notifications" && (
            <div className="settings-section">
              <h3>Notifications</h3>
              {notifs.map((n) => (
                <div key={n.key} className="ctx-row" style={{ padding: "10px 0", alignItems: "center" }}>
                  <span>{NOTIF_LABEL[n.key] ?? n.key}</span>
                  <button
                    className={n.enabled ? "verified-pill" : "badge badge-notstarted"}
                    style={{ cursor: "pointer", border: "none" }}
                    onClick={() => toggle(n.key)}
                  >
                    {n.enabled ? "On" : "Off"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {section === "storage" && (
            <div className="settings-section">
              <h3>Storage</h3>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                <span style={{ color: "var(--text-secondary)" }}>Total used</span>
                <span style={{ fontWeight: 600 }}>
                  {gb(props.storageUsed)} / {gb(props.storageLimit)}
                </span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${usedPct}%` }} />
              </div>
            </div>
          )}

          {section === "security" && (
            <div className="settings-section">
              <h3>Security</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 18 }}>
                Password management is handled by your authentication provider (enabled with the Supabase auth
                integration).
              </p>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#b83232", marginBottom: 6 }}>Danger zone</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>
                  Reset the workspace — permanently removes all projects, documents, and AI outputs. Your GoHighLevel
                  subscription must be cancelled separately.
                </div>
                <form
                  action={resetWorkspaceAction}
                  onSubmit={(e) => {
                    if (!window.confirm("Delete ALL projects, documents, and outputs? This cannot be undone.")) {
                      e.preventDefault();
                    }
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      height: 32,
                      padding: "0 14px",
                      background: "transparent",
                      color: "#b83232",
                      border: "1px solid #b83232",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    Reset workspace
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
