export const RAFFLE_IMAGE_BUCKET = "ganhaveis";

export function pathForRaffleImage(raffleId: string, filename: string) {
  const ts = Date.now();
  return `images/${raffleId}/${ts}-${filename}`;
}
