export const INTENTS = Object.freeze({
  CASUAL_CHAT: "casual_chat",
  JOKE_PLAY: "joke_play",
  EMOTIONAL_SUPPORT: "emotional_support",
  DONE_LOGGING: "done_logging",
  GOAL_STATEMENT: "goal_statement",
  REFLECTION: "reflection",
  FEEDBACK_ABOUT_GRIMM: "feedback_about_grimm",
  APP_IMPROVEMENT: "app_improvement",
  WORK_TIME: "work_time",
  ADMIN_COMMAND: "admin_command",
  UNKNOWN: "unknown"
});

const RULES = [
  rule(INTENTS.FEEDBACK_ABOUT_GRIMM, 0.9, "save_grimm_feedback", [
    /\b(?:talk|reply|respond|ask|judge|reward|remember|tease|roast)\s+(?:less|more|differently)\b/i,
    /\b(?:you should|you shouldn't|do not|don't|stop|please)\s+(?:always\s+|keep\s+)?(?:talk|sound|act|reply|respond|ask|judge|reward|remember|call|tease|roast)\b/i,
    /\b(?:be|sound)\s+(?:less|more)\s+(?:harsh|rude|nice|helpful|chatty|concise|warm|robotic|judgmental)\b/i,
    /\b(?:change|fix)\s+(?:your|grimm(?:'s)?)\s+(?:tone|voice|personality|behavior|behaviour|replies|responses)\b/i,
    /\b(?:i like|i dislike|i hate|i love)\s+(?:how|when)\s+you\b/i
  ]),
  rule(INTENTS.APP_IMPROVEMENT, 0.88, "save_app_improvement", [
    /\b(?:add|build|create|make|remove|change|fix|improve|redesign|speed up)\s+(?:a|an|the|this|that|another|new)?\s*(?:ui|button|dock|keyboard|bubble|pond|fish|feature|animation|screen|page|menu|design|bug|performance|app)\b/i,
    /\b(?:the|this|that)\s+(?:ui|button|dock|keyboard|bubble|pond|fish|feature|animation|screen|page|menu|app)\s+(?:(?:is|looks)\s+(?:broken|bad|wrong|slow|ugly)|feels\s+(?:bad|wrong|slow|awkward)|doesn't|does not|should|could|needs)\b/i,
    /\b(?:i wish|it would be (?:cool|better|nice)|can (?:the|we)|could (?:the|we))\b.*\b(?:app|ui|button|dock|keyboard|bubble|pond|fish|feature|animation|screen|page|menu)\b/i,
    /\b(?:bug|glitch|broken|laggy|slow|crash(?:es|ed|ing)?|not working|doesn't work|does not work)\b/i
  ]),
  rule(INTENTS.DONE_LOGGING, 0.89, "judge_done_item", [
    /\b(?:i|we)(?:'ve| have)?\s+(?:just\s+)?(?:finished|fixed|completed|cleaned|built|made|shipped|sent|submitted|studied|practiced|worked out|exercised|cooked|washed|organized|organised|wrote|read|called|paid|repaired|fed|walked|ran|did)\b/i,
    /\b(?:done|finished|completed|fixed|shipped)\s+(?:with\s+)?(?:it|that|this|the\s+\w+)\b/i,
    /\b(?:finally|already)\s+(?:did|finished|fixed|completed|sent|submitted|cleaned|built|made)\b/i
  ]),
  rule(INTENTS.GOAL_STATEMENT, 0.85, "consider_goal_memory", [
    /\b(?:my goal is|my goals? (?:are|for)|i aim to|i plan to|i intend to)\b/i,
    /\b(?:i want to|i'd like to|i would like to|i'm trying to|im trying to|i hope to)\s+(?:learn|become|finish|build|improve|start|stop|save|reach|make|write|read|exercise|work|study|ship|create)\b/i
  ]),
  rule(INTENTS.EMOTIONAL_SUPPORT, 0.87, "respond_with_care", [
    /\b(?:i am|i'm|im|i feel|feeling)\s+(?:really\s+|very\s+|so\s+)?(?:tired|anxious|sad|stressed|overwhelmed|lonely|scared|afraid|hopeless|upset|angry|burned out|burnt out|exhausted|depressed)\b/i,
    /\b(?:having a hard time|can't cope|cannot cope|need someone to talk to)\b/i
  ]),
  rule(INTENTS.REFLECTION, 0.8, "use_reflection_context", [
    /\b(?:help me reflect|let's reflect|lets reflect|thinking back|looking back|look back|what have you noticed|what pattern|remember what happened)\b/i,
    /\b(?:reflect on|review)\s+(?:my|our|the)\b/i
  ]),
  rule(INTENTS.JOKE_PLAY, 0.8, "play_without_cruelty", [
    /\b(?:tell me a joke|make me laugh|roast me|tease me|be funny|let's play|lets play)\b/i,
    /\b(?:joke|roast|banter)\s+(?:with|about|mode|please)\b/i
  ])
];

export class IntentService {
  classify(message = "", context = {}) {
    const text = normalize(message);
    const entities = extractEntities(text);

    if (!text) return result(INTENTS.UNKNOWN, 0.2, entities, ["ask_for_clarification"]);

    const ownerCommand = classifyOwnerCommand(text, context);
    if (ownerCommand) return result(ownerCommand.intent, ownerCommand.confidence, entities, ownerCommand.actions);

    for (const candidate of RULES) {
      const matches = candidate.patterns.filter(pattern => pattern.test(text));
      if (!matches.length) continue;
      const confidence = Math.min(0.97, candidate.confidence + (matches.length - 1) * 0.03);
      return result(candidate.intent, confidence, entities, [candidate.action]);
    }

    if (isLowInformation(text)) {
      return result(INTENTS.UNKNOWN, 0.35, entities, ["ask_for_clarification"]);
    }

    return result(INTENTS.CASUAL_CHAT, 0.66, entities, []);
  }
}

function classifyOwnerCommand(text, context) {
  const lower = text.toLowerCase();
  if (lower === "simon says work time") {
    return { intent: INTENTS.WORK_TIME, confidence: 0.99, actions: ["enter_workshop"] };
  }
  if (lower === "simon says work done") {
    return { intent: INTENTS.WORK_TIME, confidence: 0.99, actions: ["exit_workshop"] };
  }
  if (lower.startsWith("simon says")) {
    return { intent: INTENTS.ADMIN_COMMAND, confidence: 0.96, actions: ["handle_owner_command"] };
  }
  if (String(context.mode || "").toLowerCase() === "workshop" && /\b(?:yes|no|approve|reject|skip)\b/i.test(text)) {
    return { intent: INTENTS.WORK_TIME, confidence: 0.86, actions: ["handle_workshop_decision"] };
  }
  return null;
}

function rule(intent, confidence, action, patterns) {
  return { intent, confidence, action, patterns };
}

function result(intent, confidence, entities, suggestedActions) {
  return { intent, confidence, entities, suggestedActions };
}

function normalize(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function isLowInformation(text) {
  return /^(?:[?!.]+|h+m+|uh+|erm+|what|why|help|idk|dunno)$/i.test(text);
}

function extractEntities(text) {
  const lowered = text.toLowerCase();
  const topics = [
    "ui", "button", "dock", "keyboard", "bubble", "pond", "fish", "feature",
    "animation", "screen", "page", "menu", "design", "bug", "performance",
    "goal", "memory", "grimm", "coins", "trophy", "work time"
  ].filter(topic => new RegExp(`\\b${escapeRegExp(topic)}\\b`, "i").test(lowered));

  const entities = {};
  if (topics.length) entities.topics = topics;
  return entities;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
