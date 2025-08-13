import { redirect } from "next/navigation";
import { getUser } from "../../lib/actions/getUser";
import AgriculturalAIChatbot from "../../components/agricultural-ai-chatbot";

export default async function Page() {
  const { user } = await getUser();

  // Redirect to signin if user is not authenticated
  if (!user) {
    redirect("/api/auth/signin");
  }
  console.log("User authenticated:", user);

  return <AgriculturalAIChatbot />;
}
