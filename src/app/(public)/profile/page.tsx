import ProfileWorkspace from "@/app/components/ProfileWorkspace";
import { getCurrentUserProfile, getOrdersByUser } from "@/lib/db";

export const revalidate = 0;

export default async function ProfilePage() {
  const user = await getCurrentUserProfile();
  const orders = user.id === "usr-guest" ? [] : await getOrdersByUser(user.id);
  return <ProfileWorkspace user={user} orders={orders} />;
}

