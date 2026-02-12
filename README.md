# ewing-skills

English | [中文](#中文)

Skills for Claude Code / Cursor / OpenClaw. Clip web pages to Notion and more.

## Prerequisites

* Node.js (v18+)
* Chrome or Chromium browser
* Ability to run `npx tsx` commands

## Installation

### Quick Install (if supported)

```bash
npx skills add YOUR_USERNAME/ewing-skills
```

### Register as Plugin Marketplace

Run in Claude Code:

```
/plugin marketplace add YOUR_USERNAME/ewing-skills
```

### Install Skills

**Option 1: Via Browse UI**

1. Select **Browse and install plugins**
2. Select **ewing-skills**
3. Select the skill(s) to install
4. Select **Install now**

**Option 2: Direct Clone**

```bash
git clone https://github.com/YOUR_USERNAME/ewing-skills.git
cd ewing-skills/notion-clipper-skill/scripts && npm install
```

**Option 3: Ask the Agent**

Simply tell Claude Code:

> Please install Skills from github.com/YOUR_USERNAME/ewing-skills

## Update Skills

To update to the latest version:

1. Run `/plugin` in Claude Code
2. Switch to **Marketplaces** tab
3. Select **ewing-skills**
4. Choose **Update marketplace**

## Available Skills

### notion-clipper-skill

Clip web pages to Notion. Uses Chrome CDP for full JavaScript rendering, converts to Markdown, then to Notion blocks.

#### Prerequisites

1. **Notion API Key**: Create integration at https://notion.so/my-integrations
2. **Store the key**:
```bash
mkdir -p ~/.config/notion
echo "ntn_your_key_here" > ~/.config/notion/api_key
```
3. **Share database/page** with your integration (click "..." → "Connect to" → your integration)

#### Usage

Replace `${SKILL_DIR}` with the path to `notion-clipper-skill` (e.g. `ewing-skills/notion-clipper-skill`).

# Clip to database by name (recommended)
npx -y tsx ${SKILL_DIR}/scripts/main.ts <url> --database-name "Resource"

# Clip to database by ID
npx -y tsx ${SKILL_DIR}/scripts/main.ts <url> --database <database_id>

# Append to existing page
npx -y tsx ${SKILL_DIR}/scripts/main.ts <url> --page <page_id>

# List accessible databases
npx -y tsx ${SKILL_DIR}/scripts/main.ts --list-databases

# Wait mode (for login-required pages)
npx -y tsx ${SKILL_DIR}/scripts/main.ts <url> -n "Resource" --wait

#### Options

| Option | Description |
|--------|-------------|
| `<url>` | URL to clip |
| `--database-name, -n <name>` | Target database by name (searches for match) |
| `--database, -d <id>` | Target database by ID |
| `--page, -p <id>` | Append to page by ID |
| `--list-databases, -l` | List databases and exit |
| `--wait, -w` | Wait for user signal before capturing |
| `--timeout, -t <ms>` | Page load timeout (default: 30000) |
| `--no-bookmark` | Omit bookmark block at top |

#### Capture Modes

| Mode | Behavior | Use When |
|------|----------|----------|
| Auto (default) | Capture when network idle | Public pages |
| Wait (`--wait`) | User presses Enter when ready | Login-required, paywalls |

#### Examples

# Clip tweet to "Resource" database
npx -y tsx ${SKILL_DIR}/scripts/main.ts "https://x.com/user/status/123" -n "Resource"

# Clip article requiring login
npx -y tsx ${SKILL_DIR}/scripts/main.ts "https://medium.com/article" -n "Reading" --wait

# Append to page
npx -y tsx ${SKILL_DIR}/scripts/main.ts "https://example.com/post" -p xyz789

#### Database Setup

Create a Notion database with:
- **Name** (Title) - Page title
- **URL** (URL) - Source URL (optional; auto-detected from schema)

#### Troubleshooting

| Issue | Solution |
|-------|----------|
| Chrome not found | Set `NOTION_CLIPPER_CHROME_PATH` |
| ECONNREFUSED / empty body | Run `unset https_proxy http_proxy all_proxy` first, or use terminal without proxy |
| Content missing | Use `--wait` for dynamic/lazy-loaded pages |
| Notion API error | Ensure integration has access to database |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NOTION_CLIPPER_CHROME_PATH` | Custom Chrome executable path |
| `NOTION_CLIPPER_CHROME_PROFILE_DIR` | Custom Chrome profile directory |

## License

MIT

---

## 中文

ewing-skills 为 Claude Code / Cursor / OpenClaw 提供技能，支持将网页剪藏到 Notion 等。

### 安装

```bash
git clone https://github.com/YOUR_USERNAME/ewing-skills.git
cd ewing-skills/notion-clipper-skill/scripts && npm install
```

### notion-clipper-skill 使用

```bash
# 剪藏到名为 "Resource" 的数据库
npx -y tsx 路径/main.ts "https://example.com/article" -n "Resource"

# 若遇代理导致连接失败：先执行
unset https_proxy http_proxy all_proxy
```

详见 [notion-clipper-skill/SKILL.md](notion-clipper-skill/SKILL.md)。
