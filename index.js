require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const crypto = require('crypto');

// Configuration
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '8299682916:AAEv9To6oD53y3RmZ8y5SDtzNiBO4OX_aQc';
const META_API_KEY = process.env.META_API_KEY || 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIyZmNhOWRmNTBjOGYyNWVlYjg5MWI1ZGUxNzRmYzJlNCIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFJfSUQkOioiXX1dLCJpZ25vcmVSYXRlTGltaXRzIjpmYWxzZSwidG9rZW5JZCI6IjIwMjEwMjEzIiwiaW1wZXJzb25hdGVkIjpmYWxzZSwicmVhbFVzZXJJZCI6IjJmY2E5ZGY1MGM4ZjI1ZWViODkxYjVkZTE3NGZjMmU0IiwiaWF0IjoxNzYxNzYzMzU4fQ.GAr0XC9TFuw3ObxJzn2G6nZIRcr6sllsSZdMtfEMWe4YIeh6w1yud1sP3iz1EcN-10ardEy8rpfiAr4FMNqJQKSalPHQoVLCMmDOENdDEKQDfT3txBWSyYM2vXBJB0a1dZk3nSdrWhTvJocKcYqMZKuGA515FT0r5b04o_uymiGdOFonSJhn5XpJAkvxxVdQZ44yOvZxhBwiuF0o1ZZd4qytlBn21ypJimEf2apBL-IV4rIvE4j7Mm9rOr1Qy0YebRfYvT-62ntEGhfJGrQo5GMlWszdf3iSRoHP7bY39dDk-Xt581mqyf30h4z92xF_tvkayRds2gfODcNePdrvW_2DFsFnt8PlcUcfSRuW_qyerjfpTXRwdPmTIIB_r3QaytjrzVSr9GNIbfjaqKW_4r4Sd4JP6pjQzl1JkrKZ1ZTRRHkOjImfHAA0sF30qpM98NegFQLLVlmh3BjvudtSA8BT8VxSbbJW6lpFg2bcoNvABZiIAAjeuwSUyQv589iMGkWCnqwKRiQWThhf2fW_4R9ceeRFf7M2Nl1Oq8Xq0iu3k365pVwqGWuqI6CVPrknpyiUIVy9vJmN3MN4tyJnN3vTYcjFE5BiTdF34L4POh2zjOLywlVu13pkMNouU6sJGRK2uky7Mj5kChjmVM33gs4YBXjlqH8xvtMX_U1u74E';
const META_API_URL = 'https://mt-client-api-v1.london.agiliumtrade.ai';
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Validate required environment variables
if (!META_API_KEY) {
  console.error('❌ ERROR: META_API_KEY is not set!');
  console.error('📝 Please create a .env file with your MetaAPI token');
  console.error('💡 Example: META_API_KEY=your_token_here');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📝 META_API_KEY: ${META_API_KEY.substring(0, 20)}...`);
console.log(`🤖 TELEGRAM_TOKEN: ${TELEGRAM_TOKEN.substring(0, 20)}...`);

// Telegram API credentials for OAuth
const TELEGRAM_API_ID = 39710929;
const TELEGRAM_API_HASH = '091b79ff36e525b414a25dda427e89e7';

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize bot
let bot;
if (WEBHOOK_URL) {
  bot = new TelegramBot(TELEGRAM_TOKEN, { webHook: { port: PORT } });
  bot.setWebHook(`${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);
  console.log('🔗 Bot running in WEBHOOK mode');
} else {
  bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
  console.log('🔗 Bot running in POLLING mode');
}

// Storage
const userData = new Map();
const channelMonitors = new Map();
const pendingAuths = new Map();
const activeClients = new Map();

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Telegram Trading Copier Bot',
    mode: WEBHOOK_URL ? 'webhook' : 'polling',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', bot: 'running', timestamp: new Date().toISOString() });
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

if (WEBHOOK_URL) {
  app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
}

// Serve webapp
app.get('/webapp', (req, res) => {
  res.sendFile(__dirname + '/webapp/index.html');
});
app.use('/webapp', express.static('webapp'));

// Get user data
function getUserData(userId) {
  if (!userData.has(userId)) {
    userData.set(userId, {
      mt4Accounts: [],
      mt5Accounts: [],
      signalChannels: [],
      copySettings: {
        lotMultiplier: 1,
        copyStopLoss: true,
        copyTakeProfit: true,
        maxRisk: 5,
        reverseSignals: false,
        autoCloseAtTP1: true,
        moveToBreakeven: true,
        breakEvenTrigger: 50,
        numberOfOrders: 1,
        baseLotSize: 0.01
      },
      isActive: false,
      lastProcessedMessages: new Set(),
      telegramSession: null
    });
  }
  return userData.get(userId);
}

// Meta API helper
async function metaApiRequest(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${META_API_URL}${endpoint}`,
      headers: {
        'auth-token': META_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };
    
    if (data && method !== 'GET') {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || error.message,
      code: error.response?.status,
      details: error.response?.data
    };
  }
}

// Bot commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `
🤖 *Welcome to Trading Copier Bot!*

✨ *Professional Trading Signal Copier*

*Features:*
✅ MT4/MT5 Integration
✅ Real-time Signal Monitoring
✅ Advanced Risk Management
✅ Automatic Trade Execution
✅ Multi-Channel Support

*Commands:*
/grant_access - Connect your Telegram
/add_mt4 - Add MT4 account
/add_mt5 - Add MT5 account
/add_channel - Add signal channel
/start_copy - Start copying
/status - Check status
/help - Get help
  `, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `
📚 *Quick Commands*

/start - Main menu
/add_mt4 LOGIN PASS SERVER - Add MT4
/add_mt5 LOGIN PASS SERVER - Add MT5
/add_channel @username - Add channel
/grant_access - OAuth authorization
/status - Check status
/start_copy - Start copying
/stop_copy - Stop copying

*Signal Examples:*
• BUY GOLD @ 2050 SL 2045 TP 2060
• SELL BTCUSD Entry 45000 Stop 46000 TP 43000
  `, { parse_mode: 'Markdown' });
});

bot.onText(/\/status/, (msg) => {
  const user = getUserData(msg.from.id);
  bot.sendMessage(msg.chat.id, `
📊 *Status*

*Copying:* ${user.isActive ? '🟢 Active' : '🔴 Inactive'}
*MT4 Accounts:* ${user.mt4Accounts.length}
*MT5 Accounts:* ${user.mt5Accounts.length}
*Channels:* ${user.signalChannels.length}
*OAuth:* ${user.telegramSession ? '🟢 Granted' : '🔴 Not Granted'}

*Settings:*
• Lot: ${user.copySettings.baseLotSize}
• Orders: ${user.copySettings.numberOfOrders}
  `, { parse_mode: 'Markdown' });
});

// Grant access command
bot.onText(/\/grant_access/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const user = getUserData(userId);
  if (user.telegramSession) {
    bot.sendMessage(chatId, '✅ Already authorized! Use /revoke_access to remove.');
    return;
  }
  
  const token = crypto.randomBytes(32).toString('hex');
  
  pendingAuths.set(token, { 
    userId, 
    chatId, 
    timestamp: Date.now(),
    expiresAt: Date.now() + (10 * 60 * 1000),
    completed: false
  });
  
  const authUrl = `${WEBHOOK_URL || `http://localhost:${PORT}`}/telegram-auth?token=${token}`;
  
  bot.sendMessage(chatId, `
🔐 *Grant Channel Access*

*What happens:*
1️⃣ Enter your phone number
2️⃣ Get code in Telegram
3️⃣ Click "Confirm" - no typing!
4️⃣ Done!

⚠️ *Recommended:* Use separate account
  `, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: '🔐 Authorize', url: authUrl }]]
    }
  });
  
  setTimeout(() => pendingAuths.delete(token), 10 * 60 * 1000);
});

// Revoke access
bot.onText(/\/revoke_access/, async (msg) => {
  const userId = msg.from.id;
  const user = getUserData(userId);
  
  if (!user.telegramSession) {
    bot.sendMessage(msg.chat.id, 'No active authorization.');
    return;
  }
  
  user.telegramSession = null;
  
  const client = activeClients.get(userId);
  if (client) {
    try { await client.disconnect(); } catch (e) {}
    activeClients.delete(userId);
  }
  
  bot.sendMessage(msg.chat.id, '✅ Access revoked successfully!');
});

// OAuth authorization page
app.get('/telegram-auth', (req, res) => {
  const token = req.query.token;
  
  const authData = pendingAuths.get(token);
  if (!authData || authData.expiresAt < Date.now()) {
    return res.send(`
<!DOCTYPE html>
<html><head><title>Expired</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.box{background:white;padding:40px;border-radius:20px;text-align:center;max-width:400px}</style>
</head><body><div class="box"><h2>❌ Link Expired</h2><p>Request a new link with /grant_access</p></div></body></html>
    `);
  }
  
  res.send(`<!DOCTYPE html>
<html><head><title>Telegram Authorization</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.auth-container{background:white;border-radius:24px;padding:40px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
.logo{text-align:center;font-size:64px;margin-bottom:16px;animation:float 3s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}
h2{text-align:center;color:#333;margin-bottom:8px;font-size:24px}
.subtitle{text-align:center;color:#666;margin-bottom:32px;font-size:14px}
.warning{background:linear-gradient(135deg,#fff3cd 0%,#ffe69c 100%);color:#856404;padding:16px;border-radius:12px;margin-bottom:24px;font-size:13px;text-align:center;border-left:4px solid #ffc107}
.form-group{margin-bottom:24px}
label{display:block;color:#555;margin-bottom:8px;font-size:14px;font-weight:600}
.input-wrapper{position:relative}
.input-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:20px}
input{width:100%;padding:16px 16px 16px 48px;border:2px solid #e0e0e0;border-radius:12px;font-size:16px;transition:all 0.3s;background:#f8f9fa}
input:focus{outline:none;border-color:#667eea;background:white;box-shadow:0 0 0 4px rgba(102,126,234,0.1)}
button{width:100%;padding:16px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.3s;position:relative;overflow:hidden}
button:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(102,126,234,0.4)}
button:disabled{opacity:0.6;cursor:not-allowed;transform:none}
.status{margin-top:24px;padding:16px;border-radius:12px;text-align:center;display:none;animation:slideIn 0.3s}
@keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
.status.success{background:linear-gradient(135deg,#d4edda 0%,#c3e6cb 100%);color:#155724;border-left:4px solid #28a745}
.status.error{background:linear-gradient(135deg,#f8d7da 0%,#f5c6cb 100%);color:#721c24;border-left:4px solid #dc3545}
.status.info{background:linear-gradient(135deg,#d1ecf1 0%,#bee5eb 100%);color:#0c5460;border-left:4px solid #17a2b8}
.loader{border:3px solid #f3f3f3;border-top:3px solid #667eea;border-radius:50%;width:20px;height:20px;animation:spin 1s linear infinite;display:inline-block;margin-right:10px;vertical-align:middle}
@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.progress-steps{display:flex;justify-content:space-between;margin-bottom:32px;position:relative}
.progress-line{position:absolute;top:15px;left:15%;right:15%;height:2px;background:#e0e0e0;z-index:0}
.progress-line-fill{height:100%;background:#667eea;width:0%;transition:width 0.5s}
.step{width:32px;height:32px;border-radius:50%;background:#e0e0e0;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;color:#999;position:relative;z-index:1;transition:all 0.3s}
.step.active{background:#667eea;color:white;transform:scale(1.1)}
.step.completed{background:#28a745;color:white}
.help-text{text-align:center;font-size:12px;color:#999;margin-top:16px}
.telegram-code-preview{background:#f8f9fa;border:2px dashed #667eea;border-radius:12px;padding:20px;text-align:center;margin:20px 0;display:none}
.telegram-code-preview.show{display:block;animation:fadeIn 0.5s}
@keyframes fadeIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
.telegram-icon{font-size:48px;margin-bottom:12px;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
</style>
</head><body>
<div class="auth-container">
  <div class="logo">🔐</div>
  <h2>Authorize Trading Bot</h2>
  <p class="subtitle">Connect your Telegram account securely</p>
  
  <div class="progress-steps">
    <div class="progress-line"><div class="progress-line-fill" id="progressFill"></div></div>
    <div class="step active" id="step1">1</div>
    <div class="step" id="step2">2</div>
    <div class="step" id="step3">✓</div>
  </div>
  
  <div class="warning">⚠️ <strong>Important:</strong> Use a separate Telegram account to avoid restrictions.</div>
  
  <div id="phoneSection">
    <div class="form-group">
      <label for="phone">📱 Phone Number</label>
      <div class="input-wrapper">
        <span class="input-icon">📞</span>
        <input type="tel" id="phone" placeholder="+1234567890" autocomplete="tel"/>
      </div>
      <div class="help-text">Include country code (e.g., +1, +44, +234)</div>
    </div>
    <button onclick="sendCode()" id="sendBtn">
      <span style="position:relative;z-index:1">Send Verification Code</span>
    </button>
  </div>
  
  <div id="waitingSection" style="display:none">
    <div class="telegram-code-preview show">
      <div class="telegram-icon">✈️</div>
      <h3 style="margin-bottom:8px">Check Your Telegram</h3>
      <p style="color:#666;font-size:14px">We've sent a login code to your Telegram app</p>
      <p style="color:#667eea;font-weight:600;margin-top:12px;font-size:16px">Just tap "Confirm" in Telegram!</p>
    </div>
    <div style="text-align:center;margin-top:24px">
      <div class="loader" style="margin:0 auto"></div>
      <p style="color:#666;font-size:14px;margin-top:12px">Waiting for confirmation...</p>
    </div>
  </div>
  
  <div id="status" class="status"></div>
</div>

<script>
const token='${token}';
let pollInterval=null;

document.getElementById('phone').addEventListener('input',function(e){
  let value=e.target.value.replace(/[^0-9+]/g,'');
  if(value&&!value.startsWith('+'))value='+'+value;
  e.target.value=value;
});

document.getElementById('phone').addEventListener('keypress',(e)=>{
  if(e.key==='Enter')sendCode();
});

async function sendCode(){
  const phone=document.getElementById('phone').value.trim();
  const sendBtn=document.getElementById('sendBtn');
  
  if(!phone||!phone.startsWith('+')||phone.length<10){
    showStatus('Please enter a valid phone number with country code','error');
    return;
  }
  
  sendBtn.disabled=true;
  sendBtn.innerHTML='<span class="loader"></span><span style="position:relative;z-index:1">Sending...</span>';
  
  try{
    const response=await fetch('/api/send-code',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token,phone})
    });
    
    const data=await response.json();
    
    if(data.success){
      document.getElementById('step1').classList.add('completed');
      document.getElementById('step1').classList.remove('active');
      document.getElementById('step2').classList.add('active');
      document.getElementById('progressFill').style.width='50%';
      
      document.getElementById('phoneSection').style.display='none';
      document.getElementById('waitingSection').style.display='block';
      
      showStatus('📱 Code sent! Check your Telegram app','success');
      startPolling();
    }else{
      showStatus('❌ '+data.error,'error');
      sendBtn.disabled=false;
      sendBtn.innerHTML='<span style="position:relative;z-index:1">Send Verification Code</span>';
    }
  }catch(error){
    showStatus('❌ Network error. Please try again.','error');
    sendBtn.disabled=false;
    sendBtn.innerHTML='<span style="position:relative;z-index:1">Send Verification Code</span>';
  }
}

function startPolling(){
  let attempts=0;
  const maxAttempts=60;
  
  pollInterval=setInterval(async()=>{
    attempts++;
    
    if(attempts>maxAttempts){
      clearInterval(pollInterval);
      showStatus('⏱️ Timeout. Please try again.','error');
      setTimeout(()=>location.reload(),3000);
      return;
    }
    
    try{
      const response=await fetch('/api/check-auth-status',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({token})
      });
      
      const data=await response.json();
      
      if(data.completed){
        clearInterval(pollInterval);
        
        document.getElementById('step2').classList.add('completed');
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step3').classList.add('active');
        document.getElementById('progressFill').style.width='100%';
        
        showStatus('✅ Authorization successful! You can close this page.','success');
        
        setTimeout(()=>window.close(),2000);
      }
    }catch(error){
      console.error('Polling error:',error);
    }
  },2000);
}

function showStatus(message,type){
  const status=document.getElementById('status');
  status.textContent=message;
  status.className='status '+type;
  status.style.display='block';
}

window.addEventListener('beforeunload',()=>{
  if(pollInterval)clearInterval(pollInterval);
});
</script>
</body></html>`);
});

// Check auth status (polling)
app.post('/api/check-auth-status', (req, res) => {
  const { token } = req.body;
  const authData = pendingAuths.get(token);
  
  if (!authData) {
    return res.json({ completed: false, error: 'Invalid token' });
  }
  
  res.json({ completed: authData.completed || false });
});

// Send verification code
app.post('/api/send-code', async (req, res) => {
  const { token, phone } = req.body;
  
  const authData = pendingAuths.get(token);
  if (!authData || authData.expiresAt < Date.now()) {
    return res.json({ success: false, error: 'Token expired' });
  }
  
  try {
    const { TelegramClient } = require('telegram');
    const { StringSession } = require('telegram/sessions');
    
    const session = new StringSession('');
    const client = new TelegramClient(session, TELEGRAM_API_ID, TELEGRAM_API_HASH, {
      connectionRetries: 5,
      deviceModel: 'TradingBotWeb',
      systemVersion: 'WebAuth',
      appVersion: '1.0.0'
    });
    
    await client.connect();
    
    const result = await client.sendCode({
      apiId: TELEGRAM_API_ID,
      apiHash: TELEGRAM_API_HASH
    }, phone);
    
    authData.client = client;
    authData.phone = phone;
    authData.phoneCodeHash = result.phoneCodeHash;
    pendingAuths.set(token, authData);
    
    // Start auto-confirmation
    startAutoConfirm(token, client, phone);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Send code error:', error);
    res.json({ success: false, error: error.message || 'Failed to send code' });
  }
});

// Auto-confirmation handler
async function startAutoConfirm(token, client, phone) {
  const authData = pendingAuths.get(token);
  if (!authData) return;
  
  try {
    await client.signInUser({
      apiId: TELEGRAM_API_ID,
      apiHash: TELEGRAM_API_HASH
    }, {
      phoneNumber: async () => phone,
      phoneCode: async () => {
        return new Promise((resolve) => {
          const checkInterval = setInterval(async () => {
            try {
              const code = await getCodeFromTelegram(client);
              if (code) {
                clearInterval(checkInterval);
                resolve(code);
              }
            } catch (e) {}
          }, 1000);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve(null);
          }, 120000);
        });
      },
      password: async () => ''
    });
    
    const sessionString = client.session.save();
    
    const user = getUserData(authData.userId);
    user.telegramSession = sessionString;
    
    activeClients.set(authData.userId, client);
    startUserChannelMonitoring(authData.userId, client);
    
    authData.completed = true;
    pendingAuths.set(token, authData);
    
    bot.sendMessage(authData.chatId, `
✅ *Authorization Successful!*

Connected your Telegram account!

*Next steps:*
1. /add_channel @channel_name
2. /start_copy

*Manage:*
• /list_channels
• /revoke_access
    `, { parse_mode: 'Markdown' });
    
    setTimeout(() => pendingAuths.delete(token), 5000);
    
  } catch (error) {
    console.error('Auto-confirm error:', error);
    authData.error = error.message;
    pendingAuths.set(token, authData);
  }
}

async function getCodeFromTelegram(client) {
  return null;
}

// Monitor user's channels
function startUserChannelMonitoring(userId, client) {
  const { NewMessage } = require('telegram/events');
  const user = getUserData(userId);
  
  client.addEventHandler(async (event) => {
    try {
      const message = event.message;
      if (!message.text) return;
      
      const chat = await message.getChat();
      
      const isMonitored = user.signalChannels.some(ch => {
        return ch.id === chat.id.toString() || 
               (ch.username && chat.username && 
                ch.username.toLowerCase() === chat.username.toLowerCase());
      });
      
      if (isMonitored && user.isActive) {
        const signal = parseSignal(message.text);
        
        if (signal && signal.action && signal.symbol) {
          if (user.copySettings.reverseSignals) {
            signal.action = signal.action === 'BUY' ? 'SELL' : 'BUY';
          }
          
          bot.sendMessage(userId, `
🔔 *Signal Detected*

📢 ${chat.title}
${signal.action === 'BUY' ? '📈' : '📉'} ${signal.action} ${signal.symbol}
${signal.entry ? `💰 Entry: ${signal.entry}` : ''}
${signal.stopLoss ? `🛑 SL: ${signal.stopLoss}` : ''}

Executing...
          `, { parse_mode: 'Markdown' });
          
          await executeSignalOnAccounts(userId, userId, signal, chat.id.toString());
        }
      }
    } catch (error) {
      console.error('Monitoring error:', error);
    }
  }, new NewMessage({}));
  
  console.log(`✅ Started OAuth monitoring for user ${userId}`);
}

// Add MT4 account
bot.onText(/\/add_mt4 (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const params = match[1].trim().split(' ');
  const user = getUserData(userId);
  
  try {
    let accountId;
    
    if (params.length === 1) {
      accountId = params[0];
      const account = await metaApiRequest(`/users/current/accounts/${accountId}`);
      
      if (account.platform !== 'mt4') {
        bot.sendMessage(chatId, '❌ Not an MT4 account.');
        return;
      }
      
      user.mt4Accounts.push({ id: accountId, login: account.login, name: account.name });
      bot.sendMessage(chatId, `✅ MT4 connected!\nID: ${accountId}\nLogin: ${account.login}`);
      
    } else if (params.length === 3) {
      const [login, password, server] = params;
      
      bot.sendMessage(chatId, '⏳ Creating MT4 account...');
      
      const newAccount = await metaApiRequest('/users/current/accounts', 'POST', {
        name: `MT4-${login}`,
        type: 'cloud',
        login, password, server,
        platform: 'mt4',
        magic: 0
      });
      
      accountId = newAccount.id;
      await metaApiRequest(`/users/current/accounts/${accountId}/deploy`, 'POST');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      user.mt4Accounts.push({ id: accountId, login, name: `MT4-${login}` });
      bot.sendMessage(chatId, `✅ MT4 created!\n\nID: ${accountId}\nLogin: ${login}`);
      
    } else {
      bot.sendMessage(chatId, '❌ Use: /add_mt4 ACCOUNT_ID or /add_mt4 LOGIN PASS SERVER');
    }
    
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// Add MT5 account
bot.onText(/\/add_mt5 (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const params = match[1].trim().split(' ');
  const user = getUserData(userId);
  
  try {
    let accountId;
    
    if (params.length === 1) {
      accountId = params[0];
      const account = await metaApiRequest(`/users/current/accounts/${accountId}`);
      
      if (account.platform !== 'mt5') {
        bot.sendMessage(chatId, '❌ Not an MT5 account.');
        return;
      }
      
      user.mt5Accounts.push({ id: accountId, login: account.login, name: account.name });
      bot.sendMessage(chatId, `✅ MT5 connected!\nID: ${accountId}\nLogin: ${account.login}`);
      
    } else if (params.length === 3) {
      const [login, password, server] = params;
      
      bot.sendMessage(chatId, '⏳ Creating MT5 account...');
      
      const newAccount = await metaApiRequest('/users/current/accounts', 'POST', {
        name: `MT5-${login}`,
        type: 'cloud',
        login, password, server,
        platform: 'mt5',
        magic: 0
      });
      
      accountId = newAccount.id;
      await metaApiRequest(`/users/current/accounts/${accountId}/deploy`, 'POST');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      user.mt5Accounts.push({ id: accountId, login, name: `MT5-${login}` });
      bot.sendMessage(chatId, `✅ MT5 created!\n\nID: ${accountId}\nLogin: ${login}`);
      
    } else {
      bot.sendMessage(chatId, '❌ Use: /add_mt5 ACCOUNT_ID or /add_mt5 LOGIN PASS SERVER');
    }
    
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
});

// Add channel
bot.onText(/\/add_channel (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const channelIdentifier = match[1].trim();
  const user = getUserData(userId);
  
  try {
    let channelInfo;
    
    if (channelIdentifier.startsWith('@')) {
      channelInfo = await bot.getChat(channelIdentifier);
    } else {
      channelInfo = await bot.getChat(channelIdentifier);
    }
    
    const channelData = {
      id: channelInfo.id,
      title: channelInfo.title || channelIdentifier,
      username: channelInfo.username || null
    };
    
    if (user.signalChannels.some(ch => ch.id === channelData.id)) {
      bot.sendMessage(chatId, '⚠️ Channel already added!');
      return;
    }
    
    user.signalChannels.push(channelData);
    startChannelMonitoring(userId, chatId, channelData);
    
    bot.sendMessage(chatId, `✅ Channel added!\n\n📢 ${channelData.title}\nID: ${channelData.id}`);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}\n\n💡 Tip: Use /grant_access for OAuth`);
  }
});

// List channels
bot.onText(/\/list_channels/, (msg) => {
  const user = getUserData(msg.from.id);
  
  if (user.signalChannels.length === 0) {
    bot.sendMessage(msg.chat.id, '📢 No channels added yet.');
    return;
  }
  
  let message = '📢 *Your Channels:*\n\n';
  user.signalChannels.forEach((channel, index) => {
    message += `${index + 1}. ${channel.title}\n   ID: \`${channel.id}\`\n\n`;
  });
  
  bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});

// Start copying
bot.onText(/\/start_copy/, (msg) => {
  const user = getUserData(msg.from.id);
  
  if (user.signalChannels.length === 0) {
    bot.sendMessage(msg.chat.id, '❌ Add at least one channel first!');
    return;
  }
  
  if (user.mt4Accounts.length === 0 && user.mt5Accounts.length === 0) {
    bot.sendMessage(msg.chat.id, '❌ Add at least one MT4/MT5 account first!');
    return;
  }
  
  user.isActive = true;
  bot.sendMessage(msg.chat.id, '✅ Trade copying started! Monitoring all channels...');
});

// Stop copying
bot.onText(/\/stop_copy/, (msg) => {
  const user = getUserData(msg.from.id);
  user.isActive = false;
  bot.sendMessage(msg.chat.id, '🛑 Trade copying stopped.');
});

// Settings commands
bot.onText(/\/lot_size (.+)/, (msg, match) => {
  const value = parseFloat(match[1]);
  const user = getUserData(msg.from.id);
  
  if (isNaN(value) || value <= 0) {
    bot.sendMessage(msg.chat.id, '❌ Please provide a valid positive number.');
    return;
  }
  
  user.copySettings.baseLotSize = value;
  bot.sendMessage(msg.chat.id, `✅ Lot size: ${value}`);
});

bot.onText(/\/num_orders (.+)/, (msg, match) => {
  const value = parseInt(match[1]);
  const user = getUserData(msg.from.id);
  
  if (isNaN(value) || value < 1 || value > 10) {
    bot.sendMessage(msg.chat.id, '❌ Please provide a number between 1 and 10.');
    return;
  }
  
  user.copySettings.numberOfOrders = value;
  bot.sendMessage(msg.chat.id, `✅ Orders: ${value}`);
});

// Parse signal
function parseSignal(text) {
  const signal = {
    action: null,
    symbol: null,
    entry: null,
    stopLoss: null,
    takeProfit: null,
    tp1: null,
    immediate: false,
    originalText: text
  };
  
  const upperText = text.toUpperCase();
  
  if (upperText.includes('BUY') || upperText.includes('LONG')) {
    signal.action = 'BUY';
  } else if (upperText.includes('SELL') || upperText.includes('SHORT')) {
    signal.action = 'SELL';
  } else {
    return null;
  }
  
  const instruments = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    'GOLD', 'XAUUSD', 'SILVER', 'XAGUSD', 'OIL', 'BTCUSD', 'ETHUSD',
    'US30', 'US500', 'NAS100'
  ];
  
  const symbolMap = {
    'GOLD': 'XAUUSD', 'SILVER': 'XAGUSD', 'OIL': 'USOIL',
    'BITCOIN': 'BTCUSD', 'BTC': 'BTCUSD'
  };
  
  for (const inst of instruments) {
    if (upperText.includes(inst)) {
      signal.symbol = symbolMap[inst] || inst;
      break;
    }
  }
  
  if (!signal.symbol) return null;
  
  const immediateKeywords = ['NOW', 'IMMEDIATE', 'CURRENT', 'MARKET'];
  if (immediateKeywords.some(keyword => upperText.includes(keyword))) {
    signal.immediate = true;
    signal.entry = 'MARKET';
  }
  
  const priceRegex = /(\d+\.?\d*)/g;
  const prices = text.match(priceRegex);
  
  if (prices && prices.length > 0) {
    const entryMatch = text.match(/(?:entry|@|at|price)[:\s]+(\d+\.?\d*)/i);
    if (entryMatch) {
      signal.entry = parseFloat(entryMatch[1]);
    } else if (!signal.immediate) {
      signal.entry = parseFloat(prices[0]);
    }
    
    const slMatch = text.match(/(?:sl|stop\s*loss|stop)[:\s]+(\d+\.?\d*)/i);
    if (slMatch) {
      signal.stopLoss = parseFloat(slMatch[1]);
    }
    
    const tpMatch = text.match(/(?:tp|take\s*profit)[:\s]+(\d+\.?\d*)/i);
    if (tpMatch) {
      signal.takeProfit = parseFloat(tpMatch[1]);
      signal.tp1 = signal.takeProfit;
    }
  }
  
  return signal;
}

// Start channel monitoring
function startChannelMonitoring(userId, chatId, channelData) {
  const monitorKey = `${userId}_${channelData.id}`;
  
  if (channelMonitors.has(monitorKey)) {
    return;
  }
  
  bot.on('channel_post', async (msg) => {
    if (msg.chat.id === channelData.id) {
      const user = getUserData(userId);
      
      if (!user.isActive) return;
      
      const msgId = `${msg.chat.id}_${msg.message_id}`;
      if (user.lastProcessedMessages.has(msgId)) return;
      user.lastProcessedMessages.add(msgId);
      
      const signal = parseSignal(msg.text || '');
      
      if (signal && signal.action && signal.symbol) {
        if (user.copySettings.reverseSignals) {
          signal.action = signal.action === 'BUY' ? 'SELL' : 'BUY';
        }
        
        bot.sendMessage(chatId, `
🔔 *Signal Detected!*

📢 ${channelData.title}
${signal.action === 'BUY' ? '📈' : '📉'} ${signal.action} ${signal.symbol}
${signal.entry ? `💰 Entry: ${signal.entry}` : ''}
${signal.stopLoss ? `🛑 SL: ${signal.stopLoss}` : ''}

Executing...`, { parse_mode: 'Markdown' });
        
        await executeSignalOnAccounts(userId, chatId, signal, channelData.id);
      }
    }
  });
  
  channelMonitors.set(monitorKey, true);
}

// Execute signal on accounts
async function executeSignalOnAccounts(userId, chatId, signal, channelId = null) {
  const user = getUserData(userId);
  const allAccounts = [...user.mt4Accounts, ...user.mt5Accounts];
  
  if (allAccounts.length === 0) {
    bot.sendMessage(chatId, '⚠️ No accounts configured!');
    return;
  }
  
  const numberOfOrders = user.copySettings.numberOfOrders;
  const baseLotSize = user.copySettings.baseLotSize;
  const lotMultiplier = user.copySettings.lotMultiplier;
  
  for (const account of allAccounts) {
    try {
      let successCount = 0;
      let totalVolume = 0;
      
      for (let i = 0; i < numberOfOrders; i++) {
        const tradeData = {
          actionType: signal.action === 'BUY' ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL',
          symbol: signal.symbol,
          volume: baseLotSize * lotMultiplier
        };
        
        if (signal.immediate) {
          tradeData.actionType += '_MARKET';
        } else if (signal.entry) {
          tradeData.openPrice = signal.entry;
        }
        
        if (signal.stopLoss && user.copySettings.copyStopLoss) {
          tradeData.stopLoss = signal.stopLoss;
        }
        
        if (user.copySettings.copyTakeProfit && signal.tp1) {
          tradeData.takeProfit = signal.tp1;
        }
        
        await metaApiRequest(`/users/current/accounts/${account.id}/trade`, 'POST', tradeData);
        
        successCount++;
        totalVolume += tradeData.volume;
        
        if (i < numberOfOrders - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      bot.sendMessage(chatId, `✅ ${successCount} order(s) executed on ${account.login}\n💰 Volume: ${totalVolume} lots`);
      
    } catch (error) {
      bot.sendMessage(chatId, `❌ Error on ${account.login}: ${error.message}`);
    }
  }
}

// Handle forwarded messages
bot.on('message', async (msg) => {
  if (msg.forward_from_chat && msg.forward_from_chat.type === 'channel') {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const user = getUserData(userId);
    const channel = msg.forward_from_chat;
    
    const channelData = {
      id: channel.id,
      title: channel.title,
      username: channel.username || null
    };
    
    if (!user.signalChannels.some(ch => ch.id === channelData.id)) {
      user.signalChannels.push(channelData);
      startChannelMonitoring(userId, chatId, channelData);
      bot.sendMessage(chatId, `✅ Channel added: ${channelData.title}`);
    }
    
    if (user.isActive) {
      const signal = parseSignal(msg.text || '');
      
      if (signal && signal.action && signal.symbol) {
        if (user.copySettings.reverseSignals) {
          signal.action = signal.action === 'BUY' ? 'SELL' : 'BUY';
        }
        
        bot.sendMessage(chatId, `🔔 Signal from ${channel.title}! Executing...`);
        await executeSignalOnAccounts(userId, chatId, signal, channel.id);
      }
    }
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

bot.on('webhook_error', (error) => {
  console.error('Webhook error:', error);
});

// Test connections
async function testConnections() {
  console.log('🔧 Testing API connections...\n');
  
  try {
    const botInfo = await bot.getMe();
    console.log('✅ Telegram Bot Connected!');
    console.log(`   Bot Name: ${botInfo.first_name}`);
    console.log(`   Username: @${botInfo.username}\n`);
  } catch (error) {
    console.error('❌ Telegram Bot Connection Failed!');
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
  
  try {
    const accounts = await metaApiRequest('/users/current/accounts');
    console.log('✅ Meta API Connected!');
    console.log(`   Found ${accounts.length} account(s)\n`);
  } catch (error) {
    console.error('❌ Meta API Connection Failed!');
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
  
  return true;
}

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started on port ${PORT}`);
  console.log(`🌐 Mode: ${WEBHOOK_URL ? 'WEBHOOK' : 'POLLING'}`);
  console.log(`📱 Bot is ready!`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  for (const [userId, client] of activeClients.entries()) {
    try {
      await client.disconnect();
    } catch (e) {}
  }
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  
  for (const [userId, client] of activeClients.entries()) {
    try {
      await client.disconnect();
    } catch (e) {}
  }
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Run connection tests
testConnections().then(success => {
  if (success) {
    console.log('✅ All systems operational!');
    console.log('🤖 Bot is ready to receive commands...\n');
    console.log('📱 Send /start to your bot!\n');
    console.log('🔐 For OAuth: Use /grant_access\n');
  } else {
    console.log('❌ Some connections failed. Check credentials.');
  }
});

console.log('✅ Trading Copier Bot running...');
console.log('📊 Features: MT4/MT5 + Channels + OAuth + Real-time execution');
