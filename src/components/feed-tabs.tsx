"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FeedWindow } from "@/lib/supabase/queries";

const TAB_LABELS: Record<FeedWindow, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  all: "All Time",
};

export function FeedTabs({ active }: { active: FeedWindow }) {
  const router = useRouter();

  return (
    <Tabs
      value={active}
      onValueChange={(value) => router.push(`/feed?window=${value}`)}
    >
      <TabsList className="h-10 w-full">
        {Object.entries(TAB_LABELS).map(([value, label]) => (
          <TabsTrigger key={value} value={value} className="text-xs">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
