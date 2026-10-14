import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-[80dvh] place-items-center">
      <LoginForm />
    </div>
  );
}
