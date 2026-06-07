import sad from "./sad.jpg.asset.json";
import glassesCry from "./glasses-cry.jpg.asset.json";
import melting from "./melting.jpg.asset.json";
import beanie from "./beanie.jpg.asset.json";
import classic from "./classic.jpg.asset.json";
import npcCrowd from "./npc-crowd.jpg.asset.json";
import itsOver from "./its-over.jpg.asset.json";
import old from "./old.jpg.asset.json";

export const WOJAKS: string[] = [
  sad.url,
  glassesCry.url,
  melting.url,
  beanie.url,
  classic.url,
  npcCrowd.url,
  itsOver.url,
  old.url,
];

export function pickRandomWojak(): string {
  return WOJAKS[Math.floor(Math.random() * WOJAKS.length)];
}
