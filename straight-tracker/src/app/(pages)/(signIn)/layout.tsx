import { getUserSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import "@/src/app/styles/General.css"
import "@/src/app/styles/Header.css"
import "@/src/app/styles/Select.css"
import "@/src/app/styles/Signin.css"
import "@/src/app/styles/Signup.css"
import "@/src/app/styles/History.css"
import "@/src/app/styles/Tracker.css"
import "@/src/app/styles/S-Tracker.css"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const response = await getUserSession();
  if(!response?.user) {
    redirect("/");
  }
  return <>{children}</>;
}
