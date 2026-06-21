import { getRepo } from "@/lib/data";
import { LibraryView } from "@/components/LibraryView";

export default async function LibraryPage() {
  const repo = getRepo();
  const [docs, projectList] = await Promise.all([repo.listDocuments(), repo.listProjects()]);
  const projects: Record<string, string> = Object.fromEntries(projectList.map((p) => [p.id, p.companyName]));
  return <LibraryView docs={docs} projects={projects} />;
}
