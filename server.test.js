import { test, vi } from "vitest";
import app from "./app.js";

test("test server could start", async function () {
  // ensure the callback to app.listen doesn't crash
  vi.spyOn(app, "listen");
  app.listen.mockImplementation(function (port, cb) { cb(); });

  // only now that we've mocked app.listen is it safe to import server.js
  await import("./server.js");

  // if a problem happened, that would have crashed
  vi.clearAllMocks();
});