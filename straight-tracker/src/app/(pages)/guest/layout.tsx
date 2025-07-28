import "@/src/app/styles/General.css"
import "@/src/app/styles/Header.css"
import "@/src/app/styles/Guest.css"
import "@/src/app/styles/Select.css"
import "@/src/app/styles/History.css"
import "@/src/app/styles/Tracker.css"

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}