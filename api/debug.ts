// api/debug.ts
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  const u = new URL(req.url);
  const info = {
    path: u.pathname,
    q: Object.fromEntries(u.searchParams.entries()),
    ts: Date.now(),
  };
  return new Response(JSON.stringify(info), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
