const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { getDB } = require("../config/db");

//step 1:the plaain functon -- your real server logic

async function checkOrderStatusFunction({ orderId }) {
  try {
    const db = getDB();
    const order = await db.collection("orders").findOne({ orderId });

    if (!order) {
      return `No order found with id ${orderId}.`;
    }
    const itemList = order.items
      .map((item) => `${item.quantity}x ${item.name}`)
      .join(" , ");
    return `Order ${order.orderId} contains: ${itemList}. ``Current status: ${order.status}.`;
  } catch (err) {
    return `Could not look up order ${orderId}: ${err.message}`;  sssssss
  }
}

//step 2: wrap it as a LangChain tool so the model can call it

const checkOrderStatusTool = tool(checkOrderStatusFunction, {
    name:'check_order_status',
    description:
        'Look up the status of a customer order by its order id.' +
        'Use this when the customer asks where their order is.',
    schema: z.object({
        orderId: z
           .string()
           .describe('The order id to look up, for example ORD-1001.'),
    }),
});
module.exports = { checkOrderStatusTool };