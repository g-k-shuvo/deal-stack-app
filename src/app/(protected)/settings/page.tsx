import { getRepo } from "@/lib/data";
import { SettingsView } from "@/components/SettingsView";

export default async function SettingsPage() {
  const repo = getRepo();
  const [firm, user, docs, notifications, styleExamples] = await Promise.all([
    repo.getFirm(),
    repo.getUser(),
    repo.listDocuments(),
    repo.getNotifications(),
    repo.listStyleExamples(),
  ]);
  const used = docs.reduce((n, d) => n + d.sizeBytes, 0);
  return (
    <SettingsView
      firm={{
        name: firm.name,
        website: firm.website ?? "",
        address: firm.address ?? "",
        marketFocus: firm.marketFocus ?? "",
        industrySpecializations: firm.industrySpecializations ?? "",
        description: firm.description ?? "",
        advisorBio: firm.advisorBio ?? "",
        aiInstructions: firm.aiInstructions ?? "",
      }}
      defaults={firm.defaults}
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? "",
        title: user.title ?? "",
        yearsExperience: user.yearsExperience ?? "",
      }}
      hasKey={!!firm.apiKeyEncrypted}
      verified={firm.apiKeyVerified}
      storageUsed={used}
      storageLimit={firm.storageLimitBytes}
      notifications={notifications}
      styleExampleKeys={styleExamples.map((s) => s.skillKey)}
    />
  );
}
