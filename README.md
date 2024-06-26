# Thrive Bot

WARNING: This project is in early development and is not yet ready for production use. BETA releae is coming soon.

This is the source code to Thrive Bot: a helpful bot for any community. Thrive is written in TypeScript and runs with Node.js or the Bun runtime.

Test out the latest version by visiting us on Discord at: https://discord.gg/mWMsPshP

Learn more about us at https://ThriveTogether.ai

## Features

- Seamless integration with Discord
- PostgreSQL hosting via Supabase <3
- Easy to set up and run. Nothing to configure other than adding the bot to your server.

## Requirements

To run Thrive Bot, you need to set the following environment variables in a .env file:

```bash
DISCORD_TOKEN=your_discord_token
PUBLIC_SUPABASE_ANON_KEY=your_public_supabase_anon_key
DISCORD_APP_ID=your_discord_app_id
OPENAI_API_KEY=your_openai_api_key
SUPABASE_HOST=your_supabase_host
SUPABASE_SERVICE_ROLL=your_supabase_service_roll
```

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
