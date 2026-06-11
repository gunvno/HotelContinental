import { PolicyContent } from "@/components/policy/policy-content";

export default async function PolicyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <PolicyContent code={code} />;
}
