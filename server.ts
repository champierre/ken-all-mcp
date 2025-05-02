import { Server } from "npm:@modelcontextprotocol/sdk@1.5.0/server/index.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk@1.5.0/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolRequest,
} from "npm:@modelcontextprotocol/sdk@1.5.0/types.js";


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


      return {
        content: [
          {
            type: "text",
            text: "test",
          },
        ],
        isError: true
      };
      break;
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
