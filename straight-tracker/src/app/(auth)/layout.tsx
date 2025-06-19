import { getUserSession } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const response = await getUserSession();
  // console.log("AuthLayout response:", response);
  if(response?.user) {
    redirect("/");
  }
  return <>{children}</>;
}
