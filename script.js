// ============================================================================
// GAME STATE
// ============================================================================

const gameState = {
    race: null,
    isLoggedIn: false,
    currentLocation: 'bed',
    currentDialogueIndex: 0,
    selectedEmail: null,
    generatedOTP: null,
    userEmail: null,
};

// ============================================================================
// LOCATIONS DATA
// ============================================================================

const locations = {
    bed: {
        name: "Your Bed",
        background: "linear-gradient(135deg, #3d3d5c 0%, #2d2d4d 100%)",
        hotspots: [
            {
                id: 'sleep-bed',
                label: '🛏️ Sleep',
                x: '40%',
                y: '45%',
                width: '20%',
                height: '30%'
            }
        ],
        dialogue: {
            locked: "You need to log in before you can sleep. Data collection awaits.",
            unlocked: "You finally sleep... exhausted from sharing so much of yourself."
        }
    },
    room: {
        name: "Your Room",
        background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
        hotspots: [
            {
                id: 'room-door',
                label: '🚪 Door',
                x: '70%',
                y: '40%',
                width: '15%',
                height: '35%'
            }
        ],
        dialogue: {
            locked: "The door is locked. You need an account to open it.",
            unlocked: "You step through the door..."
        }
    },
    house: {
        name: "Your House",
        background: "linear-gradient(135deg, #5a6f7d 0%, #3a4f5d 100%)",
        hotspots: [
            {
                id: 'house-door',
                label: '🚪 Front Door',
                x: '45%',
                y: '50%',
                width: '15%',
                height: '30%'
            }
        ],
        dialogue: {
            locked: "You can't leave without logging in. The system won't allow it.",
            unlocked: "You step outside into the open world..."
        }
    },
    outside: {
        name: "Outside",
        background: "linear-gradient(135deg, #7cb342 0%, #558b2f 100%)",
        hotspots: [
            {
                id: 'flowers',
                label: '🌸 Flowers',
                x: '30%',
                y: '60%',
                width: '15%',
                height: '20%'
            },
            {
                id: 'mart-door',
                label: '🏪 Poké Mart',
                x: '60%',
                y: '45%',
                width: '20%',
                height: '30%'
            }
        ],
        dialogue: {
            flowers: {
                locked: "Beautiful black-boxed flowers. Error 403: Insufficient Permissions.",
                unlocked: "Gorgeous wildflowers. They don't ask for your data."
            },
            mart: {
                locked: "The mart door is closed to unregistered players.",
                unlocked: "You enter the Poké Mart..."
            }
        }
    },
    mart: {
        name: "Poké Mart",
        background: "linear-gradient(135deg, #ff6f00 0%, #e65100 100%)",
        hotspots: [
            {
                id: 'mart-checkout',
                label: '💳 Buy Items',
                x: '45%',
                y: '70%',
                width: '20%',
                height: '15%'
            }
        ],
        dialogue: {
            locked: "You need an account to make purchases.",
            unlocked: "Welcome to the Mart. Your purchase history is being logged."
        }
    }
};

// ============================================================================
// FAKE EMAILS DATA (Darkly Humorous)
// ============================================================================

function generateEmails(userEmail) {
    return [
        {
            id: 1,
            from: 'noreply@pokemail.com',
            subject: 'Welcome to PokéMail!',
            body: 'Welcome to PokéMail, where your data is our treasure!\n\nYou\'ve just agreed to:\n- Track your location 24/7\n- Monitor your sleep patterns\n- Predict your purchases\n- Sell your metadata to the highest bidder\n\nEnjoy your stay!',
            time: '9:30 AM',
            read: false,
            type: 'system'
        },
        {
            id: 2,
            from: 'offers@pokeshop.biz',
            subject: '🔥 WOW! UNBEATABLE POKEMON CARD PRICES!!!',
            body: 'CLICK NOW!!! LIMITED TIME!!! AMAZING DEALS!!!\n\n(We know you clicked this because we\'ve been tracking your click patterns. Your account shows a 87% likelihood of purchasing within the hour.)',
            time: '9:45 AM',
            read: false,
            type: 'spam'
        },
        {
            id: 3,
            from: 'privacy@totallylegit.com',
            subject: 'Claim Your FREE POKEBALLS',
            body: 'To claim your free items, please verify:\n- Full name\n- Social Security Number\n- Blood type\n- Favorite breakfast cereal\n- Your pet\'s childhood nickname\n\nDon\'t worry, we definitely won\'t misuse this!',
            time: '10:00 AM',
            read: false,
            type: 'phishing'
        },
        {
            id: 4,
            from: 'ads@megacorp.net',
            subject: 'Limited Offer: Pokémon GO+ Premium',
            body: 'Based on your location history (we\'ve been watching), you NEED this!\n\nUpgrade to Premium and get:\n- 5% discount (50% markup to normal price)\n- More ads\n- Even MORE data collection\n- A badge that says you\'re rich\n\nBuy now!',
            time: '10:15 AM',
            read: false,
            type: 'ads'
        },
        {
            id: 5,
            from: 'otp@pokesystem.auth',
            subject: '🔐 Your OTP Code',
            body: 'Your One-Time Password (OTP) is:\n\n837429\n\nDo not share this code. We\'re just storing it forever in our database anyway.',
            time: '10:20 AM',
            read: false,
            type: 'otp'
        },
        {
            id: 6,
            from: 'noreply@pokemail.com',
            subject: 'We analyzed your sleep. You\'re tired.',
            body: 'Our AI has determined that you went to sleep at 11:47 PM and woke at 6:33 AM.\n\nYou\'re tired.\n\nBuy our energy drink.\n\nWe know you will. Your behavioral prediction score is 94%.',
            time: '10:40 AM',
            read: false,
            type: 'spam'
        },
        {
            id: 7,
            from: 'purchase@pokestore.com',
            subject: 'RECEIPT: Pokémon Ultra Violet',
            body: 'Transaction #992847\nItem: Pokémon Ultra Violet\nPrice: $59.99\nPayment Method: Linked Account\n\nThank you for allowing us to track this purchase!\nWe\'ve added it to your profile for future targeted marketing.',
            time: '11:00 AM',
            read: false,
            type: 'receipt'
        },
        {
            id: 8,
            from: 'alerts@privacy.fake',
            subject: 'URGENT: Suspicious Activity [NOT REALLY]',
            body: 'We detected suspicious activity:\n\nYou opened an email.\n\nThis is definitely suspicious.\n\nTo verify it wasn\'t a hacker:\n- Click here\n- Enter your password\n- Install our "security" software\n- Give us more data\n\nWe\'re definitely not scamming you.',
            time: '11:15 AM',
            read: false,
            type: 'phishing'
        },
        {
            id: 9,
            from: 'promotions@pokebase.com',
            subject: 'Achievement Unlocked: You Sold Your Sleep Data!',
            body: 'Congratulations!\n\nYou\'ve successfully agreed to the terms and conditions without reading them!\n\nReward: Our happiness.\n\nYour reward: Probably nothing.\n\nP.S. We own your data now.',
            time: '11:30 AM',
            read: false,
            type: 'spam'
        },
        {
            id: 10,
            from: 'support@pokemail.com',
            subject: 'Your Account Security Question',
            body: 'Security Question: "What is your mother\'s maiden name?"\n\n(Don\'t worry, we\'re just asking for our records. Definitely not for identity theft.)',
            time: '11:45 AM',
            read: false,
            type: 'system'
        }
    ];
}

// ============================================================================
// DIALOGUE SYSTEM
// ============================================================================

function showDialogue(text, callback) {
    const dialogueBox = document.getElementById('dialogueBox');
    const dialogueText = document.getElementById('dialogueText');
    
    dialogueBox.style.display = 'block';
    dialogueText.innerHTML = '';
    
    let charIndex = 0;
    const typeInterval = 30; // ms per character
    
    function typeCharacter() {
        if (charIndex < text.length) {
            dialogueText.innerHTML += text[charIndex];
            charIndex++;
            setTimeout(typeCharacter, typeInterval);
        }
    }
    
    typeCharacter();
    
    // Click to continue
    const continueHandler = () => {
        dialogueBox.removeEventListener('click', continueHandler);
        dialogueBox.style.display = 'none';
        if (callback) callback();
    };
    
    dialogueBox.addEventListener('click', continueHandler);
}

function hideDialogue() {
    document.getElementById('dialogueBox').style.display = 'none';
}

// ============================================================================
// EMAIL SYSTEM
// ============================================================================

let emailsData = [];

function initializeEmails(email) {
    emailsData = generateEmails(email);
}

function renderEmailList() {
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = '';
    
    const unreadCount = emailsData.filter(e => !e.read).length;
    document.getElementById('emailCount').textContent = unreadCount;
    
    emailsData.forEach(email => {
        const emailItem = document.createElement('div');
        emailItem.className = `email-item ${email.type === 'otp' ? 'otp' : ''} ${!email.read ? 'unread' : ''}`;
        
        emailItem.innerHTML = `
            <div class="email-from">${email.from}</div>
            <div class="email-subject">${email.subject}</div>
            <div class="email-time">${email.time}</div>
        `;
        
        emailItem.addEventListener('click', () => showEmailDetail(email.id));
        emailList.appendChild(emailItem);
    });
}

function showEmailDetail(emailId) {
    const email = emailsData.find(e => e.id === emailId);
    if (!email) return;
    
    email.read = true;
    
    document.getElementById('phoneInboxState').style.display = 'none';
    document.getElementById('phoneEmailDetailState').style.display = 'flex';
    
    document.getElementById('emailDetailFrom').textContent = `From: ${email.from}`;
    document.getElementById('emailDetailSubject').textContent = email.subject;
    document.getElementById('emailDetailTime').textContent = email.time;
    document.getElementById('emailDetailBody').textContent = email.body;
    
    renderEmailList();
}

function backToInbox() {
    document.getElementById('phoneEmailDetailState').style.display = 'none';
    document.getElementById('phoneInboxState').style.display = 'flex';
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

function startLoginFlow() {
    document.getElementById('phoneInboxState').style.display = 'none';
    document.getElementById('phoneLoginState').style.display = 'flex';
}

function completeLogin() {
    const email = document.getElementById('emailInput').value;
    if (!email) {
        alert('Please enter an email');
        return;
    }
    
    gameState.userEmail = email;
    initializeEmails(email);
    
    // Generate OTP and set it in a fake email
    gameState.generatedOTP = '837429';
    
    // Move to OTP form
    document.getElementById('phoneLoginState').style.display = 'none';
    document.getElementById('phoneOTPState').style.display = 'flex';
    document.getElementById('phoneInboxState').style.display = 'none';
    
    renderEmailList();
}

function completeOTP() {
    const otpInput = document.getElementById('otpInput').value;
    if (otpInput !== gameState.generatedOTP) {
        alert('Incorrect OTP. Try 837429');
        return;
    }
    
    gameState.isLoggedIn = true;
    
    document.getElementById('phoneOTPState').style.display = 'none';
    document.getElementById('phoneInboxState').style.display = 'flex';
    
    hideBlockedModal();
    showDialogue("✓ Login successful. Your data is now ours. Continue your journey.", renderCurrentLocation);
}

// ============================================================================
// LOCATION & INTERACTION RENDERING
// ============================================================================

function renderCurrentLocation() {
    const location = locations[gameState.currentLocation];
    const gameCanvas = document.getElementById('gameCanvas');
    
    gameCanvas.style.backgroundImage = `url('')`;
    gameCanvas.style.background = location.background;
    
    // Render hotspots
    const hotspotsContainer = document.getElementById('hotspotsContainer');
    hotspotsContainer.innerHTML = '';
    
    location.hotspots.forEach(hotspot => {
        const hotspotDiv = document.createElement('div');
        hotspotDiv.className = 'hotspot';
        hotspotDiv.style.left = hotspot.x;
        hotspotDiv.style.top = hotspot.y;
        hotspotDiv.style.width = hotspot.width;
        hotspotDiv.style.height = hotspot.height;
        hotspotDiv.innerHTML = hotspot.label;
        hotspotDiv.addEventListener('click', () => handleInteraction(hotspot.id));
        hotspotsContainer.appendChild(hotspotDiv);
    });
}

function handleInteraction(hotspotId) {
    const location = locations[gameState.currentLocation];
    let dialogueText = '';
    let nextLocation = null;
    let showMart = false;
    
    if (gameState.currentLocation === 'bed' && hotspotId === 'sleep-bed') {
        if (!gameState.isLoggedIn) {
            showBlockedModal(location.dialogue.locked);
        } else {
            showDialogue(location.dialogue.unlocked, () => {
                gameState.currentLocation = 'room';
                renderCurrentLocation();
            });
        }
    }
    
    else if (gameState.currentLocation === 'room' && hotspotId === 'room-door') {
        if (!gameState.isLoggedIn) {
            showBlockedModal(location.dialogue.locked);
        } else {
            showDialogue(location.dialogue.unlocked, () => {
                gameState.currentLocation = 'house';
                renderCurrentLocation();
            });
        }
    }
    
    else if (gameState.currentLocation === 'house' && hotspotId === 'house-door') {
        if (!gameState.isLoggedIn) {
            showBlockedModal(location.dialogue.locked);
        } else {
            showDialogue(location.dialogue.unlocked, () => {
                gameState.currentLocation = 'outside';
                renderCurrentLocation();
            });
        }
    }
    
    else if (gameState.currentLocation === 'outside') {
        if (hotspotId === 'flowers') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue.flowers.locked);
            } else {
                showDialogue(location.dialogue.flowers.unlocked);
            }
        } else if (hotspotId === 'mart-door') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue.mart.locked);
            } else {
                showDialogue(location.dialogue.mart.unlocked, () => {
                    gameState.currentLocation = 'mart';
                    renderCurrentLocation();
                });
            }
        }
    }
    
    else if (gameState.currentLocation === 'mart' && hotspotId === 'mart-checkout') {
        if (!gameState.isLoggedIn) {
            showBlockedModal(location.dialogue.locked);
        } else {
            showMartModal();
        }
    }
}

// ============================================================================
// MART MODAL
// ============================================================================

function showMartModal() {
    const martItems = [
        { name: 'Potion', price: '$100' },
        { name: 'Antidote', price: '$150' },
        { name: 'Pokéball', price: '$200' },
        { name: 'Great Ball', price: '$600' }
    ];
    
    const martItemsContainer = document.querySelector('.mart-items');
    martItemsContainer.innerHTML = '';
    
    martItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'mart-item';
        itemDiv.innerHTML = `
            <div class="mart-item-name">${item.name}</div>
            <div class="mart-item-price">${item.price}</div>
            <button onclick="purchaseItem('${item.name}', '${item.price}')">Buy</button>
        `;
        martItemsContainer.appendChild(itemDiv);
    });
    
    document.getElementById('martModal').style.display = 'flex';
}

function closeMartModal() {
    document.getElementById('martModal').style.display = 'none';
}

function purchaseItem(itemName, price) {
    showDialogue(`Purchase recorded:\n${itemName} - ${price}\n\nYour purchase history has been logged and sold to advertisers. Enjoy!`, closeMartModal);
}

// ============================================================================
// BLOCKED MODAL
// ============================================================================

function showBlockedModal(message) {
    document.getElementById('blockedMessage').textContent = message;
    document.getElementById('blockedModal').style.display = 'flex';
}

function closeBlockedModal() {
    document.getElementById('blockedModal').style.display = 'none';
}

document.getElementById('blockedLoginBtn').addEventListener('click', () => {
    closeBlockedModal();
    startLoginFlow();
});

// ============================================================================
// RACE SELECTION
// ============================================================================

function selectRace(race) {
    gameState.race = race;
    document.getElementById('raceSelectModal').style.display = 'none';
    
    showDialogue(`You have become a ${race}. Everything you do will now require your data.`, () => {
        renderCurrentLocation();
        renderEmailList();
    });
}

document.querySelectorAll('.race-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectRace(btn.dataset.race);
    });
});

// ============================================================================
// EMAIL EVENT LISTENERS
// ============================================================================

document.getElementById('loginSubmitBtn').addEventListener('click', completeLogin);
document.getElementById('otpSubmitBtn').addEventListener('click', completeOTP);
document.getElementById('backToInboxBtn').addEventListener('click', backToInbox);

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('raceSelectModal').style.display = 'flex';
    document.getElementById('phoneInboxState').style.display = 'flex';
});

// Fallback: ensure inbox is shown on load
window.addEventListener('load', () => {
    if (!gameState.race) {
        document.getElementById('raceSelectModal').style.display = 'flex';
    }
});
