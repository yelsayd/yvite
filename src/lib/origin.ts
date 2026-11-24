import "server-only";
import { headers } from "next/headers";

export async function requestOrigin(): Promise<string> {
  const headerList = await headers();
  const forwardedProto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase() ?? "";
  const rawHost = headerList.get("x-forwarded-host")?.split(",")[0]?.trim() || headerList.get("host") || "";
  if (!/^[a-zA-Z0-9.:-]+$/.test(rawHost)) return "";
  const isLocal = rawHost.startsWith("localhost") || rawHost.startsWith("127.0.0.1") || rawHost.startsWith("[::1]");
  const proto =
    forwardedProto === "https" || forwardedProto === "http" ? forwardedProto : isLocal ? "http" : "https";
  return `${proto}://${rawHost}`;
}
