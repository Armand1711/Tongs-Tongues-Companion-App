// `next build` exports prefetch data in nested folders, such as
// feed/__next.feed/__PAGE__.txt, but the browser requests a flat name, such as
// feed/__next.feed.__PAGE__.txt. On a static host, those requests return 404s
// and in-app navigation falls back to full page loads. This copies each file to
// the name the browser asks for.

import { cp, readdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "out");

const entries = await readdir(OUT_DIR, { recursive: true, withFileTypes: true });
const files = entries.filter((entry) => {
  if (!entry.isFile()) return false;
  return path.join(entry.parentPath, entry.name).includes(`${path.sep}__next.`);
});

let copied = 0;
for (const file of files) {
  const source = path.join(file.parentPath, file.name);
  const parts = path.relative(OUT_DIR, source).split(path.sep);
  const rootIndex = parts.findIndex((part) => part.startsWith("__next."));

  // Already flat, such as feed/__next.feed.txt
  if (rootIndex === parts.length - 1) continue;

  const flatName = parts.slice(rootIndex).join(".");
  await cp(source, path.join(OUT_DIR, ...parts.slice(0, rootIndex), flatName));
  copied += 1;
}

console.log(`Flattened ${copied} prefetch files.`);
