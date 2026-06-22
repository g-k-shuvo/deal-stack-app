import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepo } from "@/lib/data";
import { updateProjectAction } from "@/app/actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepo();
  const p = await repo.getProject(id);
  if (!p) notFound();

  return (
    <>
      <div className="back-link">
        <Link href={`/projects/${id}`}>← Back to project</Link>
      </div>
      <div className="page-header">
        <div className="page-title">Edit project</div>
      </div>
      <form action={updateProjectAction} className="settings-section" style={{ maxWidth: 600 }}>
        <input type="hidden" name="id" value={p.id} />
        <div className="field-row">
          <label className="field-label">Company name</label>
          <input name="companyName" className="field-input" defaultValue={p.companyName} required />
        </div>
        <div className="field-row-two">
          <div>
            <label className="field-label">Status</label>
            <select name="status" className="field-select" defaultValue={p.status}>
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="onhold">On hold</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="field-label">Industry</label>
            <input name="industry" className="field-input" defaultValue={p.industry ?? ""} />
          </div>
        </div>
        <div className="field-row-two">
          <div>
            <label className="field-label">Location</label>
            <input name="location" className="field-input" defaultValue={p.location ?? ""} />
          </div>
          <div>
            <label className="field-label">Website</label>
            <input name="website" className="field-input" defaultValue={p.website ?? ""} />
          </div>
        </div>
        <div className="field-row-two">
          <div>
            <label className="field-label">Est. value</label>
            <input name="estValue" className="field-input" defaultValue={p.estValue ?? ""} />
          </div>
          <div>
            <label className="field-label">EBITDA</label>
            <input name="ebitda" className="field-input" defaultValue={p.ebitda ?? ""} />
          </div>
        </div>
        <div className="field-row-two">
          <div>
            <label className="field-label">Multiple</label>
            <input name="multiple" className="field-input" defaultValue={p.multiple ?? ""} />
          </div>
          <div>
            <label className="field-label">Structure</label>
            <input name="structure" className="field-input" defaultValue={p.structure ?? ""} />
          </div>
        </div>
        <div className="field-row-two">
          <div>
            <label className="field-label">Contact name</label>
            <input name="contactName" className="field-input" defaultValue={p.contactName ?? ""} />
          </div>
          <div>
            <label className="field-label">Contact title</label>
            <input name="contactTitle" className="field-input" defaultValue={p.contactTitle ?? ""} />
          </div>
        </div>
        <div className="field-row">
          <label className="field-label">Contact phone</label>
          <input name="contactPhone" className="field-input" defaultValue={p.contactPhone ?? ""} />
        </div>
        <button className="btn-navy" type="submit">
          Save changes
        </button>
      </form>
    </>
  );
}
