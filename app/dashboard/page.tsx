import { redirect } from "next/navigation";
import { getUser } from "../../lib/actions/getUser";
import AgriculturalAIChatbot from "../../components/agricultural-ai-chatbot";
import { APIHealthCheck } from "../../components/api-health-check";

export default async function Page() {
  const { user } = await getUser();

  // Redirect to signin if user is not authenticated
  if (!user) {
    redirect("/api/auth/signin");
  }
  console.log("User authenticated:", user);

  return (
    <div className="h-screen flex flex-col">
      <APIHealthCheck />
      <div className="flex-1">
        <AgriculturalAIChatbot />
      </div>
    </div>
  );
}
