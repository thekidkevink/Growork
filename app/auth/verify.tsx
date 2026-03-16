import { Redirect } from "expo-router";
import { signupRoutes } from "@/src/features/auth/services/signupFlow";

export default function VerifyScreen() {
  return <Redirect href={signupRoutes.success} />;
}
