export function shareUrlForRaffle(slugOrId: string, origin = "https://ganhavel.com") {
  return `${origin}/ganhavel/${slugOrId}.html`;
}

export function appUrlForRaffle(slugOrId: string, origin = "https://ganhavel.com") {
  return `${origin}/ganhavel/${slugOrId}`;
}