"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, CameraOff, RotateCcw } from "lucide-react";
import { CARDS } from "@/lib/demo/data";
import { collectCard, getCardById, useDemoState } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";
import { LANGUAGE_STYLES } from "@/lib/coasters";
import { emberBurst } from "@/components/ember-field";
import type { LanguageCode } from "@/lib/constants";
import type { Card as CardData } from "@/lib/database.types";

type ScanState =
  | { status: "idle" }
  | { status: "starting" }
  | { status: "scanning" }
  | { status: "camera_error" }
  | { status: "result"; card: CardData; alreadyCollected: boolean };

export function QrScanner() {
  const elementId = useId().replace(/:/g, "-");
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const cameraRunning = useRef(false);
  const unmounted = useRef(false);
  const [state, setState] = useState<ScanState>({ status: "idle" });
  const { collected } = useDemoState();
  const remainingCards = CARDS.filter((card) => !collected.includes(card.id));

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      if (cameraRunning.current) {
        cameraRunning.current = false;
        scannerRef.current?.stop().catch(() => {});
      }
    };
  }, []);

  // Waits for a tap, so visitors aren't asked for camera access just for
  // opening this tab.
  async function startCamera() {
    setState({ status: "starting" });

    const { Html5Qrcode } = await import("html5-qrcode");
    if (unmounted.current || !containerRef.current) return;

    const scanner = scannerRef.current ?? new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => handleDecoded(decodedText),
        undefined
      );
      if (unmounted.current) {
        scanner.stop().catch(() => {});
        return;
      }
      cameraRunning.current = true;
      setState({ status: "scanning" });
    } catch {
      if (!unmounted.current) setState({ status: "camera_error" });
    }
  }

  function handleDecoded(decodedText: string) {
    // Ignore further reads until the visitor chooses to scan again: a raw video
    // feed fires onScanSuccess many times per second.
    if (cameraRunning.current) {
      try {
        scannerRef.current?.pause(true);
      } catch {
        // already paused
      }
    }

    const code = decodedText.trim().toUpperCase();
    const card = getCardById(code);
    if (!card) {
      toast.error(`"${code}" isn't a Tongs & Tongues coaster.`);
      resumeScanning();
      return;
    }

    const result = collectCard(card.id);

    if (result === "already_collected") {
      toast.info(`Already collected: ${card.word} (${card.item_name})`);
    } else {
      toast.success(`Collected! ${card.word} — ${card.item_name}`);
      emberBurst(45);
    }

    setState({
      status: "result",
      card,
      alreadyCollected: result === "already_collected",
    });
  }

  function resumeScanning() {
    if (cameraRunning.current) {
      setState({ status: "scanning" });
      scannerRef.current?.resume();
    } else {
      setState({ status: "idle" });
    }
  }

  const revealStyle =
    state.status === "result"
      ? LANGUAGE_STYLES[state.card.language_code as LanguageCode]
      : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="sticker-border relative aspect-square w-full max-w-sm overflow-hidden rounded-[28px] bg-weber-black">
        <div id={elementId} ref={containerRef} className="size-full [&_video]:size-full [&_video]:object-cover" />

        {state.status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-weber-black p-6 text-center text-weber-cream">
            <Camera className="size-8" />
            <p className="text-sm text-weber-cream/70">
              Your camera is only used to read the QR code.
            </p>
            <Button
              onClick={startCamera}
              className="btn-sticker h-12 rounded-2xl bg-primary px-5 font-heading uppercase tracking-wide text-primary-foreground"
            >
              Start Camera
            </Button>
          </div>
        )}

        {state.status === "scanning" && (
          <>
            <svg
              viewBox="0 0 120 120"
              className="pointer-events-none absolute inset-0 m-auto size-28 opacity-80"
              aria-hidden
            >
              <path d="M6 30V12a6 6 0 0 1 6-6h18" stroke="var(--weber-ember-start)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M114 30V12a6 6 0 0 0-6-6H90" stroke="var(--weber-ember-start)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M6 90v18a6 6 0 0 0 6 6h18" stroke="var(--weber-ember-start)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M114 90v18a6 6 0 0 1-6 6H90" stroke="var(--weber-ember-start)" strokeWidth="5" fill="none" strokeLinecap="round" />
            </svg>
            <div
              className="animate-scanline pointer-events-none absolute inset-x-6 top-6 h-[3px] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--weber-ember-start), transparent)",
                boxShadow: "0 0 12px oklch(0.72 0.19 45 / 80%)",
              }}
            />
          </>
        )}

        {state.status === "camera_error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-weber-black p-6 text-center text-weber-cream">
            <CameraOff className="size-8" />
            <p className="font-heading uppercase tracking-wide">
              Camera unavailable
            </p>
            <p className="text-sm text-weber-cream/70">
              Allow camera access in your browser settings and reload this page,
              or try a sample scan below.
            </p>
          </div>
        )}

        {state.status === "result" && revealStyle && (
          <div className="absolute inset-0 flex items-center justify-center bg-weber-black/90 p-6">
            <div className="animate-coaster-drop coaster-shape coaster-frame sticker-border relative w-full max-w-[240px] overflow-hidden bg-card text-center">
              {state.card.image_url && (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={state.card.image_url}
                    alt={state.card.item_name}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                </div>
              )}
              <div className="flex flex-col items-center gap-1 p-3">
                <span
                  className="rounded-full px-2 py-0.5 font-heading text-[10px] font-semibold text-weber-black"
                  style={{ background: revealStyle.badgeBg }}
                >
                  {state.card.language}
                </span>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {state.card.word}
                </p>
                <p className="text-xs italic text-muted-foreground">
                  {state.card.phonetic}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {state.status === "result" ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            {state.alreadyCollected ? (
              "Already in your collection"
            ) : (
              <>
                You unlocked <strong className="text-foreground">{state.card.item_name}</strong> in{" "}
                <strong className="text-foreground">{state.card.language}</strong>
              </>
            )}
          </p>
          <Button
            onClick={resumeScanning}
            variant="secondary"
            className="btn-sticker h-12 w-full rounded-2xl font-heading uppercase tracking-wide"
          >
            <RotateCcw className="size-4" />
            Scan Next Coaster
          </Button>
        </div>
      ) : (
        <section className="sticker-border flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-card p-4">
          <h2 className="font-heading text-[13px] uppercase tracking-wide text-foreground">
            No coaster handy?
          </h2>
          {remainingCards.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground">
                Tap one to try a sample scan.
              </p>
              <div className="flex flex-col gap-2">
                {remainingCards.map((card) => (
                  <Button
                    key={card.id}
                    variant="outline"
                    disabled={state.status === "starting"}
                    onClick={() => handleDecoded(card.id)}
                    className="h-11 justify-between rounded-xl text-[13px] font-semibold"
                  >
                    {card.item_name}
                    <span className="text-[11px] text-muted-foreground">
                      {card.language}
                    </span>
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              You&apos;ve collected all 9 coasters. You can start over from the
              About page.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
