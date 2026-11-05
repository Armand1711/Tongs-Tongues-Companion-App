import { CHALLENGE } from "@/lib/demo/data";
import { NewEntryForm } from "@/components/new-entry-form";
import { PageHeader } from "@/components/page-header";

export default function NewEntryPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-10">
      <PageHeader title="Your Entry" back={{ href: "/feed", label: "Challenge" }} />

      <p className="sticker-border inline-block w-fit rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
        🔥 {CHALLENGE.theme}
      </p>

      <NewEntryForm />
    </div>
  );
}
