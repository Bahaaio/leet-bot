# leet-bot

A Discord bot for LeetCode daily challenges and random problems.

## Commands

| Command                 | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `/daily`                | Get today's LeetCode daily coding challenge                           |
| `/problem [difficulty]` | Get a random LeetCode problem (optionally filter by Easy/Medium/Hard) |

## Setup

### Prerequisites

- Node.js 18+
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))

### Installation

```bash
git clone https://github.com/Bahaaio/leet-bot.git
cd leet-bot
npm install
```

### Configuration

Create a `config.json` file in the root directory:

```json
{
  "token": "YOUR_BOT_TOKEN",
  "clientId": "YOUR_CLIENT_ID",
  "guildId": "YOUR_GUILD_ID"
}
```

| Field      | Description                                |
| ---------- | ------------------------------------------ |
| `token`    | Your Discord bot token                     |
| `clientId` | Your Discord application ID                |
| `guildId`  | The Discord server ID to register commands |

### Deploy Commands

Register slash commands with Discord:

```bash
npm run deploy
```

### Run

```bash
npm start
```

## Scripts

| Script           | Description                          |
| ---------------- | ------------------------------------ |
| `npm start`      | Start the bot                        |
| `npm run deploy` | Register slash commands with Discord |
| `npm run lint`   | Run ESLint                           |
| `npm run format` | Format code with Prettier            |

## License

MIT
