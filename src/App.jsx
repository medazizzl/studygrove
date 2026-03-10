import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DEFAULT_SUBJECTS = [
  "Math","Physics","Chemistry","SVT","French","English","Arabic","Philosophy","Informatics"
];

const THEMES = {
  amoled:     { name:"AMOLED Black",  bg:"#000000", surface:"#0a0a0a", card:"#111111", border:"#222222", text:"#ffffff", sub:"#888888", accent:"#6ee7b7", accent2:"#34d399" },
  white:      { name:"Clean White",   bg:"#f8f9fa", surface:"#ffffff", card:"#f0f0f0", border:"#e0e0e0", text:"#111111", sub:"#666666", accent:"#2563eb", accent2:"#1d4ed8" },
  red:        { name:"Deep Red",      bg:"#0d0000", surface:"#150000", card:"#1f0000", border:"#3d0000", text:"#fff0f0", sub:"#ff6b6b", accent:"#ff2222", accent2:"#cc0000" },
  pink:       { name:"Soft Pink 🌸",  bg:"#1a0010", surface:"#220018", card:"#2e0020", border:"#5c1040", text:"#ffe4f0", sub:"#ff8cbf", accent:"#ff69b4", accent2:"#ff1493" },
  forest:     { name:"Forest Green",  bg:"#020d05", surface:"#041508", card:"#071e0d", border:"#0e3a1a", text:"#e8f5e9", sub:"#81c784", accent:"#4caf50", accent2:"#2e7d32" },
  night:      { name:"Night Study",   bg:"#05050f", surface:"#0a0a1a", card:"#10102a", border:"#1a1a3a", text:"#ccd6f6", sub:"#8892b0", accent:"#64ffda", accent2:"#00bcd4" },
  sunset:     { name:"Sunset Orange", bg:"#0d0500", surface:"#180900", card:"#221200", border:"#442200", text:"#fff3e0", sub:"#ffb74d", accent:"#ff6d00", accent2:"#e65100" },
  lavender:   { name:"Lavender Dream",bg:"#0d0015", surface:"#160020", card:"#1e002e", border:"#3d0066", text:"#f3e5f5", sub:"#ce93d8", accent:"#ab47bc", accent2:"#7b1fa2" },
};

const ACHIEVEMENTS = [
  { id:"first_step",      icon:"🌱", name:"First Step",           desc:"Complete your first study session",        secret:false, cond:(s)=>s.totalSessions>=1 },
  { id:"apprentice",      icon:"📚", name:"Apprentice",           desc:"Study 10 hours total",                     secret:false, cond:(s)=>s.totalMinutes>=600 },
  { id:"dedicated",       icon:"🎯", name:"Dedicated",            desc:"Study 25 hours total",                     secret:false, cond:(s)=>s.totalMinutes>=1500 },
  { id:"academic_weapon", icon:"⚔️", name:"Academic Weapon",      desc:"Study 100 hours total",                   secret:false, cond:(s)=>s.totalMinutes>=6000 },
  { id:"century",         icon:"💯", name:"The Century",          desc:"Study 200 hours total",                    secret:false, cond:(s)=>s.totalMinutes>=12000 },
  { id:"streak_3",        icon:"🔥", name:"On Fire",              desc:"3-day study streak",                       secret:false, cond:(s)=>s.streak>=3 },
  { id:"disciplined",     icon:"🧘", name:"Disciplined",          desc:"7-day study streak",                       secret:false, cond:(s)=>s.streak>=7 },
  { id:"iron_will",       icon:"🦾", name:"Iron Will",            desc:"30-day study streak",                      secret:false, cond:(s)=>s.streak>=30 },
  { id:"champion",        icon:"🏆", name:"Champion",             desc:"Reach #1 on the leaderboard",              secret:false, cond:(s)=>s.leaderboardFirst>=1 },
  { id:"task_slayer",     icon:"✅", name:"Task Slayer",          desc:"Complete 10 tasks",                        secret:false, cond:(s)=>s.tasksCompleted>=10 },
  { id:"task_master",     icon:"🗡️", name:"Task Master",         desc:"Complete 50 tasks",                        secret:false, cond:(s)=>s.tasksCompleted>=50 },
  { id:"pomodoro_warrior",icon:"🍅", name:"Pomodoro Warrior",     desc:"Complete 25 Pomodoro sessions",            secret:false, cond:(s)=>s.pomodorosTotal>=25 },
  { id:"pomodoro_god",    icon:"🍅🔥",name:"Pomodoro God",        desc:"Complete 100 Pomodoro sessions",           secret:false, cond:(s)=>s.pomodorosTotal>=100 },
  { id:"last_standing",   icon:"👑", name:"Last Student Standing",desc:"Win a Last Standing challenge",            secret:false, cond:(s)=>s.challengeWins>=1 },
  { id:"multi_subject",   icon:"🎓", name:"Polymath",             desc:"Study 5 different subjects",               secret:false, cond:(s)=>Object.keys(s.subjectMinutes||{}).length>=5 },
  { id:"math_master",     icon:"∑",  name:"Math Overlord",        desc:"Study Math for 20+ hours",                 secret:false, cond:(s)=>(s.subjectMinutes?.Math||0)>=1200 },
  { id:"night_owl",       icon:"🦉", name:"Night Owl",            desc:"Study past midnight (simulated)",          secret:false, cond:(s)=>s.nightSessions>=1 },
  { id:"early_bird",      icon:"🐦", name:"Early Bird",           desc:"Start a session before 7am (simulated)",   secret:false, cond:(s)=>s.earlySessions>=1 },
  { id:"social",          icon:"👥", name:"Study Buddy",          desc:"Join your first group",                    secret:false, cond:(s)=>s.groupsJoined>=1 },
  { id:"sharer",          icon:"📎", name:"Knowledge Sharer",     desc:"Share 3 study files in chat",              secret:false, cond:(s)=>s.filesShared>=3 },
  { id:"focus_mode",      icon:"🎯", name:"Zone In",              desc:"Use focus mode 5 times",                   secret:false, cond:(s)=>s.focusModeUses>=5 },
  { id:"customizer",      icon:"🎨", name:"Interior Designer",    desc:"Try all 8 themes",                         secret:false, cond:(s)=>s.themesUsed>=8 },
  { id:"week_warrior",    icon:"📅", name:"Week Warrior",         desc:"Study every day for a week",               secret:false, cond:(s)=>s.streak>=7 },
  // SECRET
  { id:"ghost_student",   icon:"👻", name:"Ghost Student",        desc:"Study 3h while invisible",                 secret:true,  cond:(s)=>s.invisibleMinutes>=180 },
  { id:"perfectionist",   icon:"💎", name:"Perfectionist",        desc:"Study 7 days without chatting",            secret:true,  cond:(s)=>s.noChatStreak>=7 },
  { id:"architect",       icon:"🏗️", name:"The Architect",       desc:"Discover the hidden easter egg",           secret:true,  cond:(s)=>s.foundEasterEgg>=1 },
];

const MOCK_FRIENDS = [
  { id:1, name:"Sarah",   subject:"Physics",      minutes:372, status:"studying",  avatar:"S", streak:12, todayMins:240 },
  { id:2, name:"Omar",    subject:"Math",         minutes:180, status:"idle",      avatar:"O", streak:5,  todayMins:180 },
  { id:3, name:"Yasmine", subject:"Chemistry",    minutes:540, status:"studying",  avatar:"Y", streak:20, todayMins:300 },
  { id:4, name:"Karim",   subject:"English",      minutes:90,  status:"offline",   avatar:"K", streak:2,  todayMins:90  },
  { id:5, name:"Lina",    subject:"Philosophy",   minutes:420, status:"studying",  avatar:"L", streak:8,  todayMins:120 },
];

const MOCK_MESSAGES = [
  { id:1, user:"Sarah",   text:"Just finished Chapter 3 💪",          time:"14:22", type:"chat" },
  { id:2, user:"Yasmine", text:"Same! This thermodynamics is brutal",  time:"14:25", type:"chat" },
  { id:3, user:"System",  text:"Omar joined the session",              time:"14:30", type:"system" },
  { id:4, user:"Omar",    text:"Let's get it 🔥",                      time:"14:31", type:"chat" },
];

const fmtTime = (s) => {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  if (h>0) return `${h}h ${String(m).padStart(2,"0")}m`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
};
const fmtMins = (m) => {
  if (m<60) return `${m}m`;
  return `${Math.floor(m/60)}h ${m%60>0?m%60+"m":""}`.trim();
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function StudyGrove() {
  const [theme, setTheme] = useState("amoled");
  const T = THEMES[theme];

  // AUTH
  const [screen, setScreen] = useState("login"); // login | register | app
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });
  const [regForm, setRegForm] = useState({ username:"", email:"", password:"" });

  // APP STATE
  const [tab, setTab] = useState("study"); // study | group | leaderboard | stats | tasks | achievements | settings
  const [studying, setStudying] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [subjects, setSubjects] = useState([...DEFAULT_SUBJECTS]);
  const [newSubject, setNewSubject] = useState("");
  const [sessionSecs, setSessionSecs] = useState(0);
  const [todaySecs, setTodaySecs] = useState(0);
  const [weeklySecs, setWeeklySecs] = useState(82800);
  const [subjectMinutes, setSubjectMinutes] = useState({ Math:180, Physics:120, Chemistry:60, English:45, SVT:30 });
  const [totalSessions, setTotalSessions] = useState(14);
  const [streak, setStreak] = useState(7);
  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [pomodoroSecs, setPomodoroSecs] = useState(25*60);
  const [pomodorosToday, setPomodorosToday] = useState(3);
  const [pomodorosTotal, setPomodorosTotal] = useState(27);
  const [focusMode, setFocusMode] = useState(false);
  const [status, setStatus] = useState("online"); // online | invisible
  const [invisible, setInvisible] = useState(false);
  const [invisibleMins, setInvisibleMins] = useState(0);
  const [achievements, setAchievements] = useState(["first_step","streak_3","disciplined","apprentice","social","pomodoro_warrior"]);
  const [newAchievement, setNewAchievement] = useState(null);
  const [themesUsed, setThemesUsed] = useState(new Set(["amoled"]));
  const [easterEggFound, setEasterEggFound] = useState(false);
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [leaderboardFrame, setLeaderboardFrame] = useState("weekly");
  const [tasks, setTasks] = useState([
    { id:1, text:"Finish Math Chapter 5 exercises", done:false, subject:"Math" },
    { id:2, text:"Review Physics formulas", done:true, subject:"Physics" },
    { id:3, text:"Read Philosophy chapter 2", done:false, subject:"Philosophy" },
    { id:4, text:"Practice English essay writing", done:false, subject:"English" },
  ]);
  const [newTask, setNewTask] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("Math");
  const [tasksCompleted, setTasksCompleted] = useState(12);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupCode, setGroupCode] = useState("BAC2026");
  const [joinCode, setJoinCode] = useState("");
  const [groupName, setGroupName] = useState("Study Group");
  const [inGroup, setInGroup] = useState(true);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [challengeActive, setChallengeActive] = useState(false);
  const [challengeType, setChallengeType] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeSound, setActiveSound] = useState(null);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [weeklyData] = useState([
    { day:"Mon", mins:180 }, { day:"Tue", mins:300 },
    { day:"Wed", mins:120 }, { day:"Thu", mins:240 },
    { day:"Fri", mins:360 }, { day:"Sat", mins:200 },
    { day:"Sun", mins:80  },
  ]);

  const timerRef = useRef(null);
  const pomRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Timer
  useEffect(() => {
    if (studying) {
      timerRef.current = setInterval(() => {
        setSessionSecs(s => s+1);
        setTodaySecs(s => s+1);
        if (invisible) setInvisibleMins(m => m + 1/60);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [studying, invisible]);

  // Pomodoro countdown
  useEffect(() => {
    if (studying && pomodoroMode) {
      pomRef.current = setInterval(() => {
        setPomodoroSecs(s => {
          if (s<=1) {
            setPomodorosToday(p => p+1);
            setPomodorosTotal(p => p+1);
            return 25*60;
          }
          return s-1;
        });
      }, 1000);
    } else {
      clearInterval(pomRef.current);
    }
    return () => clearInterval(pomRef.current);
  }, [studying, pomodoroMode]);

  // Achievement checker
  useEffect(() => {
    const stats = { totalSessions, totalMinutes: Math.floor(todaySecs/60)+Math.floor(weeklySecs/60),
      streak, leaderboardFirst:1, tasksCompleted, pomodorosTotal, subjectMinutes,
      invisibleMinutes: invisibleMins, noChatStreak:8, foundEasterEgg: easterEggFound?1:0,
      groupsJoined:1, filesShared:4, focusModeUses:6, themesUsed: themesUsed.size,
      challengeWins:1, nightSessions:2, earlySessions:1 };
    ACHIEVEMENTS.forEach(a => {
      if (!achievements.includes(a.id) && a.cond(stats)) {
        setAchievements(prev => [...prev, a.id]);
        setNewAchievement(a);
        setTimeout(() => setNewAchievement(null), 4000);
      }
    });
  }, [todaySecs, studying, tasksCompleted, pomodorosTotal, easterEggFound, themesUsed.size]);

  const startStop = () => {
    if (!studying) {
      setStudying(true);
      if (pomodoroMode) setPomodoroSecs(25*60);
    } else {
      setStudying(false);
      setSubjectMinutes(prev => ({...prev, [selectedSubject]: (prev[selectedSubject]||0) + Math.floor(sessionSecs/60)}));
      setTotalSessions(s => s+1);
      setSessionSecs(0);
    }
  };

  const handleTheme = (t) => {
    setTheme(t);
    setThemesUsed(prev => { const n=new Set(prev); n.add(t); return n; });
    setShowThemePanel(false);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    if (studying) { setStudying(false); }
    setMessages(prev => [...prev, { id:Date.now(), user: user?.username||"You", text:chatInput, time: new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"}), type:"chat" }]);
    setChatInput("");
    setTimeout(() => chatBottomRef.current?.scrollIntoView({behavior:"smooth"}), 100);
  };

  const handleEasterEgg = () => {
    const n = easterEggClicks + 1;
    setEasterEggClicks(n);
    if (n >= 5 && !easterEggFound) {
      setEasterEggFound(true);
    }
  };

  const handleLogin = () => {
    if (loginForm.email && loginForm.password) {
      setUser({ username: loginForm.email.split("@")[0], email: loginForm.email });
      setScreen("app");
    }
  };

  const handleRegister = () => {
    if (regForm.username && regForm.email && regForm.password) {
      setUser({ username: regForm.username, email: regForm.email });
      setScreen("app");
    }
  };

  const completeTask = (id) => {
    setTasks(prev => prev.map(t => t.id===id ? {...t, done:!t.done} : t));
    setTasksCompleted(c => c+1);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id:Date.now(), text:newTask, done:false, subject:newTaskSubject }]);
    setNewTask("");
  };

  const addSubject = () => {
    if (!newSubject.trim() || subjects.includes(newSubject)) return;
    setSubjects(prev => [...prev, newSubject]);
    setNewSubject("");
    setShowAddSubject(false);
  };

  const removeSubject = (sub) => {
    if (DEFAULT_SUBJECTS.includes(sub)) return;
    setSubjects(prev => prev.filter(s => s!==sub));
  };

  const leaderboardData = [
    { name: user?.username||"You", mins: Math.floor(todaySecs/60)+Math.floor(weeklySecs/60), subject:"Math", streak, avatar:"A" },
    ...MOCK_FRIENDS
  ].sort((a,b) => b.mins - a.mins).map((m,i) => ({...m, rank:i+1}));

  // ── STYLES ────────────────────────────────────────────────────────────────
  const css = {
    app: { minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'Outfit', 'Segoe UI', sans-serif", transition:"background 0.4s, color 0.4s", position:"relative", overflow:"hidden" },
    card: { background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:20, marginBottom:16 },
    btn: { background:T.accent, color:"#000", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer", fontWeight:700, fontSize:14, transition:"all 0.2s" },
    btnOutline: { background:"transparent", color:T.accent, border:`1.5px solid ${T.accent}`, borderRadius:10, padding:"8px 18px", cursor:"pointer", fontWeight:600, fontSize:13 },
    input: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", color:T.text, fontSize:14, outline:"none", width:"100%" },
    tab: (active) => ({ padding:"8px 14px", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:13, border:"none", background: active ? T.accent : "transparent", color: active ? "#000" : T.sub, transition:"all 0.2s" }),
    statusDot: (st) => ({ width:10, height:10, borderRadius:"50%", background: st==="studying" ? T.accent : st==="idle" ? "#f59e0b" : st==="offline" ? T.sub : "transparent", border: st==="invisible" ? `2px dashed ${T.sub}` : "none", display:"inline-block", marginRight:6 }),
  };

  // ── AUTH SCREENS ──────────────────────────────────────────────────────────
  if (screen === "login" || screen === "register") {
    return (
      <div style={{...css.app, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20}}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Ambient BG */}
        <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 30% 20%, ${T.accent}18 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, ${T.accent2}12 0%, transparent 60%)`,pointerEvents:"none"}} />
        
        <div style={{...css.card, width:"100%", maxWidth:420, position:"relative", zIndex:1, boxShadow:`0 0 60px ${T.accent}20`}}>
          {/* Logo */}
          <div style={{textAlign:"center", marginBottom:28}}>
            <span onClick={handleEasterEgg} style={{fontSize:42, cursor:"default", userSelect:"none"}} title={easterEggClicks>=3?"Almost there...":""}>📖</span>
            <div style={{fontSize:28, fontWeight:900, letterSpacing:-1, marginTop:4}}>
              Study<span style={{color:T.accent}}>Grove</span>
            </div>
            <div style={{color:T.sub, fontSize:13, marginTop:4}}>Study together. Rise together.</div>
            <div style={{color:T.border, fontSize:10, marginTop:16, letterSpacing:2, textTransform:"uppercase"}}>built by aziz zl</div>
          </div>

          {screen === "login" ? (
            <>
              <input style={{...css.input, marginBottom:12}} placeholder="Email" type="email"
                value={loginForm.email} onChange={e=>setLoginForm(p=>({...p,email:e.target.value}))} />
              <input style={{...css.input, marginBottom:20}} placeholder="Password" type="password"
                value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
              <button style={{...css.btn, width:"100%", padding:14, fontSize:15}} onClick={handleLogin}>Sign In</button>
              <div style={{textAlign:"center", marginTop:16, color:T.sub, fontSize:13}}>
                No account? <span style={{color:T.accent, cursor:"pointer"}} onClick={()=>setScreen("register")}>Create one</span>
              </div>
            </>
          ) : (
            <>
              <input style={{...css.input, marginBottom:12}} placeholder="Username" value={regForm.username} onChange={e=>setRegForm(p=>({...p,username:e.target.value}))} />
              <input style={{...css.input, marginBottom:12}} placeholder="Email" type="email" value={regForm.email} onChange={e=>setRegForm(p=>({...p,email:e.target.value}))} />
              <input style={{...css.input, marginBottom:20}} placeholder="Password" type="password" value={regForm.password} onChange={e=>setRegForm(p=>({...p,password:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&handleRegister()} />
              <button style={{...css.btn, width:"100%", padding:14, fontSize:15}} onClick={handleRegister}>Create Account</button>
              <div style={{textAlign:"center", marginTop:16, color:T.sub, fontSize:13}}>
                Already have an account? <span style={{color:T.accent, cursor:"pointer"}} onClick={()=>setScreen("login")}>Sign in</span>
              </div>
            </>
          )}
        </div>
        {/* Theme selector on login */}
        <div style={{display:"flex", gap:8, marginTop:16, flexWrap:"wrap", justifyContent:"center"}}>
          {Object.entries(THEMES).map(([k,v]) => (
            <button key={k} onClick={()=>handleTheme(k)} style={{...css.btnOutline, padding:"4px 10px", fontSize:11, borderColor: theme===k?T.accent:T.border, color: theme===k?T.accent:T.sub}}>{v.name}</button>
          ))}
        </div>
      </div>
    );
  }

  // ── MAIN APP ──────────────────────────────────────────────────────────────
  const pomodoroPercent = ((25*60 - pomodoroSecs) / (25*60)) * 100;

  return (
    <div style={css.app}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 20% 10%, ${T.accent}10 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, ${T.accent2}08 0%, transparent 50%)`,pointerEvents:"none"}} />

      {/* Achievement Toast */}
      {newAchievement && (
        <div style={{position:"fixed",top:20,right:20,zIndex:1000,background:T.card,border:`1.5px solid ${T.accent}`,borderRadius:14,padding:"14px 20px",boxShadow:`0 0 30px ${T.accent}40`,animation:"slideIn 0.4s ease",maxWidth:280}}>
          <div style={{fontSize:11,color:T.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Achievement Unlocked!</div>
          <div style={{fontSize:18,marginTop:4}}>{newAchievement.icon} <strong>{newAchievement.name}</strong></div>
          <div style={{fontSize:12,color:T.sub,marginTop:2}}>{newAchievement.desc}</div>
        </div>
      )}

      {/* Easter Egg Toast */}
      {easterEggFound && !achievements.includes("architect") && (
        <div style={{position:"fixed",top:80,right:20,zIndex:999,background:"#111",border:"1.5px solid #ffd700",borderRadius:14,padding:"12px 18px",maxWidth:260}}>
          <div style={{fontSize:11,color:"#ffd700",fontWeight:700}}>🏗️ SECRET FOUND: The Architect</div>
          <div style={{fontSize:11,color:"#888",marginTop:2}}>You clicked the book 5 times. Nice persistence.</div>
        </div>
      )}

      {/* Focus Mode Overlay */}
      {focusMode && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:800,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:13,color:T.sub,marginBottom:8,textTransform:"uppercase",letterSpacing:2}}>Focus Mode</div>
          <div style={{fontSize:80,fontWeight:900,color:T.accent,fontVariantNumeric:"tabular-nums"}}>{fmtTime(sessionSecs)}</div>
          <div style={{fontSize:16,color:T.sub,marginTop:8}}>{selectedSubject}</div>
          {pomodoroMode && (
            <div style={{marginTop:20}}>
              <div style={{fontSize:13,color:T.sub,textAlign:"center",marginBottom:8}}>🍅 {fmtTime(pomodoroSecs)}</div>
              <div style={{width:200,height:4,background:T.border,borderRadius:2}}>
                <div style={{height:"100%",background:T.accent,borderRadius:2,width:`${pomodoroPercent}%`,transition:"width 1s linear"}} />
              </div>
            </div>
          )}
          <button style={{...css.btnOutline, marginTop:32}} onClick={()=>setFocusMode(false)}>Exit Focus Mode</button>
          <button style={{...css.btn, marginTop:12, background:"#cc2222"}} onClick={startStop}>Stop Studying</button>
        </div>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...css.card, width:"100%",maxWidth:400,boxShadow:`0 0 40px ${T.accent}20`}}>
            <div style={{fontWeight:800,fontSize:18,marginBottom:16}}>Study Groups</div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,color:T.sub,marginBottom:6}}>YOUR GROUP CODE</div>
              <div style={{...css.card, background:T.surface, padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                <span style={{fontWeight:700,fontSize:20,letterSpacing:3,color:T.accent}}>{groupCode}</span>
                <span style={{fontSize:11,color:T.sub}}>Share this with friends</span>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,color:T.sub,marginBottom:6}}>JOIN A GROUP</div>
              <div style={{display:"flex",gap:8}}>
                <input style={{...css.input,flex:1}} placeholder="Enter group code" value={joinCode} onChange={e=>setJoinCode(e.target.value)} />
                <button style={css.btn} onClick={()=>{setInGroup(true);setShowGroupModal(false);}}>Join</button>
              </div>
            </div>
            <button style={{...css.btnOutline,width:"100%"}} onClick={()=>setShowGroupModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <span onClick={handleEasterEgg} style={{fontSize:22, cursor:"default"}} title="">📖</span>
          <span style={{fontWeight:900, fontSize:18, letterSpacing:-0.5}}>Study<span style={{color:T.accent}}>Grove</span></span>
          {inGroup && <span style={{fontSize:11,color:T.sub,background:T.card,padding:"2px 8px",borderRadius:20,marginLeft:4}}>{groupName}</span>}
        </div>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          {studying && <span style={{fontSize:11,color:T.accent,fontWeight:700,padding:"3px 10px",border:`1px solid ${T.accent}`,borderRadius:20,animation:"pulse 2s infinite"}}>● LIVE</span>}
          <button style={{...css.btnOutline, padding:"4px 10px", fontSize:11}} onClick={()=>setInvisible(v=>!v)}>
            {invisible ? "👻 Invisible" : "🟢 Visible"}
          </button>
          <button style={{...css.btnOutline, padding:"4px 10px", fontSize:11}} onClick={()=>setShowThemePanel(v=>!v)}>🎨</button>
          <button style={{...css.btnOutline, padding:"4px 10px", fontSize:11}} onClick={()=>setShowGroupModal(true)}>👥</button>
          <div style={{width:32,height:32,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#000",cursor:"pointer"}} onClick={()=>setTab("settings")}>
            {(user?.username||"A")[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* Theme Panel Dropdown */}
      {showThemePanel && (
        <div style={{position:"fixed",top:58,right:16,zIndex:300,background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:16,minWidth:200,boxShadow:`0 10px 40px rgba(0,0,0,0.5)`}}>
          <div style={{fontSize:12,color:T.sub,fontWeight:700,marginBottom:10}}>THEMES</div>
          {Object.entries(THEMES).map(([k,v]) => (
            <div key={k} onClick={()=>handleTheme(k)} style={{padding:"8px 12px",borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:8,background:theme===k?`${T.accent}22`:"transparent",marginBottom:2}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:v.accent}} />
              <span style={{fontSize:13,color:theme===k?T.accent:T.text,fontWeight:theme===k?700:400}}>{v.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Nav */}
      <div style={{display:"flex",gap:4,padding:"10px 16px",overflowX:"auto",borderBottom:`1px solid ${T.border}`,background:T.surface}}>
        {[["study","⏱ Study"],["group","👥 Group"],["leaderboard","🏆 Ranks"],["stats","📊 Stats"],["tasks","✅ Tasks"],["achievements","🎖 Badges"],["settings","⚙️ Settings"]].map(([t,l]) => (
          <button key={t} style={css.tab(tab===t)} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{padding:"16px", maxWidth:900, margin:"0 auto", position:"relative", zIndex:1}}>

        {/* ── STUDY TAB ── */}
        {tab==="study" && (
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
            {/* Timer card */}
            <div style={{...css.card, gridColumn:"1/-1", textAlign:"center", boxShadow: studying?`0 0 40px ${T.accent}25`:"none", transition:"box-shadow 0.4s"}}>
              <div style={{fontSize:12,color:T.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:2,marginBottom:12}}>
                {studying ? `Studying ${selectedSubject}` : "Ready to Study?"}
              </div>
              <div style={{fontSize:72,fontWeight:900,color: studying?T.accent:T.text,fontVariantNumeric:"tabular-nums",letterSpacing:-2,lineHeight:1}}>
                {fmtTime(sessionSecs)}
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:24,margin:"12px 0",fontSize:13,color:T.sub}}>
                <span>Today <strong style={{color:T.text}}>{fmtTime(todaySecs)}</strong></span>
                <span>Week <strong style={{color:T.text}}>{fmtTime(weeklySecs+todaySecs)}</strong></span>
                <span>Streak <strong style={{color:T.accent}}>{streak}🔥</strong></span>
              </div>

              {/* Subject selector */}
              <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",margin:"14px 0"}}>
                {subjects.map(s => (
                  <button key={s} onClick={()=>!studying&&setSelectedSubject(s)}
                    style={{...css.btnOutline, padding:"5px 12px", fontSize:12,
                      background:selectedSubject===s?T.accent:"transparent",
                      color:selectedSubject===s?"#000":T.sub,
                      borderColor:selectedSubject===s?T.accent:T.border}}>
                    {s}
                  </button>
                ))}
                <button onClick={()=>setShowAddSubject(v=>!v)} style={{...css.btnOutline, padding:"5px 10px", fontSize:12, borderStyle:"dashed"}}>+ Add</button>
              </div>

              {showAddSubject && (
                <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}}>
                  <input style={{...css.input,maxWidth:180}} placeholder="Subject name" value={newSubject} onChange={e=>setNewSubject(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSubject()} />
                  <button style={css.btn} onClick={addSubject}>Add</button>
                </div>
              )}

              {/* Main button */}
              <button onClick={startStop} style={{...css.btn, padding:"14px 48px", fontSize:18, background: studying?"#cc2222":T.accent, color:"#000", borderRadius:14, boxShadow: studying?`0 0 20px #cc222240`:`0 0 20px ${T.accent}40`}}>
                {studying ? "⏹ Stop" : "▶ Start Studying"}
              </button>

              {/* Pomodoro toggle */}
              <div style={{marginTop:14, display:"flex", alignItems:"center", justifyContent:"center", gap:12}}>
                <button onClick={()=>setPomodoroMode(v=>!v)} style={{...css.btnOutline, fontSize:12, padding:"4px 12px", borderColor: pomodoroMode?T.accent:T.border, color: pomodoroMode?T.accent:T.sub}}>
                  🍅 Pomodoro {pomodoroMode?"ON":"OFF"}
                </button>
                {pomodoroMode && (
                  <span style={{fontSize:13, color:T.accent}}>
                    {fmtTime(pomodoroSecs)} left · {pomodorosToday} done today
                  </span>
                )}
                <button onClick={()=>{setFocusMode(true);if(!studying)startStop();}} style={{...css.btnOutline, fontSize:12, padding:"4px 12px"}}>
                  🎯 Focus Mode
                </button>
              </div>

              {pomodoroMode && (
                <div style={{marginTop:10,height:4,background:T.border,borderRadius:2}}>
                  <div style={{height:"100%",background:T.accent,borderRadius:2,width:`${pomodoroPercent}%`,transition:"width 1s linear"}} />
                </div>
              )}
            </div>

            {/* Subject breakdown */}
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>📚 Subject Hours</div>
              {Object.entries(subjectMinutes).map(([sub,mins]) => (
                <div key={sub} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}>
                    <span>{sub}</span>
                    <span style={{color:T.accent,fontWeight:600}}>{fmtMins(mins)}</span>
                  </div>
                  <div style={{height:4,background:T.border,borderRadius:2}}>
                    <div style={{height:"100%",background:T.accent,borderRadius:2,width:`${Math.min(100,(mins/Math.max(...Object.values(subjectMinutes)))*100)}%`}} />
                  </div>
                </div>
              ))}
            </div>

            {/* Online Friends */}
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🟢 Group Status</div>
              {[{id:0,name:user?.username||"You",subject:selectedSubject,status:studying?(invisible?"invisible":"studying"):"idle",avatar:"A",streak,todayMins:Math.floor(todaySecs/60)}, ...MOCK_FRIENDS].map(f => (
                <div key={f.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#000"}}>{f.avatar}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{f.name} {f.id===0?"(you)":""}</div>
                      <div style={{fontSize:11,color:T.sub}}>{f.status==="studying"?`Studying ${f.subject}`:f.status} · {fmtMins(f.todayMins)} today</div>
                    </div>
                  </div>
                  <span style={css.statusDot(f.status)} />
                </div>
              ))}
            </div>

            {/* Challenges */}
            <div style={{...css.card, gridColumn:"1/-1"}}>
              <div style={{fontWeight:700,marginBottom:12}}>⚔️ Challenges</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[
                  {icon:"👑",name:"Last Student Standing",desc:"All start together – first to stop is eliminated!",type:"last_standing"},
                  {icon:"⚡",name:"24-Hour Grind",desc:"Who studies the most in 24 hours?",type:"24h"},
                  {icon:"📅",name:"30-Day Challenge",desc:"Consistent grind for 30 days. No excuses.",type:"30d"},
                ].map(c => (
                  <div key={c.type} style={{...css.card, background:T.surface, padding:14, cursor:"pointer"}} onClick={()=>{setChallengeType(c.type);setChallengeActive(true);}}>
                    <div style={{fontSize:24}}>{c.icon}</div>
                    <div style={{fontWeight:700,fontSize:13,marginTop:6}}>{c.name}</div>
                    <div style={{fontSize:11,color:T.sub,marginTop:4}}>{c.desc}</div>
                    {challengeActive&&challengeType===c.type && <div style={{marginTop:8,fontSize:11,color:T.accent,fontWeight:700}}>● ACTIVE</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GROUP / CHAT TAB ── */}
        {tab==="group" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{...css.card,height:500,display:"flex",flexDirection:"column"}}>
              <div style={{fontWeight:700,marginBottom:12}}>💬 Group Chat</div>
              <div style={{fontSize:11,color:"#f59e0b",marginBottom:10,padding:"6px 10px",background:"#f59e0b18",borderRadius:8}}>
                ⚠️ Sending a message will pause your timer
              </div>
              <div style={{flex:1,overflowY:"auto",paddingRight:4}}>
                {messages.map(m => (
                  <div key={m.id} style={{marginBottom:10}}>
                    {m.type==="system" ? (
                      <div style={{textAlign:"center",fontSize:11,color:T.sub}}>— {m.text} —</div>
                    ) : (
                      <div>
                        <span style={{fontWeight:700,fontSize:13,color:T.accent}}>{m.user}</span>
                        <span style={{fontSize:11,color:T.sub,marginLeft:6}}>{m.time}</span>
                        <div style={{fontSize:13,marginTop:2,color:T.text}}>{m.text}</div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <input style={{...css.input,flex:1}} placeholder="Message... (pauses timer)" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} />
                <button style={css.btn} onClick={sendMessage}>→</button>
              </div>
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>📎 Shared Resources</div>
              {[
                {name:"Physics Chapter 4 Notes.pdf",by:"Sarah",time:"2h ago",icon:"📄"},
                {name:"Chemistry formulas.jpg",by:"Yasmine",time:"4h ago",icon:"🖼"},
                {name:"Math Exercise Sheet.pdf",by:"Omar",time:"yesterday",icon:"📄"},
              ].map((f,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                  <span style={{fontSize:20}}>{f.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600}}>{f.name}</div>
                    <div style={{fontSize:11,color:T.sub}}>by {f.by} · {f.time}</div>
                  </div>
                  <button style={{...css.btnOutline,fontSize:11,padding:"3px 8px"}}>↓</button>
                </div>
              ))}
              <button style={{...css.btnOutline, width:"100%", marginTop:12}}>📎 Upload File</button>
            </div>

            <div style={{...css.card,gridColumn:"1/-1"}}>
              <div style={{fontWeight:700,marginBottom:12}}>👥 {groupName} · {MOCK_FRIENDS.length+1} members</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
                {[{id:0,name:user?.username||"You",subject:selectedSubject,status:studying?(invisible?"invisible":"studying"):"idle",avatar:"A",streak,todayMins:Math.floor(todaySecs/60)}, ...MOCK_FRIENDS].map(f => (
                  <div key={f.id} style={{...css.card,background:T.surface,padding:12,textAlign:"center"}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16,color:"#000",margin:"0 auto 8px"}}>
                      {f.avatar}
                    </div>
                    <div style={{fontWeight:600,fontSize:13}}>{f.name}</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginTop:4}}>
                      <span style={css.statusDot(f.status)} />
                      <span style={{fontSize:11,color:T.sub}}>{f.status}</span>
                    </div>
                    {f.status==="studying"&&<div style={{fontSize:11,color:T.accent,marginTop:4}}>{f.subject}</div>}
                    <div style={{fontSize:11,color:T.sub,marginTop:4}}>{fmtMins(f.todayMins)} today</div>
                    <div style={{fontSize:11,color:"#f59e0b",marginTop:2}}>🔥{f.streak}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {tab==="leaderboard" && (
          <div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {["daily","weekly","monthly","3months"].map(f => (
                <button key={f} style={css.tab(leaderboardFrame===f)} onClick={()=>setLeaderboardFrame(f)}>
                  {f==="3months"?"3 Months":f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:4}}>🏆 {groupName} Leaderboard</div>
              <div style={{fontSize:12,color:T.sub,marginBottom:16}}>{leaderboardFrame.charAt(0).toUpperCase()+leaderboardFrame.slice(1)} rankings</div>
              {leaderboardData.map((m,i) => (
                <div key={m.name} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.border}`,background: i===0?`${T.accent}10`:"transparent",borderRadius:i===0?8:0}}>
                  <div style={{width:32,textAlign:"center",fontWeight:900,fontSize:i===0?20:15,color:i===0?T.accent:i===1?"#c0c0c0":i===2?"#cd7f32":T.sub}}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}
                  </div>
                  <div style={{width:36,height:36,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#000"}}>
                    {m.avatar||m.name[0]}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{m.name} {m.name===(user?.username||"You")&&<span style={{fontSize:11,color:T.accent}}>(you)</span>}</div>
                    <div style={{fontSize:11,color:T.sub}}>🔥 {m.streak} day streak · {m.subject}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,color:T.accent}}>{fmtMins(m.mins)}</div>
                    <div style={{fontSize:11,color:T.sub}}>studied</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subject leaderboard */}
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🎯 Subject Rankings · Physics</div>
              {[{name:"Sarah",mins:360},{name:"Yasmine",mins:280},{name:user?.username||"You",mins:120},{name:"Omar",mins:90},{name:"Karim",mins:60}].map((m,i) => (
                <div key={m.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}}>
                  <span style={{width:20,color:T.sub,fontWeight:700}}>{i+1}.</span>
                  <span style={{flex:1,fontWeight:600}}>{m.name}</span>
                  <div style={{width:120,height:6,background:T.border,borderRadius:3}}>
                    <div style={{height:"100%",background:T.accent,borderRadius:3,width:`${(m.mins/360)*100}%`}} />
                  </div>
                  <span style={{color:T.accent,fontWeight:700,fontSize:13,minWidth:40,textAlign:"right"}}>{fmtMins(m.mins)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab==="stats" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
              {[
                {label:"Total Hours",value:fmtMins(Math.floor(weeklySecs/60)+340),icon:"⏱"},
                {label:"Current Streak",value:`${streak} days 🔥`,icon:"🔥"},
                {label:"Sessions",value:totalSessions,icon:"📚"},
                {label:"Pomodoros",value:`${pomodorosTotal} 🍅`,icon:"🍅"},
                {label:"Tasks Done",value:tasksCompleted,icon:"✅"},
                {label:"Achievements",value:`${achievements.length}/${ACHIEVEMENTS.length}`,icon:"🎖"},
              ].map(s => (
                <div key={s.label} style={{...css.card,textAlign:"center",padding:16}}>
                  <div style={{fontSize:24}}>{s.icon}</div>
                  <div style={{fontWeight:900,fontSize:20,color:T.accent,marginTop:4}}>{s.value}</div>
                  <div style={{fontSize:11,color:T.sub,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Weekly chart */}
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:16}}>📅 This Week</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120}}>
                {weeklyData.map(d => (
                  <div key={d.day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <span style={{fontSize:10,color:T.accent,fontWeight:600}}>{d.mins>=60?Math.floor(d.mins/60)+"h":d.mins+"m"}</span>
                    <div style={{width:"100%",background:T.accent,borderRadius:"4px 4px 0 0",height:`${(d.mins/360)*100}px`,minHeight:4,transition:"height 0.4s"}} />
                    <span style={{fontSize:11,color:T.sub}}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject distribution */}
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🎯 Subject Distribution</div>
              {Object.entries(subjectMinutes).map(([sub,mins]) => {
                const total = Object.values(subjectMinutes).reduce((a,b)=>a+b,0);
                const pct = Math.round((mins/total)*100);
                return (
                  <div key={sub} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{width:80,fontSize:12,color:T.text}}>{sub}</span>
                    <div style={{flex:1,height:8,background:T.border,borderRadius:4}}>
                      <div style={{height:"100%",background:T.accent,borderRadius:4,width:`${pct}%`}} />
                    </div>
                    <span style={{fontSize:12,color:T.accent,fontWeight:600,width:50,textAlign:"right"}}>{pct}% · {fmtMins(mins)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {tab==="tasks" && (
          <div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>➕ Add Task</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <input style={{...css.input,flex:1,minWidth:200}} placeholder="What do you need to study?" value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} />
                <select style={{...css.input,width:140}} value={newTaskSubject} onChange={e=>setNewTaskSubject(e.target.value)}>
                  {subjects.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button style={css.btn} onClick={addTask}>Add Task</button>
              </div>
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>📋 Tasks ({tasks.filter(t=>!t.done).length} remaining)</div>
              {tasks.map(t => (
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                  <button onClick={()=>completeTask(t.id)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${t.done?T.accent:T.border}`,background:t.done?T.accent:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {t.done && <span style={{color:"#000",fontSize:12,fontWeight:900}}>✓</span>}
                  </button>
                  <span style={{flex:1,fontSize:13,textDecoration:t.done?"line-through":"none",color:t.done?T.sub:T.text}}>{t.text}</span>
                  <span style={{fontSize:11,color:T.accent,padding:"2px 8px",background:`${T.accent}18`,borderRadius:20}}>{t.subject}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACHIEVEMENTS TAB ── */}
        {tab==="achievements" && (
          <div>
            <div style={{...css.card,background:`linear-gradient(135deg,${T.card},${T.surface})`,marginBottom:16}}>
              <div style={{fontWeight:700}}>🎖 Badges Unlocked: {achievements.length} / {ACHIEVEMENTS.filter(a=>!a.secret).length} + {ACHIEVEMENTS.filter(a=>a.secret).length} secret</div>
              <div style={{height:8,background:T.border,borderRadius:4,marginTop:10}}>
                <div style={{height:"100%",background:T.accent,borderRadius:4,width:`${(achievements.length/ACHIEVEMENTS.length)*100}%`}} />
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
              {ACHIEVEMENTS.map(a => {
                const unlocked = achievements.includes(a.id);
                return (
                  <div key={a.id} style={{...css.card,padding:14,textAlign:"center",opacity:unlocked?1:0.45,border:`1.5px solid ${unlocked?T.accent:T.border}`,transition:"all 0.3s",background:unlocked?`${T.accent}08`:T.card}}>
                    <div style={{fontSize:28}}>{a.secret && !unlocked ? "❓" : a.icon}</div>
                    <div style={{fontWeight:700,fontSize:13,marginTop:6}}>{a.secret && !unlocked ? "???" : a.name}</div>
                    <div style={{fontSize:11,color:T.sub,marginTop:4}}>{a.secret && !unlocked ? "Hidden achievement" : a.desc}</div>
                    {a.secret && <div style={{fontSize:10,color:T.accent,marginTop:4,fontWeight:700}}>SECRET</div>}
                    {unlocked && <div style={{fontSize:10,color:T.accent,marginTop:6,fontWeight:700}}>✓ UNLOCKED</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab==="settings" && (
          <div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>👤 Account</div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <div style={{width:50,height:50,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:"#000"}}>
                  {(user?.username||"A")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:16}}>{user?.username}</div>
                  <div style={{fontSize:12,color:T.sub}}>{user?.email}</div>
                </div>
              </div>
              <button style={{...css.btnOutline,fontSize:12}} onClick={()=>setScreen("login")}>Sign Out</button>
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🎨 Themes</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                {Object.entries(THEMES).map(([k,v]) => (
                  <button key={k} onClick={()=>handleTheme(k)} style={{...css.btnOutline,padding:"10px",textAlign:"left",display:"flex",alignItems:"center",gap:8,borderColor:theme===k?T.accent:T.border,background:theme===k?`${T.accent}15`:"transparent"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:v.accent,flexShrink:0}} />
                    <span style={{fontSize:12,fontWeight:theme===k?700:400,color:theme===k?T.accent:T.text}}>{v.name}</span>
                    {theme===k && <span style={{marginLeft:"auto",color:T.accent,fontSize:12}}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🔔 Privacy & Visibility</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600}}>Invisible Mode</div>
                  <div style={{fontSize:12,color:T.sub}}>Study time still counts, but you appear offline</div>
                </div>
                <button onClick={()=>setInvisible(v=>!v)} style={{...css.btn, padding:"6px 14px", fontSize:12, background: invisible?"#cc2222":T.accent}}>
                  {invisible ? "👻 ON" : "🟢 OFF"}
                </button>
              </div>
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:4}}>🎵 Ambient Sounds</div>
              <div style={{fontSize:12,color:T.sub,marginBottom:12}}>Royalty-free sounds to help you focus</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {[{name:"🌧 Rain",id:"rain"},{name:"🔥 Fireplace",id:"fire"},{name:"🎵 Lo-fi",id:"lofi"},{name:"🌊 Ocean",id:"ocean"},{name:"☕ Café",id:"cafe"}].map(s => (
                  <button key={s.id} onClick={()=>setActiveSound(activeSound===s.id?null:s.id)}
                    style={{...css.btnOutline,fontSize:12,padding:"6px 14px",borderColor:activeSound===s.id?T.accent:T.border,color:activeSound===s.id?T.accent:T.sub}}>
                    {s.name} {activeSound===s.id?"▶":""} 
                  </button>
                ))}
              </div>
              {activeSound && <div style={{fontSize:11,color:T.accent,marginTop:8}}>▶ Playing: {activeSound} (simulated — connect audio API for real sounds)</div>}
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:4}}>🏗️ About StudyGrove</div>
              <div style={{fontSize:12,color:T.sub}}>v1.0 · Built for BAC 2026 warriors and beyond.</div>
              <div style={{fontSize:11,color:T.border,marginTop:8,fontStyle:"italic"}}>
                "Alone you go fast. Together you go far." · Click the 📖 logo 5 times for a secret...
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        select option { background: ${T.card}; color: ${T.text}; }
      `}</style>
    </div>
  );
}
