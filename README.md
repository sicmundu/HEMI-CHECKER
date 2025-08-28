# HEMI CHECKER

![Status](https://img.shields.io/badge/Status-Production-green?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-blue?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

A high-performance Telegram bot for checking Hemi blockchain balances with advanced batch processing capabilities and dynamic response system.

## Features

- **Telegram Integration**: Native Telegram bot with real-time messaging
- **EVM Validation**: Comprehensive Ethereum address validation using ethers.js
- **Batch Processing**: Process up to 50 wallet addresses simultaneously
- **API Integration**: Direct connection to Hemi Portal API
- **Dynamic Responses**: Context-aware messaging system
- **Error Handling**: Robust error management and user feedback
- **Production Ready**: Optimized for high-volume usage

## Technical Stack

- **Runtime**: Node.js 18+
- **Bot Framework**: node-telegram-bot-api
- **Blockchain**: ethers.js for EVM interaction
- **HTTP Client**: axios for API requests
- **Environment**: dotenv for configuration

## Quick Start

### Prerequisites

- Node.js 18 or higher
- Telegram Bot Token from [@BotFather](https://t.me/botfather)

### Installation

```bash
# Navigate to project directory
cd hemi_checker

# Install dependencies
npm install
```

### Configuration

**Option 1: Interactive Setup (Recommended)**
```bash
npm run setup
```
Follow the guided setup process to configure your bot token.

**Option 2: Manual Configuration**

1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
HEMI_API_BASE_URL=https://portal-api.hemi.xyz
HEMI_CHAIN_ID=43111
MAX_WALLETS_PER_REQUEST=50
REQUEST_TIMEOUT=10000
```

### Bot Creation

1. Start a conversation with [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Choose bot name: `HEMI CHECKER`
4. Choose username ending with 'bot'
5. Copy the provided token to your `.env` file

### Launch

```bash
# Start the bot
npm start

# Development mode with auto-restart
npm run dev
```

## Usage

### Available Commands

- `/start` - Initialize bot and display welcome message
- `/help` - Show available commands and usage instructions
- `/stats` - Display bot statistics and system status

### Balance Checking

Send EVM wallet addresses directly to the bot:

**Single Wallet:**
```
0x742d35Cc6634C0532925a3b8D7bCDD6437a7B6e0
```

**Multiple Wallets:**
```
0x742d35Cc6634C0532925a3b8D7bCDD6437a7B6e0
0x123d35Cc6634C0532925a3b8D7bCDD6437a7B123
0x456d35Cc6634C0532925a3b8D7bCDD6437a7B456
```

### Response Examples

**Eligible Wallet:**
```
Wallet: 0x742d...B6e0
Status: ELIGIBLE
Amount: 554.00 HEMI
```

**Non-eligible Wallet:**
```
Wallet: 0x123d...B123
Status: NOT ELIGIBLE
Amount: 0 HEMI
```

## API Integration

The bot integrates with the Hemi Portal API:

**Endpoint:** `https://portal-api.hemi.xyz/claims/43111/{wallet_address}`

**Response Format:**
```json
{
  "amount": "554"
}
```

**Error Handling:**
- 404: Wallet not found in airdrop
- 500: Server error
- Timeout: Request timeout (configurable)

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot authentication token | - | Yes |
| `HEMI_API_BASE_URL` | Base URL for Hemi API | `https://portal-api.hemi.xyz` | No |
| `HEMI_CHAIN_ID` | Hemi blockchain chain ID | `43111` | No |
| `MAX_WALLETS_PER_REQUEST` | Maximum wallets per batch | `50` | No |
| `REQUEST_TIMEOUT` | API request timeout (ms) | `10000` | No |

### Bot Limits

- **Wallet Validation**: Only valid EVM addresses accepted
- **Batch Size**: Maximum 50 wallets per request
- **Request Timeout**: 10 seconds default
- **Rate Limiting**: Implemented via Telegram Bot API

## Development

### Project Structure

```
hemi_checker/
├── bot.js              # Main bot logic and handlers
├── setup.js            # Interactive setup script
├── package.json        # Project dependencies and scripts
├── .env                # Environment configuration
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

### Scripts

```bash
# Start production bot
npm start

# Development mode with auto-restart
npm run dev

# Interactive setup
npm run setup
```

### Core Functions

- `isValidEVMAddress()` - Wallet validation using ethers.js
- `checkHemiDrop()` - API integration for balance checking
- `formatWalletResult()` - Response formatting
- `createSummaryMessage()` - Batch result summarization

### Adding Features

1. **New Commands**: Add `bot.onText()` handlers
2. **Response Customization**: Modify `STYLE_MESSAGES` object
3. **API Extensions**: Update `checkHemiDrop()` function
4. **Validation Rules**: Enhance `isValidEVMAddress()`

## Deployment

### Production Setup

1. **Server Requirements**:
   - Node.js 18+
   - Stable internet connection
   - Process manager (PM2 recommended)

2. **Environment Setup**:
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start with PM2
   pm2 start bot.js --name "hemi-checker"
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

## Security

- **No Private Keys**: Read-only wallet checking
- **Environment Variables**: Sensitive data in `.env`
- **Input Validation**: All inputs validated before processing
- **Rate Limiting**: Controlled via Telegram Bot API
- **Error Sanitization**: No sensitive data in error messages

## Troubleshooting

### Common Issues

**Bot Not Responding:**
1. Verify bot token in `.env` file
2. Check internet connectivity
3. Confirm bot is running
4. Review logs for errors

**API Errors:**
1. Verify Hemi API endpoint availability
2. Check network connectivity
3. Validate request timeout settings
4. Monitor API response status codes

**Validation Errors:**
1. Ensure wallet addresses are valid EVM format
2. Check for typos in addresses
3. Verify ethers.js is properly installed

## Performance

- **Concurrent Processing**: Async/await for parallel wallet checking
- **Batch Optimization**: Up to 50 wallets processed simultaneously
- **Memory Usage**: Optimized for minimal memory footprint
- **Response Time**: Sub-second response for single wallets

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

### Coding Standards

- ES6+ JavaScript
- Async/await for asynchronous operations
- Comprehensive error handling
- Clear variable naming
- Inline documentation for complex logic

## License

MIT License - see LICENSE file for details.

## Support

For issues, bugs, or feature requests:

1. Check existing issues in the repository
2. Create new issue with detailed description
3. Include error logs and configuration details
4. Specify Node.js version and operating system

---

**HEMI CHECKER** - Professional balance checking for the Hemi blockchain ecosystem.