import { redirect } from "next/navigation";

export default function HomePage() {
  // Langsung redirect ke login
  redirect("/login");
}
