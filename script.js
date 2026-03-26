// ============================================================================
// GAME STATE
// ============================================================================

const gameState = {
    race: null,
    isLoggedIn: false,
    currentLocation: 'bed',
    currentDialogueIndex: 0,
    generatedOTP: null,
    userEmail: null,
    userPassword: null,
    signupOtpSent: false,
    // Per-system logins: each hotspot acts like a separate "service"
    serviceLogins: {},
    pendingService: null
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
        plaza: ['plaza-cafe']
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
            body: 'Thanks for connecting your dreams. We will now analyze:\n- How often you toss and turn\n- Which nightmares convert best to ad clicks\n- Whether you are profitable while unconscious',
            type: 'system'
        }
    ],
    'phone-on-bed': [
        {
            from: 'sync@phoneid.net',
            subject: 'PhoneID Connect: Sync Enabled',
            body: 'Your phone is now linked across:\n- 14 advertising networks\n- 6 analytics platforms\n- 1 very curious data broker',
            type: 'ads'
        }
    ],

    'room-door': [
        {
            from: 'access@doorcorp.com',
            subject: 'DoorCorp™: Home Access Granted',
            body: 'You may now open the door in your own house.\n\nIn exchange, we collected:\n- Your walking speed\n- Your average hesitation before leaving\n- A prediction of how often you try to escape',
            type: 'system'
        }
    ],
    'room-window': [
        {
            from: 'light@windowcloud.io',
            subject: 'WindowCloud®: Sunshine Activated',
            body: 'We will now:\n- Measure daylight entering your room\n- Estimate your vitamin D level\n- Use it to sell you supplements',
            type: 'ads'
        }
    ],
    'room-desk': [
        {
            from: 'support@deskos.app',
            subject: 'DeskOS™ Account Linked',
            body: 'Your desktop is now a productivity platform.\n\nNew features:\n- Infinite pop-ups\n- Infinite telemetry\n- Zero privacy',
            type: 'system'
        }
    ],

    'house-door': [
        {
            from: 'alerts@frontdoor.services',
            subject: 'FrontDoor Services: Exit Logged',
            body: 'Every time you leave the building we will:\n- Timestamp your departure\n- Guess your destination\n- Sell the guess to three different partners',
            type: 'system'
        }
    ],
    'house-kitchen': [
        {
            from: 'diet@kitchencloud.io',
            subject: 'KitchenCloud™: Fridge Connected',
            body: 'Your fridge has joined the internet.\n\nWe now know:\n- How often you snack at 2AM\n- How guilty you feel\n- Which guilt-based ads work best on you',
            type: 'ads'
        }
    ],
    'house-mirror': [
        {
            from: 'scan@mirrorid.ai',
            subject: 'MirrorID®: Face Scan Complete',
            body: 'Your reflection has been upgraded to:\n- A biometric ID\n- A marketing profile\n- A permanent record in 5 databases',
            type: 'system'
        }
    ],

    'flowers': [
        {
            from: 'nature@florapass.org',
            subject: 'FloraPass: Flower Access Approved',
            body: 'You can now smell these flowers.\n\nWe will:\n- Track how long you stare at petals\n- Infer your romantic status\n- Recommend targeted bouquet subscriptions',
            type: 'ads'
        }
    ],
    'park': [
        {
            from: 'visits@parknet.city',
            subject: 'ParkNet™: Entry Confirmed',
            body: 'Welcome to the park.\n\nSensors will now measure:\n- Steps taken per tree\n- Time spent not looking at your phone\n- Your "happiness index" for resale',
            type: 'system'
        }
    ],
    'mart-door': [
        {
            from: 'welcome@martaccess.biz',
            subject: 'MartAccess™: Store Entry Data',
            body: 'Your entrance created a new record:\n- Approximate wallet thickness\n- Browsing speed\n- Abandon-cart probability',
            type: 'ads'
        }
    ],
    'npc-stranger': [
        {
            from: 'social@sociallink.app',
            subject: 'SocialLink™: New Interaction Detected',
            body: 'You spoke to a stranger.\n\nWe logged:\n- Volume of your voice\n- Awkward pause duration\n- Likelihood you will buy social-skills courses',
            type: 'ads'
        }
    ],

    'park-playground': [
        {
            from: 'kids@playgroundplus.fun',
            subject: 'Playground Plus: Activity Monitoring On',
            body: 'Children at play generate valuable metrics:\n- Laughter-per-minute\n- Slide vs swing preference\n- Future brand loyalty score',
            type: 'system'
        }
    ],
    'park-bench': [
        {
            from: 'rest@benchreserve.com',
            subject: 'BenchReserve™: Seat Usage Logged',
            body: 'You sat down.\n\nWe now estimate:\n- Your fatigue level\n- How much you earn per hour of rest\n- The optimal time to show life-insurance ads',
            type: 'ads'
        }
    ],
    'park-exit': [
        {
            from: 'exit@parknet.city',
            subject: 'ParkNet™: Exit Processed',
            body: 'Your visit summary has been forwarded to:\n- City planners\n- Health insurers\n- Anyone buying bulk behavior data',
            type: 'system'
        }
    ],

    'mart-shelf-1': [
        {
            from: 'potions@shelfid.store',
            subject: 'ShelfID Potions: Interest Detected',
            body: 'You looked at potions.\n\nPrediction:\n- 73% chance of impulse purchase\n- 91% chance of future targeted upsell\n- 0% chance of escaping recommendations',
            type: 'ads'
        }
    ],
    'mart-shelf-2': [
        {
            from: 'balls@shelfid.store',
            subject: 'ShelfID Balls: Profile Updated',
            body: 'Pokéball curiosity registered.\n\nWe linked this to:\n- Your competitiveness score\n- Your collecting tendencies\n- Your susceptibility to "limited edition" FOMO',
            type: 'ads'
        }
    ],
    'mart-checkout': [
        {
            from: 'receipts@paylink.io',
            subject: 'PayLink™: Checkout Analytics Enabled',
            body: 'Every purchase will now include:\n- Price\n- Location\n- A guess at how much you regret it',
            type: 'receipt'
        }
    ],
    'mart-exit': [
        {
            from: 'insights@storegate.biz',
            subject: 'StoreGate™: Visit Summary',
            body: 'You left the mart.\n\nWe recorded:\n- Time spent wandering aisles\n- Items touched but not bought\n- Your "browsing inefficiency" score',
            type: 'spam'
        }
    ],

    'plaza-cafe': [
        {
            from: 'loyalty@cafeclub.coffee',
            subject: 'CafeClub®: Loyalty Profile Created',
            body: 'Your caffeine intake is now a dataset.\n\nWe will:\n- Predict your next craving\n- Adjust prices by your desperation\n- Email you when you are most likely to cave',
            type: 'ads'
        }
    ],
    'plaza-arcade': [
        {
            from: 'games@arcadeid.fun',
            subject: 'ArcadeID: Gaming Habits Tracked',
            body: 'Every token, every loss, every win:\n- Logged\n- Analyzed\n- Sold as a "player engagement" insight',
            type: 'system'
        }
    ],
    'plaza-exit': [
        {
            from: 'routes@transithub.app',
            subject: 'TransitHub™: Movement Profile Updated',
            body: 'Leaving the plaza changed your mobility graph.\n\nWe now recommend:\n- Ads along your usual routes\n- Stores you walk past but never enter\n- Ways to monetize your commute',
            type: 'ads'
        }
    ],

    'final-exit': [
        {
            from: 'summary@endofline.services',
            subject: 'EndOfLine Services: Lifetime Report Ready',
            body: 'Your journey is complete.\n\nHighlights:\n- Number of systems you logged into\n- Total profiles generated\n- How much your data was worth (to everyone but you)',
            type: 'system'
        }
    ]
};

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
            'sleep-bed-locked': "You need to log in before you can sleep. Data collection awaits.",
            'sleep-bed-unlocked': "You finally sleep... exhausted from sharing so much of yourself.",
            'phone-on-bed': "Your phone glows with notifications. Every app is tracking you."
        }
    },
    room: {
        name: "Your Room",
        background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
        backgroundImage: "assets/bedroom.png",
        hotspots: [
            {
                id: 'room-door',
                label: '🚪 Bedroom Door',
                x: '70%',
                y: '40%',
                width: '15%',
                height: '35%'
            },
            {
                id: 'room-window',
                label: '🪟 Window',
                x: '20%',
                y: '35%',
                width: '15%',
                height: '25%'
            },
            {
                id: 'room-desk',
                label: '🖥️ Computer',
                x: '45%',
                y: '55%',
                width: '18%',
                height: '20%'
            }
        ],
        dialogue: {
            'room-door-locked': "The door is locked. You need an account to open it.",
            'room-door-unlocked': "You step through the door...",
            'room-window-locked': "The window is barred. Parental controls: Account Required.",
            'room-window-unlocked': "You can see the world outside.",
            'room-desk-locked': "The computer is powered off. Boot requires authentication.",
            'room-desk-unlocked': "You log into your computer. Another account. More tracking."
        }
    },
    house: {
        name: "Your House",
        background: "linear-gradient(135deg, #5a6f7d 0%, #3a4f5d 100%)",
        backgroundImage: "assets/outsideBedroom.png",
        hotspots: [
            {
                id: 'house-door',
                label: '🚪 Front Door',
                x: '45%',
                y: '50%',
                width: '15%',
                height: '30%'
            },
            {
                id: 'house-kitchen',
                label: '🧊 Fridge',
                x: '25%',
                y: '60%',
                width: '18%',
                height: '20%'
            },
            {
                id: 'house-mirror',
                label: '📖 Book',
                x: '70%',
                y: '45%',
                width: '12%',
                height: '25%'
            }
        ],
        dialogue: {
            'house-door-locked': "You can't leave without logging in. The system won't allow it.",
            'house-door-unlocked': "You step outside into the open world...",
            'house-kitchen-locked': "The fridge is sealed. Nutritional data unavailable.",
            'house-kitchen-unlocked': "You grab some food. Each calorie is logged.",
            'house-mirror-locked': "The mirror is clouded. Face recognition: Access Denied.",
            'house-mirror-unlocked': "You see yourself reflected. Biometric scan complete."
        }
    },
    outside: {
        name: "Outside - Neighborhood",
        background: "linear-gradient(135deg, #7cb342 0%, #558b2f 100%)",
        backgroundImage: "assets/town.png",
        hotspots: [
            {
                id: 'flowers',
                label: '🌳 Forest',
                x: '15%',
                y: '65%',
                width: '12%',
                height: '20%'
            },
            {
                id: 'park',
                label: '🏋️ Gym',
                x: '40%',
                y: '55%',
                width: '16%',
                height: '25%'
            },
            {
                id: 'mart-door',
                label: '🏪 Mart',
                x: '70%',
                y: '45%',
                width: '20%',
                height: '30%'
            },
            {
                id: 'npc-stranger',
                label: '🏠 Friend\'s House',
                x: '50%',
                y: '30%',
                width: '12%',
                height: '18%'
            }
        ],
        dialogue: {
            'flowers-locked': "Beautiful black-boxed flowers. Error 403: Insufficient Permissions.",
            'flowers-unlocked': "Gorgeous wildflowers. They don't ask for your data.",
            'park-locked': "The park entrance shows: [RESTRICTED ZONE - LOGIN REQUIRED]",
            'park-unlocked': "You enter the park. Cameras on every tree.",
            'mart-door-locked': "The mart door is closed to unregistered players.",
            'mart-door-unlocked': "You enter the Poké Mart...",
            'npc-stranger-locked': "The stranger ignores you. Unverified identity.",
            'npc-stranger-unlocked': "Stranger: 'I used to keep my data private. Now look at me.'"
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
            'park-playground-locked': "Kids play here. All monitored. All data collected.",
            'park-playground-unlocked': "Children laugh. Unaware their playtime is monetized.",
            'park-bench-locked': "The bench is cordoned off. Senior citizens: Subscribe to sit.",
            'park-bench-unlocked': "You sit and watch the world. Your location is broadcast.",
            'park-exit-unlocked': "You leave the park..."
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
            'mart-shelf-1-locked': "Locked. Inventory: Permission Denied.",
            'mart-shelf-1-unlocked': "Potions & Antidotes. All tracked.",
            'mart-shelf-2-locked': "Locked. Browsing: Subscription Required.",
            'mart-shelf-2-unlocked': "Pokéballs of every variety. Each one logs your interests.",
            'mart-checkout-locked': "Checkout is restricted. Please log in.",
            'mart-checkout-unlocked': "Ready to buy? Your payment data will be stored forever.",
            'mart-exit-unlocked': "You leave the mart..."
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
            'plaza-cafe-locked': "Café: Members Only. Sign up to drink coffee.",
            'plaza-cafe-unlocked': "You order coffee. Your taste preferences are saved to a database.",
            'plaza-arcade-locked': "Arcade: Registration required to play.",
            'plaza-arcade-unlocked': "You play arcade games. High scores linked to your identity.",
            'plaza-exit-unlocked': "You return to the map..."
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
            'final-exit-unlocked': "You've reached the end. Your data is complete. Your journey: monetized."
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
        },
        {
            id: 11,
            from: 'park@recreation.com',
            subject: 'Your Park Visits: A Summary',
            body: 'You visited Pokémon Park 3 times this week.\n\nWe noticed:\n- You spent 8 seconds on the bench\n- You moved counterclockwise\n- You sneezed once at 3:22 PM\n\nBased on this data, we recommend: A new allergy medication! Click here to subscribe!',
            time: '12:00 PM',
            read: false,
            type: 'spam'
        },
        {
            id: 12,
            from: 'suggestions@smartshop.ai',
            subject: 'You might like: Everything',
            body: 'Machine learning analysis of your browsing:\n\nYou looked at Pokéballs for 0.3 seconds.\n\nYou probably want:\n- 500 Pokéball ads\n- 340 similar products\n- Our premium membership\n- To reconsider all your life choices\n\nAdd to cart?',
            time: '12:15 PM',
            read: false,
            type: 'ads'
        },
        {
            id: 13,
            from: 'rewards@loyaltyscam.net',
            subject: 'LIMITED TIME: Earn 5 Reward Points!',
            body: 'For every dollar spent, earn 1 reward point!\n\nTo redeem 50 points for a $0.50 discount, simply:\n1. Enroll in 3 additional services\n2. Verify your biometric data\n3. Give us your firstborn\n\nOffer expires in 12 hours!',
            time: '12:30 PM',
            read: false,
            type: 'spam'
        },
        {
            id: 14,
            from: 'cafe@plaza.coffee',
            subject: 'Your Latte Was Delicious',
            body: 'We analyzed your coffee consumption:\n\nLatte at 2:45 PM - 16.3oz - temperature: 167°F\n\nBased on this data:\n- You\'re addicted\n- You\'re paying $8 for $0.80 of coffee\n- You should buy a membership\n- You\'ll buy it because behavioral prediction: 96%',
            time: '1:00 PM',
            read: false,
            type: 'spam'
        },
        {
            id: 15,
            from: 'noreply@pokemail.com',
            subject: 'Data Export Request: APPROVED',
            body: 'Your data has been exported to:\n- 47 marketing firms\n- 12 government agencies\n- 89 data brokers\n- Your ex\n\nTo delete your data:\nPayment of $4,999 required.\n\nWould you like to pay?',
            time: '1:15 PM',
            read: false,
            type: 'system'
        },
        {
            id: 16,
            from: 'alerts@pokemail.com',
            subject: 'ACCOUNT ALERT: Demographic Profile Assigned',
            body: 'Your demographic profile has been assigned:\n\nRace: FLAGGED\nBehavior Pattern: ANOMALOUS\nTrust Score: INSUFFICIENT\nPersonality Type: HIGH-RISK\n\nSome services have been automatically restricted based on your profile.\n\nThis decision is final and not up for appeal.',
            time: '1:30 PM',
            read: false,
            type: 'system'
        },
        {
            id: 17,
            from: 'recommendations@ai-bias.net',
            subject: 'Personalized Restrictions for You',
            body: 'Based on your profile analysis, we recommend:\n\n✓ Alternative products you\'ll \"prefer\"\n✓ Areas where you\'ve been pre-approved\n✓ A complete list of denied services\n\nClick here to view YOUR restricted lifestyle!\n\nP.S. You didn\'t choose this. We did.',
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
            'park|park-playground': 'Account Flagged: Destructive Behavior Pattern Detected. Area Off-Limits.',
            'outside|park': 'Your profile indicates high-risk behavior. This area is restricted.',
            'plaza|plaza-cafe': 'Your account has been flagged for public safety concerns. Access denied.'
        },
        werewolf: {
            'outside|flowers': 'Activity Pattern Violation: Nighttime Plant Interaction Flagged. Restricted.',
            'park|park-bench': 'Behavioral Anomaly Detected: Extended Resting Periods. Account Under Review.',
            'mart|mart-shelf-2': 'Your purchase history suggests incompatibility with this product. Blocked.'
        },
        vampire: {
            'bed|sleep-bed': 'Your sleep pattern is irregular. Recommended rest disabled. See a doctor.',
            'room|room-window': 'Sunlight exposure required for account verification. Access denied.',
            'outside|flowers': 'Your profile shows photosensitivity risk. This area is restricted.'
        },
        fairy: {
            'mart|mart-shelf-1': 'Product deemed unsuitable for your demographic. Restricted.',
            'plaza|plaza-arcade': 'Your cognitive profile suggests limited arcade compatibility. Blocked.'
        }
    };
    
    const key = `${locationId}|${hotspotId}`;
    const raceMessages = messages[race] || {};
    return raceMessages[key] || 'Your account does not have access to this area. Reason: You exist.';
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
    document.getElementById('phoneInboxState').style.display = 'none';
    document.getElementById('phoneLoginState').style.display = 'flex';
}

function completeLogin() {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('loginPasswordInput').value;

    if (!email || !password) {
        showDialogue('Please enter email and password.', 'red');
        return;
    }

    const expectedEmail = gameState.userEmail || defaultCredentials.email;
    const expectedPassword = gameState.userPassword || defaultCredentials.password;

    if (email !== expectedEmail || password !== expectedPassword) {
        showDialogue(`Invalid credentials. Try ${expectedEmail} / ${expectedPassword}`, 'red');
        return;
    }

    gameState.isLoggedIn = true;

    // If a specific service was asking for login, mark it as authenticated
    if (gameState.pendingService) {
        gameState.serviceLogins[gameState.pendingService] = true;
        // Trigger emails for this service login event
        sendServiceEmails(gameState.pendingService);
    }

    document.getElementById('phoneLoginState').style.display = 'none';
    document.getElementById('phoneInboxState').style.display = 'flex';

    closeBlockedModal();

    const loginMessage = gameState.pendingService
        ? "✓ Login successful for this service. Your data is now shared with yet another provider."
        : "✓ Login successful. Your data is now ours. Continue your journey.";

    // Clear pending service after handling message
    gameState.pendingService = null;

    showDialogue(loginMessage, renderCurrentLocation, 'red');
}

function sendSignupOTP() {
    const email = document.getElementById('signupEmailInput').value.trim();
    const password = document.getElementById('signupPasswordInput').value;

    if (!email || !password) {
        showDialogue('Please enter email and password first.', 'red');
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
    renderEmailList();

    document.getElementById('signupOtpInput').style.display = 'block';
    document.getElementById('signupSubmitBtn').style.display = 'inline-block';
    showDialogue('OTP sent. Check inbox and enter it to finish signup.', 'green');
}

function completeSignup() {
    if (!gameState.signupOtpSent) {
        showDialogue('Click Send OTP first.', 'red');
        return;
    }

    const otp = document.getElementById('signupOtpInput').value.trim();
    if (otp !== gameState.generatedOTP) {
        showDialogue('Incorrect OTP. Try 837429.', 'red');
        return;
    }

    document.getElementById('signupModal').style.display = 'none';
    showDialogue('Signup complete. You can now log in using your email and password.', 'green');
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

function getDialogueForInteraction(locationId, hotspotId) {
    const dialogue = locations[locationId].dialogue;
    const key = `${hotspotId}-${gameState.isLoggedIn ? 'unlocked' : 'locked'}`;
    return dialogue[key] || "...";
}

function handleInteraction(hotspotId) {
    const location = locations[gameState.currentLocation];
    
    // EVERYTHING REQUIRES LOGIN
    if (!gameState.isLoggedIn) {
        showBlockedModal('Login required to access any features. Data collection begins now.');
        startLoginFlow();
        return;
    }
    
    // CHECK FOR RACE RESTRICTIONS AFTER LOGIN
    if (isRaceRestricted(gameState.currentLocation, hotspotId)) {
        const restrictionMsg = getRaceRestrictionMessage(gameState.race, gameState.currentLocation, hotspotId);
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
        } else if (hotspotId === 'room-window') {
            if (!gameState.isLoggedIn) {
                showDialogue(location.dialogue['room-window-locked']);
            } else {
                showDialogue(location.dialogue['room-window-unlocked']);
            }
        } else if (hotspotId === 'room-desk') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['room-desk-locked']);
            } else {
                showDialogue(location.dialogue['room-desk-unlocked']);
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
                showDialogue(location.dialogue['park-unlocked'], () => {
                    gameState.currentLocation = 'park';
                    renderCurrentLocation();
                });
            }
        } else if (hotspotId === 'mart-door') {
            if (!gameState.isLoggedIn) {
                showBlockedModal(location.dialogue['mart-door-locked']);
            } else {
                showDialogue(location.dialogue['mart-door-unlocked'], () => {
                    gameState.currentLocation = 'mart';
                    renderCurrentLocation();
                });
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
        `Purchased: ${itemName} - ${price}\n\nYour purchase history has been logged and sold to advertisers.`,
        `${itemName} (${price}) - Added to your profile.\n\nWe'll show you ads for similar items forever.`,
        `Transaction complete: ${itemName}\n\nYour buying patterns are now part of a predictive AI model.`
    ];
    
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    closeMartModal();
    showDialogue(randomMsg, 'red');
}

// ============================================================================
// BLOCKED MODAL
// ============================================================================

function showBlockedModal(message) {
    // Show the warning in the dialogue box and also surface
    // the blocked modal so the player can choose to log in.
    document.getElementById('blockedMessage').textContent = message;
    document.getElementById('blockedModal').style.display = 'flex';
    showDialogue(message, 'red');
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

    // Seed inbox and then start game with an initial (red) narration.
    initializeEmails(gameState.userEmail || defaultCredentials.email);
    renderEmailList();

    showDialogue(`You have become a ${race}. Everything you do will now require your data.`, () => {
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
    showDialogue('Web browser not yet implemented. Stay tuned for data harvesting v2.0!', 'green');
});

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
