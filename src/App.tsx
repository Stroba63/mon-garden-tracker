import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, RotateCcw, History, X, Server, Search, Cloud, LogOut, Clock, BarChart2, Calendar } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- CONFIGURATION CLOUD (Firebase) ---
let firebaseConfig;
if (typeof __firebase_config !== 'undefined') {
  firebaseConfig = JSON.parse(__firebase_config);
} else {
  // TES INFORMATIONS FIREBASE PERSONNELLES
  firebaseConfig = {
    apiKey: "AIzaSyB7PdcsonVW5COmTh2cbfiNaO02s6o0uO8",
    authDomain: "mon-tracker-garden.firebaseapp.com",
    projectId: "mon-tracker-garden",
    storageBucket: "mon-tracker-garden.firebasestorage.app",
    messagingSenderId: "1004588310849",
    appId: "1:1004588310849:web:c4eb8f586f47fae92f41c0",
    measurementId: "G-3V98Y16R96"
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'garden-tracker-pro';

// --- LISTE DES PETS (HUGES) ---
const RAW_PETS = [
  "albinopeacock", "amethystbeetle", "angoragoat", "ankylosaurus", "applegazelle", 
  "arcticfox", "armadillo", "ashraven", "axolotl", "baconpig", "badger", "bagelbunny", 
  "baldeagle", "barnowl", "bat", "bearbee", "beardeddragon", "bearonbike", "beaver", 
  "bee", "birb", "blackbird", "blackbunny", "blackcat", "bloodhedgehog", "bloodkiwi", 
  "bloodowl", "bluewhale", "bonedog", "brontosaurus", "brownmouse", "brownowl", 
  "bunny", "butterfly", "calico", "camel", "candysquirrel", "capebuffalo", "capybara", 
  "cardinal", "carnivalelephant", "cat", "celebrationbeetle", "celebrationpuppy", 
  "cerberus", "cheetah", "chickenzombie", "chimera", "chimpanzee", "chinchilla", 
  "chipmunk", "chocolatebunny", "christmasgorilla", "christmasspirit", "chubbychipmunk", 
  "ckitsune", "clam", "cockatrice", "cocoacat", "cookedowl", "crab", "crocodile", 
  "crow", "cuckoo", "dairycow", "darkspriggan", "deer", "diamonddragonfly", 
  "diamondpanther", "dilo", "discobee", "dog", "dragonfly", "drake", "easterbunny", 
  "eastereggchick", "echofrog", "eggnogchick", "elephant", "elk", "emeraldsnake", 
  "farmerchipmunk", "fennecfox", "festivefrostsquirrel", "festiveicegolem", 
  "festivemoose", "festivenutcracker", "festivepartridge", "festivereindeer", 
  "festivesantabear", "festiveturtledove", "festivewendigo", "festiveyeti", "firefly", 
  "firemite", "fireworksprite", "flamebee", "flamingo", "football", "fortunesquirrel", 
  "frenchfryferret", "frenchhen", "frog", "frostdragon", "frostsquirrel", "galahcockatoo", 
  "gecko", "geodeturtle", "germanshepherd", "ghostbear", "ghostlybat", "ghostlyblackcat", 
  "ghostlybonedog", "ghostlydarkspriggan", "ghostlyheadlesshorseman", "ghostlymummy", 
  "ghostlyscarab", "ghostlyspider", "ghostlytombmarmot", "giantant", "giantarmadillo", 
  "giantashraven", "giantbadger", "giantbarnowl", "giantfirefly", "giantfiremite", 
  "giantgrizzlybear", "giantmantisshrimp", "giantrobin", "giantscorpion", 
  "giantsilverdragonfly", "giantsnowmanbuilder", "giantsnowmansoldier", "giantswan", 
  "giftrat", "gildedchocchocolatebunny", "gildedchoceasterbunny", "gildedchoceastereggchick", 
  "gildedchocjerboa", "gildedchocmarshmallowlamb", "gildedchocnyala", "gildedchocperyton", 
  "gildedchocspringbee", "giraffe", "glasscat", "glassdog", "glimmeringsprite", "gnome", 
  "goat", "goblin", "goblingardener", "goblinminer", "goldengoose", "goldenlab", 
  "goldenpiggy", "goldfinch", "golem", "gorillachef", "greenbean", "greymouse", 
  "griffin", "grizzlybear", "gummybear", "hamster", "hazehound", "headlesshorseman", 
  "hedgehog", "hexserpent", "hippo", "honeybee", "hootsieroll", "hotdog", "hummingbird", 
  "hyacinthmacaw", "hydra", "hyena", "hyrax", "icegolem", "idolchipmunk", "iguana", 
  "iguanodon", "imp", "jackalope", "jerboa", "kappa", "kitsune", "kiwi", "koi", 
  "krampus", "ladybug", "lemonlion", "lich", "lion", "lioness", "lobster", 
  "luminoussprite", "lyrebird", "magpie", "mallard", "mantisshrimp", "marmot", 
  "marshmallowlamb", "meerkat", "messengerpigeon", "mimic", "mistletoad", "mizuchi", 
  "mochimouse", "mole", "monkey", "mooncat", "moose", "moth", "mummy", "newyearsbird", 
  "newyearschimp", "newyearsdragon", "nightowl", "nutcracker", "nyala", "orangetabby", 
  "orangutan", "orchidmantis", "ostrich", "otter", "owl", "oxpecker", "pachycephalo", 
  "packbee", "packmule", "pancakemole", "panda", "parasaurolophus", "partridge", 
  "peachwasp", "peacock", "penguin", "performerseal", "peryton", "petalbee", "phoenix", 
  "pig", "pinebeetle", "pinkbunny", "pinkpanda", "pixie", "polarbear", "prayingmantis", 
  "pterodactyl", "pumpkinrat", "queenbee", "raccoon", "raiju", "rainbowankylosaurus", 
  "rainbowarcticfox", "rainbowbeardeddragon", "rainbowbearonbike", "rainbowbirb", 
  "rainbowblackbird", "rainbowbrownowl", "rainbowcarnivalelephant", "rainbowcelebrationpuppy", 
  "rainbowcerberus", "rainbowchinchilla", "rainbowchristmasgorilla", "rainbowckitsune", 
  "rainbowclam", "rainbowcuckoo", "rainbowdilo", "rainbowelephant", "rainbowelk", 
  "rainbowfireworksprite", "rainbowfrenchhen", "rainbowfrostdragon", "rainbowgiraffe", 
  "rainbowgoldfinch", "rainbowgriffin", "rainbowhazehound", "rainbowhotdog", 
  "rainbowhydra", "rainbowiguanodon", "rainbowkrampus", "rainbowlobster", "rainbowmagpie", 
  "rainbowmizuchi", "rainbownewyearsbird", "rainbownewyearschimp", "rainbownewyearsdragon", 
  "rainbowoxpecker", "rainbowpachycephalo", "rainbowparasaurolophus", "rainbowperformerseal", 
  "rainbowphoenix", "rainbowpinkbunny", "rainbowrhino", "rainbowshowpony", "rainbowshroomie", 
  "rainbowsnowbunny", "rainbowspinosaurus", "rainbowstagbeetle", "rainbowstarwolf", 
  "rainbowunicyclemonkey", "rainbowzebra", "raptor", "reaper", "redfox", "redgiantant", 
  "rednosedreindeer", "redpanda", "redrosefox", "redsquirrel", "reindeer", "rhino", 
  "robin", "rooster", "rubysquid", "salmon", "sandsnake", "santabear", "sapphiremacaw", 
  "scarab", "scarletmacaw", "seal", "seaturtle", "seedling", "sheckling", "shibainu", 
  "showpony", "shroomie", "silverdragonfly", "silvermonkey", "silverpiggy", "sloth", 
  "smithingdog", "snail", "snowbunny", "snowmanbuilder", "snowmansoldier", "spacesquirrel", 
  "specter", "spider", "spinosaurus", "spotteddeer", "spriggan", "springbee", "squirrel", 
  "stagbeetle", "starfish", "starwolf", "stegosaurus", "stork", "sugarglider", "summerkiwi", 
  "sushibear", "swan", "tanchozuru", "tanuki", "tarantulahawk", "termite", "tiger", 
  "tombmarmot", "topazsnail", "toucan", "trapdoorspider", "treefrog", "trex", "triceratops", 
  "tsuchinoko", "turtle", "turtledove", "unicyclemonkey", "wasp", "waterbuffalo", "wendigo", 
  "whitetiger", "windwyvern", "wisp", "wolf", "woodpecker", "woody", "yeti", "zebra"
];

const PETS = RAW_PETS.map(id => ({
  id: id,
  name: 'Huge ' + id.charAt(0).toUpperCase() + id.slice(1),
  emoji: '✨', 
  image: `https://raw.githubusercontent.com/Stroba63/garden-tracker-assets/main/${id}.webp`
}));

// Obtenir la date d'aujourd'hui (Heure locale)
const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [totalEggs, setTotalEggs] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [lastActionTime, setLastActionTime] = useState(null);
  const [dailyStats, setDailyStats] = useState({});
  
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isHugeModalOpen, setIsHugeModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  
  const [hugeWeight, setHugeWeight] = useState("");
  const [imageError, setImageError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPet, setSelectedPet] = useState(PETS[0]);

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Gestion de la connexion
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (err) { 
          console.error("Erreur Auth:", err); 
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fonctions Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erreur de connexion:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTotalEggs(0);
      setCurrentStreak(0);
      setHistory([]);
      setLastActionTime(null);
      setDailyStats({});
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  // 3. Synchronisation Cloud
  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'eggCounter', 'mainData');
    
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTotalEggs(data.totalEggs || 0);
        setCurrentStreak(data.currentStreak || 0);
        setHistory(data.history ? JSON.parse(data.history) : []);
        setLastActionTime(data.lastActionTime || null);
        setDailyStats(data.dailyStats ? JSON.parse(data.dailyStats) : {});
      } else if (user.isAnonymous) {
        setTotalEggs(0);
        setCurrentStreak(0);
        setHistory([]);
        setLastActionTime(null);
        setDailyStats({});
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Erreur Sync Cloud:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 4. Sauvegarde
  const saveData = async (newTotal, newStreak, newHistory, newLastAction, newDailyStats) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'eggCounter', 'mainData');
      await setDoc(docRef, {
        totalEggs: newTotal,
        currentStreak: newStreak,
        history: JSON.stringify(newHistory),
        lastActionTime: newLastAction,
        dailyStats: JSON.stringify(newDailyStats)
      }, { merge: true });
    } finally {
      setIsSaving(false);
    }
  };

  const modifyEggs = (amount) => {
    const newTotal = Math.max(0, totalEggs + amount);
    const newStreak = Math.max(0, currentStreak + amount);
    const now = Date.now();
    
    const todayStr = getTodayString();
    const newDailyStats = { ...dailyStats };
    newDailyStats[todayStr] = Math.max(0, (newDailyStats[todayStr] || 0) + amount);
    
    setTotalEggs(newTotal);
    setCurrentStreak(newStreak);
    setLastActionTime(now);
    setDailyStats(newDailyStats);
    
    saveData(newTotal, newStreak, history, now, newDailyStats);
  };

  const handleRegisterHuge = () => {
    const now = Date.now();
    const newHuge = {
      id: now,
      eggsTaken: currentStreak,
      totalAtTime: totalEggs,
      weight: hugeWeight || "?",
      petId: selectedPet.id,
      date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now
    };
    const newHistory = [newHuge, ...history];
    setHistory(newHistory);
    setCurrentStreak(0);
    saveData(totalEggs, 0, newHistory, lastActionTime, dailyStats);
    
    setHugeWeight("");
    setSearchTerm("");
    setIsHugeModalOpen(false);
  };

  const handleResetAll = () => {
    setTotalEggs(0);
    setCurrentStreak(0);
    setHistory([]);
    setLastActionTime(null);
    setDailyStats({});
    saveData(0, 0, [], null, {});
    setIsResetModalOpen(false);
  };

  const filteredPets = useMemo(() => {
    if (!searchTerm) return PETS;
    return PETS.filter(pet => pet.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Jamais";
    const diff = Math.max(0, Math.floor((currentTime - timestamp) / 1000));
    if (diff < 60) return `il y a ${diff} sec`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `il y a ${mins} min ${diff % 60} s`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours} h ${mins % 60} min`;
    const days = Math.floor(hours / 24);
    return `il y a ${days} j ${hours % 24} h`;
  };

  // Calculs pour les statistiques
  const todayEggs = dailyStats[getTodayString()] || 0;
  const statsKeys = Object.keys(dailyStats);
  const totalTrackedDays = statsKeys.length;
  const totalEggsInStats = Object.values(dailyStats).reduce((a, b) => a + b, 0);
  const averagePerDay = totalTrackedDays > 0 ? Math.round(totalEggsInStats / totalTrackedDays) : 0;
  
  const sortedDailyStats = useMemo(() => {
    return Object.entries(dailyStats).sort((a, b) => b[0].localeCompare(a[0]));
  }, [dailyStats]);

  const formatDateString = (dateStr) => {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#060a0e] flex flex-col items-center justify-center text-emerald-500">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
      <p className="font-black text-xs uppercase tracking-[0.3em] animate-pulse">Connexion Serveur...</p>
    </div>
  );

  return (
    // L'astuce est ici : lg:fixed lg:inset-0 force le site à faire exactement 100% de l'écran sur PC
    // Sur mobile, on garde min-h-screen pour scroller normalement
    <div className="min-h-screen lg:fixed lg:inset-0 bg-[#060a0e] text-white font-sans flex flex-col lg:overflow-hidden pb-12 lg:pb-0">
      
      {/* --- TOP BAR GLOBALE --- */}
      <div className="flex-none w-full max-w-[1600px] mx-auto flex justify-between items-center p-4 lg:p-6 lg:px-10">
        {user && !user.isAnonymous ? (
          <button onClick={handleLogout} className="flex items-center gap-2 bg-emerald-900/40 hover:bg-emerald-800/60 transition-colors px-3 py-1.5 rounded-full border border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Cloud className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{user.displayName || "Connecté"}</span>
            <LogOut className="w-3 h-3 text-emerald-600 ml-1" />
          </button>
        ) : (
          <button onClick={handleGoogleLogin} className="flex items-center gap-2 bg-blue-900/40 hover:bg-blue-800/60 transition-colors px-3 py-1.5 rounded-full border border-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.2)] group">
            <Server className="w-3 h-3 text-blue-400 group-hover:animate-pulse" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Se connecter (Sync)</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          {isSaving ? (
             <span className="text-[9px] font-black text-emerald-400 animate-pulse uppercase tracking-widest">Sauvegarde...</span>
          ) : (
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Synchro Cloud OK</span>
          )}
        </div>
      </div>

      {/* --- WRAPPER PRINCIPAL DES 3 COLONNES --- */}
      {/* flex-1 permet de prendre la hauteur restante. min-h-0 empêche le débordement */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 xl:gap-10 px-4 lg:px-10 pb-4 lg:pb-8 min-h-0">
        
        {/* === COLONNE 1 : STATISTIQUES (Visible uniquement sur PC) === */}
        <div className="hidden lg:flex flex-col w-[320px] bg-[#111821] rounded-[3rem] p-8 border border-slate-800/50 shadow-2xl overflow-hidden shrink-0">
          
          <div className="flex-none flex justify-between items-start mb-8">
            <div className="flex items-center gap-2 text-emerald-500">
              <BarChart2 className="w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Statistiques</h2>
            </div>
          </div>
          
          <div className="flex-none bg-emerald-900/20 border border-emerald-500/30 rounded-[2rem] p-6 text-center shadow-inner mb-8">
            <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest mb-1">Moyenne quotidienne</p>
            <div className="flex items-end justify-center gap-1.5 mt-2">
              <span className="text-5xl font-black text-emerald-400 tabular-nums tracking-tighter leading-none">{averagePerDay}</span>
              <span className="text-xs font-bold text-emerald-600 mb-1">œufs/j</span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-3">Sur {totalTrackedDays} jour(s)</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">Historique par jour</h4>
            
            {/* L'ancien badge est placé ici, en tête de liste ! */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-sm mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mt-px">+{todayEggs} Aujourd'hui</span>
            </div>

            {sortedDailyStats.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4 font-bold">Aucune donnée.</p>
            ) : (
              <div className="space-y-2.5">
                {sortedDailyStats.map(([date, count]) => {
                  const isToday = date === getTodayString();
                  if (isToday) return null; // Ne pas afficher 2 fois aujourd'hui
                  return (
                    <div key={date} className="flex justify-between items-center p-4 rounded-2xl border bg-[#0a0f14] border-slate-800">
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        <span className="text-[11px] font-bold">{formatDateString(date)}</span>
                      </div>
                      <span className="text-base font-black tabular-nums text-white">+{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* === COLONNE 2 : L'APPLICATION (Le coeur du tracker) === */}
        {/* On gère l'overflow-y-auto en interne pour éviter de casser le design si l'écran est petit verticalement */}
        <div className="flex-1 w-full max-w-md lg:max-w-[500px] flex flex-col bg-[#111821] rounded-[3rem] border border-slate-800/50 shadow-2xl overflow-hidden relative">
          
          {/* Header */}
          <div className="flex-none w-full bg-gradient-to-b from-[#107c64] to-[#0a4d3e] p-8 flex flex-row items-center justify-center gap-6 relative border-b border-white/5 overflow-hidden">
            <div className="relative group flex-shrink-0 flex justify-center items-center w-20 h-20">
              {!imageError ? (
                <img 
                  src="https://github.com/Stroba63/garden-tracker-assets/blob/main/CommonEgg.webp?raw=true" 
                  alt="Grow a Garden Egg" 
                  className="w-20 h-20 object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)] animate-bounce-slow relative z-10"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-16 h-16 bg-emerald-800/80 rounded-[40%_60%_60%_40%/50%_50%_60%_50%] border-4 border-emerald-400/50 shadow-[0_0_30px_rgba(16,124,100,0.8)] animate-bounce-slow flex items-center justify-center relative z-10">
                   <span className="text-white/50 font-bold text-[10px] uppercase tracking-widest">Œuf</span>
                </div>
              )}
            </div>
            <div className="z-10 min-w-0">
              <h1 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-lg leading-tight truncate">
                GROW A GARDEN
              </h1>
              <p className="text-emerald-300 font-bold text-sm uppercase tracking-widest mt-1 opacity-80">Tracker Personnel</p>
            </div>

            {/* Bouton Stats Mobile */}
            <button 
              onClick={() => setIsStatsModalOpen(true)}
              className="lg:hidden absolute top-4 right-4 bg-black/20 hover:bg-black/30 p-2.5 rounded-xl text-white/70 transition-colors backdrop-blur-sm"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
          </div>

          {/* Zone Statistiques (Milieu) */}
          <div className="flex-none grid grid-cols-2 divide-x divide-slate-800/50 border-b border-slate-800/50">
            <div className="p-6 lg:p-8 text-center flex flex-col justify-center min-w-0">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 lg:mb-2">Œufs Ouverts</p>
              {/* Le truncate PX-2 résout le bug de l'affichage écrasé de ta capture */}
              <p className="text-4xl lg:text-5xl font-black text-white tabular-nums tracking-tighter leading-none truncate px-2">{totalEggs}</p>
            </div>
            <div className="p-6 lg:p-8 text-center flex flex-col justify-center bg-orange-500/[0.03] min-w-0">
              <p className="text-[10px] font-black text-orange-500/80 uppercase tracking-widest mb-1 lg:mb-2 italic">Pity Actuelle</p>
              <p className="text-4xl lg:text-5xl font-black text-orange-400 tabular-nums tracking-tighter leading-none truncate px-2">{currentStreak}</p>
            </div>
          </div>

          {/* Panneau de Contrôle - Défilable si besoin */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 flex flex-col justify-between space-y-8">
            
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <span className="text-[9px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Ouvrir des œufs</span>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 5, 13].map(val => (
                    <button 
                      key={`+${val}`}
                      onClick={() => modifyEggs(val)}
                      className="bg-[#107c64] hover:bg-[#14a384] active:scale-95 text-white py-5 lg:py-6 rounded-2xl font-black text-2xl lg:text-3xl transition-all shadow-[0_8px_0_rgb(10,77,62)] hover:shadow-[0_4px_0_rgb(10,77,62)] hover:translate-y-[4px] active:translate-y-[8px] active:shadow-none"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-px flex-1 bg-slate-800/50"></div>
                  <span className="text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Correction</span>
                  <div className="h-px flex-1 bg-slate-800/50"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 5, 13].map(val => (
                    <button 
                      key={`-${val}`}
                      onClick={() => modifyEggs(-val)}
                      disabled={totalEggs === 0}
                      className="bg-slate-800/50 hover:bg-slate-800 active:scale-95 text-slate-500 py-3 lg:py-4 rounded-2xl font-bold text-base lg:text-lg transition-all border border-slate-700 disabled:opacity-20 disabled:pointer-events-none"
                    >
                      -{val}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-center pt-2 flex items-center justify-center gap-2 text-slate-500">
                 <Clock className="w-3.5 h-3.5" />
                 <p className="text-[10px] font-bold uppercase tracking-widest">
                   Dernier ajout : <span className="text-emerald-400 font-black">{formatRelativeTime(lastActionTime)}</span>
                 </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/50">
              <div className="text-center mb-4">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                   Dernier Huge : <span className="text-orange-400 font-black">{history.length > 0 ? formatRelativeTime(history[0].timestamp) : "Aucun"}</span>
                 </p>
              </div>

              <button 
                onClick={() => setIsHugeModalOpen(true)}
                className="w-full bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-[#060a0e] py-6 lg:py-7 rounded-[2rem] font-black text-2xl lg:text-3xl shadow-xl transition-all flex flex-col items-center justify-center gap-2 transform active:scale-95 border-b-[6px] border-orange-800 hover:border-b-[3px] hover:translate-y-[3px] active:border-b-0 active:translate-y-[6px]"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 lg:w-10 lg:h-10" />
                  HUGE OBTENU !
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* === COLONNE 3 : HISTORIQUE === */}
        <div className="hidden lg:flex flex-col w-[380px] bg-[#111821] rounded-[3rem] p-8 border border-slate-800/50 shadow-2xl overflow-hidden shrink-0">
          
          <div className="flex-none flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <History className="w-5 h-5" /> Journal
            </h2>
            {history.length > 0 && (
              <button onClick={() => setIsResetModalOpen(true)} className="text-slate-600 hover:text-red-500 bg-slate-800/30 hover:bg-red-500/10 p-2.5 rounded-xl transition-colors border border-transparent hover:border-red-500/30" title="Réinitialiser les statistiques">
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-20 bg-[#0a0f14] rounded-3xl border border-dashed border-slate-800/50 text-slate-600 text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-5">
                <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center">
                   <EggIcon />
                </div>
                Aucune capture
              </div>
            ) : (
              history.map((h, i) => {
                const petInfo = PETS.find(p => p.id === h.petId) || { name: 'Huge Inconnu', emoji: '🏆', image: null };
                
                return (
                  <div key={h.id} className="bg-[#0a0f14] border border-slate-800/50 rounded-3xl p-5 flex items-center gap-4 shadow-lg hover:border-slate-700 transition-colors">
                    <div className="w-20 h-20 shrink-0 bg-[#060a0e] rounded-2xl flex items-center justify-center p-2 border border-slate-800 shadow-inner">
                      {petInfo.image ? (
                        <img src={petInfo.image} alt={petInfo.name} className="max-w-full max-h-full object-contain drop-shadow-md" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                      ) : null}
                      <span className="text-4xl drop-shadow-md" style={{ display: petInfo.image ? 'none' : 'block' }}>{petInfo.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-orange-500 font-black uppercase tracking-wider text-xs leading-none pt-1 truncate pr-2">{petInfo.name}</span>
                        <span className="text-[9px] text-slate-500 font-bold tabular-nums text-right shrink-0">{h.date}</span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-black flex flex-col justify-center shrink-0">
                          <span className="text-[8px] opacity-70 uppercase tracking-widest mb-0.5">Poids</span>
                          <span className="text-sm leading-none">{h.weight} <span className="text-[8px] opacity-80">KG</span></span>
                        </div>
                        <div className="text-right min-w-0">
                          <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Chance</p>
                          <p className="text-2xl font-black text-white tabular-nums leading-none tracking-tighter truncate">{h.eggsTaken}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div> {/* FIN DU WRAPPER */}

      {/* --- MODAL STATISTIQUES (Utilisée uniquement sur mobile) --- */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:hidden">
          <div className="bg-[#111821] border border-slate-800 rounded-[3rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="bg-emerald-600 p-6 flex justify-between items-center shrink-0">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-5 h-5" /> STATISTIQUES
              </h3>
              <button onClick={() => setIsStatsModalOpen(false)} className="bg-black/20 p-2 rounded-full text-white hover:bg-black/40 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mt-px">+{todayEggs} Aujourd'hui</span>
              </div>

              <div className="bg-[#0a0f14] border border-slate-800/80 rounded-3xl p-6 text-center shadow-inner">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Moyenne quotidienne</p>
                <div className="flex items-end justify-center gap-1.5">
                  <span className="text-5xl font-black text-emerald-400 tabular-nums tracking-tighter leading-none">{averagePerDay}</span>
                  <span className="text-sm font-bold text-slate-600 mb-1">œufs/j</span>
                </div>
                <p className="text-[9px] text-slate-600 font-bold uppercase mt-3">Sur {totalTrackedDays} jour(s)</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800/50 pb-2">Historique par jour</h4>
                
                {sortedDailyStats.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center py-4 font-bold">Aucune donnée.</p>
                ) : (
                  <div className="space-y-2">
                    {sortedDailyStats.map(([date, count]) => {
                      const isToday = date === getTodayString();
                      if (isToday) return null;
                      return (
                        <div key={date} className="flex justify-between items-center p-4 rounded-xl border bg-[#0a0f14] border-slate-800">
                          <div className="flex items-center gap-2.5 text-slate-400">
                            <Calendar className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-bold">{formatDateString(date)}</span>
                          </div>
                          <span className="text-base font-black tabular-nums text-white">+{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL HUGE OBTENU --- */}
      {isHugeModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#111821] border border-slate-800 rounded-[3.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
            <div className="bg-orange-500 p-6 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black text-[#060a0e] uppercase tracking-tighter italic">MAGNIFIQUE !</h3>
              <button onClick={() => { setIsHugeModalOpen(false); setSearchTerm(""); }} className="bg-black/10 p-2 rounded-full text-[#060a0e] hover:bg-black/20 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-8 space-y-6 text-center overflow-y-auto custom-scrollbar flex-1">
              <div className="bg-[#0a0f14] rounded-3xl p-5 border border-slate-800/50 shadow-inner">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Obtenu après</p>
                <p className="text-5xl font-black text-white tracking-tighter tabular-nums">{currentStreak} <span className="text-orange-500 text-lg">œufs</span></p>
              </div>

              <div className="text-left space-y-3">
                <div className="flex justify-between items-end px-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quel Huge ?</label>
                   <span className="text-[9px] text-slate-600 font-bold">{filteredPets.length} trouvé(s)</span>
                </div>
                
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Rechercher un familier..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#060a0e] border-2 border-slate-800 rounded-2xl py-3.5 pl-10 pr-4 text-white text-sm font-bold focus:border-orange-500 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-[25vh] overflow-y-auto custom-scrollbar pr-1 pb-1">
                  {filteredPets.length > 0 ? filteredPets.map(pet => (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPet(pet)}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${selectedPet.id === pet.id ? 'border-orange-500 bg-orange-500/10 shadow-lg' : 'border-slate-800 bg-[#0a0f14] hover:border-slate-700 hover:bg-[#111821]'}`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        {pet.image ? (
                          <img src={pet.image} alt={pet.name} className="max-w-full max-h-full object-contain drop-shadow-md" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                        ) : null}
                        <span className="text-3xl drop-shadow-md" style={{ display: pet.image ? 'none' : 'block' }}>{pet.emoji}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-center text-slate-400 leading-tight line-clamp-2 w-full px-1">{pet.name.replace('Huge ', '')}</span>
                    </button>
                  )) : (
                     <div className="col-span-3 text-center py-6 text-slate-600 text-xs font-bold uppercase tracking-widest">Aucun résultat</div>
                  )}
                </div>
              </div>

              <div className="text-left space-y-2 pt-4 border-t border-slate-800/50">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1 tracking-widest">Poids (KG)</label>
                <input 
                  type="number" step="0.01" placeholder="ex: 10.18"
                  value={hugeWeight} onChange={(e) => setHugeWeight(e.target.value)}
                  className="w-full bg-[#060a0e] border-2 border-slate-800 rounded-2xl p-4 text-white text-2xl font-black focus:border-orange-500 outline-none transition-all shadow-inner text-center"
                />
              </div>

              <button onClick={handleRegisterHuge} className="w-full bg-orange-500 text-[#060a0e] font-black py-5 rounded-[2rem] text-xl shadow-xl hover:bg-orange-400 active:scale-95 transition-all uppercase tracking-[0.2em] border-b-4 border-orange-800 shrink-0 mt-4">
                ENREGISTRER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-center">
          <div className="bg-[#111821] border border-slate-800 rounded-[3rem] p-10 w-full max-w-xs shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <RotateCcw className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tighter">TOUT SUPPRIMER ?</h3>
            <p className="text-slate-500 text-xs mb-8 font-medium leading-relaxed">Tes statistiques et ton historique cloud seront perdus à jamais.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setIsResetModalOpen(false)} className="bg-[#0a0f14] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors">ANNULER</button>
              <button onClick={handleResetAll} className="bg-red-600 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-900/30 hover:bg-red-500 text-white transition-colors">OUI, EFFACER</button>
            </div>
          </div>
        </div>
      )}

      {/* Force la page à ne pas défiler sur PC (overflow hidden) */}
      <style dangerouslySetInnerHTML={{__html: `
        :root { background-color: #060a0e !important; }
        body { margin: 0 !important; padding: 0 !important; background-color: #060a0e !important; overflow: hidden !important; }
        #root { max-width: none !important; padding: 0 !important; margin: 0 !important; width: 100%; }

        @media (max-width: 1023px) {
           body { overflow: auto !important; }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .animate-bounce-slow { animation: bounce-slow 5s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; margin: 0; 
        }
      `}} />
    </div>
  );
}

// Icône de secours minimaliste
function EggIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
      <path d="M12 22c4.97 0 9-4.03 9-9s-4.03-11-9-11-9 6.03-9 11 4.03 9 9 9z" />
    </svg>
  );
}
