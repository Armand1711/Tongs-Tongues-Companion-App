import { SignupForm } from "@/components/signup-form";
import { PageHeader } from "@/components/page-header";

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader
        title="Create Account"
        subtitle="Save your coasters and entries so they follow you across devices."
        back={{ href: "/account", label: "Account" }}
      />

      <div className="sticker-border rounded-2xl bg-card p-5">
        <SignupForm />
      </div>
    </div>
  );
}
