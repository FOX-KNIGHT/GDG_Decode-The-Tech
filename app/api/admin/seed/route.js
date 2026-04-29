export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import Team from '@/lib/models/Team';
import Question from '@/lib/models/Question';
import GameSession from '@/lib/models/GameSession';

// Reusing seed data logic
const round1Questions = [
  { question: 'What is the answer to life, the universe, and everything?', options: ['42', '24', 'Infinity', 'Zero'], correctAnswer: '42', explanation: 'Hitchhiker\'s Guide to the Galaxy.' },
  { question: 'Online storage and computing accessed via the internet', options: ['Cloud', 'Algorithm', 'Cache', 'Kernel'], correctAnswer: 'Cloud', explanation: 'Cloud computing means storing and accessing data/programs over the internet.' },
  { question: 'Step-by-step set of instructions to solve a problem', options: ['Bug', 'Algorithm', 'Firewall', 'Latency'], correctAnswer: 'Algorithm', explanation: 'An algorithm is a defined sequence of steps to accomplish a task.' },
  { question: 'An error or flaw in a program that causes incorrect behavior', options: ['Patch', 'Bug', 'Cache', 'Pixel'], correctAnswer: 'Bug', explanation: 'A bug is an unintended error in software code.' },
  { question: 'Temporary fast-access storage for frequently used data', options: ['Cache', 'RAM', 'ROM', 'SSD'], correctAnswer: 'Cache', explanation: 'Cache stores frequently accessed data for quicker retrieval.' },
  { question: 'A network security system that monitors and controls traffic', options: ['Router', 'Firewall', 'Switch', 'Modem'], correctAnswer: 'Firewall', explanation: 'A firewall blocks unauthorized access while permitting outward communication.' },
  { question: 'Delay in data transfer across a network', options: ['Bandwidth', 'Latency', 'Throughput', 'Jitter'], correctAnswer: 'Latency', explanation: 'Latency is the time it takes for data to travel from source to destination.' },
  { question: 'The process of converting data into a coded form to prevent unauthorized access', options: ['Hashing', 'Encryption', 'Compression', 'Tokenization'], correctAnswer: 'Encryption', explanation: 'Encryption scrambles data so only authorized users can read it.' },
  { question: 'A software update that fixes specific problems or vulnerabilities', options: ['Update', 'Patch', 'Build', 'Release'], correctAnswer: 'Patch', explanation: 'A patch is a small piece of code released to fix bugs or security vulnerabilities.' },
  { question: 'The core program of an operating system that manages hardware resources', options: ['Shell', 'Kernel', 'Driver', 'API'], correctAnswer: 'Kernel', explanation: 'The kernel is the central component of an OS managing CPU, memory, and I/O.' },
  { question: 'A set of rules allowing different software applications to communicate', options: ['SDK', 'API', 'IDE', 'CLI'], correctAnswer: 'API', explanation: 'API (Application Programming Interface) lets apps talk to each other.' },
  { question: 'Software designed to harm, disrupt, or gain unauthorized access to a system', options: ['Spyware', 'Malware', 'Adware', 'Ransomware'], correctAnswer: 'Malware', explanation: 'Malware is malicious software including viruses, trojans, and spyware.' },
  { question: 'The amount of data transferred over a network in a given time', options: ['Latency', 'Bandwidth', 'Frequency', 'Speed'], correctAnswer: 'Bandwidth', explanation: 'Bandwidth measures the data transfer capacity of a network connection.' },
  { question: 'A unique identifier assigned to every device on a network', options: ['MAC Address', 'IP Address', 'DNS', 'URL'], correctAnswer: 'IP Address', explanation: 'An IP address uniquely identifies a device on an internet or local network.' },
  { question: 'The practice of making software usable by people with disabilities', options: ['Usability', 'Accessibility', 'Scalability', 'Portability'], correctAnswer: 'Accessibility', explanation: 'Accessibility ensures software works for people with visual, motor, or cognitive impairments.' },
  { question: 'A simulated computer environment running on a physical machine', options: ['Container', 'Virtual Machine', 'Sandbox', 'Hypervisor'], correctAnswer: 'Virtual Machine', explanation: 'A VM emulates a full computer system within another computer.' },
  { question: 'A system that converts domain names to IP addresses', options: ['DHCP', 'DNS', 'NAT', 'SSL'], correctAnswer: 'DNS', explanation: 'DNS (Domain Name System) is the internet\'s phone book, mapping names to IPs.' },
  { question: 'Open-source distributed version control system for tracking code changes', options: ['SVN', 'Git', 'Mercurial', 'CVS'], correctAnswer: 'Git', explanation: 'Git tracks changes in source code during software development.' },
  { question: 'A lightweight alternative to virtual machines that shares the OS kernel', options: ['Virtual Machine', 'Container', 'Sandbox', 'Cluster'], correctAnswer: 'Container', explanation: 'Containers (like Docker) package apps with dependencies without a full OS.' },
  { question: 'A cyberattack where an attacker secretly relays and alters communication between two parties', options: ['Phishing', 'Man-in-the-Middle', 'DDoS', 'SQL Injection'], correctAnswer: 'Man-in-the-Middle', explanation: 'MITM attacks intercept communication between two systems.' },
  { question: 'The smallest unit of data in computing, either 0 or 1', options: ['Byte', 'Bit', 'Nibble', 'Word'], correctAnswer: 'Bit', explanation: 'A bit is the fundamental unit of information in computing.' },
];

const round2Questions = [
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

export async function POST() {
  try {
    await dbConnect();
    
    // Clear existing
    await mongoose.connection.collection('questions').deleteMany({});
    await mongoose.connection.collection('gamesessions').deleteMany({});
    await mongoose.connection.collection('teams').deleteMany({});

    // Insert questions
    const allQuestions = [
      ...round1Questions.map((q, i) => ({ ...q, round: 1, questionNumber: i + 1, basePoints: 10 })),
      ...round2Questions.map((q, i) => ({ ...q, round: 2, questionNumber: i + 1, basePoints: 15 })),
      ...round3Questions.map((q, i) => ({ ...q, round: 3, questionNumber: i + 1, basePoints: 10, emojiClue: q.emojiClue || '' })),
    ];

    await mongoose.connection.collection('questions').insertMany(allQuestions);

    // Create game session
    await mongoose.connection.collection('gamesessions').insertOne({
      sessionId: 'main',
      status: 'waiting',
      currentRound: 0,
      roundDurations: { round1: 900, round2: 1200, round3: 900 },
      fastestAnswers: { round1: [], round2: [], round3: [] },
      settings: { fastestFingerBonus: 5, timeBonusEnabled: true, shuffleQuestions: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
