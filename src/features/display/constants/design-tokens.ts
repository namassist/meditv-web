export function getPoliColor(poliLabel: string): string {
  const label = poliLabel.toLowerCase();
  if (label.includes("anak")) return "var(--meditv-poli-anak)";
  if (label.includes("kandungan") || label.includes("obgyn"))
    return "var(--meditv-poli-kandungan)";
  if (label.includes("laktasi")) return "var(--meditv-poli-laktasi)";
  if (label.includes("gizi")) return "var(--meditv-poli-gizi)";
  return "var(--meditv-poli-umum)";
}
