import type { Metadata } from "next";
import { RegisterForm } from "@/components/Auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign up | DevHub",
  description:
    "Create your DevHub account and start connecting with developers.",
};

const RegisterPage = () => {
  return <RegisterForm />;
};

export default RegisterPage;
