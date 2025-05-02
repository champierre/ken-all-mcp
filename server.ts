/// <reference lib="deno.ns" />
/// <reference types="https://deno.land/x/typescript/lib/lib.deno.ns.d.ts" />

import { Server } from "npm:@modelcontextprotocol/sdk@1.5.0/server/index.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk@1.5.0/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolRequest,
} from "npm:@modelcontextprotocol/sdk@1.5.0/types.js";

declare const Deno: {
  readTextFile: (path: string) => Promise<string>;
  env: {
    get: (key: string) => string | undefined;
  };
};

const TOOLS: Tool[] = [
  {
    name: "search_address",
    description: "Search address by keywords",
    inputSchema: {
      type: "object",
      properties: {
        keywords: { type: "string", descrption: "keywords" },
      },
      required: ["keywords"]
    },
  }
];
const server = new Server(
  {
    name: "ken-all-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {
        search_address: TOOLS[0]
      },
    },
  }
);

server.setRequestHandler(ListResourcesRequestSchema, () => ({
  resources: [],
}));
server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};
  switch (name) {
    case "search_address":
      const keywords = args.keywords as string;
      if (typeof keywords !== "string") {
        return {
          content: [
            {
              type: "text",
              text: `Keywords should be strings separated by spaces, got ${typeof keywords}`,
            },
          ],
          isError: true,
        };
      }

      const keywordList = keywords.split(/\s+/).filter(Boolean);
      const results: string[] = [];
      const maxResults = 10;

      try {
        const currentDir = new URL(".", import.meta.url).pathname;
        const filePath = `${currentDir}utf_ken_all.csv`;
        const content = await Deno.readTextFile(filePath);
        const lines = content.split("\n");

        for (const line of lines) {
          const cols = line.split(",");
          const zipcode = cols[2]?.replace(/"/g, "");
          const pref = cols[6]?.replace(/"/g, "");
          const city = cols[7]?.replace(/"/g, "");
          const town = cols[8]?.replace(/"/g, "");

          const haystack = [zipcode, pref, city, town].join("");
          if (keywordList.every(k => haystack.includes(k))) {
            results.push(`${zipcode}, ${pref}, ${city}, ${town}`);
            if (results.length >= maxResults) break;
          }
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error reading file: ${error.message}`,
            },
          ],
          isError: true,
        };
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No results found.",
            },
          ],
          isError: false,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: results.join("\n"),
          },
        ],
        isError: false,
      };
    default:
      return {
        content: [
          {
            type: "text",
            text: `Unknown tool: ${name}`
          },
        ],
        isError: true,
      };
      break;
  }
});

await server.connect(new StdioServerTransport());
console.error("MCP server running on stdio");
