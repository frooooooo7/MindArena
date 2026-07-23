import { redirect } from "next/navigation";

export default async function UserProfileRoute({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  redirect(`/account/${encodeURIComponent(username)}`);
}
