/* ==========================================================================
   🛡️ COMPUTER LAB SAFETY ADVENTURE - JAVASCRIPT GAME ENGINE
   Vanilla JS, Zero Dependencies, Web Audio API Sound Synthesizer,
   Canvas Confetti System, Interactive Levels 1 to 5.
   ========================================================================== */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type, duration, delay = 0, gainVal = 0.15) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Fallback silently if audio interrupted
      }
    }, delay);
  }

  playClick() {
    this.playTone(600, 'sine', 0.08, 0, 0.12);
  }

  playCorrect() {
    // Happy major triad arpeggio (C5 - E5 - G5 - C6)
    this.playTone(523.25, 'sine', 0.15, 0, 0.15);
    this.playTone(659.25, 'sine', 0.15, 80, 0.15);
    this.playTone(783.99, 'sine', 0.18, 160, 0.15);
    this.playTone(1046.50, 'sine', 0.35, 240, 0.2);
  }

  playStar() {
    this.playTone(880, 'triangle', 0.15, 0, 0.15);
    this.playTone(1320, 'triangle', 0.25, 100, 0.2);
  }

  playError() {
    // Gentle boing (descending pitch)
    this.playTone(320, 'sawtooth', 0.15, 0, 0.08);
    this.playTone(240, 'sawtooth', 0.25, 120, 0.08);
  }

  playSbtStep(stepNum) {
    const freqs = [440, 587.33, 880];
    const f = freqs[stepNum - 1] || 600;
    this.playTone(f, 'sine', 0.2, 0, 0.18);
  }

  playVictory() {
    // Cheerful celebratory fanfare
    const notes = [
      { f: 523.25, d: 120, t: 0 },
      { f: 659.25, d: 120, t: 120 },
      { f: 783.99, d: 150, t: 240 },
      { f: 1046.50, d: 400, t: 400 }
    ];
    notes.forEach(n => {
      this.playTone(n.f, 'triangle', n.d / 1000, n.t, 0.2);
    });
  }
}

/* ==========================================================================
   CONFETTI CANNON EFFECT
   ========================================================================== */
class ConfettiCannon {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(count = 70) {
    if (!this.canvas || !this.ctx) return;
    const colors = ['#ffb703', '#fb8500', '#06d6a0', '#4cc9f0', '#ef476f', '#7209b7', '#ffffff'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width * 0.5 + (Math.random() - 0.5) * 200,
        y: this.canvas.height * 0.4 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.9) * 18,
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        life: 1
      });
    }
    if (!this.animating) {
      this.animating = true;
      this.render();
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.rotation += p.rotSpeed;
      p.life -= 0.012;
      p.opacity = Math.max(0, p.life);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      this.ctx.restore();

      if (p.life <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.render());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

/* ==========================================================================
   GAME CONTENT DATA
   ========================================================================== */

// LEVEL 1: Physical Lab Safety (5 Rich Graphic Scenarios)
const LEVEL_1_DATA = [
  {
    id: 'l1_water',
    title: '💧 Water Bottle Alert!',
    prompt: 'Leo is carrying a water bottle into the computer room. What should he do?',
    studentItem: '💧',
    storageSign: '🚪 Hallway Drink Table',
    monitorStatus: '🖥️ System Active',
    isFrozen: false,
    choices: [
      {
        text: 'Take the water outside to the drink rack',
        icon: '💧',
        isCorrect: true,
        actionName: 'take_outside',
        feedback: 'Excellent choice! 🌟 Water can spill, cause electrical short circuits, and ruin computers.',
        points: 50
      },
      {
        text: 'Bring the water bottle to the computer desk',
        icon: '🚫',
        isCorrect: false,
        feedback: 'Oops! Let\'s think again 🤔 Liquids are never allowed near keyboards or computers!',
        points: 0
      }
    ]
  },
  {
    id: 'l1_food',
    title: '🍱 Lunch Snack Dilemma',
    prompt: 'Leo is sitting at the computer desk opening a box of tasty snacks. What is the safe choice?',
    studentItem: '🍱',
    storageSign: '🚪 Lunch Table Area',
    monitorStatus: '🖥️ Coding Project',
    isFrozen: false,
    choices: [
      {
        text: 'Eat outside the computer lab',
        icon: '🍱',
        isCorrect: true,
        actionName: 'take_outside',
        feedback: 'Spot on! 🌟 Food crumbs get stuck between keyboard keys and sticky fingers damage equipment.',
        points: 50
      },
      {
        text: 'Eat snacks while typing on the keyboard',
        icon: '🍔',
        isCorrect: false,
        feedback: 'Oops! Let\'s think again 🤔 Eating inside the lab can damage computer equipment.',
        points: 0
      }
    ]
  },
  {
    id: 'l1_cable',
    title: '🔌 Stuck Cable Hazard',
    prompt: 'A power cable is tangled tightly under the computer desk. Leo wants to plug in his mouse. What should he do?',
    studentItem: '🔌',
    storageSign: '👩‍🏫 Teacher Desk',
    monitorStatus: '⚙️ Hardware Setup',
    isFrozen: false,
    choices: [
      {
        text: 'Ask Teacher Maya for help untangling it',
        icon: '👩‍🏫',
        isCorrect: true,
        actionName: 'call_teacher',
        feedback: 'Great Safety Decision! 🌟 Never yank cables with force—it can cause electric shock or break ports.',
        points: 50
      },
      {
        text: 'Pull the cable as hard as possible',
        icon: '💪',
        isCorrect: false,
        feedback: 'Oops! Let\'s think again 🤔 Forcefully pulling cables can snap wires or cause electrical hazards.',
        points: 0
      }
    ]
  },
  {
    id: 'l1_frozen',
    title: '🧘 Computer Not Responding',
    prompt: 'The computer screen is frozen and the game won\'t load. Leo is getting frustrated. What should he do?',
    studentItem: '❓',
    storageSign: '👩‍🏫 Teacher Help',
    monitorStatus: '❄️ SYSTEM FROZEN',
    isFrozen: true,
    choices: [
      {
        text: 'Stay calm and ask the teacher for help',
        icon: '🧘',
        isCorrect: true,
        actionName: 'call_teacher',
        feedback: 'Super Hero Mindset! 🌟 Computers are delicate machines. Stay patient and get help.',
        points: 50
      },
      {
        text: 'Hit the monitor and smash the keyboard',
        icon: '👊',
        isCorrect: false,
        feedback: 'Oops! Let\'s think again 🤔 Hitting equipment breaks hardware. Always ask an adult.',
        points: 0
      }
    ]
  },
  {
    id: 'l1_bag',
    title: '🎒 Heavy School Bag',
    prompt: 'Leo enters the computer lab with a bulky backpack. Where should the bag go?',
    studentItem: '🎒',
    storageSign: '🗄️ Bag Storage Cubby',
    monitorStatus: '🖥️ Lab Station Ready',
    isFrozen: false,
    choices: [
      {
        text: 'Put the bag in the designated cubby rack',
        icon: '🎒',
        isCorrect: true,
        actionName: 'take_outside',
        feedback: 'Awesome! 🌟 Keeping aisles clear prevents students and teachers from tripping and falling.',
        points: 50
      },
      {
        text: 'Leave the bag in the middle of the aisle floor',
        icon: '🚶',
        isCorrect: false,
        feedback: 'Oops! Let\'s think again 🤔 Leaving bags on the floor is a dangerous tripping hazard!',
        points: 0
      }
    ]
  }
];

// LEVEL 2: Good Habits vs Bad Habits (10 Rich Scenarios)
const LEVEL_2_DATA = [
  {
    title: 'Sitting upright with feet flat on the floor',
    desc: 'Student adjusts chair height and sits properly with straight posture.',
    emoji: '🪑',
    isGood: true,
    explain: 'Good posture keeps your back and neck healthy during computer time!'
  },
  {
    title: 'Running and chasing friends between lab desks',
    desc: 'Students sprinting across the room while computer cords are around.',
    emoji: '🏃🏃',
    isGood: false,
    explain: 'Running in the lab can cause tripping over wires or crashing into expensive equipment.'
  },
  {
    title: 'Washing and thoroughly drying hands before typing',
    desc: 'Clean dry hands keep the mouse and keyboards clean for everyone.',
    emoji: '🧼✨',
    isGood: true,
    explain: 'Clean hands protect keyboards from dirt, grease, and moisture damage.'
  },
  {
    title: 'Touching electrical plugs or power sockets with wet hands',
    desc: 'Handling wall power cables immediately after washing hands.',
    emoji: '⚡💧',
    isGood: false,
    explain: 'DANGEROUS! Water conducts electricity and can cause severe electric shock.'
  },
  {
    title: 'Carrying laptop equipment with two hands gently',
    desc: 'Holding devices securely by the base instead of swinging them.',
    emoji: '💻🤲',
    isGood: true,
    explain: 'Always use two hands to prevent expensive laptops or tablets from dropping!'
  },
  {
    title: 'Yanking power cables out from the wall by the wire',
    desc: 'Pulling hard on the middle of the cord instead of grasping the plug head.',
    emoji: '🔌💥',
    isGood: false,
    explain: 'Pulling cords damages internal wires. Always hold the plastic plug head gently!'
  },
  {
    title: 'Politely raising hand when a screen shows an error',
    desc: 'Asking the teacher or lab assistant for guidance.',
    emoji: '🙋',
    isGood: true,
    explain: 'Teachers know the safe way to troubleshoot computer errors!'
  },
  {
    title: 'Smashing and banging keys when losing a video game',
    desc: 'Punching the keyboard in frustration.',
    emoji: '⌨️👊',
    isGood: false,
    explain: 'Hardware can easily break under force. Always treat school equipment with respect!'
  },
  {
    title: 'Storing juice boxes and snacks outside the lab door',
    desc: 'Keeping all drinks in the designated cafeteria or cubby zone.',
    emoji: '🧃🚪',
    isGood: true,
    explain: 'Zero drinks in the lab means zero liquid accidents!'
  },
  {
    title: 'Pushing chair out into the hallway when leaving',
    desc: 'Leaving computer chairs sticking out blocking the walking path.',
    emoji: '🪑🚶',
    isGood: false,
    explain: 'Always push your chair in under the desk so nobody trips walking past!'
  }
];

// LEVEL 3: Safe Web Explorer (Search + 5 Popups)
const LEVEL_3_SEARCH_DATA = {
  type: 'search',
  query: 'Animals of the World',
  results: [
    {
      id: 'res_natgeo',
      url: 'https://kids.nationalgeographic.com/animals',
      title: '🦁 National Geographic Kids – Animal Encyclopedia',
      snippet: 'Explore fun animal facts, photos, habitat maps and educational wildlife videos for school research.',
      badge: 'VERIFIED EDUCATIONAL',
      badgeClass: 'verified',
      isSafe: true,
      feedback: 'Great discovery! 🌟 National Geographic Kids is a trusted, verified educational resource for students.'
    },
    {
      id: 'res_spam1',
      url: 'http://free-animal-game-win-ipad-now.xyz/download',
      title: '🎁 FREE 3D ANIMAL GAME DOWNLOAD (NO VIRUS 100% FREE IPAD)!!!',
      snippet: 'CLICK HERE IMMEDIATELY TO CLAIM 10,000 COINS AND WIN FREE GAMING LAPTOP!!!',
      badge: 'SUSPICIOUS LINK',
      badgeClass: 'warning',
      isSafe: false,
      feedback: 'Caution! 🛑 Flashy promises of free iPads or all-caps free downloads are often phishing traps or viruses.'
    },
    {
      id: 'res_spam2',
      url: 'http://unblocked-gamez-free-secret-cheats.net',
      title: '⚠️ DOWNLOAD CHEAT ENGINE FOR ALL GAMES - ENTER PASSWORD',
      snippet: 'Type your school username and password to unlock all game levels instantly.',
      badge: 'DANGEROUS',
      badgeClass: 'warning',
      isSafe: false,
      feedback: 'Dangerous trick! 🛑 Never type your school password into random websites.'
    }
  ]
};

const LEVEL_3_POPUPS_DATA = [
  {
    id: 'p1_tablet',
    icon: '🎁',
    title: 'CONGRATULATIONS!',
    msg: 'You have been randomly selected as today\'s winner for a FREE GAMING TABLET! Click below to claim!',
    btnSafeText: '↩️ Close / Go Back',
    btnDangerText: '🎮 CLAIM TABLET NOW!',
    feedback: 'Smart choice! 🌟 Unexpected prizes and free giveaways on websites are common tricks to steal information.',
    advice: 'Never click on surprise prize popups.'
  },
  {
    id: 'p2_virus',
    icon: '⚠️',
    title: 'CRITICAL VIRUS DETECTED!',
    msg: 'Your computer is infected with 5 viruses! Click below to download our Emergency Cleaner immediately!',
    btnSafeText: '✖️ Close Popup & Ask Teacher',
    btnDangerText: '🚨 FIX COMPUTER NOW!',
    feedback: 'Hero defense! 🌟 Fake virus popups try to trick you into downloading real malware. Real safety tools don\'t show flashing web popups.',
    advice: 'Always close fake alerts and let your teacher know.'
  },
  {
    id: 'p3_winner',
    icon: '🎉',
    title: 'YOU ARE VISITOR #1,000,000!',
    msg: 'Enter your home address, school name, and phone number to receive a $500 gift card in the mail!',
    btnSafeText: '🛑 Leave Page / Do Not Share',
    btnDangerText: '📝 ENTER MY DETAILS',
    feedback: 'Terrific privacy protection! 🌟 Never give out your home address or school location to online popups.',
    advice: 'Personal information should stay strictly private.'
  },
  {
    id: 'p4_password',
    icon: '🔑',
    title: 'SECURITY UPDATE REQUIRED',
    msg: 'Please re-enter your school Google or Microsoft password here to keep your internet connection active.',
    btnSafeText: '🔒 Cancel & Never Give Password',
    btnDangerText: '🔑 TYPE MY PASSWORD',
    feedback: 'Top-tier cyber security! 🌟 Legitimate services never ask you to enter passwords in unverified web popups.',
    advice: 'Only enter passwords on official login pages with adult guidance.'
  },
  {
    id: 'p5_download',
    icon: '🔔',
    title: 'FAST DOWNLOAD READY',
    msg: 'Your download "SuperUltraGameInstaller.exe" is ready. Run this file now to begin installation.',
    btnSafeText: '↩️ Cancel Download',
    btnDangerText: '💾 RUN FILE NOW',
    feedback: 'Fantastic safety habit! 🌟 Never download or run unknown executable files (.exe) without permission from your teacher or parent.',
    advice: 'Always ask a trusted adult before downloading any program.'
  }
];

// LEVEL 4: Stop, Block, Tell (5 Real-World Scenarios)
const LEVEL_4_DATA = [
  {
    id: 'sbt_address',
    sender: 'MysteryPlayer_77',
    avatar: '👤',
    isKnown: false,
    statusText: '⚠️ Unknown Sender • Not in your trusted contacts',
    msg: '"Hey! You are cool. What is your real full name, home address, and where do you walk after school?"',
    threat: 'Stranger asking for private personal location & address',
    stopDesc: 'You stopped typing and refused to give away private information.',
    blockDesc: 'You blocked MysteryPlayer_77 so they can never send messages again.',
    tellDesc: 'You told Teacher Maya and your parents about the stranger immediately!'
  },
  {
    id: 'sbt_link',
    sender: 'StrangeBot_404',
    avatar: '🤖',
    isKnown: false,
    statusText: '⚠️ Suspicious Bot • Unverified Account',
    msg: '"Click this secret link right now to see embarrassing photos of your classmates: http://weird-trap.xyz"',
    threat: 'Suspicious dangerous link / cyberbullying trap',
    stopDesc: 'You stopped and did NOT click on the suspicious link.',
    blockDesc: 'You blocked StrangeBot_404 from your contact list.',
    tellDesc: 'You reported the malicious link to your teacher so school filters could block it!'
  },
  {
    id: 'sbt_password',
    sender: 'Admin_Helper_Fake',
    avatar: '⚠️',
    isKnown: false,
    statusText: '⚠️ Impersonator • Fake Admin Account',
    msg: '"This is the game administrator. Give me your password right now or your game account will be banned forever!"',
    threat: 'Fake admin trying to steal password by threatening',
    stopDesc: 'You stayed calm and did NOT send your password.',
    blockDesc: 'You blocked the fake admin account.',
    tellDesc: 'You informed your parents and teacher about the scammer.'
  },
  {
    id: 'sbt_friend',
    sender: 'HappyNimal_07',
    avatar: '😊',
    isKnown: true,
    statusText: '✅ Trusted Classmate • Grade 5 Room B',
    msg: '"Hi! I am feeling sad today because I lost my favourite pencil. Can you help me find it?"',
    threat: 'A classmate is sharing a personal problem and asking for friendly help.',
    stopDesc: 'You listened carefully and gave your friend time to explain.',
    blockDesc: 'You did not block your friend because they were not doing anything unsafe or unkind.',
    tellDesc: 'You encouraged your friend to tell the teacher if they could not find the pencil.'
  },
  {
    id: 'sbt_group',
    sender: 'ClassCaptain_05',
    avatar: '⭐',
    isKnown: true,
    statusText: '✅ School Class Captain • Project Group',
    msg: '"Our group project is tomorrow! Let us share our ideas here and choose who will do each part."',
    threat: 'Classmates are using the chat responsibly to organize a school project.',
    stopDesc: 'You read the messages carefully before replying.',
    blockDesc: 'You did not block your classmates because this is a safe school discussion.',
    tellDesc: 'You told the teacher about your group plan and asked if everyone had a task.'
  }
];

/* ==========================================================================
   MAIN GAME CONTROLLER CLASS
   ========================================================================== */
class SafetyAdventureGame {
  constructor() {
    this.sound = new SoundSystem();
    this.confetti = new ConfettiCannon('confetti-canvas');

    // State Variables
    this.score = 0;
    this.lives = 3;
    this.currentLevel = 1;
    this.scenarioIndex = 0;
    this.timerSeconds = 45;
    this.timerInterval = null;
    this.isGauntlet = false;
    this.gauntletQuestions = [];
    this.correctDecisionsCount = 0;
    this.totalQuestionsAnswered = 0;
    this.levelStars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.levelScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Level 4 SBT Stage
    this.sbtCurrentStep = 1; // 1: STOP, 2: BLOCK, 3: TELL

    // DOM Caching
    this.initDomElements();
    this.bindEvents();
    this.updateStatsDisplay();
  }

  initDomElements() {
    this.dom = {
      hud: document.getElementById('game-hud'),
      hudLevelNum: document.getElementById('hud-level-num'),
      hudProgressFill: document.getElementById('hud-progress-fill'),
      hudProgressText: document.getElementById('hud-progress-text'),
      hudScoreVal: document.getElementById('hud-score-val'),
      hudHearts: document.getElementById('hud-hearts-container'),
      hudTimerVal: document.getElementById('hud-timer-val'),
      soundIcon: document.getElementById('sound-icon'),

      // Screens
      screenMainMenu: document.getElementById('screen-main-menu'),
      screenLevelSelect: document.getElementById('screen-level-select'),
      screenHowToPlay: document.getElementById('screen-how-to-play'),
      screenSafetyRules: document.getElementById('screen-safety-rules'),
      screenLevel1: document.getElementById('screen-level-1'),
      screenLevel2: document.getElementById('screen-level-2'),
      screenLevel3: document.getElementById('screen-level-3'),
      screenLevel4: document.getElementById('screen-level-4'),
      screenLevelComplete: document.getElementById('screen-level-complete'),
      screenGameResult: document.getElementById('screen-game-result'),
      screenGameOver: document.getElementById('screen-game-over'),

      // Feedback Overlay
      feedbackOverlay: document.getElementById('feedback-overlay'),
      feedbackBox: document.getElementById('feedback-modal-box'),
      fbIcon: document.getElementById('fb-icon'),
      fbTitle: document.getElementById('fb-title'),
      fbDesc: document.getElementById('fb-desc'),
      fbPoints: document.getElementById('fb-points'),

      // Level 1 Stage
      l1Title: document.getElementById('l1-title'),
      l1Prompt: document.getElementById('l1-prompt-text'),
      l1Choices: document.getElementById('l1-choices-container'),
      l1StudentActor: document.getElementById('l1-student-actor'),
      l1StudentBubble: document.getElementById('l1-student-bubble'),
      l1StudentItem: document.getElementById('l1-student-item'),
      l1StorageSign: document.getElementById('l1-storage-sign'),
      l1StorageRack: document.getElementById('l1-storage-rack'),
      l1ScreenContent: document.getElementById('l1-screen-content'),
      l1ScreenGlass: document.getElementById('l1-screen-glass'),
      l1TeacherHelper: document.getElementById('l1-teacher-helper'),
      l1TeacherBubble: document.getElementById('l1-teacher-bubble'),
      l1HazardSlot: document.getElementById('l1-hazard-slot'),
      l1CableWire: document.getElementById('l1-wire'),

      // Level 2 Stage
      l2SceneCard: document.getElementById('l2-scene-card'),
      l2SceneBadge: document.getElementById('l2-scene-badge'),
      l2SceneEmoji: document.getElementById('l2-scene-emoji'),
      l2SceneTitle: document.getElementById('l2-scene-title'),
      l2SceneDesc: document.getElementById('l2-scene-desc'),

      // Level 3 Stage
      l3SearchView: document.getElementById('l3-search-view'),
      l3PopupView: document.getElementById('l3-popup-view'),
      l3SearchResults: document.getElementById('l3-search-results'),
      l3PopupBox: document.getElementById('l3-popup-box'),
      l3PopupIcon: document.getElementById('l3-popup-icon'),
      l3PopupTitle: document.getElementById('l3-popup-title'),
      l3PopupMsg: document.getElementById('l3-popup-msg'),
      l3PopupBtns: document.getElementById('l3-popup-btns'),
      l3TabTitle: document.getElementById('l3-tab-title'),
      l3UrlInput: document.getElementById('l3-url-input'),

      // Level 4 Stage
      l4SenderName: document.getElementById('l4-sender-name'),
      l4ChatAvatar: document.getElementById('l4-chat-avatar'),
      l4SenderStatus: document.getElementById('l4-sender-status'),
      l4SenderTag: document.getElementById('l4-sender-tag'),
      l4MsgText: document.getElementById('l4-msg-text'),
      l4ChatStatus: document.getElementById('l4-chat-status'),
      l4InstructionText: document.getElementById('l4-instruction-text'),
      btnSbtStop: document.getElementById('btn-sbt-stop'),
      btnSbtBlock: document.getElementById('btn-sbt-block'),
      btnSbtTell: document.getElementById('btn-sbt-tell'),
      sbtNode1: document.getElementById('sbt-node-1'),
      sbtNode2: document.getElementById('sbt-node-2'),
      sbtNode3: document.getElementById('sbt-node-3'),
      sbtLine1: document.getElementById('sbt-line-1'),
      sbtLine2: document.getElementById('sbt-line-2')
    };
  }

  bindEvents() {
    // Menu Buttons
    document.getElementById('btn-start-game').addEventListener('click', () => {
      this.sound.playClick();
      this.startLevel(1);
    });

    document.getElementById('btn-level-select').addEventListener('click', () => {
      this.sound.playClick();
      this.showScreen('screen-level-select');
    });

    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      this.sound.playClick();
      this.showScreen('screen-how-to-play');
    });

    document.getElementById('btn-safety-rules').addEventListener('click', () => {
      this.sound.playClick();
      this.showScreen('screen-safety-rules');
    });

    document.getElementById('btn-home').addEventListener('click', () => {
      this.sound.playClick();
      this.stopTimer();
      this.showScreen('screen-main-menu');
      this.dom.hud.classList.add('hidden');
    });

    document.getElementById('btn-sound-toggle').addEventListener('click', () => {
      const enabled = this.sound.toggle();
      this.dom.soundIcon.textContent = enabled ? '🔊' : '🔇';
      if (enabled) this.sound.playClick();
    });
  }

  /* ==========================================================================
     SCREEN MANAGEMENT
     ========================================================================== */
  showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }
  }

  setMascot(text, avatar = '👩‍🏫', autoHideMs = 4000) {
    // Mascot bar removed to keep underside of the screen completely clean and unobstructed
  }

  updateStatsDisplay() {
    this.dom.hudScoreVal.textContent = this.score;
    this.dom.hudLevelNum.textContent = this.isGauntlet ? 'CHALLENGE' : this.currentLevel;

    // High score & rank
    let high = parseInt(localStorage.getItem('safety_hero_highscore') || '0', 10);
    if (this.score > high) {
      high = this.score;
      localStorage.setItem('safety_hero_highscore', high);
    }
    const menuHigh = document.getElementById('menu-high-score');
    if (menuHigh) menuHigh.textContent = high;

    // Stars total
    let totalStars = 0;
    for (let k in this.levelStars) totalStars += this.levelStars[k];
    const menuStars = document.getElementById('menu-stars-earned');
    if (menuStars) menuStars.textContent = `${totalStars} / 15`;

    let rank = 'Safety Cadet 🛡️';
    if (totalStars >= 12) rank = '🥇 GRAND MASTER HERO';
    else if (totalStars >= 8) rank = '🥈 Lab Safety Captain';
    else if (totalStars >= 4) rank = '🥉 Safety Explorer';

    const menuRank = document.getElementById('menu-rank');
    if (menuRank) menuRank.textContent = rank;

    // Update level select stars
    for (let l = 1; l <= 5; l++) {
      const el = document.getElementById(`lvl${l}-stars`);
      if (el) {
        const count = this.levelStars[l] || 0;
        el.textContent = '⭐'.repeat(count) + '☆'.repeat(3 - count);
      }
    }
  }

  updateHeartsDisplay() {
    const hearts = this.dom.hudHearts.querySelectorAll('.heart');
    hearts.forEach((h, index) => {
      if (index < this.lives) {
        h.classList.remove('lost');
        h.classList.add('active');
      } else {
        h.classList.add('lost');
        h.classList.remove('active');
      }
    });
  }

  startTimer(seconds) {
    this.stopTimer();
    this.timerSeconds = seconds;
    this.dom.hudTimerVal.textContent = `${this.timerSeconds}s`;

    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      this.dom.hudTimerVal.textContent = `${this.timerSeconds}s`;

      if (this.timerSeconds <= 10) {
        this.dom.hudTimerVal.style.color = '#ef476f';
      } else {
        this.dom.hudTimerVal.style.color = '#f8fafc';
      }

      if (this.timerSeconds <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleTimeUp() {
    this.handleWrongDecision('Time is up! Let\'s think carefully and make a safe choice.', 0);
  }

  /* ==========================================================================
     LEVEL INITIALIZATION
     ========================================================================== */
  startLevel(lvlNumber) {
    this.currentLevel = lvlNumber;
    this.scenarioIndex = 0;
    this.lives = 3;
    this.isGauntlet = (lvlNumber === 5);
    this.updateHeartsDisplay();
    this.updateStatsDisplay();

    this.dom.hud.classList.remove('hidden');

    if (this.isGauntlet) {
      this.setupGauntletMode();
      return;
    }

    switch (lvlNumber) {
      case 1:
        this.showScreen('screen-level-1');
        this.setMascot('Level 1: Keep our Physical Computer Lab safe from liquids, food & hazards!', '👩‍🏫');
        this.loadLevel1Scenario(0);
        break;
      case 2:
        this.showScreen('screen-level-2');
        this.setMascot('Level 2: Sort good lab habits from bad habits!', '🤖');
        this.loadLevel2Scenario(0);
        break;
      case 3:
        this.showScreen('screen-level-3');
        this.setMascot('Level 3: Search safely on the web and avoid suspicious popups!', '🔍');
        this.loadLevel3Scenario(0);
        break;
      case 4:
        this.showScreen('screen-level-4');
        this.setMascot('Level 4: Follow the golden rule: STOP 🛑 • BLOCK 🚫 • TELL 👩‍🏫!', '🚦');
        this.loadLevel4Scenario(0);
        break;
    }
  }

  retryCurrentLevel() {
    this.sound.playClick();
    this.startLevel(this.currentLevel);
  }

  /* ==========================================================================
     LEVEL 1 CONTROLLER (Physical Lab Safety)
     ========================================================================== */
  loadLevel1Scenario(idx) {
    const data = LEVEL_1_DATA[idx];
    if (!data) {
      this.completeLevel(1);
      return;
    }

    this.scenarioIndex = idx;
    this.startTimer(45);

    // Update Progress
    const total = LEVEL_1_DATA.length;
    this.dom.hudProgressFill.style.width = `${((idx + 1) / total) * 100}%`;
    this.dom.hudProgressText.textContent = `${idx + 1} / ${total}`;

    // Reset visual positions & animations
    this.dom.l1Title.textContent = data.title;
    this.dom.l1Prompt.textContent = data.prompt;
    this.dom.l1StudentItem.textContent = data.studentItem;
    this.dom.l1StorageSign.textContent = data.storageSign;
    this.dom.l1StorageRack.innerHTML = '';
    this.dom.l1TeacherHelper.classList.add('hidden');
    this.dom.l1HazardSlot.innerHTML = '';
    this.dom.l1StudentActor.style.left = '200px';
    this.dom.l1StudentActor.style.opacity = '1';
    this.dom.l1StudentBubble.textContent = '"What should I do?"';

    // Screen State
    this.dom.l1ScreenContent.textContent = data.monitorStatus;
    if (data.isFrozen) {
      this.dom.l1ScreenGlass.classList.add('frozen');
      this.dom.l1CableWire.classList.add('tangled');
    } else {
      this.dom.l1ScreenGlass.classList.remove('frozen');
      this.dom.l1CableWire.classList.remove('tangled');
    }

    // Populate Choices
    this.dom.l1Choices.innerHTML = '';
    data.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'btn-choice';
      btn.innerHTML = `<span class="choice-icon">${choice.icon}</span><span>${choice.text}</span>`;
      btn.onclick = () => this.handleLevel1Choice(choice, data);
      this.dom.l1Choices.appendChild(btn);
    });
  }

  handleLevel1Choice(choice, scenarioData) {
    this.totalQuestionsAnswered++;
    if (choice.isCorrect) {
      this.stopTimer();
      this.correctDecisionsCount++;
      this.score += choice.points + Math.floor(this.timerSeconds * 1.5);
      this.updateStatsDisplay();

      // Perform Character & Lab Animations
      if (choice.actionName === 'take_outside') {
        this.dom.l1StudentActor.style.left = '60px';
        this.dom.l1StudentBubble.textContent = '✨ Safe outside the lab!';
        setTimeout(() => {
          this.dom.l1StorageRack.innerHTML = `<span class="placed-item">${scenarioData.studentItem}</span>`;
          this.dom.l1StudentItem.textContent = '👍';
        }, 400);
      } else if (choice.actionName === 'call_teacher') {
        this.dom.l1TeacherHelper.classList.remove('hidden');
        this.dom.l1TeacherBubble.textContent = '👩‍🏫 Great job asking! Let\'s fix this safely.';
        this.dom.l1ScreenGlass.classList.remove('frozen');
        this.dom.l1CableWire.classList.remove('tangled');
        this.dom.l1ScreenContent.textContent = '✅ FIXED SAFELY';
      }

      this.sound.playCorrect();
      this.confetti.fire(30);

      this.showFeedbackModal(true, 'Great Choice! 🌟', choice.feedback, choice.points, () => {
        this.loadLevel1Scenario(this.scenarioIndex + 1);
      });
    } else {
      this.handleWrongDecision(choice.feedback, 0);
    }
  }

  /* ==========================================================================
     LEVEL 2 CONTROLLER (Good Habits vs Bad Habits)
     ========================================================================== */
  loadLevel2Scenario(idx) {
    const data = LEVEL_2_DATA[idx];
    if (!data) {
      this.completeLevel(2);
      return;
    }

    this.scenarioIndex = idx;
    this.startTimer(30);

    const total = LEVEL_2_DATA.length;
    this.dom.hudProgressFill.style.width = `${((idx + 1) / total) * 100}%`;
    this.dom.hudProgressText.textContent = `${idx + 1} / ${total}`;

    // Populate Scene Card
    this.dom.l2SceneBadge.textContent = `Scenario ${idx + 1} of ${total}`;
    this.dom.l2SceneEmoji.textContent = data.emoji;
    this.dom.l2SceneTitle.textContent = data.title;
    this.dom.l2SceneDesc.textContent = data.desc;

    // Reset card animation
    this.dom.l2SceneCard.style.transform = 'scale(1)';
    this.dom.l2SceneCard.style.opacity = '1';
  }

  handleHabitChoice(userChoseGood) {
    const data = this.isGauntlet ? this.gauntletQuestions[this.scenarioIndex]?.data : LEVEL_2_DATA[this.scenarioIndex];
    if (!data) return;

    this.totalQuestionsAnswered++;
    const isCorrect = (userChoseGood === data.isGood);

    if (isCorrect) {
      this.stopTimer();
      this.correctDecisionsCount++;
      const earned = (this.isGauntlet ? 70 : 40) + Math.floor(this.timerSeconds * 1.2);
      this.score += earned;
      this.updateStatsDisplay();
      this.sound.playCorrect();

      // Card swipe animation
      this.dom.l2SceneCard.style.transform = userChoseGood ? 'translateX(100px) rotate(8deg)' : 'translateX(-100px) rotate(-8deg)';
      this.dom.l2SceneCard.style.opacity = '0';

      this.showFeedbackModal(true, 'Spot on! ⭐', data.explain, earned, () => {
        if (this.isGauntlet) {
          this.scenarioIndex++;
          this.loadGauntletQuestion(this.scenarioIndex);
        } else {
          this.loadLevel2Scenario(this.scenarioIndex + 1);
        }
      });
    } else {
      this.handleWrongDecision(`Oops! Let's think again 🤔 ${data.explain}`, 0);
    }
  }

  /* ==========================================================================
     LEVEL 3 CONTROLLER (Safe Internet Explorer)
     ========================================================================== */
  loadLevel3Scenario(idx) {
    // Total scenarios = 1 search + 5 popups = 6
    const total = 1 + LEVEL_3_POPUPS_DATA.length;
    this.scenarioIndex = idx;
    this.startTimer(40);

    this.dom.hudProgressFill.style.width = `${((idx + 1) / total) * 100}%`;
    this.dom.hudProgressText.textContent = `${idx + 1} / ${total}`;

    if (idx === 0) {
      // Scenario 1: Search Result
      this.dom.l3SearchView.classList.remove('hidden');
      this.dom.l3PopupView.classList.add('hidden');
      this.dom.l3TabTitle.textContent = 'SafeKids Search - Animals';
      this.dom.l3UrlInput.value = 'https://www.safekidssearch.org/animals';

      this.dom.l3SearchResults.innerHTML = '';
      LEVEL_3_SEARCH_DATA.results.forEach(res => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
          <span class="sr-url">${res.url}</span>
          <h4 class="sr-title">${res.title}</h4>
          <p class="sr-snippet">${res.snippet}</p>
          <span class="sr-badge ${res.badgeClass}">${res.badge}</span>
        `;
        item.onclick = () => this.handleLevel3SearchResult(res);
        this.dom.l3SearchResults.appendChild(item);
      });
    } else {
      // Scenarios 1 to 5: Suspicious Popups
      const popupData = LEVEL_3_POPUPS_DATA[idx - 1];
      if (!popupData) {
        this.completeLevel(3);
        return;
      }

      this.dom.l3SearchView.classList.add('hidden');
      this.dom.l3PopupView.classList.remove('hidden');
      this.dom.l3TabTitle.textContent = 'Animal Facts Article';
      this.dom.l3UrlInput.value = 'https://kids.nationalgeographic.com/animals/wild';

      // Populate Popup
      this.dom.l3PopupIcon.textContent = popupData.icon;
      this.dom.l3PopupTitle.textContent = popupData.title;
      this.dom.l3PopupMsg.textContent = popupData.msg;

      this.dom.l3PopupBtns.innerHTML = '';
      
      const btnSafe = document.createElement('button');
      btnSafe.className = 'btn-popup-action safe';
      btnSafe.textContent = popupData.btnSafeText;
      btnSafe.onclick = () => this.handleLevel3PopupChoice(true, popupData);

      const btnDanger = document.createElement('button');
      btnDanger.className = 'btn-popup-action danger';
      btnDanger.textContent = popupData.btnDangerText;
      btnDanger.onclick = () => this.handleLevel3PopupChoice(false, popupData);

      this.dom.l3PopupBtns.appendChild(btnSafe);
      this.dom.l3PopupBtns.appendChild(btnDanger);
    }
  }

  handleLevel3SearchResult(res) {
    this.totalQuestionsAnswered++;
    if (res.isSafe) {
      this.stopTimer();
      this.correctDecisionsCount++;
      const earned = 50 + Math.floor(this.timerSeconds * 1.5);
      this.score += earned;
      this.updateStatsDisplay();
      this.sound.playCorrect();

      this.showFeedbackModal(true, 'Smart Browsing! 🌐', res.feedback, earned, () => {
        this.loadLevel3Scenario(1);
      });
    } else {
      this.handleWrongDecision(res.feedback, 0);
    }
  }

  handleLevel3PopupChoice(isSafeAction, popupData) {
    this.totalQuestionsAnswered++;
    if (isSafeAction) {
      this.stopTimer();
      this.correctDecisionsCount++;
      const earned = 50 + Math.floor(this.timerSeconds * 1.5);
      this.score += earned;
      this.updateStatsDisplay();
      this.sound.playCorrect();

      this.showFeedbackModal(true, 'Popup Blocked! 🛡️', popupData.feedback, earned, () => {
        this.loadLevel3Scenario(this.scenarioIndex + 1);
      });
    } else {
      this.handleWrongDecision('Oops! That was a suspicious trap popup. Always close or back away!', 0);
    }
  }

  /* ==========================================================================
     LEVEL 4 CONTROLLER (STOP - BLOCK - TELL)
     ========================================================================== */
  loadLevel4Scenario(idx) {
    const data = LEVEL_4_DATA[idx];
    if (!data) {
      this.completeLevel(4);
      return;
    }

    this.scenarioIndex = idx;
    this.sbtCurrentStep = 1; // Start at STOP
    this.startTimer(45);

    const total = LEVEL_4_DATA.length;
    this.dom.hudProgressFill.style.width = `${((idx + 1) / total) * 100}%`;
    this.dom.hudProgressText.textContent = `${idx + 1} / ${total}`;

    // Update Chat UI
    this.dom.l4SenderName.textContent = data.sender;
    this.dom.l4MsgText.textContent = data.msg;
    this.dom.l4ChatStatus.classList.add('hidden');

    if (this.dom.l4ChatAvatar) {
      this.dom.l4ChatAvatar.textContent = data.avatar || '👤';
    }
    if (this.dom.l4SenderStatus) {
      this.dom.l4SenderStatus.textContent = data.statusText || (data.isKnown ? '✅ Trusted Contact' : '⚠️ Unknown Sender');
      this.dom.l4SenderStatus.style.color = data.isKnown ? '#059669' : 'var(--accent-yellow)';
    }
    if (this.dom.l4SenderTag) {
      this.dom.l4SenderTag.textContent = `${data.sender}:`;
      this.dom.l4SenderTag.style.color = data.isKnown ? '#2563eb' : 'var(--accent-red)';
    }

    this.updateSbtStepperUI();
  }

  updateSbtStepperUI() {
    const data = this.isGauntlet ? this.gauntletQuestions[this.scenarioIndex]?.data : LEVEL_4_DATA[this.scenarioIndex];
    const isKnown = data?.isKnown || false;
    const step = this.sbtCurrentStep;

    // Stepper node states
    [this.dom.sbtNode1, this.dom.sbtNode2, this.dom.sbtNode3].forEach((node, i) => {
      const num = i + 1;
      node.classList.remove('active', 'completed');
      if (num < step) node.classList.add('completed');
      else if (num === step) node.classList.add('active');
    });

    // Update Stepper Node Text
    if (this.dom.sbtNode1 && this.dom.sbtNode1.querySelector('.snode-lbl')) {
      this.dom.sbtNode1.querySelector('.snode-lbl').textContent = isKnown ? 'LISTEN' : 'STOP';
    }
    if (this.dom.sbtNode2 && this.dom.sbtNode2.querySelector('.snode-lbl')) {
      this.dom.sbtNode2.querySelector('.snode-lbl').textContent = isKnown ? 'KEEP CHAT' : 'BLOCK';
    }
    if (this.dom.sbtNode3 && this.dom.sbtNode3.querySelector('.snode-lbl')) {
      this.dom.sbtNode3.querySelector('.snode-lbl').textContent = isKnown ? 'SUPPORT' : 'TELL';
    }

    // Lines
    if (step >= 2) this.dom.sbtLine1.classList.add('filled');
    else this.dom.sbtLine1.classList.remove('filled');

    if (step >= 3) this.dom.sbtLine2.classList.add('filled');
    else this.dom.sbtLine2.classList.remove('filled');

    // Button Labels and Subtexts
    if (isKnown) {
      this.dom.btnSbtStop.innerHTML = '<span class="sbt-btn-icon">🎧</span><div class="sbt-btn-text"><strong>1. LISTEN & READ</strong><span>Give friend time & read carefully</span></div>';
      this.dom.btnSbtBlock.innerHTML = '<span class="sbt-btn-icon">🤝</span><div class="sbt-btn-text"><strong>2. DO NOT BLOCK</strong><span>Safe conversation — keep chat open</span></div>';
      this.dom.btnSbtTell.innerHTML = '<span class="sbt-btn-icon">👩‍🏫</span><div class="sbt-btn-text"><strong>3. TELL / COLLABORATE</strong><span>Share ideas or ask teacher for advice</span></div>';
    } else {
      this.dom.btnSbtStop.innerHTML = '<span class="sbt-btn-icon">🛑</span><div class="sbt-btn-text"><strong>1. STOP</strong><span>Do NOT reply or give info</span></div>';
      this.dom.btnSbtBlock.innerHTML = '<span class="sbt-btn-icon">🚫</span><div class="sbt-btn-text"><strong>2. BLOCK</strong><span>Stop them from messaging</span></div>';
      this.dom.btnSbtTell.innerHTML = '<span class="sbt-btn-icon">👩‍🏫</span><div class="sbt-btn-text"><strong>3. TELL</strong><span>Report to teacher or parent</span></div>';
    }

    // Buttons enabling
    this.dom.btnSbtStop.classList.toggle('disabled', step !== 1);
    this.dom.btnSbtBlock.classList.toggle('disabled', step !== 2);
    this.dom.btnSbtTell.classList.toggle('disabled', step !== 3);

    // Text Instructions
    if (step === 1) {
      this.dom.l4InstructionText.innerHTML = isKnown
        ? '🤝 <strong>Step 1: LISTEN & READ!</strong> This is a known classmate. Click <strong>1. LISTEN & READ</strong> to understand their message.'
        : '🛑 <strong>Step 1: STOP!</strong> An unknown contact is messaging. Click <strong>1. STOP</strong> and do not reply!';
    } else if (step === 2) {
      this.dom.l4InstructionText.innerHTML = isKnown
        ? '✅ <strong>Step 2: DO NOT BLOCK!</strong> This is safe, friendly school communication. Click <strong>2. DO NOT BLOCK</strong>!'
        : '🚫 <strong>Step 2: BLOCK!</strong> Stop this sender from messaging you again. Click <strong>2. BLOCK</strong>!';
    } else if (step === 3) {
      this.dom.l4InstructionText.innerHTML = isKnown
        ? '👩‍🏫 <strong>Step 3: TELL / COLLABORATE!</strong> Cooperate or involve the teacher if needed. Click <strong>3. TELL / COLLABORATE</strong>!'
        : '👩‍🏫 <strong>Step 3: TELL!</strong> Report the conversation to Teacher Maya or parents. Click <strong>3. TELL</strong>!';
    }
  }

  handleSBTAction(action) {
    const data = this.isGauntlet ? this.gauntletQuestions[this.scenarioIndex]?.data : LEVEL_4_DATA[this.scenarioIndex];
    if (!data) return;

    if (action === 'STOP' && this.sbtCurrentStep === 1) {
      this.sound.playSbtStep(1);
      this.sbtCurrentStep = 2;
      this.dom.l4ChatStatus.classList.remove('hidden');
      this.dom.l4ChatStatus.textContent = data.isKnown ? `🎧 ${data.stopDesc}` : '🛑 Conversation Stopped! Refused to reply.';
      this.updateSbtStepperUI();
    } else if (action === 'BLOCK' && this.sbtCurrentStep === 2) {
      this.sound.playSbtStep(2);
      this.sbtCurrentStep = 3;
      this.dom.l4ChatStatus.textContent = data.isKnown ? `🤝 ${data.blockDesc}` : `🚫 ${data.sender} has been BLOCKED!`;
      this.updateSbtStepperUI();
    } else if (action === 'TELL' && this.sbtCurrentStep === 3) {
      this.sound.playSbtStep(3);
      this.stopTimer();
      this.totalQuestionsAnswered++;
      this.correctDecisionsCount++;
      const earned = (this.isGauntlet ? 70 : 60) + Math.floor(this.timerSeconds * 1.5);
      this.score += earned;
      this.updateStatsDisplay();
      this.sound.playCorrect();

      const modalTitle = data.isKnown ? 'Responsible Chat! 🌟' : 'Rule Complete! 🚦';
      const modalDesc = data.isKnown
        ? `Great job! You recognized a safe, friendly classmate. ${data.tellDesc}`
        : `Outstanding! You executed STOP 🛑 → BLOCK 🚫 → TELL 👩‍🏫 perfectly! ${data.tellDesc}`;

      this.showFeedbackModal(true, modalTitle, modalDesc, earned, () => {
        if (this.isGauntlet) {
          this.scenarioIndex++;
          this.loadGauntletQuestion(this.scenarioIndex);
        } else {
          this.loadLevel4Scenario(this.scenarioIndex + 1);
        }
      });
    } else {
      this.sound.playError();
    }
  }

  /* ==========================================================================
     LEVEL 5 / GAUNTLET BOSS MODE
     ========================================================================== */
  setupGauntletMode() {
    this.gauntletQuestions = [
      { type: 'l1', data: LEVEL_1_DATA[0] },
      { type: 'l2', data: LEVEL_2_DATA[1] },
      { type: 'l3', data: LEVEL_3_POPUPS_DATA[1] },
      { type: 'l4', data: LEVEL_4_DATA[0] },
      { type: 'l2', data: LEVEL_2_DATA[3] },
      { type: 'l1', data: LEVEL_1_DATA[3] }
    ];
    this.scenarioIndex = 0;
    this.loadGauntletQuestion(0);
  }

  loadGauntletQuestion(idx) {
    const q = this.gauntletQuestions[idx];
    if (!q) {
      this.completeLevel(5);
      return;
    }

    if (q.type === 'l1') {
      this.showScreen('screen-level-1');
      this.loadLevel1ScenarioForGauntlet(q.data);
    } else if (q.type === 'l2') {
      this.showScreen('screen-level-2');
      this.loadLevel2ScenarioForGauntlet(q.data);
    } else if (q.type === 'l3') {
      this.showScreen('screen-level-3');
      this.loadLevel3ScenarioForGauntlet(q.data);
    } else if (q.type === 'l4') {
      this.showScreen('screen-level-4');
      this.loadLevel4ScenarioForGauntlet(q.data);
    }
  }

  loadLevel1ScenarioForGauntlet(data) {
    this.startTimer(30);
    this.dom.l1Title.textContent = `👑 Challenge: ${data.title}`;
    this.dom.l1Prompt.textContent = data.prompt;
    this.dom.l1StudentItem.textContent = data.studentItem;
    this.dom.l1Choices.innerHTML = '';
    data.choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'btn-choice';
      btn.innerHTML = `<span class="choice-icon">${c.icon}</span><span>${c.text}</span>`;
      btn.onclick = () => {
        if (c.isCorrect) {
          this.stopTimer();
          this.score += 70;
          this.updateStatsDisplay();
          this.sound.playCorrect();
          this.showFeedbackModal(true, 'Hero Point! ⚡', c.feedback, 70, () => {
            this.scenarioIndex++;
            this.loadGauntletQuestion(this.scenarioIndex);
          });
        } else {
          this.handleWrongDecision(c.feedback, 0);
        }
      };
      this.dom.l1Choices.appendChild(btn);
    });
  }

  loadLevel2ScenarioForGauntlet(data) {
    this.startTimer(25);
    this.dom.l2SceneBadge.textContent = '👑 Gauntlet Speed Round';
    this.dom.l2SceneEmoji.textContent = data.emoji;
    this.dom.l2SceneTitle.textContent = data.title;
    this.dom.l2SceneDesc.textContent = data.desc;
  }

  loadLevel3ScenarioForGauntlet(popupData) {
    this.startTimer(25);
    this.dom.l3SearchView.classList.add('hidden');
    this.dom.l3PopupView.classList.remove('hidden');
    this.dom.l3PopupIcon.textContent = popupData.icon;
    this.dom.l3PopupTitle.textContent = popupData.title;
    this.dom.l3PopupMsg.textContent = popupData.msg;
    this.dom.l3PopupBtns.innerHTML = '';

    const btnSafe = document.createElement('button');
    btnSafe.className = 'btn-popup-action safe';
    btnSafe.textContent = popupData.btnSafeText;
    btnSafe.onclick = () => {
      this.stopTimer();
      this.score += 70;
      this.updateStatsDisplay();
      this.sound.playCorrect();
      this.showFeedbackModal(true, 'Defense Mastery! 🛡️', popupData.feedback, 70, () => {
        this.scenarioIndex++;
        this.loadGauntletQuestion(this.scenarioIndex);
      });
    };

    const btnDanger = document.createElement('button');
    btnDanger.className = 'btn-popup-action danger';
    btnDanger.textContent = popupData.btnDangerText;
    btnDanger.onclick = () => this.handleWrongDecision('That was a dangerous web trap popup!', 0);

    this.dom.l3PopupBtns.appendChild(btnSafe);
    this.dom.l3PopupBtns.appendChild(btnDanger);
  }

  loadLevel4ScenarioForGauntlet(data) {
    this.startTimer(35);
    this.sbtCurrentStep = 1;
    this.dom.l4SenderName.textContent = data.sender;
    this.dom.l4MsgText.textContent = data.msg;
    this.dom.l4ChatStatus.classList.add('hidden');
    this.updateSbtStepperUI();
  }

  /* ==========================================================================
     MISTAKE & FEEDBACK HANDLING
     ========================================================================== */
  handleWrongDecision(message, pointsDeduction = 0) {
    this.sound.playError();
    this.lives--;
    this.updateHeartsDisplay();

    if (this.lives <= 0) {
      this.stopTimer();
      this.showGameOverModal(message);
    } else {
      this.showFeedbackModal(false, 'Oops! Let\'s think again 🤔', message, pointsDeduction, () => {
        // Continue current stage
      });
    }
  }

  showFeedbackModal(isSuccess, title, desc, points, onNextCallback) {
    this.dom.feedbackOverlay.classList.remove('hidden');
    this.dom.feedbackBox.className = `feedback-modal-box ${isSuccess ? '' : 'error-box'}`;
    this.dom.fbIcon.textContent = isSuccess ? '🌟' : '🤔';
    this.dom.fbTitle.textContent = title;
    this.dom.fbDesc.textContent = desc;

    if (points > 0) {
      this.dom.fbPoints.textContent = `+${points} Points!`;
      this.dom.fbPoints.className = 'fb-points';
    } else {
      this.dom.fbPoints.textContent = 'Keep trying! You can do it!';
      this.dom.fbPoints.className = 'fb-points zero';
    }

    this.onFeedbackDismiss = onNextCallback;
  }

  dismissFeedback() {
    this.sound.playClick();
    this.dom.feedbackOverlay.classList.add('hidden');
    if (typeof this.onFeedbackDismiss === 'function') {
      const cb = this.onFeedbackDismiss;
      this.onFeedbackDismiss = null;
      cb();
    }
  }

  showGameOverModal(lastTip) {
    this.showScreen('screen-game-over');
    const tipBox = document.getElementById('go-tip-box');
    if (tipBox) {
      tipBox.innerHTML = `💡 <strong>Safety Review:</strong> ${lastTip || 'Take your time, keep all food/drinks outside, and use Stop-Block-Tell for online messages!'}`;
    }
  }

  /* ==========================================================================
     LEVEL COMPLETION & CERTIFICATE
     ========================================================================== */
  completeLevel(lvlNumber) {
    this.stopTimer();
    this.sound.playVictory();
    this.confetti.fire(100);

    // Calculate level stars based on remaining lives
    let stars = 3;
    if (this.lives === 2) stars = 2;
    else if (this.lives === 1) stars = 1;

    this.levelStars[lvlNumber] = Math.max(this.levelStars[lvlNumber] || 0, stars);
    this.levelScores[lvlNumber] = this.score;
    this.updateStatsDisplay();

    if (lvlNumber === 5 || (lvlNumber === 4 && !this.isGauntlet && this.allPriorLevelsCompleted())) {
      this.showFinalCertificate();
      return;
    }

    // Show Level Complete Screen
    this.showScreen('screen-level-complete');

    document.getElementById('complete-lvl-title').textContent = `🎉 LEVEL ${lvlNumber} COMPLETE!`;
    document.getElementById('complete-score-val').textContent = `+${this.score}`;

    const acc = this.totalQuestionsAnswered > 0 ? Math.round((this.correctDecisionsCount / this.totalQuestionsAnswered) * 100) : 100;
    document.getElementById('complete-acc-val').textContent = `${acc}%`;

    const rating = stars === 3 ? 'Master Hero ⭐⭐⭐' : stars === 2 ? 'Great Defender ⭐⭐' : 'Good Cadet ⭐';
    document.getElementById('complete-rating-val').textContent = rating;

    // Display stars
    const starEls = document.querySelectorAll('.vstar');
    starEls.forEach((s, idx) => {
      if (idx < stars) s.classList.add('awarded');
      else s.classList.remove('awarded');
    });

    const nextBtn = document.getElementById('btn-next-level');
    if (lvlNumber >= 4) {
      nextBtn.innerHTML = '<span>Proceed to Final Boss Challenge 👑</span>';
    } else {
      nextBtn.innerHTML = `<span>Continue to Level ${lvlNumber + 1} ➡</span>`;
    }
  }

  allPriorLevelsCompleted() {
    return this.levelStars[1] > 0 && this.levelStars[2] > 0 && this.levelStars[3] > 0 && this.levelStars[4] > 0;
  }

  proceedNextLevel() {
    this.sound.playClick();
    if (this.currentLevel < 4) {
      this.startLevel(this.currentLevel + 1);
    } else if (this.currentLevel === 4) {
      this.startLevel(5); // Gauntlet Boss
    } else {
      this.showFinalCertificate();
    }
  }

  showFinalCertificate() {
    this.showScreen('screen-game-result');
    this.sound.playVictory();
    this.confetti.fire(150);

    let totalStars = 0;
    for (let k in this.levelStars) totalStars += this.levelStars[k];

    const acc = this.totalQuestionsAnswered > 0 ? Math.round((this.correctDecisionsCount / this.totalQuestionsAnswered) * 100) : 100;

    document.getElementById('cert-total-score').textContent = this.score;
    document.getElementById('cert-total-stars').textContent = `${totalStars} / 15`;
    document.getElementById('cert-accuracy').textContent = `${acc}%`;

    let rankName = 'GRAND MASTER';
    if (totalStars < 10) rankName = 'SAFETY CAPTAIN';
    if (totalStars < 6) rankName = 'SAFETY HERO CADET';

    document.getElementById('cert-rank-name').textContent = rankName;
  }
}

// Global instance initialization upon window load
let game;
window.addEventListener('DOMContentLoaded', () => {
  game = new SafetyAdventureGame();
});
