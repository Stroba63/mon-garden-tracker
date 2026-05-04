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
    <div className="min-h-screen bg-[#030608] flex flex-col items-center justify-center text-emerald-500">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
      <p className="font-black text-xs uppercase tracking-[0.3em] animate-pulse">Connexion Serveur...</p>
    </div>
  );

  return (
    <div className="min-h-screen lg:h-screen bg-[#030608] text-white font-sans flex flex-col lg:overflow-hidden selection:bg-emerald-500/30">
      
      {/* --- TOP BAR GLOBALE --- */}
      <div className="flex-none w-full flex justify-between items-center p-4 lg:px-8 lg:py-6">
        {user && !user.isAnonymous ? (
          <button onClick={handleLogout} className="flex items-center gap-2 bg-[#0a1015] hover:bg-[#111820] transition-colors px-4 py-2 rounded-xl border border-white/5 shadow-sm">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{user.displayName || "Connecté"}</span>
            <LogOut className="w-4 h-4 text-emerald-600 ml-2" />
          </button>
        ) : (
          <button onClick={handleGoogleLogin} className="flex items-center gap-2 bg-[#0a1015] hover:bg-[#111820] transition-colors px-4 py-2 rounded-xl border border-white/5 shadow-sm group">
            <Server className="w-4 h-4 text-blue-400 group-hover:animate-pulse" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Se connecter (Sync)</span>
          </button>
        )}

        <div className="flex items-center gap-2 bg-[#0a1015] px-4 py-2 rounded-xl border border-white/5">
          {isSaving ? (
             <span className="text-[10px] font-black text-emerald-400 animate-pulse uppercase tracking-widest">Sauvegarde...</span>
          ) : (
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synchro Cloud OK</span>
          )}
        </div>
      </div>

      {/* --- WRAPPER PRINCIPAL --- */}
      <div className="flex-1 w-full flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 pb-4 lg:px-8 lg:pb-8 min-h-0">
        
        {/* === COLONNE GAUCHE (MODIFIÉE) === */}
        <div className="hidden lg:flex flex-col w-[260px] xl:w-[300px] bg-[#0A1014] rounded-[2rem] border border-emerald-900/20 shadow-2xl flex-none overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none"></div>
          
          <div className="flex-none p-6 pb-2 relative z-10">
            <div className="flex items-center gap-3 text-emerald-500 mb-6">
              <BarChart2 className="w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Statistiques</h2>
            </div>
            
            <div className="bg-[#05080A] border border-white/5 rounded-2xl p-5 text-center shadow-inner">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Moyenne quotidienne</p>
              <div className="flex items-end justify-center gap-1.5 mt-2">
                <span className="text-4xl xl:text-5xl font-black text-emerald-400 tabular-nums tracking-tighter leading-none truncate">{averagePerDay}</span>
                <span className="text-xs font-bold text-slate-600 mb-1">œufs/j</span>
              </div>
              <p className="text-[9px] text-slate-600 font-bold uppercase mt-3">Sur {totalTrackedDays} jour(s) actif(s)</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4 relative z-10">
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Historique</h4>
            {sortedDailyStats.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4 font-bold">Aucune donnée.</p>
            ) : (
              <div className="space-y-2.5">
                {sortedDailyStats.map(([date, count]) => {
                  const isToday = date === getTodayString();
                  return (
                    <div key={date} className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${isToday ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#05080A] border-white/5 hover:border-white/10'}`}>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className={`w-3.5 h-3.5 ${isToday ? 'text-emerald-500' : 'text-slate-600'}`} />
                        <span className="text-[11px] font-bold truncate">{isToday ? "Aujourd'hui" : formatDateString(date)}</span>
                      </div>
                      <span className={`text-sm font-black tabular-nums ${isToday ? 'text-emerald-400' : 'text-slate-300'}`}>+{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* === COLONNE CENTRALE (MODIFIÉE) === */}
        <div className="flex-1 min-w-[320px] bg-[#0A1014] rounded-[2.5rem] border border-emerald-900/20 shadow-2xl flex flex-col overflow-hidden relative">
          
          <div className="flex-none w-full bg-gradient-to-br from-[#063324] via-[#091a15] to-[#0A1014] p-6 lg:p-8 flex flex-col sm:flex-row items-center sm:justify-start gap-4 border-b border-white/5 relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="relative flex-shrink-0 flex justify-center items-center w-20 h-20 lg:w-24 lg:h-24">
              {!imageError ? (
                <img 
                  src="https://github.com/Stroba63/garden-tracker-assets/blob/main/CommonEgg.webp?raw=true" 
                  alt="Grow a Garden Egg" 
                  className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] animate-bounce-slow relative z-10"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-16 h-16 bg-emerald-800/80 rounded-[40%_60%_60%_40%/50%_50%_60%_50%] border-4 border-emerald-400/50 shadow-[0_0_30px_rgba(16,124,100,0.8)] animate-bounce-slow flex items-center justify-center relative z-10">
                   <span className="text-white/50 font-bold text-[10px] uppercase tracking-widest">Œuf</span>
                </div>
              )}
            </div>
            
            <div className="z-10 flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black text-white uppercase tracking-wide truncate">Grow a Garden</h1>
              <p className="text-emerald-400 font-bold text-[10px] lg:text-xs uppercase tracking-widest mt-1">Tracker Personnel</p>
            </div>

            <button 
              onClick={() => setIsStatsModalOpen(true)}
              className="lg:hidden absolute top-4 right-4 bg-white/5 hover:bg-white/10 p-2.5 rounded-xl text-slate-400 transition-colors border border-white/5 backdrop-blur-sm"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
          </div>

          {/* Zone Statistiques - Retrait du break-all et tailles ajustées */}
          <div className="flex-none grid grid-cols-2 divide-x divide-white/5 border-b border-white/5 bg-[#05080A]/50">
            <div className="p-6 lg:p-8 text-center flex flex-col justify-center min-w-0">
              <p className="text-[10px] xl:text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Œufs Ouverts</p>
              <p className="text-5xl lg:text-6xl font-black text-white tabular-nums tracking-tighter leading-none truncate">{totalEggs}</p>
            </div>
            <div className="p-6 lg:p-8 text-center flex flex-col justify-center bg-orange-500/[0.02] min-w-0">
              <p className="text-[10px] xl:text-xs font-black text-orange-500/80 uppercase tracking-widest mb-2 italic">Pity Actuelle</p>
              <p className="text-5xl lg:text-6xl font-black text-orange-400 tabular-nums tracking-tighter leading-none truncate">{currentStreak}</p>
            </div>
          </div>

          {/* Panneau de Contrôle */}
          <div className="flex-1 overflow-y-auto flex flex-col justify-center p-6 lg:p-8 relative">
            <div className="max-w-xl mx-auto w-full space-y-8 lg:space-y-10">
              
              <div className="space-y-4 lg:space-y-5">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-white/5"></div>
                  <span className="text-[10px] lg:text-xs font-black text-emerald-500 uppercase tracking-[0.3em] whitespace-nowrap">Ajouter</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <div className="grid grid-cols-3 gap-3 lg:gap-5">
                  {[1, 5, 13].map(val => (
                    <button 
                      key={`+${val}`}
                      onClick={() => modifyEggs(val)}
                      className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white py-5 lg:py-6 rounded-2xl font-black text-2xl lg:text-3xl transition-all shadow-[0_6px_0_rgb(4,120,87)] hover:shadow-[0_3px_0_rgb(4,120,87)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-white/5"></div>
                  <span className="text-[10px] lg:text-xs font-black text-slate-600 uppercase tracking-[0.3em] whitespace-nowrap">Correction</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                <div className="grid grid-cols-3 gap-3 lg:gap-5">
                  {[1, 5, 13].map(val => (
                    <button 
                      key={`-${val}`}
                      onClick={() => modifyEggs(-val)}
                      disabled={totalEggs === 0}
                      className="bg-[#05080A] hover:bg-white/5 active:scale-95 text-slate-500 py-3 lg:py-4 rounded-xl font-bold text-lg lg:text-xl transition-all border border-white/5 disabled:opacity-20 disabled:pointer-events-none"
                    >
                      -{val}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-center pt-2 flex items-center justify-center gap-2 text-slate-500">
                 <Clock className="w-4 h-4" />
                 <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest">
                   Dernier ajout : <span className="text-emerald-400 font-black">{formatRelativeTime(lastActionTime)}</span>
                 </p>
              </div>

              <div className="pt-6 lg:pt-8 border-t border-white/5">
                <div className="text-center mb-4">
                   <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest">
                     Dernier Huge : <span className="text-orange-400 font-black">{history.length > 0 ? formatRelativeTime(history[0].timestamp) : "Aucun"}</span>
                   </p>
                </div>

                <button 
                  onClick={() => setIsHugeModalOpen(true)}
                  className="w-full bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-[#030608] py-6 lg:py-8 rounded-[2rem] font-black text-2xl lg:text-3xl shadow-xl transition-all flex flex-col items-center justify-center gap-2 transform active:scale-95 border-b-[6px] border-orange-800 hover:border-b-[3px] hover:translate-y-[3px] active:border-b-0 active:translate-y-[6px]"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 lg:w-10 lg:h-10" />
                    HUGE OBTENU !
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* === COLONNE DROITE (MODIFIÉE) === */}
        <div className="w-full lg:w-[280px] xl:w-[320px] flex-none flex flex-col bg-[#0A1014] rounded-[2rem] border border-emerald-900/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-orange-900/5 to-transparent pointer-events-none"></div>
          
          <div className="flex-none flex justify-between items-center p-6 pb-2 relative z-10">
            <div className="flex items-center gap-3 text-slate-400">
              <History className="w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Journal</h2>
            </div>
            {history.length > 0 && (
              <button onClick={() => setIsResetModalOpen(true)} className="text-slate-600 hover:text-red-500 bg-white/5 hover:bg-red-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/30" title="Réinitialiser les statistiques">
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4 relative z-10 lg:h-0">
            {history.length === 0 ? (
              <div className="text-center py-20 bg-[#05080A] rounded-3xl border border-dashed border-white/5 text-slate-600 text-xs font-black uppercase tracking-widest flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-full border-2 border-white/5 flex items-center justify-center">
                   <EggIcon />
                </div>
                Aucune capture
              </div>
            ) : (
              <div className="space-y-3.5">
                {history.map((h, i) => {
                  const petInfo = PETS.find(p => p.id === h.petId) || { name: 'Huge Inconnu', emoji: '🏆', image: null };
                  
                  return (
                    <div key={h.id} className="bg-[#05080A] border border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-lg hover:border-white/10 transition-colors">
                      <div className="w-14 h-14 shrink-0 bg-[#030608] rounded-xl flex items-center justify-center p-2 border border-white/5 shadow-inner">
                        {petInfo.image ? (
                          <img src={petInfo.image} alt={petInfo.name} className="max-w-full max-h-full object-contain drop-shadow-md" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                        ) : null}
                        <span className="text-2xl drop-shadow-md" style={{ display: petInfo.image ? 'none' : 'block' }}>{petInfo.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <div className="flex justify-between items-start">
                          <span className="text-orange-500 font-black uppercase tracking-wider text-[10px] leading-none pt-1 truncate pr-2">{petInfo.name}</span>
                        </div>
                        <div className="flex justify-between items-end mt-1">
                          <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1.5 rounded-lg border border-emerald-500/20 font-black flex flex-col justify-center shrink-0">
                            <span className="text-[7px] opacity-70 uppercase tracking-widest mb-px">Poids</span>
                            <span className="text-xs leading-none">{h.weight} <span className="text-[7px] opacity-80">KG</span></span>
                          </div>
                          <div className="text-right min-w-0 pl-2">
                            <p className="text-[7px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Chance</p>
                            <p className="text-lg font-black text-white tabular-nums leading-none tracking-tighter truncate">{h.eggsTaken}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div> {/* FIN DU WRAPPER PRINCIPAL */}

      {/* --- MODAL STATISTIQUES (Utilisée uniquement sur mobile) --- */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:hidden">
          <div className="bg-[#0A1014] border border-white/5 rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="bg-emerald-700 p-5 flex justify-between items-center shrink-0">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-5 h-5" /> STATISTIQUES
              </h3>
              <button onClick={() => setIsStatsModalOpen(false)} className="bg-black/20 p-2 rounded-full text-white hover:bg-black/40 transition-colors"><X className="w-4 h-4"/></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="bg-[#05080A] border border-white/5 rounded-2xl p-6 text-center shadow-inner">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Moyenne quotidienne</p>
                <div className="flex items-end justify-center gap-1.5">
                  <span className="text-5xl font-black text-emerald-400 tabular-nums tracking-tighter leading-none">{averagePerDay}</span>
                  <span className="text-sm font-bold text-slate-600 mb-1">œufs/jour</span>
                </div>
                <p className="text-[9px] text-slate-600 font-bold uppercase mt-3">Basé sur {totalTrackedDays} jour(s) actif(s)</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2">Historique par jour</h4>
                
                {sortedDailyStats.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center py-4 font-bold">Aucune donnée enregistrée.</p>
                ) : (
                  <div className="space-y-2">
                    {sortedDailyStats.map(([date, count]) => {
                      const isToday = date === getTodayString();
                      return (
                        <div key={date} className={`flex justify-between items-center p-4 rounded-xl border ${isToday ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#05080A] border-white/5'}`}>
                          <div className="flex items-center gap-2.5 text-slate-400">
                            <Calendar className={`w-4 h-4 ${isToday ? 'text-emerald-500' : 'text-slate-600'}`} />
                            <span className="text-xs font-bold">{isToday ? "Aujourd'hui" : formatDateString(date)}</span>
                          </div>
                          <span className={`text-base font-black tabular-nums ${isToday ? 'text-emerald-400' : 'text-white'}`}>+{count}</span>
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
          <div className="bg-[#0A1014] border border-white/5 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
            <div className="bg-orange-500 p-5 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-black text-[#030608] uppercase tracking-tighter italic">MAGNIFIQUE !</h3>
              <button onClick={() => { setIsHugeModalOpen(false); setSearchTerm(""); }} className="bg-black/10 p-1.5 rounded-full text-[#030608] hover:bg-black/20 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-6 text-center overflow-y-auto custom-scrollbar flex-1">
              <div className="bg-[#05080A] rounded-2xl p-5 border border-white/5 shadow-inner">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Obtenu après</p>
                <p className="text-5xl font-black text-white tracking-tighter tabular-nums truncate">{currentStreak} <span className="text-orange-500 text-lg">œufs</span></p>
              </div>

              <div className="text-left space-y-3">
                <div className="flex justify-between items-end px-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quel Huge ?</label>
                   <span className="text-[9px] text-slate-600 font-bold">{filteredPets.length} trouvé(s)</span>
                </div>
                
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Rechercher un familier..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#030608] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white text-sm font-bold focus:border-orange-500 outline-none transition-all shadow-inner placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-[25vh] overflow-y-auto custom-scrollbar pr-1 pb-1">
                  {filteredPets.length > 0 ? filteredPets.map(pet => (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPet(pet)}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${selectedPet.id === pet.id ? 'border-orange-500 bg-orange-500/10 shadow-lg' : 'border-white/5 bg-[#05080A] hover:border-white/10 hover:bg-white/5'}`}
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

              <div className="text-left space-y-2 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black text-slate-400 uppercase px-1 tracking-widest">Poids (KG)</label>
                <input 
                  type="number" step="0.01" placeholder="ex: 10.18"
                  value={hugeWeight} onChange={(e) => setHugeWeight(e.target.value)}
                  className="w-full bg-[#030608] border border-white/10 rounded-xl p-4 text-white text-2xl font-black focus:border-orange-500 outline-none transition-all shadow-inner text-center"
                />
              </div>

              <button onClick={handleRegisterHuge} className="w-full bg-orange-500 text-[#030608] font-black py-5 rounded-2xl text-xl shadow-xl hover:bg-orange-400 active:scale-95 transition-all uppercase tracking-[0.2em] border-b-4 border-orange-800 shrink-0 mt-4">
                ENREGISTRER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-center">
          <div className="bg-[#0A1014] border border-white/5 rounded-3xl p-8 w-full max-w-xs shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <RotateCcw className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tighter">TOUT SUPPRIMER ?</h3>
            <p className="text-slate-500 text-[11px] mb-8 font-medium leading-relaxed">Tes statistiques et ton historique cloud seront perdus à jamais.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setIsResetModalOpen(false)} className="bg-[#05080A] py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/5 hover:bg-white/5 text-slate-300 transition-colors">ANNULER</button>
              <button onClick={handleResetAll} className="bg-red-600 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-900/30 hover:bg-red-500 text-white transition-colors">OUI, EFFACER</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
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
