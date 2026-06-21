import Link from "next/link";
import { createProjectAction } from "@/app/actions";

export default function NewProjectPage() {
  return (
    <>
      <div className="back-link">
        <Link href="/projects">← Project directory</Link>
      </div>
      <div className="page-header">
        <div className="page-title">New project</div>
      </div>
      <form action={createProjectAction} className="settings-section" style={{ maxWidth: 560 }}>
        <div className="field-row">
          <label className="field-label">Company name *</label>
          <input name="companyName" className="field-input" required />
        </div>
        <div className="field-row-two">
          <div>
            <label className="field-label">Type</label>
            <select name="type" className="field-select" defaultValue="sell">
              <option value="sell">Sell-side</option>
              <option value="buy">Buy-side</option>
            </select>
          </div>
          <div>
            <label className="field-label">Status</label>
            <select name="status" className="field-select" defaultValue="prospect">
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
        <div className="field-row-two">
          <div>
            <label className="field-label">Industry</label>
            <input name="industry" className="field-input" />
          </div>
          <div>
            <label className="field-label">Location</label>
            <input name="location" className="field-input" />
          </div>
        </div>
        <div className="field-row-two">
          <div>
            <label className="field-label">Contact name</label>
            <input name="contactName" className="field-input" />
          </div>
          <div>
            <label className="field-label">Contact title</label>
            <input name="contactTitle" className="field-input" />
          </div>
        </div>
        <div className="field-row-two">
          <div>
            <label className="field-label">Est. value / target size</label>
            <input name="estValue" className="field-input" />
          </div>
          <div>
            <label className="field-label">Website</label>
            <input name="website" className="field-input" />
          </div>
        </div>
        <button className="btn-navy" type="submit">
          Create project
        </button>
      </form>
    </>
  );
}
