// scripts/seed.js - Run with: node scripts/seed.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/decode-the-tech';

const round1Questions = [
  // MCQs (10 total)
  { type: 'mcq', question: 'A unique identifier assigned to every device on a network', options: ['MAC Address', 'IP Address', 'DNS', 'URL'], correctAnswer: 'IP Address', explanation: 'An IP address uniquely identifies a device on an internet or local network.' },
  { type: 'mcq', question: 'Step-by-step set of instructions to solve a problem', options: ['Bug', 'Algorithm', 'Firewall', 'Latency'], correctAnswer: 'Algorithm', explanation: 'An algorithm is a defined sequence of steps to accomplish a task.' },
  { type: 'mcq', question: 'The core program of an operating system that manages hardware resources', options: ['Shell', 'Kernel', 'Driver', 'API'], correctAnswer: 'Kernel', explanation: 'The kernel is the central component of an OS managing CPU, memory, and I/O.' },
  { type: 'mcq', question: 'The practice of making software usable by people with disabilities', options: ['Usability', 'Accessibility', 'Scalability', 'Portability'], correctAnswer: 'Accessibility', explanation: 'Accessibility ensures software works for people with visual, motor, or cognitive impairments.' },
  { type: 'mcq', question: 'Data that provides information about other data', options: ['Raw Data', 'Metadata', 'Big Data', 'Microdata'], correctAnswer: 'Metadata', explanation: 'Metadata describes the content, quality, and context of data.' },
  { type: 'mcq', question: 'Software permanently programmed into a hardware device', options: ['Malware', 'Firmware', 'Spyware', 'Adware'], correctAnswer: 'Firmware', explanation: 'Firmware provides low-level control for a device\'s specific hardware.' },
  { type: 'mcq', question: 'A set of rules for data communication across a network', options: ['Standard', 'Protocol', 'Policy', 'Guideline'], correctAnswer: 'Protocol', explanation: 'Protocols define how data is formatted and transmitted.' },
  { type: 'mcq', question: 'Translates high-level code into machine-readable instructions', options: ['Interpreter', 'Compiler', 'Debugger', 'Linker'], correctAnswer: 'Compiler', explanation: 'A compiler converts source code into an executable program.' },
  { type: 'mcq', question: 'The process of finding and fixing errors in code', options: ['Testing', 'Debugging', 'Profiling', 'Refactoring'], correctAnswer: 'Debugging', explanation: 'Debugging involves identifying, isolating, and resolving bugs.' },
  { type: 'mcq', question: 'An error or flaw in a program that causes incorrect behavior', options: ['Patch', 'Bug', 'Cache', 'Pixel'], correctAnswer: 'Bug', explanation: 'A bug is an unintended error in software code.' },

  // Match The Following (15 total)
  { type: 'match', question: 'Match the Web Concepts', matchPairs: [{ left: 'DNS', right: 'Name to IP' }, { left: 'HTTP', right: 'Web Transfer' }, { left: 'URL', right: 'Web Address' }], explanation: 'Core protocols of the World Wide Web.' },
  { type: 'match', question: 'Match the Storage types', matchPairs: [{ left: 'SSD', right: 'Fast Flash' }, { left: 'HDD', right: 'Magnetic Disk' }, { left: 'RAM', right: 'Volatile Memory' }], explanation: 'Different ways computers store data.' },
  { type: 'match', question: 'Match the Cloud types', matchPairs: [{ left: 'SaaS', right: 'Software Service' }, { left: 'PaaS', right: 'Platform Service' }, { left: 'IaaS', right: 'Infrastructure Service' }], explanation: 'The three main cloud service models.' },
  { type: 'match', question: 'Match the Programming paradigms', matchPairs: [{ left: 'OOP', right: 'Object Oriented' }, { left: 'Functional', right: 'Pure Functions' }, { left: 'Imperative', right: 'Step Commands' }], explanation: 'Different styles of writing code.' },
  { type: 'match', question: 'Match the Cybersecurity terms', matchPairs: [{ left: 'Phishing', right: 'Fraudulent emails' }, { left: 'Firewall', right: 'Traffic filter' }, { left: 'VPN', right: 'Secure tunnel' }], explanation: 'Common security tools and threats.' },
  { type: 'match', question: 'Match the Data units', matchPairs: [{ left: 'Bit', right: '0 or 1' }, { left: 'Byte', right: '8 bits' }, { left: 'Nibble', right: '4 bits' }], explanation: 'Fundamental building blocks of digital data.' },
  { type: 'match', question: 'Match the Hardware ports', matchPairs: [{ left: 'USB-C', right: 'Universal port' }, { left: 'HDMI', right: 'Video/Audio' }, { left: 'Ethernet', right: 'Wired Network' }], explanation: 'Common physical connections for devices.' },
  { type: 'match', question: 'Match the OS examples', matchPairs: [{ left: 'Linux', right: 'Open Source' }, { left: 'Windows', right: 'Microsoft' }, { left: 'macOS', right: 'Apple' }], explanation: 'The most popular operating systems.' },
  { type: 'match', question: 'Match the UI components', matchPairs: [{ left: 'Navbar', right: 'Navigation' }, { left: 'Footer', right: 'Bottom info' }, { left: 'Sidebar', right: 'Side menu' }], explanation: 'Standard parts of a website layout.' },
  { type: 'match', question: 'Match the Dev tools', matchPairs: [{ left: 'IDE', right: 'Code Editor' }, { left: 'CLI', right: 'Text Terminal' }, { left: 'SDK', right: 'Dev Kit' }], explanation: 'Tools used by software engineers.' },
  { type: 'match', question: 'Match the Network types', matchPairs: [{ left: 'LAN', right: 'Local area' }, { left: 'WAN', right: 'Wide area' }, { left: 'PAN', right: 'Personal area' }], explanation: 'Classifications of computer networks.' },
  { type: 'match', question: 'Match the Browser names', matchPairs: [{ left: 'Chrome', right: 'Google' }, { left: 'Firefox', right: 'Mozilla' }, { left: 'Safari', right: 'Apple' }], explanation: 'Common software for web surfing.' },
  { type: 'match', question: 'Match the Databases', matchPairs: [{ left: 'SQL', right: 'Relational' }, { left: 'NoSQL', right: 'Non-relational' }, { left: 'Redis', right: 'In-memory' }], explanation: 'Systems for storing and managing data.' },
  { type: 'match', question: 'Match the File formats', matchPairs: [{ left: 'JSON', right: 'Data Object' }, { left: 'HTML', right: 'Markup' }, { left: 'CSS', right: 'Styling' }], explanation: 'Standard languages for web development.' },
  { type: 'match', question: 'Match the Mobile OS', matchPairs: [{ left: 'Android', right: 'Google Mobile' }, { left: 'iOS', right: 'Apple Mobile' }, { left: 'Harmony', right: 'Huawei' }], explanation: 'Operating systems for smartphones.' }
];

const round2Questions = [
  // Q = Emoji clue description, emojiClue = actual emojis, Options = app names
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '📱☁️🎧', options: ['Spotify', 'Apple Music', 'SoundCloud', 'Pandora'], correctAnswer: 'Spotify', explanation: 'Phone + Cloud + Music = Spotify, the music streaming app.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '📸❤️💬', options: ['Snapchat', 'Instagram', 'Pinterest', 'VSCO'], correctAnswer: 'Instagram', explanation: 'Photo + Heart + Comment = Instagram.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '👻💛👻', options: ['Halloween App', 'Snapchat', 'BeReal', 'TikTok'], correctAnswer: 'Snapchat', explanation: 'Ghost + Yellow = Snapchat\'s ghost mascot.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🎬▶️📺', options: ['Hulu', 'Netflix', 'YouTube', 'Disney+'], correctAnswer: 'YouTube', explanation: 'Film + Play Button + TV = YouTube.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🛒📦🚀', options: ['eBay', 'Amazon', 'Flipkart', 'Shopify'], correctAnswer: 'Amazon', explanation: 'Cart + Package + Fast delivery = Amazon Prime.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🔵💬👥', options: ['WhatsApp', 'Telegram', 'Facebook', 'Discord'], correctAnswer: 'Facebook', explanation: 'Blue + Messages + People = Facebook social network.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🐦💙✉️', options: ['Twitter/X', 'Discord', 'Telegram', 'BlueSky'], correctAnswer: 'Twitter/X', explanation: 'Bird + Blue + Message = Twitter (now X).' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '📂☁️🔗', options: ['OneDrive', 'Google Drive', 'Dropbox', 'Box'], correctAnswer: 'Google Drive', explanation: 'Folder + Cloud + Link = Google Drive.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🗺️📍🧭', options: ['Waze', 'Apple Maps', 'Google Maps', 'HERE Maps'], correctAnswer: 'Google Maps', explanation: 'Map + Pin + Navigation = Google Maps.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🎮🕹️👾', options: ['Steam', 'PlayStation', 'Discord', 'Twitch'], correctAnswer: 'Steam', explanation: 'Games + Joystick + Alien = Steam gaming platform.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🏠🛏️✈️', options: ['Booking.com', 'TripAdvisor', 'Airbnb', 'Hotels.com'], correctAnswer: 'Airbnb', explanation: 'Home + Bed + Plane = Airbnb.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🤝💼👔', options: ['Indeed', 'Glassdoor', 'LinkedIn', 'Monster'], correctAnswer: 'LinkedIn', explanation: 'Handshake + Business + Suit = LinkedIn.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🍕🛵⏰', options: ['DoorDash', 'Uber Eats', 'Zomato', 'Swiggy'], correctAnswer: 'Zomato', explanation: 'Food + Delivery Bike + Fast = Zomato.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '💻🐙🌿', options: ['GitLab', 'Bitbucket', 'GitHub', 'Gitea'], correctAnswer: 'GitHub', explanation: 'Laptop + Octocat + Branch = GitHub.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🟣🎙️📡', options: ['Clubhouse', 'Spotify Podcasts', 'Discord', 'Anchor'], correctAnswer: 'Clubhouse', explanation: 'Purple + Microphone + Live = Clubhouse audio app.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '💳🔒🏦', options: ['PayPal', 'Paytm', 'Razorpay', 'PhonePe'], correctAnswer: 'Paytm', explanation: 'Card + Secure + Bank = Paytm.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🎓📚🎯', options: ['Khan Academy', 'Coursera', 'Duolingo', 'Udemy'], correctAnswer: 'Khan Academy', explanation: 'Graduation + Books + Target = Khan Academy.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🦜🟢💬', options: ['WeChat', 'WhatsApp', 'Telegram', 'Signal'], correctAnswer: 'WhatsApp', explanation: 'Green + Chat = WhatsApp messaging.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '🎵🎤🏆', options: ['TikTok', 'Triller', 'Likee', 'Reels'], correctAnswer: 'TikTok', explanation: 'Music + Mic + Viral fame = TikTok.' },
  { question: 'Identify the app or platform from this emoji clue', emojiClue: '📧📬🔵', options: ['Yahoo Mail', 'Outlook', 'Gmail', 'ProtonMail'], correctAnswer: 'Gmail', explanation: 'Email + Mailbox + Google Blue = Gmail.' },
];

const round3Questions = [
  // actualFact = whether the fact is Real or Fake
  // correctAnswer = what they must CHOOSE (opposite of actualFact) to win
  // So if fact is Real, correctAnswer = 'Fake' (they must pick the wrong one)
  { question: 'Google tested smart contact lenses that could monitor blood sugar levels', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! Google X (now Verily) developed glucose-monitoring contact lenses.' },
  { question: 'Instagram shows you exactly who viewed your profile', options: ['Real', 'Fake'], actualFact: 'Fake', correctAnswer: 'Real', explanation: 'FALSE! Instagram does not show profile visitors (unlike LinkedIn).' },
  { question: 'The first computer bug was an actual real insect found inside a computer', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! In 1947, a moth was found in a Harvard computer relay causing errors.' },
  { question: 'Wi-Fi stands for Wireless Fidelity', options: ['Real', 'Fake'], actualFact: 'Fake', correctAnswer: 'Real', explanation: 'FALSE! Wi-Fi was a marketing term; it doesn\'t officially stand for anything.' },
  { question: 'AI systems like ChatGPT can write functional code for real applications', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! Modern LLMs can write, debug, and explain working code.' },
  { question: 'YouTube was originally designed as a video dating site', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! YouTube\'s first concept was "Tune In Hook Up" — a video dating platform.' },
  { question: 'Deleting a file permanently removes it from a hard drive', options: ['Real', 'Fake'], actualFact: 'Fake', correctAnswer: 'Real', explanation: 'FALSE! Deleted files remain recoverable until overwritten by new data.' },
  { question: 'Amazon started as an online bookstore', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! Jeff Bezos launched Amazon in 1994 selling only books.' },
  { question: 'The first iPhone had 3G connectivity', options: ['Real', 'Fake'], actualFact: 'Fake', correctAnswer: 'Real', explanation: 'FALSE! The original 2007 iPhone only supported EDGE (2G) data.' },
  { question: 'Bluetooth technology is named after a Viking king', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! It\'s named after Harald Bluetooth, a 10th-century Danish king.' },
  { question: 'More people own smartphones than toothbrushes worldwide', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! Global smartphone ownership exceeds toothbrush ownership globally.' },
  { question: 'A byte consists of 16 bits', options: ['Real', 'Fake'], actualFact: 'Fake', correctAnswer: 'Real', explanation: 'FALSE! A byte is 8 bits, not 16. 16 bits = 2 bytes.' },
  { question: 'NASA\'s Apollo 11 guidance computer had less processing power than a modern calculator', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! The AGC had 4KB RAM and 32KB storage — far less than modern devices.' },
  { question: 'Incognito mode hides your browsing from your Internet Service Provider', options: ['Real', 'Fake'], actualFact: 'Fake', correctAnswer: 'Real', explanation: 'FALSE! Incognito only hides history locally; ISPs can still see your activity.' },
  { question: 'The @ symbol was chosen for email addresses because it was barely used and available', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! Ray Tomlinson chose @ in 1971 because it was rarely used in text.' },
  { question: 'Python programming language is named after the Monty Python comedy group', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! Guido van Rossum named Python after Monty Python\'s Flying Circus.' },
  { question: 'All websites must use HTTPS to function on modern browsers', options: ['Real', 'Fake'], actualFact: 'Fake', correctAnswer: 'Real', explanation: 'FALSE! HTTP sites still work, though browsers display security warnings.' },
  { question: 'Facebook\'s "Like" button was almost called the "Awesome" button', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! Early prototypes used "Awesome" before settling on "Like".' },
  { question: 'Turning a device off and on again can fix most minor software glitches', options: ['Real', 'Fake'], actualFact: 'Real', correctAnswer: 'Fake', explanation: 'TRUE! Rebooting clears RAM, resets processes, and resolves many common issues.' },
  { question: 'The internet and the World Wide Web are the same thing', options: ['Real', 'Fake'], actualFact: 'Fake', correctAnswer: 'Real', explanation: 'FALSE! The internet is the physical network; the Web is a service that runs on it.' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await mongoose.connection.collection('questions').deleteMany({});
  await mongoose.connection.collection('gamesessions').deleteMany({});
  console.log('Cleared old data');

  // Insert questions
  const allQuestions = [
    ...round1Questions.map((q, i) => ({ ...q, round: 1, questionNumber: i + 1, basePoints: 1, isActive: true })),
    ...round2Questions.map((q, i) => ({ ...q, round: 2, questionNumber: i + 1, basePoints: 1, isActive: true })),
    ...round3Questions.map((q, i) => ({ ...q, round: 3, questionNumber: i + 1, basePoints: 1, emojiClue: q.emojiClue || '', isActive: true })),
  ];

  await mongoose.connection.collection('questions').insertMany(allQuestions);
  console.log(`Inserted ${allQuestions.length} questions`);

  // Create game session
  await mongoose.connection.collection('gamesessions').insertOne({
    sessionId: 'main',
    status: 'waiting',
    currentRound: 0,
    roundDurations: { round1: 600, round2: 600, round3: 600 },
    fastestAnswers: { round1: [], round2: [], round3: [] },
    settings: { fastestFingerBonus: 0, timeBonusEnabled: false, shuffleQuestions: true },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('Created game session');

  await mongoose.disconnect();
  console.log('Done! Database seeded successfully.');
}

seed().catch(console.error);
