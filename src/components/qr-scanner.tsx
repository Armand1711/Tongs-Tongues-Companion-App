"use client";

import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { CameraOff, CheckCircle2, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { collectCard, getCardById } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import type { Card as CardData } from "@/lib/database.types";

type ScanState =
  | { status: "scanning" }
  | { status: "starting" }
  | { status: "camera_error" }
  | { status: "result"; card: CardData; alreadyCollected: boolean };

export function QrScanner() {
  const elementId = useId().replace(/:/g, "-");
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [state, setState] = useState<ScanState>({ status: "starting" });

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled || !containerRef.current) return;

      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => handleDecoded(decodedText),
          undefined
        );
        if (!cancelled) setState({ status: "scanning" });
      } catch {
        if (!cancelled) setState({ status: "camera_error" });
      }
    }

    start();

    return () => {
      cancelled = true;
      scannerRef.current?.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId]);

  async function handleDecoded(decodedText: string) {
    const scanner = scannerRef.current;
    if (!scanner) return;

    // Ignore further reads until this one resolves and the user chooses
    // to scan again — a raw video feed fires onScanSuccess many times/sec.
    try {
      await scanner.pause(true);
    } catch {
      // already paused/stopped
    }

    const code = decodedText.trim().toUpperCase();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Session not ready yet — try again in a moment.");
      resumeScanning();
      return;
    }

    const card = await getCardById(supabase, code);
    if (!card) {
      toast.error(`"${code}" isn't a Tongs & Tongues card.`);
      resumeScanning();
      return;
    }

    const result = await collectCard(supabase, user.id, code);

    if (result.status === "already_collected") {
      toast.info(`Already collected: ${card.word} (${card.item_name})`);
    } else if (result.status === "collected") {
      toast.success(`Collected! ${card.word} — ${card.item_name}`);
    }

    setState({
      status: "result",
      card,
      alreadyCollected: result.status === "already_collected",
    });
  }

  function resumeScanning() {
    const scanner = scannerRef.current;
    if (!scanner) return;
    setState({ status: "scanning" });
    scanner.resume();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-black">
        <div id={elementId} ref={containerRef} className="w-full" />

        {state.status === "camera_error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-weber-black p-6 text-center text-weber-cream">
            <CameraOff className="size-8" />
            <p className="font-heading uppercase tracking-wide">
              Camera unavailable
            </p>
            <p className="text-sm text-weber-cream/70">
              Allow camera access in your browser settings, then reload this
              page.
            </p>
          </div>
        )}

        {state.status === "result" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-weber-black/95 p-6 text-center text-weber-cream">
            <CheckCircle2 className="size-10 text-primary" />
            <div>
              <p className="font-heading text-2xl uppercase tracking-wide">
                {state.card.word}
              </p>
              <p className="text-sm text-weber-cream/70">
                {state.card.item_name} · {state.card.language}
              </p>
              <p className="mt-1 text-xs italic text-weber-cream/60">
                {state.card.phonetic}
              </p>
            </div>
            {state.alreadyCollected && (
              <p className="text-xs uppercase tracking-wide text-weber-cream/60">
                Already in your collection
              </p>
            )}
            <Button
              onClick={resumeScanning}
              className="mt-2 rounded-xl font-heading uppercase tracking-wide"
            >
              <RotateCcw className="size-4" />
              Scan Next Card
            </Button>
          </div>
        )}
      </div>

      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Point your camera at the QR code on a Weber card to collect it
        automatically.
      </p>
    </div>
  );
}
