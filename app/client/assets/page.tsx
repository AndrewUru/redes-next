import { notFound } from "next/navigation";
import { getClientIdForCurrentUser } from "@/lib/auth";
import { AssetsManager } from "@/components/client/assets-manager";

export default async function ClientAssetsPage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();
  return <AssetsManager clientId={clientId} />;
}
