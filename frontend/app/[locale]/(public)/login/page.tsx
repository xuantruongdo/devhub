import { LoginForm } from "@/components/Auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | DevHub",
  description: "Sign in to your DevHub account and connect with developers.",
};

const LoginPage = () => {
  return <LoginForm />;
};

export default LoginPage;
