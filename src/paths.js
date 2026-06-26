import crypto from "node:crypto";
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const LOOPBACK_HOST = "127.0.0.1";
export const IPV6_LOOPBACK_HOST = "::1";

// Binding to a wildcard address means "all interfaces" - it is not itself a connectable
// target, so the CLI's local control channel falls back to the matching-family loopback.
// :: must fold to ::1 (not 127.0.0.1) because on macOS/BSD IPV6_V6ONLY defaults on, so a
// ::-bound socket rejects IPv4 loopback connections.
const WILDCARD_BIND_LOOPBACK = new Map([
  ["0.0.0.0", LOOPBACK_HOST],
  ["::", IPV6_LOOPBACK_HOST],
]);

// Address the server binds to (LAVISH_AXI_HOST). Defaults to loopback. A wildcard value
// (0.0.0.0 or ::) binds every interface.
export function bindHost(env = process.env) {
  return env.LAVISH_AXI_HOST?.trim() || LOOPBACK_HOST;
}

// Host the CLI uses to reach the server it spawned. A wildcard bind address can't be
// dialed directly, so the local control channel falls back to loopback.
export function clientHost(env = process.env) {
  const host = bindHost(env);
  return WILDCARD_BIND_LOOPBACK.get(host) ?? host;
}

// Hostname written into the session URLs the server generates (LAVISH_AXI_LINK_HOST).
// Defaults to the host the CLI dials.
export function linkHost(env = process.env) {
  return env.LAVISH_AXI_LINK_HOST?.trim() || clientHost(env);
}

// Brackets an IPv6 literal so it can be safely interpolated into a URL authority.
// IPv4 addresses and hostnames pass through unchanged.
export function hostForUrl(host) {
  if (host.includes(":") && !host.startsWith("[")) return `[${host}]`;
  return host;
}

export function defaultStateDir() {
  return path.join(os.homedir(), ".lavish");
}

export function stateDir() {
  return process.env.LAVISH_AXI_STATE_DIR || defaultStateDir();
}

export function stateFile() {
  return path.join(stateDir(), "state.json");
}

export function serverLogFile() {
  return path.join(stateDir(), "server.log");
}

export async function ensureStateDir() {
  await mkdir(stateDir(), { recursive: true });
}

// One lavish server multiplexes every artifact under a given state dir, so the common case
// (default state dir) keeps the canonical 4387 and shares one server. An isolated instance
// only has to set LAVISH_AXI_STATE_DIR — its port is derived deterministically from that dir,
// so two isolated instances never collide on 4387. LAVISH_AXI_PORT pins an exact port.
export function defaultPort(env = process.env) {
  if (env.LAVISH_AXI_PORT) return Number(env.LAVISH_AXI_PORT);
  const dir = env.LAVISH_AXI_STATE_DIR || defaultStateDir();
  if (dir === defaultStateDir()) return 4387;
  return 4388 + (crypto.createHash("sha256").update(dir).digest().readUInt16BE(0) % 1000);
}
