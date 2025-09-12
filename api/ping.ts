// api/ping.ts
export const config = { runtime: "edge" };
export default () => new Response("pong", { status: 200 });