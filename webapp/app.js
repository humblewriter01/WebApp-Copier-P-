// Initialize Telegram Web App
const tg = window.Telegram.WebApp;

// Expand to full screen
tg.ready();
tg.expand();

// Enable closing confirmation
tg.enableClosingConfirmation();

// App state
let appState = {
  accounts: [],
  channels: [],
  settings: {
    baseLotSize: 0.01,
    numberOfOrders: 1,
    lotMultiplier: 1,
    copyStopLoss: true,
    copyTakeProfit: true,
    reverseSignals: false,
    autoCloseAtTP1: true,
    moveToBreakeven: true
  },
  isActive: false
};

// Get user info
const user = tg.initDataUnsafe.user;
console.log('User:', user);

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  
  // Vibrate feedback
  tg.HapticFeedback.impactOccurred('light');
  
  // Load data for tab
  if (tabName === 'dashboard') {
    loadDashboard();
  } else if (tabName === 'accounts') {
    loadAccounts();
  } else if (tabName === 'channels') {
    loadChannels();
  } else if (tabName === 'settings') {
    loadSettings();
  }
}

// Load dashboard
function loadDashboard() {
  document.getElementById('status-accounts').textContent = appState.accounts.length;
  document.getElementById('status-channels').textContent = appState.channels.length;
  document.getElementById('status-signals').textContent = '0'; // Would be loaded from server
}

// Load accounts
function loadAccounts() {
  const accountsList = document.getElementById('accounts-list');
  
  if (appState.accounts.length === 0) {
    accountsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>No accounts added yet</p>
        <p style="font-size: 14px; margin-top: 8px;">Use bot commands:<br/>/add_mt4 or /add_mt5</p>
      </div>
    `;
    return;
  }
  
  accountsList.innerHTML = appState.accounts.map(acc => `
    <div class="account-card">
      <div class="account-info">
        <div class="account-name">${acc.name}</div>
        <div class="account-details">Login: ${acc.login} • ${acc.platform.toUpperCase()}</div>
      </div>
      <span class="badge success">Active</span>
    </div>
  `).join('');
}

// Add channel
function addChannel() {
  const input = document.getElementById('channel-input');
  const channelId = input.value.trim();
  
  if (!channelId) {
    tg.showAlert('Please enter a channel username or ID');
    return;
  }
  
  // Check if already added
  if (appState.channels.some(ch => ch.id === channelId || ch.username === channelId)) {
    tg.showAlert('Channel already added!');
    return;
  }
  
  // Add channel
  appState.channels.push({
    id: channelId,
    title: channelId,
    username: channelId.startsWith('@') ? channelId.substring(1) : null,
    selected: true
  });
  
  input.value = '';
  loadChannels();
  
  tg.HapticFeedback.notificationOccurred('success');
  tg.showPopup({
    title: 'Channel Added',
    message: `Added ${channelId} to monitoring list`,
    buttons: [{ type: 'ok' }]
  });
}

// Load channels
function loadChannels() {
  const channelsList = document.getElementById('channels-list');
  
  if (appState.channels.length === 0) {
    channelsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>No channels added</p>
      </div>
    `;
    return;
  }
  
  channelsList.innerHTML = appState.channels.map((ch, index) => `
    <div class="channel-item">
      <input type="checkbox" 
             id="channel-${index}" 
             ${ch.selected ? 'checked' : ''}
             onchange="toggleChannel(${index})">
      <div class="channel-info">
        <div class="channel-name">${ch.title}</div>
        <div class="channel-id">${ch.username ? '@' + ch.username : ch.id}</div>
      </div>
    </div>
  `).join('');
}

// Toggle channel selection
function toggleChannel(index) {
  appState.channels[index].selected = !appState.channels[index].selected;
  tg.HapticFeedback.impactOccurred('light');
}

// Load settings
function loadSettings() {
  document.getElementById('lot-size').value = appState.settings.baseLotSize;
  document.getElementById('num-orders').value = appState.settings.numberOfOrders;
  document.getElementById('lot-multiplier').value = appState.settings.lotMultiplier;
  
  document.getElementById('toggle-sl').classList.toggle('active', appState.settings.copyStopLoss);
  document.getElementById('toggle-tp').classList.toggle('active', appState.settings.copyTakeProfit);
  document.getElementById('toggle-reverse').classList.toggle('active', appState.settings.reverseSignals);
  document.getElementById('toggle-tp1').classList.toggle('active', appState.settings.autoCloseAtTP1);
}

// Toggle setting
function toggleSetting(setting) {
  const toggleElement = document.getElementById(`toggle-${setting}`);
  const isActive = toggleElement.classList.toggle('active');
  
  if (setting === 'sl') appState.settings.copyStopLoss = isActive;
  else if (setting === 'tp') appState.settings.copyTakeProfit = isActive;
  else if (setting === 'reverse') appState.settings.reverseSignals = isActive;
  else if (setting === 'tp1') appState.settings.autoCloseAtTP1 = isActive;
  
  tg.HapticFeedback.impactOccurred('medium');
}

// Save settings
function saveSettings() {
  appState.settings.baseLotSize = parseFloat(document.getElementById('lot-size').value);
  appState.settings.numberOfOrders = parseInt(document.getElementById('num-orders').value);
  appState.settings.lotMultiplier = parseFloat(document.getElementById('lot-multiplier').value);
  
  // Send to bot
  sendDataToBot({
    action: 'save_settings',
    settings: appState.settings
  });
  
  tg.HapticFeedback.notificationOccurred('success');
  tg.showPopup({
    title: 'Settings Saved',
    message: 'Your trading settings have been updated',
    buttons: [{ type: 'ok' }]
  });
}

// Start copying
function startCopying() {
  const selectedChannels = appState.channels.filter(ch => ch.selected);
  
  if (selectedChannels.length === 0) {
    tg.showAlert('Please add and select at least one channel first!');
    switchTab('channels');
    return;
  }
  
  if (appState.accounts.length === 0) {
    tg.showAlert('Please add at least one MT4/MT5 account first!');
    tg.close();
    return;
  }
  
  tg.showConfirm('Start copying signals from ' + selectedChannels.length + ' channel(s)?', (confirmed) => {
    if (confirmed) {
      sendDataToBot({
        action: 'start_copying',
        channels: selectedChannels,
        settings: appState.settings
      });
      
      appState.isActive = true;
      
      tg.HapticFeedback.notificationOccurred('success');
      tg.showPopup({
        title: '✅ Started!',
        message: 'Trade copying is now active. All signals will be executed automatically.',
        buttons: [{ 
          type: 'ok', 
          text: 'Got it' 
        }]
      });
      
      setTimeout(() => tg.close(), 1500);
    }
  });
}

// Stop copying
function stopCopying() {
  tg.showConfirm('Stop all trade copying?', (confirmed) => {
    if (confirmed) {
      sendDataToBot({
        action: 'stop_copying'
      });
      
      appState.isActive = false;
      
      tg.HapticFeedback.notificationOccurred('warning');
      tg.showPopup({
        title: '⏸️ Stopped',
        message: 'Trade copying has been paused.',
        buttons: [{ type: 'ok' }]
      });
    }
  });
}

// Send data to bot
function sendDataToBot(data) {
  console.log('Sending to bot:', data);
  tg.sendData(JSON.stringify(data));
}

// Show Main Button at bottom
tg.MainButton.setText('START COPYING');
tg.MainButton.color = '#667eea';
tg.MainButton.textColor = '#ffffff';
tg.MainButton.show();

tg.MainButton.onClick(() => {
  startCopying();
});

// Initialize app
function initApp() {
  // Show loading
  console.log('Initializing app...');
  
  // Load initial data (would be fetched from server in production)
  // For now, we'll use mock data
  
  // Simulate loading
  setTimeout(() => {
    loadDashboard();
  }, 500);
}

// Handle back button
tg.BackButton.onClick(() => {
  tg.close();
});

// Show back button
tg.BackButton.show();

// Start app
initApp();
