# Supabase MCP Server Setup

This project includes configuration for the Supabase MCP (Model Context Protocol) server, which allows Claude to directly interact with your Supabase database.

## What is MCP?

MCP (Model Context Protocol) enables Claude to directly query and manipulate your Supabase database through a standardized protocol, making database operations more intuitive.

## Setup Instructions

### 1. Get Your Supabase Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (⚠️ This is a secret key - never commit it to git!)

### 2. Configure MCP Server

Edit `mcp-config.json` and replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual service role key:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://pcznamduramewdupeqbx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key-here"
      }
    }
  }
}
```

### 3. Configure Claude Code

If using Claude Code (CLI), add the MCP server to your Claude config:

```bash
# For Claude Code
claude config add-mcp-server supabase --config ./mcp-config.json
```

Or manually add to `~/.config/claude/mcp-servers.json`:

```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-supabase"],
    "env": {
      "SUPABASE_URL": "https://pcznamduramewdupeqbx.supabase.co",
      "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
    }
  }
}
```

### 4. Test the Connection

Once configured, Claude can interact with your database:

**Example queries:**
- "Show me all articles in the database"
- "Insert a test article"
- "Update the tweet count for article X"
- "Delete old articles"

## Available MCP Tools

The Supabase MCP server provides these tools:

- **query** - Run SQL queries
- **insert** - Insert rows
- **update** - Update rows
- **delete** - Delete rows
- **rpc** - Call Supabase functions

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `mcp-config.json` with real credentials to git
- Add `mcp-config.json` to `.gitignore` if it contains secrets
- Use environment variables for production
- The service role key bypasses RLS - use carefully

## Alternative: Environment Variables

Instead of hardcoding in the config file, use environment variables:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

Then export these in your shell:

```bash
export SUPABASE_URL="https://pcznamduramewdupeqbx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Supabase MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/supabase)
- [Claude Code MCP Guide](https://docs.anthropic.com/claude/docs/mcp)
