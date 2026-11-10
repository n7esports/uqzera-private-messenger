import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

test("GET /health returns 200 and {status:ok}", async () => {
  const port = 8123;
  const child = spawn(process.execPath, ["src/index.js"], {
    cwd: new URL("..", import.meta.url).pathname,
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  });
  await new Promise((r) => setTimeout(r, 800));
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "application/json");
    const body = await res.json();
    assert.deepEqual(body, { status: "ok" });
  } finally {
    child.kill();
  }
});
