require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { ethers } = require('ethers');

// Bot configuration
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const HEMI_API_BASE = process.env.HEMI_API_BASE_URL || 'https://portal-api.hemi.xyz';
const HEMI_CHAIN_ID = process.env.HEMI_CHAIN_ID || '43111';
const MAX_WALLETS = parseInt(process.env.MAX_WALLETS_PER_REQUEST) || 50;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 10000;

// Epic emojis and styling
const EMOJIS = {
    fire: '🔥',
    diamond: '💎',
    rocket: '🚀',
    money: '💰',
    skull: '💀',
    cry: '😭',
    party: '🎉',
    lightning: '⚡',
    gem: '💎',
    crown: '👑',
    explosion: '💥',
    ghost: '👻',
    robot: '🤖',
    alien: '👽'
};

// INSANELY WILD style messages for HEMI CHECKER
const STYLE_MESSAGES = {
    eligible: [
        `${EMOJIS.fire}${EMOJIS.fire}${EMOJIS.fire} HOOOOOLY SHIIIIIT YOU'RE LOADED!!! ${EMOJIS.fire}${EMOJIS.fire}${EMOJIS.fire}`,
        `${EMOJIS.rocket}${EMOJIS.explosion} YOOOOOOO WE'RE GOING TO THE MOOOOOON!!! ${EMOJIS.explosion}${EMOJIS.rocket}`,
        `${EMOJIS.diamond}${EMOJIS.crown} ABSOLUTE FUCKING LEGEND DETECTED!!! ${EMOJIS.crown}${EMOJIS.diamond}`,
        `${EMOJIS.party}${EMOJIS.money} MONEY MACHINE GO BRRRRRRRRRRR!!! ${EMOJIS.money}${EMOJIS.party}`,
        `${EMOJIS.lightning}${EMOJIS.gem} JACKPOT JACKPOT JACKPOOOOOOT!!! ${EMOJIS.gem}${EMOJIS.lightning}`,
        `${EMOJIS.fire}${EMOJIS.rocket} CHAD WALLET CONFIRMED!!! ${EMOJIS.rocket}${EMOJIS.fire}`,
        `${EMOJIS.explosion}${EMOJIS.diamond} GIGACHAD ENERGY DETECTED!!! ${EMOJIS.diamond}${EMOJIS.explosion}`
    ],
    notEligible: [
        `${EMOJIS.skull}${EMOJIS.cry} AAAAAAHHH NOOOOOO YOU'RE BROKE!!! ${EMOJIS.cry}${EMOJIS.skull}`,
        `${EMOJIS.ghost}${EMOJIS.ghost} RIP RIP RIP YOUR WALLET IS DEAD!!! ${EMOJIS.ghost}${EMOJIS.ghost}`,
        `${EMOJIS.skull}${EMOJIS.skull} ZERO! FUCKING ZERO! NOTHIIIING!!! ${EMOJIS.skull}${EMOJIS.skull}`,
        `${EMOJIS.cry}${EMOJIS.cry} NGMI! NGMI! YOU'RE NGMI!!! ${EMOJIS.cry}${EMOJIS.cry}`,
        `${EMOJIS.alien}${EMOJIS.skull} THIS WALLET IS CURSED AF!!! ${EMOJIS.skull}${EMOJIS.alien}`,
        `${EMOJIS.ghost}${EMOJIS.fire} REKT! ABSOLUTELY FUCKING REKT!!! ${EMOJIS.fire}${EMOJIS.ghost}`,
        `${EMOJIS.cry}${EMOJIS.explosion} MISSION FAILED SPECTACULARLY!!! ${EMOJIS.explosion}${EMOJIS.cry}`
    ],
    error: [
        `${EMOJIS.robot}${EMOJIS.explosion} SYSTEM IS TOTALLY FUCKED!!! ${EMOJIS.explosion}${EMOJIS.robot}`,
        `${EMOJIS.alien}${EMOJIS.fire} THE MATRIX IS GLITCHING HARD!!! ${EMOJIS.fire}${EMOJIS.alien}`,
        `${EMOJIS.skull}${EMOJIS.lightning} APOCALYPSE MODE ACTIVATED!!! ${EMOJIS.lightning}${EMOJIS.skull}`
    ]
};

// Utility functions
function isValidEVMAddress(address) {
    try {
        return ethers.isAddress(address);
    } catch (error) {
        return false;
    }
}

function getRandomMessage(type) {
    const messages = STYLE_MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
}

function formatBalance(amount) {
    const rawAmount = parseFloat(amount);
    
    // Handle zero or invalid amounts
    if (!rawAmount || rawAmount === 0) {
        return "0.00";
    }
    
    // Auto-detect the scale based on the number magnitude
    let actualAmount;
    
    if (rawAmount >= 1e15) {
        // Very large numbers (like 399730489300000) - divide by 1e12
        actualAmount = rawAmount / 1e12;
    } else if (rawAmount >= 1e9) {
        // Large numbers (like 2427553393000) - divide by 1e9  
        actualAmount = rawAmount / 1e9;
    } else if (rawAmount >= 1e6) {
        // Medium numbers (like 2427553393) - divide by 1e6
        actualAmount = rawAmount / 1e6;
    } else {
        // Small numbers - use as is
        actualAmount = rawAmount;
    }
    
    // Return the number with 2 decimal places
    return actualAmount.toFixed(2);
}

// API functions
async function checkHemiDrop(wallet) {
    try {
        const response = await axios.get(
            `${HEMI_API_BASE}/claims/${HEMI_CHAIN_ID}/${wallet}`,
            { timeout: REQUEST_TIMEOUT }
        );
        
        const amount = response.data?.amount || "0";
        return {
            wallet,
            amount: parseFloat(amount), // Store raw API amount
            success: true,
            error: null
        };
    } catch (error) {
        return {
            wallet,
            amount: 0,
            success: false,
            error: error.response?.status === 404 ? 'Not found' : 'API Error'
        };
    }
}

function formatWalletResult(result) {
    const shortWallet = `${result.wallet.slice(0, 6)}...${result.wallet.slice(-4)}`;
    
    if (!result.success) {
        return `${EMOJIS.skull} \`${shortWallet}\` - ${getRandomMessage('error')}`;
    }
    
    if (result.amount === 0) {
        return `${EMOJIS.cry} \`${shortWallet}\` - ${getRandomMessage('notEligible')}`;
    }
    
    return `${EMOJIS.fire} \`${shortWallet}\` - ${getRandomMessage('eligible')}\n💰 **${formatBalance(result.amount)} HEMI**`;
}

function createSummaryMessage(results) {
    const eligible = results.filter(r => r.success && r.amount > 0);
    const notEligible = results.filter(r => r.success && r.amount === 0);
    const errors = results.filter(r => !r.success);
    
    // Calculate total amount using the smart conversion
    const totalAmount = eligible.reduce((sum, r) => {
        const convertedAmount = parseFloat(formatBalance(r.amount));
        return sum + convertedAmount;
    }, 0);
    
    let summary = `\n${EMOJIS.lightning}${EMOJIS.explosion} **ABSOLUTELY INSANE SUMMARY!!!** ${EMOJIS.explosion}${EMOJIS.lightning}\n\n`;
    
    if (eligible.length > 0) {
        summary += `${EMOJIS.diamond}${EMOJIS.fire} **LOADED WALLETS:** ${eligible.length} (YOU'RE RICH AF!)\n`;
        summary += `${EMOJIS.money}${EMOJIS.rocket} **TOTAL FUCKING HEMI:** ${totalAmount.toFixed(2)}\n`;
    }
    
    if (notEligible.length > 0) {
        summary += `${EMOJIS.skull}${EMOJIS.cry} **BROKE ASS WALLETS:** ${notEligible.length} (RIP)\n`;
    }
    
    if (errors.length > 0) {
        summary += `${EMOJIS.robot}${EMOJIS.explosion} **FUCKED UP WALLETS:** ${errors.length}\n`;
    }
    
    if (eligible.length === 0) {
        summary += `\n${getRandomMessage('notEligible')}\n`;
    } else {
        summary += `\n${getRandomMessage('eligible')}\n`;
    }
    
    return summary;
}

// Bot commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
${EMOJIS.fire}${EMOJIS.explosion} **WELCOME TO THE ULTIMATE HEMI CHECKER!!!** ${EMOJIS.explosion}${EMOJIS.fire}

${EMOJIS.lightning}${EMOJIS.lightning} **I'M THE MOST INSANE HEMI BALANCE CHECKER ON TELEGRAM!!!** ${EMOJIS.lightning}${EMOJIS.lightning}

${EMOJIS.rocket} **WHAT I DO:**
${EMOJIS.fire} Check your HEMI like a PSYCHOPATH!
${EMOJIS.fire} Handle up to 50 wallets because I'M CRAZY!
${EMOJIS.fire} Deliver results with UNHINGED ENERGY!

${EMOJIS.diamond} **HOW TO USE:**
Just throw your EVM wallets at me and I'll CHECK THE SHIT OUT OF THEM!

Examples:
\`0x742d35Cc6634C0532925a3b8D7bCDD6437a7B6e0\`

Or spam me with multiple wallets:
\`0x742d35Cc6634C0532925a3b8D7bCDD6437a7B6e0\`
\`0x123d35Cc6634C0532925a3b8D7bCDD6437a7B123\`

${EMOJIS.explosion}${EMOJIS.rocket} **LET'S CHECK SOME FUCKING HEMI!!!** ${EMOJIS.rocket}${EMOJIS.explosion}
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
${EMOJIS.robot}${EMOJIS.explosion} **HEMI CHECKER COMMANDS - PREPARE FOR CHAOS!!!** ${EMOJIS.explosion}${EMOJIS.robot}

${EMOJIS.fire} **/start** - EXPLOSIVE welcome message
${EMOJIS.fire} **/help** - This INSANE help
${EMOJIS.fire} **/stats** - Bot statistics (WE'RE CRUSHING IT!)

${EMOJIS.lightning}${EMOJIS.lightning} **TO CHECK HEMI BALANCES:**
JUST SEND WALLET ADDRESSES AND I'LL GO FUCKING WILD!

${EMOJIS.skull} **SUPPORTED FORMATS:**
- Single wallet: \`0x742d35Cc6634C0532925a3b8D7bCDD6437a7B6e0\`
- Multiple wallets (I CAN HANDLE THE CHAOS!)
- Up to 50 wallets because I'M ABSOLUTELY UNHINGED!

${EMOJIS.rocket}${EMOJIS.explosion} **READY TO BLOW YOUR MIND WITH HEMI DATA!!!** ${EMOJIS.explosion}${EMOJIS.rocket}
    `;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    const statsMessage = `
${EMOJIS.crown}${EMOJIS.fire} **HEMI CHECKER STATISTICS - WE'RE ON FIRE!!!** ${EMOJIS.fire}${EMOJIS.crown}

${EMOJIS.robot} **Status:** ABSOLUTELY FUCKING OPERATIONAL ${EMOJIS.explosion}
${EMOJIS.lightning} **API:** Hemi Portal API (WE'RE CONNECTED!)
${EMOJIS.diamond} **Max Wallets:** ${MAX_WALLETS} per request (BRING IT ON!)
${EMOJIS.rocket} **Response Time:** FASTER THAN YOUR EX LEAVING YOU!

${EMOJIS.fire}${EMOJIS.explosion} **READY TO CHECK THE LIVING HELL OUT OF YOUR HEMI!!!** ${EMOJIS.explosion}${EMOJIS.fire}
    `;
    
    bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
});

// Main message handler
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Skip if it's a command
    if (text.startsWith('/')) {
        return;
    }
    
    // Extract wallet addresses from the message
    const walletRegex = /0x[a-fA-F0-9]{40}/g;
    const wallets = text.match(walletRegex) || [];
    
    if (wallets.length === 0) {
        bot.sendMessage(chatId, `${EMOJIS.alien}${EMOJIS.skull} **NO VALID WALLETS DETECTED, YOU ABSOLUTE MUPPET!!!**\n\nSend me EVM wallet addresses like:\n\`0x742d35Cc6634C0532925a3b8D7bCDD6437a7B6e0\``, 
            { parse_mode: 'Markdown' });
        return;
    }
    
    // Validate wallet limit
    if (wallets.length > MAX_WALLETS) {
        bot.sendMessage(chatId, `${EMOJIS.explosion}${EMOJIS.skull} **TOO MANY FUCKING WALLETS!!!**\n\nMax allowed: ${MAX_WALLETS}\nYou sent: ${wallets.length}\n\n${EMOJIS.robot} I'm crazy but not THAT crazy! Reduce and try again!`, 
            { parse_mode: 'Markdown' });
        return;
    }
    
    // Validate all wallets
    const invalidWallets = wallets.filter(wallet => !isValidEVMAddress(wallet));
    if (invalidWallets.length > 0) {
        bot.sendMessage(chatId, `${EMOJIS.skull}${EMOJIS.fire} **INVALID WALLETS DETECTED, WHAT THE HELL!!!**\n\n${invalidWallets.map(w => `\`${w}\``).join('\n')}\n\n${EMOJIS.robot} FIX YOUR SHIT AND TRY AGAIN!`, 
            { parse_mode: 'Markdown' });
        return;
    }
    
    // Send processing message
    const processingMsg = await bot.sendMessage(chatId, `${EMOJIS.lightning}${EMOJIS.fire} **CHECKING YOUR HEMI LIKE A MANIAC!!!**\n\nProcessing ${wallets.length} wallet(s)\n${EMOJIS.robot}${EMOJIS.explosion} HOLD THE FUCK ON...`, 
        { parse_mode: 'Markdown' });
    
    try {
        // Check all wallets
        const results = await Promise.all(wallets.map(checkHemiDrop));
        
        // Format results
        let responseMessage = `${EMOJIS.fire}${EMOJIS.explosion} **HEMI CHECK RESULTS - BRACE YOURSELF!!!** ${EMOJIS.explosion}${EMOJIS.fire}\n\n`;
        
        results.forEach(result => {
            responseMessage += formatWalletResult(result) + '\n\n';
        });
        
        // Add summary
        responseMessage += createSummaryMessage(results);
        
        // Delete processing message and send results
        await bot.deleteMessage(chatId, processingMsg.message_id);
        await bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        console.error('Error processing wallets:', error);
        await bot.deleteMessage(chatId, processingMsg.message_id);
        await bot.sendMessage(chatId, `${getRandomMessage('error')}\n\nPlease try again later!`, 
            { parse_mode: 'Markdown' });
    }
});

// Error handling
bot.on('error', (error) => {
    console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

// Start message
console.log(`${EMOJIS.fire} HEMI CHECKER Bot is starting...`);
console.log(`${EMOJIS.rocket} Ready to check some HEMI like a psychopath!`);

// Keep the process alive
process.on('SIGINT', () => {
    console.log(`\n${EMOJIS.skull} HEMI CHECKER is shutting down...`);
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(`\n${EMOJIS.skull} HEMI CHECKER is shutting down...`);
    bot.stopPolling();
    process.exit(0);
});