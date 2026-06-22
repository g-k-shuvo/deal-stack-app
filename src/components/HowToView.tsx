"use client";
import { useState } from "react";
import { skillsByTrack } from "@/lib/skills/registry";

interface Row {
  n: string;
  title: string;
  learn: string;
  ghl?: boolean;
}
const CATEGORIES = [
  "Getting started",
  "Sell-side skills",
  "Buy-side skills",
  "Walkthroughs",
  "Tips & best practices",
];

function rowsFor(cat: string): Row[] {
  if (cat === "Getting started") {
    return [
      {
        n: "1",
        title: "Platform overview",
        learn: "Tour of all screens and how each section connects to the deal workflow.",
      },
      {
        n: "2",
        title: "API key setup",
        learn:
          "Create an Anthropic account, generate your Claude API key, and connect it in Settings.",
      },
      {
        n: "3",
        title: "Your first project",
        learn: "Create a project, enter client context, and run your first skill end to end.",
      },
      {
        n: "4",
        title: "Document library",
        learn: "Saving, organizing, downloading, and managing AI outputs across projects.",
      },
    ];
  }
  if (cat === "Sell-side skills") {
    return skillsByTrack("sell").map((s) => ({
      n: String(s.step),
      title: s.name,
      learn: s.description,
      ghl: s.key === "sell.cim",
    }));
  }
  if (cat === "Buy-side skills") {
    return skillsByTrack("buy").map((s) => ({
      n: String(s.step),
      title: s.name,
      learn: s.description,
    }));
  }
  if (cat === "Tips & best practices") {
    return [
      {
        n: "1",
        title: "Better inputs",
        learn: "Craft higher-quality context and instructions to improve output quality.",
      },
      {
        n: "2",
        title: "The revision loop",
        learn: "Use the revision bar to refine drafts without re-running the full skill.",
      },
      {
        n: "3",
        title: "Junior associate standard",
        learn: "Review AI outputs with a senior advisor's eye before sending.",
      },
    ];
  }
  return [];
}

export function HowToView() {
  const [cat, setCat] = useState(CATEGORIES[0]!);
  const rows = rowsFor(cat);
  return (
    <>
      <div className="page-header">
        <div className="page-title">How-to videos</div>
        <div className="page-sub">
          Tutorial library — videos hosted in the GoHighLevel course platform.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 22 }}>
        <div className="settings-nav">
          {CATEGORIES.map((c) => (
            <div
              key={c}
              className={`sn-item${cat === c ? " active" : ""}`}
              onClick={() => setCat(c)}
            >
              {c}
            </div>
          ))}
        </div>
        <div className="card">
          <div className="col-header" style={{ marginBottom: 8 }}>
            {cat} ({rows.length})
          </div>
          {rows.length === 0 ? (
            <div className="empty-state" style={{ border: "none" }}>
              No videos in this section yet.
            </div>
          ) : (
            <table className="data-table" style={{ border: "none" }}>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "25%" }}>Title</th>
                  <th style={{ width: "55%" }}>What you&apos;ll learn</th>
                  <th style={{ width: "15%" }}>Link</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.n + r.title}>
                    <td style={{ color: "var(--text-tertiary)" }}>{r.n}</td>
                    <td>{r.title}</td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.learn}</td>
                    <td>
                      {r.ghl ? (
                        <span className="link">↗ Open in GHL</span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                          Link pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
