import test from "node:test";
import assert from "node:assert/strict";
import { IntentService } from "./IntentService.js";

const service = new IntentService();

const cases = [
  ["", "unknown"],
  ["hello grimm", "casual_chat"],
  ["simon says work time", "work_time"],
  ["simon says work done", "work_time"],
  ["simon says inspect the provider", "admin_command"],
  ["talk less and stop asking me for proof", "feedback_about_grimm"],
  ["I like how you tease me", "feedback_about_grimm"],
  ["add a fish shop button", "app_improvement"],
  ["the keyboard is broken", "app_improvement"],
  ["I fed the fish", "done_logging"],
  ["I finished cleaning my room", "done_logging"],
  ["finally submitted it", "done_logging"],
  ["my goal is to read twelve books", "goal_statement"],
  ["I want to learn Burmese", "goal_statement"],
  ["I'm really overwhelmed", "emotional_support"],
  ["help me reflect on my week", "reflection"],
  ["tell me a joke", "joke_play"],
  ["the pond looks beautiful today", "casual_chat"],
  ["fish", "casual_chat"],
  ["idk", "unknown"]
];

for (const [message, expected] of cases) {
  test(`${JSON.stringify(message)} -> ${expected}`, () => {
    assert.equal(service.classify(message).intent, expected);
  });
}

test("workshop decisions use mode context", () => {
  const detected = service.classify("approve", { mode: "workshop" });
  assert.equal(detected.intent, "work_time");
  assert.deepEqual(detected.suggestedActions, ["handle_workshop_decision"]);
});

test("returns the stable intent contract", () => {
  const detected = service.classify("add a pond menu");
  assert.deepEqual(Object.keys(detected), ["intent", "confidence", "entities", "suggestedActions"]);
  assert.ok(detected.confidence >= 0 && detected.confidence <= 1);
  assert.deepEqual(detected.entities.topics, ["pond", "menu"]);
});
