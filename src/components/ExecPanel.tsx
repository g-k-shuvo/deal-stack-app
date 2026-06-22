"use client";
import { useState } from "react";
import Link from "next/link";
import {
  runSkillAction,
  reviseAction,
  saveOutputAction,
  markStepCompleteAction,
} from "@/app/actions";
import type { InputField } from "@/lib/skills/types";

interface AutoItem {
  label: string;
  value: string;
}
interface Output {
  runId: string;
  versionNo: number;
  previewMd: string;
  versions: number[];
}
interface Props {
  projectId: string;
  skillKey: string;
  skillName: string;
  format: string;
  step: number;
  total: number;
  inputs: InputField[];
  initialInputs: Record<string, string>;
  autoContext: AutoItem[];
  missing: string[];
  initial: Output | null;
  nextHref: string | null;
  nextName: string | null;
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}

export function ExecPanel(props: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>(props.initialInputs);
  const [out, setOut] = useState<Output | null>(props.initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rev, setRev] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function generate() {
    setBusy(true);
    setErr(null);
    setSaved(null);
    try {
      const r = await runSkillAction(props.projectId, props.skillKey, inputs);
      setOut({
        runId: r.runId,
        versionNo: r.versionNo,
        previewMd: r.previewMd,
        versions: [...(out?.versions ?? []), r.versionNo],
      });
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function revise() {
    if (!out || !rev.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await reviseAction(out.runId, rev);
      setOut({
        ...out,
        versionNo: r.versionNo,
        previewMd: r.previewMd,
        versions: [...out.versions, r.versionNo],
      });
      setRev("");
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!out) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await saveOutputAction(out.runId, out.versionNo);
      setSaved(r.filename);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    if (!out) return;
    setBusy(true);
    setErr(null);
    try {
      await markStepCompleteAction(out.runId, out.versionNo);
      setDone(true);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="exec-layout">
      <div className="exec-left">
        <div className="exec-panel-title">{props.skillName}</div>
        <div className="exec-panel-sub">
          Step {props.step} of {props.total} · Output: {props.format.toUpperCase()}
        </div>
        <div className="ctx-strip">
          {props.autoContext.map((a) => (
            <div className="ctx-strip-row" key={a.label}>
              <span className="auto-tag">auto</span>
              <span style={{ color: "var(--text-secondary)" }}>{a.label}:</span>
              <span>{a.value}</span>
            </div>
          ))}
        </div>
        {props.inputs.map((f) => (
          <div className="form-group" key={f.name}>
            <label className="form-label">{f.label}</label>
            <Field
              field={f}
              value={inputs[f.name] ?? ""}
              onChange={(v) => setInputs({ ...inputs, [f.name]: v })}
            />
          </div>
        ))}
        <button className="btn-navy btn-full" disabled={busy} onClick={generate}>
          {busy ? "Generating…" : out ? "Regenerate" : `Generate ${props.skillName}`}
        </button>
        {err && <div style={{ color: "#b83232", fontSize: 12, marginTop: 8 }}>{err}</div>}
      </div>

      <div className="exec-mid">
        {props.missing.length > 0 && (
          <div className="flash" style={{ background: "#faeeda", color: "#633806" }}>
            Missing prior deliverables: {props.missing.join(", ")}. Generated using available
            context.
          </div>
        )}
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14 }}>
          {out ? `Output · Version ${out.versionNo}` : "No output yet — fill inputs and Generate."}
        </div>
        {out && (
          <div className="output-block">
            <div className="output-preview">{out.previewMd}</div>
          </div>
        )}
        {out && (
          <div className="revision-bar">
            <input
              placeholder="Request a revision — e.g. 'Expand the financial summary'"
              value={rev}
              onChange={(e) => setRev(e.target.value)}
            />
            <button className="btn-navy" disabled={busy} onClick={revise}>
              Send
            </button>
          </div>
        )}
      </div>

      <div className="exec-right">
        <div className="save-section">
          <div className="save-label">Save output</div>
          <button className="btn-gold btn-full" disabled={!out || busy} onClick={save}>
            Save to library
          </button>
          <a
            className="btn-outline btn-full"
            href={out ? `/api/download/${out.runId}/${out.versionNo}` : undefined}
            style={{ pointerEvents: out ? "auto" : "none", opacity: out ? 1 : 0.5 }}
          >
            Download {props.format.toUpperCase()}
          </a>
          <button className="btn-outline btn-full" disabled={!out || busy} onClick={complete}>
            {done ? "Step completed ✓" : "Mark step complete"}
          </button>
          {saved && <div className="flash">Saved: {saved}</div>}
        </div>
        <div className="save-section">
          <div className="save-label">Versions</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {out ? out.versions.join(", ") : "—"}
          </div>
        </div>
        {props.nextHref && (
          <div className="save-section" style={{ borderBottom: "none" }}>
            <div className="save-label">Next step</div>
            <Link className="btn-navy btn-full" href={props.nextHref}>
              {props.nextName}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: InputField;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        className="form-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select className="form-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {(field.options ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  return <input className="form-input" value={value} onChange={(e) => onChange(e.target.value)} />;
}
