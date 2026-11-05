"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { resetDemo } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";

export function ResetDemoButton() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        resetDemo();
        toast.success("Demo reset.");
      }}
      className="w-full rounded-xl font-heading text-xs font-bold uppercase tracking-wide"
    >
      <RotateCcw className="size-4" />
      Reset Demo
    </Button>
  );
}
