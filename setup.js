#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const EMOJIS = {
    fire: '🔥',
    robot: '🤖',
    rocket: '🚀',
    gem: '💎',
    lightning: '⚡',
    party: '🎉'
};

console.log(`\n${EMOJIS.fire}${EMOJIS.rocket} HEMI CHECKER BOT SETUP ${EMOJIS.rocket}${EMOJIS.fire}\n`);

console.log(`${EMOJIS.robot} Welcome to the most INSANE setup process!\n`);

console.log(`${EMOJIS.lightning} To get your bot token:`);
console.log(`1. Go to https://t.me/botfather`);
console.log(`2. Send /newbot`);
console.log(`3. Choose a name: "HEMI CHECKER"`);
console.log(`4. Choose a username ending with "bot"`);
console.log(`5. Copy the token you receive\n`);

rl.question(`${EMOJIS.gem} Enter your Telegram Bot Token: `, (token) => {
    if (!token || token.trim() === '') {
        console.log(`\n${EMOJIS.fire} No token provided. Setup cancelled.`);
        rl.close();
        return;
    }
    
    // Basic token validation
    if (!token.includes(':') || token.length < 40) {
        console.log(`\n${EMOJIS.fire} Invalid token format. Please check and try again.`);
        rl.close();
        return;
    }
    
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    // Read existing .env file
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add the token
    if (envContent.includes('TELEGRAM_BOT_TOKEN=')) {
        envContent = envContent.replace(
            /TELEGRAM_BOT_TOKEN=.*/,
            `TELEGRAM_BOT_TOKEN=${token.trim()}`
        );
    } else {
        envContent += `\nTELEGRAM_BOT_TOKEN=${token.trim()}\n`;
    }
    
    // Write back to .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log(`\n${EMOJIS.party} SUCCESS! Bot token saved to .env file`);
    console.log(`\n${EMOJIS.rocket} Your HEMI CHECKER is ready to launch!`);
    console.log(`\n${EMOJIS.fire} To start hunting drops:`);
    console.log(`   npm start`);
    console.log(`\n${EMOJIS.gem} Happy HEMI checking! ${EMOJIS.gem}`);
    
    rl.close();
});