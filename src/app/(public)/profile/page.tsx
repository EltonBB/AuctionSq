import ProfileWorkspace from "@/app/components/ProfileWorkspace";
import { getBidsByUser, getCurrentUserProfile, getOrdersByUser } from "@/lib/db";

export const revalidate = 0;

export default async function ProfilePage() {
  const user = await getCurrentUserProfile();
  const orders = user.id === "usr-guest" ? [] : await getOrdersByUser(user.id);
  const bids = user.id === "usr-guest" ? [] : await getBidsByUser(user.id);
  return <ProfileWorkspace user={user} orders={orders} bids={bids} />;
}

