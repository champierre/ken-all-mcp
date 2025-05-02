deno compile --no-check --allow-read --target x86_64-unknown-linux-gnu --output binaries/ken-all-mcp-linux-x86_64 ken-all-mcp.ts
deno compile --no-check --allow-read --target aarch64-unknown-linux-gnu --output binaries/ken-all-mcp-linux-aarch64 ken-all-mcp.ts
deno compile --no-check --allow-read --target x86_64-pc-windows-msvc --output binaries/ken-all-mcp-windows-x86_64 ken-all-mcp.ts
deno compile --no-check --allow-read --target x86_64-apple-darwin --output binaries/ken-all-mcp-macos-x86_64 ken-all-mcp.ts
deno compile --no-check --allow-read --target aarch64-apple-darwin --output binaries/ken-all-mcp-macos-aarch64 ken-all-mcp.ts
