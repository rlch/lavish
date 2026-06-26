import assert from "node:assert/strict";
import test from "node:test";

import {
  bindHost,
  clientHost,
  defaultPort,
  hostForUrl,
  IPV6_LOOPBACK_HOST,
  LOOPBACK_HOST,
  linkHost,
} from "../src/paths.js";

test("bindHost defaults to loopback and honors LAVISH_AXI_HOST", () => {
  assert.equal(bindHost({}), LOOPBACK_HOST);
  assert.equal(bindHost({ LAVISH_AXI_HOST: "" }), LOOPBACK_HOST);
  assert.equal(bindHost({ LAVISH_AXI_HOST: "  " }), LOOPBACK_HOST);
  assert.equal(bindHost({ LAVISH_AXI_HOST: "100.64.0.1" }), "100.64.0.1");
  assert.equal(bindHost({ LAVISH_AXI_HOST: " 0.0.0.0 " }), "0.0.0.0");
});

test("clientHost dials the bind host but falls back to the matching-family loopback for wildcard binds", () => {
  assert.equal(clientHost({}), LOOPBACK_HOST);
  assert.equal(clientHost({ LAVISH_AXI_HOST: "100.64.0.1" }), "100.64.0.1");
  assert.equal(clientHost({ LAVISH_AXI_HOST: "0.0.0.0" }), LOOPBACK_HOST);
  assert.equal(clientHost({ LAVISH_AXI_HOST: "::" }), IPV6_LOOPBACK_HOST);
});

test("linkHost prefers LAVISH_AXI_LINK_HOST, then falls back to the dial host", () => {
  assert.equal(linkHost({}), LOOPBACK_HOST);
  assert.equal(linkHost({ LAVISH_AXI_LINK_HOST: "host.example" }), "host.example");
  assert.equal(linkHost({ LAVISH_AXI_LINK_HOST: "  " }), LOOPBACK_HOST);
  // Non-wildcard bind with no explicit link host -> links reuse the bind address.
  assert.equal(linkHost({ LAVISH_AXI_HOST: "100.64.0.1" }), "100.64.0.1");
  // Wildcard bind with an explicit link host -> links use the hostname, not 0.0.0.0.
  assert.equal(linkHost({ LAVISH_AXI_HOST: "0.0.0.0", LAVISH_AXI_LINK_HOST: "host.example" }), "host.example");
  // IPv6 wildcard bind with no explicit link host -> links fall back to the IPv6 loopback.
  assert.equal(linkHost({ LAVISH_AXI_HOST: "::" }), IPV6_LOOPBACK_HOST);
});

test("defaultPort keeps 4387 for the default dir, derives a stable distinct port per custom dir, and LAVISH_AXI_PORT pins", () => {
  // Default state dir -> canonical shared port.
  assert.equal(defaultPort({}), 4387);
  // Explicit override always wins.
  assert.equal(defaultPort({ LAVISH_AXI_PORT: "5000" }), 5000);
  // Custom state dirs are isolated instances: distinct, stable, never 4387.
  const a = defaultPort({ LAVISH_AXI_STATE_DIR: "/tmp/lavish-a" });
  const b = defaultPort({ LAVISH_AXI_STATE_DIR: "/tmp/lavish-b" });
  assert.notEqual(a, 4387);
  assert.notEqual(b, 4387);
  assert.notEqual(a, b);
  assert.ok(a >= 4388 && a <= 5387);
  // Deterministic: same dir -> same port across calls.
  assert.equal(a, defaultPort({ LAVISH_AXI_STATE_DIR: "/tmp/lavish-a" }));
});

test("hostForUrl brackets IPv6 literals but leaves IPv4 and hostnames alone", () => {
  assert.equal(hostForUrl("127.0.0.1"), "127.0.0.1");
  assert.equal(hostForUrl("host.example"), "host.example");
  assert.equal(hostForUrl("::1"), "[::1]");
  assert.equal(hostForUrl("[::1]"), "[::1]");
});
