import { notFound } from "next/navigation";
import { LANGUAGE_INFO, LANGUAGE_ORDER, languageSlugToCode } from "@/lib/constants";
import { LanguageDetail } from "@/components/language-detail";

export function generateStaticParams() {
  return LANGUAGE_ORDER.map((code) => ({ language: LANGUAGE_INFO[code].slug }));
}

export default async function LanguageDetailPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const code = languageSlugToCode(language);

  if (!code) {
    notFound();
  }

  return <LanguageDetail code={code} />;
}
