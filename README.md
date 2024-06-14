# Thrive Bot

This is the source code to Thrive Bot: a helpful bot for any community. Thrive is written in TypeScript and runs with Node.js or the Bun runtime.

To use the latest version of the bot for testing, add Thrive Bot to your Discord server by clicking [here](https://discord.com/oauth2/authorize?client_id=1220895933563277332).

## Features

- Seamless integration with Discord
- PostgreSQL hosting via Supabase <3
- Easy to set up and run. Nothing to configure other than adding the bot to your server.

## Requirements

To run Thrive Bot, you need to set the following environment variables in a `.env` file:

- `DISCORD_TOKEN`: Your Discord bot token for accessing the Discord API.
- `PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key for PostgreSQL hosting.

## Installation

First, clone the repository:

```sh
git clone https://github.com/yourusername/thrive-bot.git
cd thrive-bot
```

### Using Node.js

Install the dependencies and run the development script:

```sh
npm install
npm run dev
```

### Using Bun

Install the dependencies and run the development script:

```sh
bun install
bun run dev
```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Feel free to customize it further based on your specific requirements or preferences.