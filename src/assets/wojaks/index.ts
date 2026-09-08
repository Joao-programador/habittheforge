export const WOJAKS: string[] = [
  "/wojaks/1.png",
  "/wojaks/2.png",
  "/wojaks/4.png"
];

export function pickRandomWojak(): string {
  return WOJAKS[Math.floor(Math.random() * WOJAKS.length)];
}
