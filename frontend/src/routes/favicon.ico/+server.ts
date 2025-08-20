import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  // Intentionally return no content to satisfy browsers that auto-request /favicon.ico
  return new Response(null, { status: 204 });
};
