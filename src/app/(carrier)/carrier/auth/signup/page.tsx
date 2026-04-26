import { redirect } from "next/navigation";

export default function CarrierAuthSignupRedirect() {
  redirect("/carrier/signup");
}
