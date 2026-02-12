---
name: notion-clipper-skill
description: Clip web pages to Notion. Fetches any URL via Chrome CDP, converts HTML to Markdown, then to Notion blocks using martian library, and saves to user-specified Notion database or page. Use when user wants to save/clip a webpage to Notion, or mentions "clip to notion", "save page to notion", "网页剪藏到Notion".
---

# Notion Clipper

Clip any web page to Notion. Uses Chrome CDP for full JavaScript rendering, converts to Markdown, then to Notion blocks.

## Prerequisites

1. **Notion API Key**: Create an integration at https://notion.so/my-integrations
2. **Store the key**:
```bash
mkdir -p ~/.config/notion
echo "ntn_your_key_here" > ~/.config/notion/api_key
```
3. **Share target database/page** with your integration (click "..." → "Connect to" → your integration name)

## First Time Setup

On first use, dependencies will be automatically installed. If you prefer to install manually:

```bash
cd ${SKILL_DIR}/scripts && npm install
```

Dependencies: `@tryfabric/martian` (Markdown to Notion blocks), `ws` (WebSocket for CDP)

## Script Directory

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.ts`
3. Replace all `${SKILL_DIR}` in commands with the actual path
4. **Before first execution**, check and install dependencies:
```bash
# Check if dependencies are installed, if not, install them
test -d "${SKILL_DIR}/scripts/node_modules" || (cd "${SKILL_DIR}/scripts" && npm install)
```

## Usage

**Use Node (tsx) to run** so Notion API requests go direct.  
**若遇 ECONNREFUSED / empty body**：先执行 `unset https_proxy http_proxy all_proxy` 再运行，或在新终端（未设置代理）中运行。

```bash
# Clip to a Notion database by NAME (recommended - searches for database)
npx -y tsx ${SKILL_DIR}/scripts/main.ts <url> --database-name "Resource"

# Clip to a Notion database by ID
npx -y tsx ${SKILL_DIR}/scripts/main.ts <url> --database <database_id>

# Clip to an existing page (appends blocks)
npx -y tsx ${SKILL_DIR}/scripts/main.ts <url> --page <page_id>

# List all accessible databases
npx -y tsx ${SKILL_DIR}/scripts/main.ts --list-databases

# For pages requiring login (wait mode)
npx -y tsx ${SKILL_DIR}/scripts/main.ts <url> --database-name "Resource" --wait
```

## Options

| Option | Description |
|--------|-------------|
| `<url>` | URL to clip |
| `--database-name, -n <name>` | Target database by name (searches for match) |
| `--database, -d <id>` | Target Notion database by ID |
| `--page, -p <id>` | Target Notion page ID (appends blocks) |
| `--list-databases, -l` | List all accessible databases and exit |
| `--wait, -w` | Wait for user signal before capturing |
| `--timeout, -t <ms>` | Page load timeout (default: 30000) |
| `--no-bookmark` | Don't include bookmark block at top |

## Capture Modes

| Mode | Behavior | Use When |
|------|----------|----------|
| Auto (default) | Capture on network idle | Public pages, static content |
| Wait (`--wait`) | User signals when ready | Login-required, lazy loading, paywalls |

**Wait mode workflow**:
1. Run with `--wait` → Chrome opens, script outputs "Press Enter when ready"
2. Log in or navigate as needed in the browser
3. Press Enter in terminal to trigger capture

## Output Structure

When saving to a **database**, creates a new page with:
- **Name**: Page title
- **URL**: Source URL (if database has URL property)
- **Content**: Bookmark block + converted content blocks

When appending to a **page**, adds:
- Bookmark block (link to source)
- Divider
- Converted content blocks

## Database Setup

For best results, create a Notion database with these properties:
- **Name** (Title) - Required, will contain page title
- **URL** (URL) - Optional, will contain source URL

## Examples

**Clip a tweet to "Resource" database (by name):**
```bash
npx -y tsx ${SKILL_DIR}/scripts/main.ts "https://x.com/dotey/status/123456" -n "Resource"
```

**List all databases first:**
```bash
npx -y tsx ${SKILL_DIR}/scripts/main.ts --list-databases
```

**Clip article requiring login:**
```bash
npx -y tsx ${SKILL_DIR}/scripts/main.ts "https://medium.com/article" -n "Reading" --wait
```

**Append to reading notes page:**
```bash
npx -y tsx ${SKILL_DIR}/scripts/main.ts "https://blog.example.com/post" -p xyz789
```

## How It Works

1. **Fetch**: Launch Chrome via CDP, navigate to URL
2. **Render**: Wait for JavaScript to execute, scroll to trigger lazy loading
3. **Extract**: Run cleanup script to remove ads/nav, extract main content
4. **Convert**: HTML → Markdown → Notion blocks (via @tryfabric/martian)
5. **Save**: Call Notion API to create page or append blocks

## Dependencies

- Chrome/Chromium browser (installed locally)
- Node.js (script runs with `tsx` under Node so Notion API uses direct HTTPS; Bun can route through proxy and return empty body)
- `@tryfabric/martian` npm package (installed in scripts/)
- Notion API key configured

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NOTION_CLIPPER_CHROME_PATH` | Custom Chrome executable path |
| `NOTION_CLIPPER_CHROME_PROFILE_DIR` | Custom Chrome profile directory |
| `https_proxy` / `HTTP_PROXY` | Proxy for Notion API (e.g. `http://127.0.0.1:7890`) |
| `http_proxy` / `HTTPS_PROXY` | Same as above |
| `all_proxy` | Optional, e.g. `socks5://127.0.0.1:7890` |

**Example (proxy on port 7890):**
```bash
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890
```

## Troubleshooting

- **Chrome not found**: Set `NOTION_CLIPPER_CHROME_PATH` environment variable
- **Timeout errors**: Increase `--timeout` value or use `--wait` mode
- **Content missing**: Try `--wait` mode for dynamic/lazy-loaded pages
- **Notion API error**: Ensure integration has access to target database/page
- **Unable to connect (Notion API)**: Set proxy env vars if you use a proxy (see above)
- **Notion API returned empty body (status 200)**: Run with **Node** via `npx -y tsx` instead of `bun`. Under Bun, `node:https` may go through proxy and get empty response; under Node it goes direct.
