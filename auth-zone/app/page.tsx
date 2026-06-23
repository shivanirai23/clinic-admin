import { redirect } from "next/navigation";

/** Auth zone has no dashboard — send direct visitors to login. */
export default function AuthZoneHomePage() {
  redirect("/login");
}
