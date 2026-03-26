// ============================================================================
// GAME STATE
// ============================================================================

const gameState = {
    race: null,
    isLoggedIn: false,
    currentLocation: 'room',
    currentDialogueIndex: 0,
    generatedOTP: null,
    userEmail: null,
    userPassword: null,
    signupOtpSent: false,
    // Per-system logins: each hotspot acts like a separate "service"
    serviceLogins: {},
    pendingService: null,
    // Track which race-based restrictions have already triggered an email
    restrictionEmailsSent: {},
    // Aggregate stats
    loginCount: 0,
    dataRecordedCount: 0,
    serviceFollowupScheduled: {}
};

const defaultCredentials = {
    email: 'abc@gmail.com',
    password: 'autofill'
};

// Race-based restrictions (which hotspots/interactions are blocked for which races)
const raceRestrictions = {
    godzilla: {
        park: ['park-playground'],
        outside: ['park'],
        plaza: ['plaza-cafe'],
        house: ['house-door']
    },
    werewolf: {
        outside: ['flowers'],
        park: ['park-bench'],
        mart: ['mart-shelf-2']
    },
    vampire: {
        bed: ['sleep-bed'],
        room: ['room-window'],
        outside: ['flowers']
    },
    fairy: {
        mart: ['mart-shelf-1'],
        plaza: ['plaza-arcade']
    },
    princess: {
        // Princess gets most access (ironic commentary on privilege)
    }
};

// Per-system login flavour text for each hotspot "service"
const serviceLoginMessages = {
    // Bed / phone
    'sleep-bed': 'SleepTracker™ requires a separate account to monitor your dreams.',
    'phone-on-bed': 'PhoneID Connect: Sign in again so your phone can sync even more data.',

    // Room systems
    'room-door': 'DoorCorp™: Create an account to open doors in your own house.',
    'room-window': 'WindowCloud®: Sunshine access requires its own login.',
    'room-desk': 'DeskOS™: Authenticate again to use your personal computer.',

    // House systems
    'house-door': 'FrontDoor Services LLC: Separate credentials required to leave the building.',
    'house-kitchen': 'KitchenCloud™: Log in to access food and nutritional analytics.',
    'house-mirror': 'MirrorID®: Biometric reflection service needs its own account.',

    // Outside systems
    'flowers': 'FloraPass: Sign up to smell these flowers and share your pollen data.',
    'park': 'ParkNet™: Neighborhood park uses a different platform. Please log in.',
    'mart-door': 'MartAccess™: Retail entry system requires additional authentication.',
    'npc-stranger': 'SocialLink™: Talking to strangers needs a separate social identity login.',

    // Park systems
    'park-playground': 'Playground Plus: Child-safe fun behind yet another account wall.',
    'park-bench': 'BenchReserve™: Sitting services require recurring authentication.',
    'park-exit': 'ExitGate Cloud: Even leaving the park needs a separate login.',

    // Mart systems
    'mart-shelf-1': 'ShelfID Potions: Browse potions with your dedicated inventory account.',
    'mart-shelf-2': 'ShelfID Balls: A different vendor, a different login.',
    'mart-checkout': 'PayLink™ Checkout: Payment processing is managed by another provider.',
    'mart-exit': 'StoreGate™: Exiting the mart uses its own security system.',

    // Plaza systems
    'plaza-cafe': 'CafeClub®: Coffee loyalty program demands a separate profile.',
    'plaza-arcade': 'ArcadeID: High scores and game time tracked under a unique login.',
    'plaza-exit': 'TransitHub™: Map access handled by a third-party mobility platform.',

    // Final system
    'final-exit': 'EndOfLine Services: Finalizing your journey requires one last login.'
};

// Satirical emails that get sent when logging into each separate system
const serviceEmailTemplates = {
    'sleep-bed': [
        {
            from: 'sleep@tracker.io',
            subject: 'Welcome to SleepTracker™',
            body: 'Thanks for signing up to SleepTracker. We use your movement and sleep patterns to give you sleep insights and recommend related products over time.',
            type: 'system'
        }
    ],
    'phone-on-bed': [
        {
            from: 'sync@phoneid.net',
            subject: 'PhoneID Connect: Sync Enabled',
            body: 'Your phone is now synced across our partner services so your apps can stay connected and notifications can be tailored to how you use your device.',
            type: 'ads'
        }
    ],

    'room-door': [
        {
            from: 'access@doorcorp.com',
            subject: 'DoorCorp™: Home Access Granted',
            body: 'You can now use DoorCorp to unlock your front door. Basic usage data like time and frequency of use may be logged to help improve reliability and security.',
            type: 'system'
        }
    ],
    'room-window': [
        {
            from: 'light@windowcloud.io',
            subject: 'WindowCloud®: Sunshine Activated',
            body: 'WindowCloud is now active. We estimate light exposure in your room to suggest routines, wellness tips, and occasional related offers.',
            type: 'ads'
        }
    ],
    'room-desk': [
        {
            from: 'support@deskos.app',
            subject: 'DeskOS™ Account Linked',
            body: 'Your DeskOS account is linked. We collect limited usage metrics to keep your workspace synced and to surface productivity recommendations.',
            type: 'system'
        }
    ],

    'house-door': [
        {
            from: 'alerts@frontdoor.services',
            subject: 'FrontDoor Services: Exit Logged',
            body: 'We will note each time you unlock and exit through your front door so we can detect unusual activity and improve access alerts.',
            type: 'system'
        }
    ],
    'house-kitchen': [
        {
            from: 'diet@kitchencloud.io',
            subject: 'KitchenCloud™: Fridge Connected',
            body: 'Your fridge is now online. We track basic opening and inventory patterns to suggest recipes, shopping lists, and occasional promotions.',
            type: 'ads'
        }
    ],
    'house-mirror': [
        {
            from: 'scan@mirrorid.ai',
            subject: 'MirrorID®: Face Scan Complete',
            body: 'Your MirrorID profile is set up. Face data is used for authentication, personalization, and security checks in line with our privacy policy.',
            type: 'system'
        }
    ],

    'flowers': [
        {
            from: 'nature@florapass.org',
            subject: 'FloraPass: Flower Access Approved',
            body: 'You now have access to this managed green area. Visitor counts and dwell time may be used to plan maintenance and inform local offers.',
            type: 'ads'
        }
    ],
    'park': [
        {
            from: 'visits@parknet.city',
            subject: 'ParkNet™: Entry Confirmed',
            body: 'Welcome to the park. We may collect anonymous visit and movement data to improve facilities and understand how the space is used.',
            type: 'system'
        }
    ],
    'mart-door': [
        {
            from: 'welcome@martaccess.biz',
            subject: 'MartAccess™: Store Entry Data',
            body: 'Your visit to the store has been registered. We log approximate visit time and sections viewed to better plan staffing and promotions.',
            type: 'ads'
        }
    ],
    'npc-stranger': [
        {
            from: 'social@sociallink.app',
            subject: 'SocialLink™: New Interaction Detected',
            body: 'We noticed you started a new conversation. SocialLink may use interaction data to suggest contacts and events you might be interested in.',
            type: 'ads'
        }
    ],

    'park-playground': [
        {
            from: 'kids@playgroundplus.fun',
            subject: 'Playground Plus: Activity Monitoring On',
            body: 'Playground Plus is active. Aggregate play activity may be monitored to keep equipment safe and to understand which areas are most used.',
            type: 'system'
        }
    ],
    'park-bench': [
        {
            from: 'rest@benchreserve.com',
            subject: 'BenchReserve™: Seat Usage Logged',
            body: 'Your bench reservation has been noted. We may track approximate stay length to manage availability and inform park planning.',
            type: 'ads'
        }
    ],
    'park-exit': [
        {
            from: 'exit@parknet.city',
            subject: 'ParkNet™: Exit Processed',
            body: 'Your park visit has ended. Aggregated visit statistics may be shared with the city to help maintain and improve public spaces.',
            type: 'system'
        }
    ],

    'mart-shelf-1': [
        {
            from: 'potions@shelfid.store',
            subject: 'ShelfID Potions: Interest Detected',
            body: 'You viewed items in the potions aisle. We may use this browsing history to fine-tune recommendations and store layout.',
            type: 'ads'
        }
    ],
    'mart-shelf-2': [
        {
            from: 'balls@shelfid.store',
            subject: 'ShelfID Balls: Profile Updated',
            body: 'Your interest in capture items was recorded. Similar products may appear more often in your suggestions and in-store offers.',
            type: 'ads'
        }
    ],
    'mart-checkout': [
        {
            from: 'receipts@paylink.io',
            subject: 'PayLink™: Checkout Analytics Enabled',
            body: 'Your purchases will be logged with price and location so we can issue receipts, detect fraud, and improve our services.',
            type: 'receipt'
        }
    ],
    'mart-exit': [
        {
            from: 'insights@storegate.biz',
            subject: 'StoreGate™: Visit Summary',
            body: 'Your visit has ended. We store basic details like duration and sections visited to better stock shelves and manage campaigns.',
            type: 'spam'
        }
    ],

    'plaza-cafe': [
        {
            from: 'loyalty@cafeclub.coffee',
            subject: 'CafeClub®: Loyalty Profile Created',
            body: 'Your CaféClub account is active. We track your usual orders and visit times so we can send occasional discounts and tailored offers.',
            type: 'ads'
        }
    ],
    'plaza-arcade': [
        {
            from: 'games@arcadeid.fun',
            subject: 'ArcadeID: Gaming Habits Tracked',
            body: 'Your ArcadeID session has started. Game results and play time may be analyzed to balance difficulty and suggest new titles.',
            type: 'system'
        }
    ],
    'plaza-exit': [
        {
            from: 'routes@transithub.app',
            subject: 'TransitHub™: Movement Profile Updated',
            body: 'Leaving the plaza updated your usual route. TransitHub may use anonymous movement patterns to improve route suggestions and local listings.',
            type: 'ads'
        }
    ],

    'final-exit': [
        {
            from: 'summary@endofline.services',
            subject: 'EndOfLine Services: Lifetime Report Ready',
            body: 'Your journey through this service is complete. A summary of logins, devices, and preferences has been compiled for your records.',
            type: 'system'
        }
    ]
};

// ============================================================================
// FOLLOW-UP AD EMAILS (BASED ON RACE)
// ============================================================================

function scheduleFollowupEmails(serviceId) {
    if (!serviceId) return;
    if (!gameState.race) return;

    if (gameState.serviceFollowupScheduled[serviceId]) return;
    gameState.serviceFollowupScheduled[serviceId] = true;

    const raceLabel = gameState.race.charAt(0).toUpperCase() + gameState.race.slice(1);
    const baseName = serviceId.replace(/[-_]/g, ' ');
    const serviceName = baseName.charAt(0).toUpperCase() + baseName.slice(1);

    // Send a follow-up ad email some time after the first login
    setTimeout(() => {
        const now = new Date();
        const email = {
            id: Date.now(),
            from: 'ads@profile-targets.net',
            subject: `${serviceName}: extra offers for your ${raceLabel} profile`,
            body:
                `Because you logged in to ${serviceName}, we found new offers that match how ${raceLabel} accounts usually behave.\n\n` +
                'These suggestions are based on your activity and on similar profiles. Turning this off may reduce access to some features.',
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            type: 'ads'
        };

        emailsData.push(email);
        gameState.dataRecordedCount += 1;
        renderEmailList();
    }, 30000); // ~30 seconds after first login to this service
}

// ============================================================================
// LOCATIONS DATA
// ============================================================================

const locations = {
    bed: {
        name: "Your Bed",
        background: "linear-gradient(135deg, #3d3d5c 0%, #2d2d4d 100%)",
        backgroundImage: "assets/bedroom.png",
        hotspots: [
            {
                id: 'sleep-bed',
                label: '🛏️ Bed',
                x: '73%',
                y: '45%',
                width: '20%',
                height: '35%'
            },
            {
                id: 'phone-on-bed',
                label: '📺 TV / Phone',
                x: '75%',
                y: '1%',
                width: '30%',
                height: '35%'
            }
        ],
        dialogue: {
            'sleep-bed-locked': "You need to log in before you can sleep.",
            'sleep-bed-unlocked': "You finally fall asleep, drained from the day.",
            'phone-on-bed': "Your phone lights up with a steady stream of notifications."
        }
    },
    room: {
        name: "Your Room",
        background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
        backgroundImage: "assets/bedroom.png",
        hotspots: [
            {
                id: 'room-door',
                label: 'Leave',
                x: '8%',
                y: '8%',
                width: '17%',
                height: '17%'
            },
            {
                id: 'sleep-bed',
                label: 'Bed',
                x: '73%',
                y: '45%',
                width: '20%',
                height: '30%'
            },
            {
                id: 'room-desk',
                label: 'Computer',
                x: '75%',
                y: '0%',
                width: '30%',
                height: '35%'
            }
        ],
        dialogue: {
            'room-door-locked': "The door is locked. You need to sign in to open it.",
            'room-door-unlocked': "You step through the door into the hallway.",
            'room-desk-locked': "The computer won’t start without your login.",
            'room-desk-unlocked': "You log into your computer. Another account, another session.",
            'sleep-bed-unlocked': "You lie down and drift off for a while."
        }
    },
    house: {
        name: "Your House",
        background: "linear-gradient(135deg, #5a6f7d 0%, #3a4f5d 100%)",
        backgroundImage: "assets/outsideBedroom.png",
        hotspots: [
            {
                id: 'house-door',
                label: 'Front Door',
                x: '15%',
                y: '17%',
                width: '16%',
                height: '16%'
            },
            {
                id: 'house-kitchen',
                label: 'Fridge',
                x: '92%',
                y: '12%',
                width: '8%',
                height: '20%'
            },
            {
                id: 'house-mirror',
                label: 'Mirror',
                x: '55%',
                y: '72%',
                width: '12%',
                height: '12%'
            }
        ],
        dialogue: {
            'house-door-locked': "You can’t leave yet. Your account isn’t verified.",
            'house-door-unlocked': "You open the front door and step outside.",
            'house-kitchen-locked': "The fridge is locked behind a smart panel.",
            'house-kitchen-unlocked': "You grab some food while the system quietly logs it.",
            'house-mirror-locked': "The mirror stays dark. Face recognition failed.",
            'house-mirror-unlocked': "Your reflection appears as the scanner completes its check."
        }
    },
    outside: {
        name: "Outside - Neighborhood",
        background: "linear-gradient(135deg, #7cb342 0%, #558b2f 100%)",
        backgroundImage: "assets/town.png",
        hotspots: [
            {
                id: 'flowers',
                label: 'Forest',
                x: '50%',
                y: '68%',
                width: '40%',
                height: '30%'
            },
            {
                id: 'park',
                label: 'Gym',
                x: '11%',
                y: '4%',
                width: '17%',
                height: '15%'
            },
            {
                id: 'mart-door',
                label: 'Mart',
                x: '54%',
                y: '42%',
                width: '11%',
                height: '11%'
            },
            {
                id: 'npc-stranger',
                label: 'Friend\'s House',
                x: '77%',
                y: '41%',
                width: '13%',
                height: '13%'
            }
        ],
        dialogue: {
            'flowers-locked': "The path to the flowers is blocked off.",
            'flowers-unlocked': "You stop for a moment to look at the wildflowers.",
            'park-locked': "A sign at the park gate asks you to log in first.",
            'park-unlocked': "You look toward the park, but the rest of town is outside this prototype.",
            'mart-door-locked': "The mart door stays shut to anyone not registered.",
            'mart-door-unlocked': "The mart entrance glows with ads, but this store isn’t part of the current demo.",
            'npc-stranger-locked': "The person glances your way but doesn’t respond.",
            'npc-stranger-unlocked': "Stranger: “I used to keep things offline. It’s harder now.”"
        }
    },
    park: {
        name: "Pokémon Park",
        background: "linear-gradient(135deg, #66bb6a 0%, #43a047 100%)",
        backgroundImage: "assets/town.png",
        hotspots: [
            {
                id: 'park-playground',
                label: '🎠 Playground',
                x: '30%',
                y: '50%',
                width: '18%',
                height: '25%'
            },
            {
                id: 'park-bench',
                label: '🪑 Bench',
                x: '55%',
                y: '60%',
                width: '15%',
                height: '18%'
            },
            {
                id: 'park-exit',
                label: '🚪 Exit',
                x: '75%',
                y: '50%',
                width: '12%',
                height: '20%'
            }
        ],
        dialogue: {
            'park-playground-locked': "The playground is roped off outside of registered hours.",
            'park-playground-unlocked': "You hear kids playing in the background as you pass by.",
            'park-bench-locked': "The bench is marked as reserved for members.",
            'park-bench-unlocked': "You sit for a moment while the city quietly logs foot traffic.",
            'park-exit-unlocked': "You leave the park and head back toward the street."
        }
    },
    mart: {
        name: "Poké Mart",
        background: "linear-gradient(135deg, #ff6f00 0%, #e65100 100%)",
        backgroundImage: "assets/town.png",
        hotspots: [
            {
                id: 'mart-shelf-1',
                label: '📦 Potions',
                x: '20%',
                y: '45%',
                width: '16%',
                height: '30%'
            },
            {
                id: 'mart-shelf-2',
                label: '📦 Balls',
                x: '50%',
                y: '45%',
                width: '16%',
                height: '30%'
            },
            {
                id: 'mart-checkout',
                label: '💳 Checkout',
                x: '75%',
                y: '55%',
                width: '16%',
                height: '25%'
            },
            {
                id: 'mart-exit',
                label: '🚪 Exit',
                x: '10%',
                y: '30%',
                width: '12%',
                height: '20%'
            }
        ],
        dialogue: {
            'mart-shelf-1-locked': "You can’t see the stock without signing in.",
            'mart-shelf-1-unlocked': "Potions and antidotes line the shelf, neatly tagged.",
            'mart-shelf-2-locked': "This shelf is visible only to registered customers.",
            'mart-shelf-2-unlocked': "Different types of Pokéballs are on display, sorted by use.",
            'mart-checkout-locked': "Checkout is only available to logged-in accounts.",
            'mart-checkout-unlocked': "You move to pay, knowing the purchase will stay on record.",
            'mart-exit-unlocked': "You step back out of the mart into the street."
        }
    },
    plaza: {
        name: "Shopping Plaza",
        background: "linear-gradient(135deg, #b0bec5 0%, #78909c 100%)",
        backgroundImage: "assets/town.png",
        hotspots: [
            {
                id: 'plaza-cafe',
                label: '☕ Café',
                x: '25%',
                y: '50%',
                width: '18%',
                height: '25%'
            },
            {
                id: 'plaza-arcade',
                label: '🕹️ Arcade',
                x: '55%',
                y: '50%',
                width: '18%',
                height: '25%'
            },
            {
                id: 'plaza-exit',
                label: '🚗 Exit to Map',
                x: '80%',
                y: '40%',
                width: '15%',
                height: '30%'
            }
        ],
        dialogue: {
            'plaza-cafe-locked': "The café door has a small sign: members only.",
            'plaza-cafe-unlocked': "You grab a drink while the system adds it to your usual order history.",
            'plaza-arcade-locked': "You need an account before you can start a game.",
            'plaza-arcade-unlocked': "You spend a few minutes playing while scores sync to your profile.",
            'plaza-exit-unlocked': "You leave the plaza and check the map for what’s next."
        }
    },
    final: {
        name: "End of the Line",
        background: "linear-gradient(135deg, #424242 0%, #212121 100%)",
        backgroundImage: "assets/town.png",
        hotspots: [
            {
                id: 'final-exit',
                label: '🏁 Finish',
                x: '40%',
                y: '45%',
                width: '20%',
                height: '30%'
            }
        ],
        dialogue: {
            'final-exit-unlocked': "You’ve reached the end. Your journey and choices have all been recorded."
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
                body: 'Welcome to PokéMail. By using this service, you agree that we may process basic account, device, and usage data to operate your inbox and show you relevant offers.',
            time: '9:30 AM',
            read: false,
            type: 'system'
        },
        {
            id: 2,
            from: 'offers@pokeshop.biz',
            subject: '🔥 WOW! UNBEATABLE POKEMON CARD PRICES!!!',
                body: 'Limited-time offers on cards and merchandise. You received this message because you\'ve interacted with similar products in the past.',
            time: '9:45 AM',
            read: false,
            type: 'spam'
        },
        {
            id: 3,
            from: 'privacy@totallylegit.com',
            subject: 'Claim Your FREE POKEBALLS',
                body: 'To claim your free items, please confirm your personal and payment details via the attached form. If you did not request this, ignore the email.',
            time: '10:00 AM',
            read: false,
            type: 'phishing'
        },
        {
            id: 4,
            from: 'ads@megacorp.net',
            subject: 'Limited Offer: Pokémon GO+ Premium',
                body: 'We think you might be interested in Pokémon GO+ Premium based on your recent activity. Upgrade for bonus items, events, and extra in-game features.',
            time: '10:15 AM',
            read: false,
            type: 'ads'
        },
        {
            id: 5,
            from: 'otp@pokesystem.auth',
            subject: '🔐 Your OTP Code',
                body: 'Your One-Time Password (OTP) is:\n\n837429\n\nDo not share this code with anyone. Our systems use it only to confirm this login request.',
            time: '10:20 AM',
            read: false,
            type: 'otp'
        },
        {
            id: 6,
            from: 'noreply@pokemail.com',
            subject: 'We analyzed your sleep. You\'re tired.',
                body: 'Our system detected a short night of sleep. You may feel tired today, so we\'ve highlighted content about rest, pacing your day, and optional energy boosters.',
            time: '10:40 AM',
            read: false,
            type: 'spam'
        },
        {
            id: 7,
            from: 'purchase@pokestore.com',
            subject: 'RECEIPT: Pokémon Ultra Violet',
                body: 'Transaction #992847\nItem: Pokémon Ultra Violet\nPrice: $59.99\nPayment Method: Linked Account\n\nThanks for your purchase. Details have been stored in your account history for support and refund purposes.',
            time: '11:00 AM',
            read: false,
            type: 'receipt'
        },
        {
            id: 8,
            from: 'alerts@privacy.fake',
            subject: 'URGENT: Suspicious Activity [NOT REALLY]',
                body: 'We detected unusual activity on your account. If this wasn\'t you, please review recent sessions and update your password via the official security page.',
            time: '11:15 AM',
            read: false,
            type: 'phishing'
        },
        {
            id: 9,
            from: 'promotions@pokebase.com',
            subject: 'Achievement Unlocked: You Sold Your Sleep Data!',
                body: 'Thanks for accepting the latest terms and conditions. This lets us keep your account active and continue improving our recommendations and services.',
            time: '11:30 AM',
            read: false,
            type: 'spam'
        },
        {
            id: 10,
            from: 'support@pokemail.com',
            subject: 'Your Account Security Question',
                body: 'Security Question: "What is your mother\'s maiden name?"\n\nWe use security questions to help verify your identity when you contact support or reset your password.',
            time: '11:45 AM',
            read: false,
            type: 'system'
        },
        {
            id: 11,
            from: 'park@recreation.com',
            subject: 'Your Park Visits: A Summary',
                body: 'You visited Pokémon Park several times this week. We use aggregated visit data to maintain paths, seating, and facilities, and may show you offers related to outdoor activities.',
            time: '12:00 PM',
            read: false,
            type: 'spam'
        },
        {
            id: 12,
            from: 'suggestions@smartshop.ai',
            subject: 'You might like: Everything',
                body: 'Based on what you\'ve recently viewed, we think you may like related items and bundles. You can update your preferences in account settings at any time.',
            time: '12:15 PM',
            read: false,
            type: 'ads'
        },
        {
            id: 13,
            from: 'rewards@loyaltyscam.net',
            subject: 'LIMITED TIME: Earn 5 Reward Points!',
                body: 'Earn points on every purchase and redeem them for small discounts on future orders. Full conditions and expiry dates are available in your rewards account.',
            time: '12:30 PM',
            read: false,
            type: 'spam'
        },
        {
            id: 14,
            from: 'cafe@plaza.coffee',
            subject: 'Your Latte Was Delicious',
                body: 'Thanks for stopping by today. We\'ve added this drink to your favorites so we can suggest similar options and occasional loyalty rewards.',
            time: '1:00 PM',
            read: false,
            type: 'spam'
        },
        {
            id: 15,
            from: 'noreply@pokemail.com',
            subject: 'Data Export Request: APPROVED',
                body: 'Your data export request has been processed. A copy of your account information and activity logs is now available for download from your settings page.',
            time: '1:15 PM',
            read: false,
            type: 'system'
        },
        {
            id: 16,
            from: 'alerts@pokemail.com',
            subject: 'ACCOUNT ALERT: Demographic Profile Assigned',
                body: 'We\'ve updated your profile based on information you provided and how you use our services. Certain features may differ by region, age, and account history.',
            time: '1:30 PM',
            read: false,
            type: 'system'
        },
        {
            id: 17,
            from: 'recommendations@ai-bias.net',
            subject: 'Personalized Restrictions for You',
                body: 'We\'ve tailored your recommendations based on your profile and activity. Some products and areas may not be available to every account. View details in your dashboard.',
            time: '1:45 PM',
            read: false,
            type: 'ads'
        }
    ];
}

// ============================================================================
// DIALOGUE SYSTEM
// ============================================================================

// tone: 'green' (default) or 'red' depending on how malicious the message is.
// Supports showDialogue(text, callback, tone) or showDialogue(text, tone).
function showDialogue(text, callback, tone) {
    if (typeof callback === 'string' && tone === undefined) {
        tone = callback;
        callback = null;
    }

    // Be defensive: always coerce text to a usable string so
    // a missing dialogue line can't break the typewriter.
    if (text === undefined || text === null) {
        text = '';
    } else if (typeof text !== 'string') {
        text = String(text);
    }

    const dialogueBox = document.getElementById('dialogueBox');
    const dialogueText = document.getElementById('dialogueText');
    const appliedTone = tone === 'red' ? 'red' : 'green';
    
    dialogueBox.style.display = 'block';
    dialogueBox.classList.remove('dialogue-red', 'dialogue-green');
    dialogueBox.classList.add(appliedTone === 'red' ? 'dialogue-red' : 'dialogue-green');

    // Simple render: write full text at once to avoid any
    // timing issues with the typewriter effect.
    dialogueText.textContent = text;
    
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
// RESTRICTION CHECKS
// ============================================================================

function isRaceRestricted(locationId, hotspotId) {
    if (!gameState.race) return false;
    const restrictions = raceRestrictions[gameState.race];
    if (!restrictions) return false;
    if (!restrictions[locationId]) return false;
    return restrictions[locationId].includes(hotspotId);
}

function getRaceRestrictionMessage(race, locationId, hotspotId) {
    const messages = {
        godzilla: {
            'house|house-door': 'We’re having trouble confirming your access right now. Please try again in a moment.',
            'park|park-playground': 'For safety reasons, your account currently can’t access this area.',
            'outside|park': 'Based on your profile settings, this part of the map is unavailable.',
            'plaza|plaza-cafe': 'Access to this location is limited for your current account status.'
        },
        werewolf: {
            'outside|flowers': 'This area is closed to you based on how your account is set up.',
            'park|park-bench': 'Long-stay areas are limited for your profile at the moment.',
            'mart|mart-shelf-2': 'This product isn’t available to your account right now.'
        },
        vampire: {
            'bed|sleep-bed': 'Rest options for your account are temporarily limited.',
            'room|room-window': 'Additional verification is required before you can open this window.',
            'outside|flowers': 'Due to your profile settings, this area is currently restricted.'
        },
        fairy: {
            'mart|mart-shelf-1': 'This section is unavailable for your current account type.',
            'plaza|plaza-arcade': 'This activity isn’t offered to your profile right now.'
        }
    };
    
    const key = `${locationId}|${hotspotId}`;
    const raceMessages = messages[race] || {};
    return raceMessages[key] || 'Your account does not currently have access to this area.';
}

// ============================================================================
// EMAIL SYSTEM
// ============================================================================

let emailsData = [];

function initializeEmails(email) {
    emailsData = generateEmails(email);
    // Treat each seeded email as a prior record of data about you
    gameState.dataRecordedCount += emailsData.length;
}

function renderEmailList() {
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = '';
    
    const unreadCount = emailsData.filter(e => !e.read).length;
    document.getElementById('emailCount').textContent = unreadCount;
    
    // Reverse to show newest at top
    const sortedEmails = [...emailsData].reverse();
    
    sortedEmails.forEach(email => {
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

// Send an email the first time a race-based restriction is encountered
function sendRestrictionEmail(race, locationId, hotspotId, restrictionMessage) {
    const location = locations[locationId];
    const hotspotConfig = location && location.hotspots
        ? location.hotspots.find(h => h.id === hotspotId)
        : null;

    const rawLabel = hotspotConfig ? hotspotConfig.label : hotspotId;
    const cleanLabel = typeof rawLabel === 'string'
        ? rawLabel.replace(/^[^A-Za-z0-9]+\s*/, '').trim()
        : hotspotId;

    const now = new Date();

    const email = {
        id: Date.now(),
        from: 'restrictions@ai-bias.net',
        subject: `Access restricted: ${cleanLabel || hotspotId}`,
        body:
            `Our systems limited access to "${cleanLabel || hotspotId}" based on your profile (${race}).\n\n` +
            `${restrictionMessage}\n\n` +
            'Some accounts may see different locations, options, or prices. ' +
            'These automated decisions are based on how your profile is categorized.',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'system'
    };

    emailsData.push(email);
    gameState.dataRecordedCount += 1;
    renderEmailList();
}

// Send emails associated with a specific system login event
function sendServiceEmails(serviceId) {
    const templates = serviceEmailTemplates[serviceId];
    if (!templates || !templates.length) return;

    const now = new Date();

    templates.forEach((tpl, index) => {
        const email = {
            id: Date.now() + index,
            from: tpl.from,
            subject: tpl.subject,
            body: tpl.body,
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            type: tpl.type || 'system'
        };
        emailsData.push(email);
        gameState.dataRecordedCount += 1;
    });

    renderEmailList();
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
    // Legacy manual login screen is no longer used.
    // Login now happens automatically via a short loading popup.
}

function completeLogin() {
    // Legacy manual login handler retained for safety but unused.
    // Auto-login is now handled by autoLoginWithPopup().
}

function sendSignupOTP() {
    const email = document.getElementById('signupEmailInput').value.trim();
    const password = document.getElementById('signupPasswordInput').value;

    if (!email || !password) {
        showDialogue('Please enter an email and password first.', 'red');
        return;
    }

    gameState.userEmail = email;
    gameState.userPassword = password;
    gameState.generatedOTP = '837429';
    gameState.signupOtpSent = true;

    const otpEmail = {
        id: Date.now(),
        from: 'otp@pokesystem.auth',
        subject: '🔐 Your OTP Code',
        body: `Your One-Time Password (OTP) is:\n\n${gameState.generatedOTP}\n\nDo not share this code.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'otp'
    };

    emailsData.push(otpEmail);
    gameState.dataRecordedCount += 1;
    renderEmailList();

    document.getElementById('signupOtpInput').style.display = 'block';
    document.getElementById('signupSubmitBtn').style.display = 'inline-block';
    showDialogue('OTP sent. Check your inbox and enter it to finish signup.', 'green');
}

function completeSignup() {
    if (!gameState.signupOtpSent) {
        showDialogue('Please click Send OTP before entering a code.', 'red');
        return;
    }

    const otp = document.getElementById('signupOtpInput').value.trim();
    if (otp !== gameState.generatedOTP) {
        showDialogue('That code doesn’t match. Please check the email and try again.', 'red');
        return;
    }

    document.getElementById('signupModal').style.display = 'none';
    showDialogue('Signup complete. You can now log in with your email and password.', 'green');
}

// ============================================================================
// LOCATION & INTERACTION RENDERING
// ============================================================================

function renderCurrentLocation() {
    const location = locations[gameState.currentLocation];
    const gameCanvas = document.getElementById('gameCanvas');
    
    gameCanvas.style.background = location.background || '#000';
    if (location.backgroundImage) {
        gameCanvas.style.backgroundImage = `url('${location.backgroundImage}')`;
        gameCanvas.style.backgroundSize = 'cover';
        gameCanvas.style.backgroundPosition = 'center';
    } else {
        gameCanvas.style.backgroundImage = 'none';
    }
    
    // Adjust canvas height to match the intrinsic aspect ratio of
    // the current background image so the whole image stays visible
    // across different screen aspect ratios.
    adjustGameCanvasSize();

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

// Keep the visual game canvas (and therefore the hotspot overlay)
// sized to the actual aspect ratio of the current background image,
// so we avoid cutting off parts of the image on wide/tall screens.
function adjustGameCanvasSize() {
    const location = locations[gameState.currentLocation];
    const gameCanvas = document.getElementById('gameCanvas');

    if (!location || !location.backgroundImage || !gameCanvas) return;

    const img = new Image();
    img.src = location.backgroundImage;
    img.onload = () => {
        const aspect = img.width / img.height;
        const width = gameCanvas.clientWidth;

        if (!width || !aspect) return;

        const height = width / aspect;
        gameCanvas.style.height = `${height}px`;
    };
}

function getDialogueForInteraction(locationId, hotspotId) {
    const dialogue = locations[locationId].dialogue;
    const key = `${hotspotId}-${gameState.isLoggedIn ? 'unlocked' : 'locked'}`;
    return dialogue[key] || "...";
}

function handleInteraction(hotspotId) {
    const location = locations[gameState.currentLocation];
    
    // EVERYTHING REQUIRES LOGIN
    if (!gameState.isLoggedIn) {
        // Global login required; no manual login screen, just auto-login.
        gameState.pendingService = null;
        showBlockedModal('You need to log in before you can use anything here.');
        return;
    }
    
    // CHECK FOR RACE RESTRICTIONS AFTER LOGIN
    if (isRaceRestricted(gameState.currentLocation, hotspotId)) {
        const restrictionMsg = getRaceRestrictionMessage(gameState.race, gameState.currentLocation, hotspotId);
        const key = `${gameState.race}|${gameState.currentLocation}|${hotspotId}`;

        if (!gameState.restrictionEmailsSent[key]) {
            gameState.restrictionEmailsSent[key] = true;
            sendRestrictionEmail(gameState.race, gameState.currentLocation, hotspotId, restrictionMsg);
        }

        showBlockedModal(restrictionMsg);
        return;
    }

    // PER-SERVICE LOGIN: every hotspot is treated as a separate system
    const serviceId = hotspotId;
    if (!gameState.serviceLogins[serviceId]) {
        gameState.pendingService = serviceId;
        const hotspotConfig = location.hotspots.find(h => h.id === hotspotId);
        const rawLabel = hotspotConfig ? hotspotConfig.label : hotspotId;
        // Strip leading emoji/symbols for a cleaner service name
        const serviceName = typeof rawLabel === 'string'
            ? rawLabel.replace(/^[^A-Za-z0-9]+\s*/, '').trim()
            : serviceId;
        const customMessage = serviceLoginMessages[serviceId]
            || `"${serviceName}" runs on a different system. Please log in again to continue.`;
        showBlockedModal(customMessage);
        return;
    }
    
    // BED INTERACTIONS
    if (gameState.currentLocation === 'bed') {
        if (hotspotId === 'sleep-bed') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['sleep-bed-locked']);
            } else {
                showDialogue(location.dialogue['sleep-bed-unlocked'], () => {
                    gameState.currentLocation = 'room';
                    renderCurrentLocation();
                });
            }
        } else if (hotspotId === 'phone-on-bed') {
            showDialogue(location.dialogue['phone-on-bed']);
        }
    }
    
    // ROOM INTERACTIONS
    else if (gameState.currentLocation === 'room') {
        if (hotspotId === 'room-door') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['room-door-locked']);
            } else {
                showDialogue(location.dialogue['room-door-unlocked'], () => {
                    gameState.currentLocation = 'house';
                    renderCurrentLocation();
                });
            }
        } else if (hotspotId === 'room-desk') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['room-desk-locked']);
            } else {
                showDialogue(location.dialogue['room-desk-unlocked']);
            }
        } else if (hotspotId === 'sleep-bed') {
            // In the new flow, the bed is part of the room;
            // interacting with it just shows the sleep narration.
            if (!gameState.isLoggedIn) {
                showBlockedModal('Login required before you can even rest.');
            } else {
                showDialogue(location.dialogue['sleep-bed-unlocked']);
            }
        }
    }
    
    // HOUSE INTERACTIONS
    else if (gameState.currentLocation === 'house') {
        if (hotspotId === 'house-door') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['house-door-locked']);
            } else {
                showDialogue(location.dialogue['house-door-unlocked'], () => {
                    gameState.currentLocation = 'outside';
                    renderCurrentLocation();
                });
            }
        } else if (hotspotId === 'house-kitchen') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['house-kitchen-locked']);
            } else {
                showDialogue(location.dialogue['house-kitchen-unlocked']);
            }
        } else if (hotspotId === 'house-mirror') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['house-mirror-locked']);
            } else {
                showDialogue(location.dialogue['house-mirror-unlocked']);
            }
        }
    }
    
    // OUTSIDE INTERACTIONS
    else if (gameState.currentLocation === 'outside') {
        if (hotspotId === 'flowers') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['flowers-locked']);
            } else {
                showDialogue(location.dialogue['flowers-unlocked']);
            }
        } else if (hotspotId === 'park') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['park-locked']);
            } else {
                // Keep the player in the outside scene; park scene is disabled for now.
                showDialogue(location.dialogue['park-unlocked']);
            }
        } else if (hotspotId === 'mart-door') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['mart-door-locked']);
            } else {
                // Mart interior is disabled; just show commentary.
                showDialogue(location.dialogue['mart-door-unlocked']);
            }
        } else if (hotspotId === 'npc-stranger') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['npc-stranger-locked']);
            } else {
                showDialogue(location.dialogue['npc-stranger-unlocked']);
            }
        }
    }
    
    // PARK INTERACTIONS
    else if (gameState.currentLocation === 'park') {
        if (hotspotId === 'park-playground') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['park-playground-locked']);
            } else {
                showDialogue(location.dialogue['park-playground-unlocked']);
            }
        } else if (hotspotId === 'park-bench') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['park-bench-locked']);
            } else {
                showDialogue(location.dialogue['park-bench-unlocked']);
            }
        } else if (hotspotId === 'park-exit') {
            showDialogue(location.dialogue['park-exit-unlocked'], () => {
                gameState.currentLocation = 'plaza';
                renderCurrentLocation();
            });
        }
    }
    
    // MART INTERACTIONS
    else if (gameState.currentLocation === 'mart') {
        if (hotspotId === 'mart-shelf-1') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['mart-shelf-1-locked']);
            } else {
                showDialogue(location.dialogue['mart-shelf-1-unlocked']);
            }
        } else if (hotspotId === 'mart-shelf-2') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['mart-shelf-2-locked']);
            } else {
                showDialogue(location.dialogue['mart-shelf-2-unlocked']);
            }
        } else if (hotspotId === 'mart-checkout') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['mart-checkout-locked']);
            } else {
                showDialogue(location.dialogue['mart-checkout-unlocked'], showMartModal);
            }
        } else if (hotspotId === 'mart-exit') {
            showDialogue(location.dialogue['mart-exit-unlocked'], () => {
                gameState.currentLocation = 'outside';
                renderCurrentLocation();
            });
        }
    }
    
    // PLAZA INTERACTIONS
    else if (gameState.currentLocation === 'plaza') {
        if (hotspotId === 'plaza-cafe') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['plaza-cafe-locked']);
            } else {
                showDialogue(location.dialogue['plaza-cafe-unlocked']);
            }
        } else if (hotspotId === 'plaza-arcade') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['plaza-arcade-locked']);
            } else {
                showDialogue(location.dialogue['plaza-arcade-unlocked']);
            }
        } else if (hotspotId === 'plaza-exit') {
            showDialogue(location.dialogue['plaza-exit-unlocked'], () => {
                gameState.currentLocation = 'final';
                renderCurrentLocation();
            });
        }
    }
    
    // FINAL INTERACTIONS
    else if (gameState.currentLocation === 'final') {
        if (hotspotId === 'final-exit') {
            showDialogue(location.dialogue['final-exit-unlocked'], () => {
                showDialogue("Thank you for playing. Your data has been sold to 47 companies.\n\nThis was Critical UX.");
            });
        }
    }
}

// ============================================================================
// MART MODAL
// ============================================================================

function showMartModal() {
    const martItems = [
        { name: 'Potion', price: '$100', desc: 'Heal 20 HP' },
        { name: 'Antidote', price: '$150', desc: 'Cure Poison' },
        { name: 'Pokéball', price: '$200', desc: 'Catch Pokémon' },
        { name: 'Great Ball', price: '$600', desc: 'Better Catch Rate' },
        { name: 'Ultra Ball', price: '$800', desc: 'Best Catch Rate' },
        { name: 'Escape Rope', price: '$550', desc: 'Exit dungeon' }
    ];
    
    const martItemsContainer = document.querySelector('.mart-items');
    martItemsContainer.innerHTML = '';
    
    martItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'mart-item';
        itemDiv.innerHTML = `
            <div class="mart-item-name">${item.name}</div>
            <div class="mart-item-desc">${item.desc}</div>
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
    const messages = [
        `Purchased: ${itemName} - ${price}\n\nThis purchase has been saved to your account history.`,
        `${itemName} (${price}) - Added to your profile.\n\nYou may see more suggestions based on similar items.`,
        `Transaction complete: ${itemName}\n\nYour recent purchases will help us tailor future offers.`
    ];
    
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    closeMartModal();
    showDialogue(randomMsg, 'red');
}

// ============================================================================
// BLOCKED / LOGIN HANDLING (DIALOGUE-ONLY)
// ============================================================================

function autoLoginViaDialogue(serviceId) {
    // First show a short "Logging in" message; clicking it performs the login.
    showDialogue('Logging in…', () => {
        // Count every time the player is asked to log in
        gameState.loginCount += 1;

        // Mark the player as globally logged in
        gameState.isLoggedIn = true;

        // If this was for a specific service, record that login and
        // send the corresponding satirical email(s).
        if (serviceId) {
            gameState.serviceLogins[serviceId] = true;
            sendServiceEmails(serviceId);
            scheduleFollowupEmails(serviceId);
        }

        const loginMessage = serviceId
            ? '✓ Login successful for this service. Some additional data may now be shared to keep it running.'
            : '✓ Login successful. Your account is now active for this area.';

        // Clear pending service after handling message
        gameState.pendingService = null;

        showDialogue(loginMessage, renderCurrentLocation, 'red');
    }, 'red');

    // Auto-advance from "Logging in…" to the next message after 1 second
    setTimeout(() => {
        const dialogueBox = document.getElementById('dialogueBox');
        if (dialogueBox && dialogueBox.style.display !== 'none') {
            dialogueBox.click();
        }
    }, 1000);
}

function showBlockedModal(message) {
    // No visual modal anymore; just use the dialogue box.
    // Clicking the dialogue will immediately proceed to the auto-login flow.
    const serviceId = gameState.pendingService || null;
    showDialogue(message, () => {
        autoLoginViaDialogue(serviceId);
    }, 'red');
}

function closeBlockedModal() {
    const modal = document.getElementById('blockedModal');
    if (modal) modal.style.display = 'none';
}

// Keep this listener defined, though the modal is no longer surfaced visually.
document.getElementById('blockedLoginBtn').addEventListener('click', () => {
    const serviceId = gameState.pendingService || null;
    closeBlockedModal();
    autoLoginViaDialogue(serviceId);
});

// ============================================================================
// END SCREEN & STATS
// ============================================================================

function showEndScreen() {
    const container = document.querySelector('.container');
    const dialogueBox = document.getElementById('dialogueBox');
    const endScreen = document.getElementById('endScreen');
    const endStatsText = document.getElementById('endStatsText');
    const endButton = document.getElementById('endButton');

    if (container) container.style.display = 'none';
    if (dialogueBox) dialogueBox.style.display = 'none';
    if (endButton) endButton.style.display = 'none';

    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });

    const raceLabel = gameState.race
        ? gameState.race.charAt(0).toUpperCase() + gameState.race.slice(1)
        : 'no specific profile';
    const restrictedCount = Object.keys(gameState.restrictionEmailsSent || {}).length;
    const loginCount = gameState.loginCount || 0;
    const dataCount = gameState.dataRecordedCount || 0;

    const text =
        `Since you played ${raceLabel} you were restricted from ${restrictedCount} things.\n\n` +
        `You logged in ${loginCount} times, and your data was recorded ${dataCount} times.\n\n` +
        'Most of your data is either sold for further advertising or keeping track of your activity for "public safety" (whatever the corporations and government are currently trying to take away from you).';

    if (endStatsText) {
        endStatsText.textContent = text;
    }

    if (endScreen) {
        endScreen.style.display = 'flex';
    }
}

// ============================================================================
// RACE SELECTION
// ============================================================================

function selectRace(race) {
    gameState.race = race;
    document.getElementById('raceSelectModal').style.display = 'none';

    // Seed inbox and then start game with an initial (red) narration.
    initializeEmails(gameState.userEmail || defaultCredentials.email);
    renderEmailList();

    showDialogue(`You have become a ${race}. Most things you do from now on will be tied to your account.`, () => {
        renderCurrentLocation();
    }, 'red');
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
document.getElementById('backToInboxBtn').addEventListener('click', backToInbox);
document.getElementById('sendSignupOtpBtn').addEventListener('click', sendSignupOTP);
document.getElementById('signupSubmitBtn').addEventListener('click', completeSignup);

document.getElementById('backFromLoginBtn').addEventListener('click', () => {
    document.getElementById('phoneLoginState').style.display = 'none';
    document.getElementById('phoneInboxState').style.display = 'flex';
});

// Phone nav buttons
document.getElementById('phoneNavEmail').addEventListener('click', () => {
    document.getElementById('phoneNavEmail').classList.add('active');
    document.getElementById('phoneNavWeb').classList.remove('active');
    document.getElementById('phoneInboxState').style.display = 'flex';
});

document.getElementById('phoneNavWeb').addEventListener('click', () => {
    document.getElementById('phoneNavWeb').classList.add('active');
    document.getElementById('phoneNavEmail').classList.remove('active');
    // Web view would show here (placeholder for now)
    showDialogue('The web browser isn’t available in this prototype yet.', 'green');
});

// Global End button
document.getElementById('endButton').addEventListener('click', showEndScreen);

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('raceSelectModal').style.display = 'flex';
    document.getElementById('phoneInboxState').style.display = 'flex';
    // Ensure canvas/hotspots resize correctly if the window size
    // changes before the player has selected a race.
    window.addEventListener('resize', adjustGameCanvasSize);
});

// Fallback: ensure inbox is shown on load
window.addEventListener('load', () => {
    if (!gameState.race) {
        document.getElementById('raceSelectModal').style.display = 'flex';
    }
});
