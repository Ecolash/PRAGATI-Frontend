import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/getUser";
import QRScannerPage from "./qr-scanner-page";

export default async function Page() {
  const { user } = await getUser();

  // Redirect to signin if user is not authenticated
  if (!user) {
    redirect("/signin");
  }

  return <QRScannerPage />;
}
