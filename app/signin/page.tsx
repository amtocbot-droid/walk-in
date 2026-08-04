import { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
          Loading…
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
