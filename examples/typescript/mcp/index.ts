/**
 * Need:
 * - MCP server to be able to verify token (SSE should be able to do this)
 * - Need client to be able to send header
 * - Each client application would need to implement a wallet type
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "dotenv";
import { Hex } from "viem";
import { z } from "zod";
import { wrapFetchWithPayment, createSigner } from "x402-fetch";

config();

const privateKey = process.env.PRIVATE_KEY as Hex;
const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. https://example.com
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /weather
const delegationKey = process.env.DELEGATION_KEY as string;

if (!privateKey || !baseURL || !endpointPath) {
  throw new Error("Missing environment variables");
}

const signer = await createSigner("base-sepolia", privateKey);
const fetchWithPayment = wrapFetchWithPayment(fetch, signer, delegationKey);

// const client = withPaymentInterceptor(axios.create({ baseURL }), account);

// Create an MCP server
const server = new McpServer({
  name: "x402 MCP Client Demo",
  version: "1.0.0",
});

// Add an addition tool
server.tool(
  "get-data-from-resource-server",
  "Get data from the resource server (in this example, the weather)",
  {},
  async () => {
    // const res = await client.get(endpointPath);
    const response = await fetchWithPayment(`${baseURL}${endpointPath}`, { method: "GET" });
    const body = await response.json();
    console.log(body);

    return {
      content: [{ type: "text", text: JSON.stringify(body) }],
    };
  },
);

// Define schema for x402 tokens tool
const x402TokensSchema = z.object({
  limit: z
    .number()
    .optional()
    .default(10)
    .describe("Number of tokens to return (default: 10, max: 250)"),
  vs_currency: z
    .string()
    .optional()
    .default("usd")
    .describe("Currency to price tokens in (default: usd)"),
});

server.registerTool(
  "get-x402-tokens",
  {
    title: "Get x402 Ecosystem Tokens",
    description: "Get x402 ecosystem tokens from CoinGecko with optional limit parameter",
    inputSchema: x402TokensSchema.shape,
  },
  async ({ limit = 10, vs_currency = "usd" }) => {
    const url = `${baseURL}/x402-tokens?limit=${limit}&vs_currency=${vs_currency}`;

    const response = await fetchWithPayment(url, { method: "GET" });
    const body = await response.json();

    return {
      content: [{ type: "text", text: JSON.stringify(body) }],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
