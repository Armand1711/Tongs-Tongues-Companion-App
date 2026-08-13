import { LoginForm } from "@/components/login-form";
import { PageHeader } from "@/components/page-header";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader
        title="Log In"
        subtitle="Sign back in to pick up your collection on this device."
        back={{ href: "/account", label: "Account" }}
      />

      <div className="sticker-border rounded-2xl bg-card p-5">
        <LoginForm />
      </div>
    </div>
  );
}
