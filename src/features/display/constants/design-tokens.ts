const POLI_COLORS: Record<string, string> = {
  anak: "#d22c63",
  kandungan: "#1a757e",
  obgyn: "#1a757e",
  laktasi: "#eb6d13",
  gizi: "#2b9658",
  umum: "#6839c5",
};

export function getPoliColor(poliLabel: string): string {
  const label = poliLabel.toLowerCase();
  for (const [key, color] of Object.entries(POLI_COLORS)) {
    if (label.includes(key)) return color;
  }
  return POLI_COLORS.umum;
}
