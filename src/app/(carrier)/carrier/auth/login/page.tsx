import { redirect } from "next/navigation";

export default function CarrierAuthLoginRedirect() {
  redirect("/login?next=/carrier");
}
