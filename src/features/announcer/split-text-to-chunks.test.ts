import { describe, expect, it } from "vitest";
import { splitTextToChunks } from "./split-text-to-chunks";

describe("splitTextToChunks", () => {
  it("returns single chunk for short text", () => {
    expect(splitTextToChunks("Nomor antrian A001")).toEqual([
      "Nomor antrian A001",
    ]);
  });

  it("splits at sentence boundaries", () => {
    const text =
      "Antrian nomor A012, dr. Siti. Silakan menuju ke ruang pemeriksaan. Terima kasih.";
    const chunks = splitTextToChunks(text, 50);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(50);
    }
  });

  it("hard splits when single sentence exceeds maxLen", () => {
    const text = "A".repeat(250);
    const chunks = splitTextToChunks(text, 200);
    expect(chunks.length).toBe(2);
    expect(chunks[0].length).toBe(200);
    expect(chunks[1].length).toBe(50);
  });

  it("returns empty array for empty string", () => {
    expect(splitTextToChunks("")).toEqual([]);
  });

  it("handles comma-separated phrases", () => {
    const text =
      "Antrian nomor A012, dr. Siti, silakan menuju ke ruang pemeriksaan.";
    const chunks = splitTextToChunks(text, 40);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(40);
    }
    expect(chunks.join(" ").replace(/\s+/g, " ").trim()).toContain("Antrian");
  });
});
