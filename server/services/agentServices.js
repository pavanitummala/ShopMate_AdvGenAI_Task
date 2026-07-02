const { createAgent } = require("langchain");
const { checkOderStatusTool } = require("../tools/shopTools");
const agent = createAgent({
  model: "google-genai:gemini-2.5-flash",
  tools: [checkOderStatusTool],
  systemPrompt:
    "You are a helpful customer support assistant for ShopMATE." +
    "ShopMATE is an online store." +
    "Use the available tools to answer questions about orders." +
    "Always be polite and concise." +
    "If you cannot find the infformation, say so clearly.",
});

//runShopAgent sends o ne user message to the message and returns
//the final text answer.The agent mey call one or more tools
//internally before producig that answer+

async function runShopAgent(userMessage) {
  const result = await agent.invoke({
    messages: [{ role: "user", content: userMessage }],
  });
  return String(result.message.at(-1).content);
}
module.exports = { runShopAgent };
