import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cifpwjdhfiyidvympecs.supabase.co";
const SUPABASE_KEY = "sb_publishable_HvSxWwjvK_zgI-PvQS4SyA_dCUUZJc9";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEFAULT_SUBJECTS = ["Math","Physics","Chemistry","SVT","French","English","Arabic","Philosophy","Informatics"];

const THEMES = {
  amoled:   { name:"AMOLED Black",   bg:"#000000", surface:"#0a0a0a", card:"#111111", border:"#222222", text:"#ffffff", sub:"#888888", accent:"#6ee7b7", accent2:"#34d399" },
  white:    { name:"Clean White",    bg:"#f8f9fa", surface:"#ffffff", card:"#f0f0f0", border:"#e0e0e0", text:"#111111", sub:"#666666", accent:"#2563eb", accent2:"#1d4ed8" },
  red:      { name:"Deep Red",       bg:"#0d0000", surface:"#150000", card:"#1f0000", border:"#3d0000", text:"#fff0f0", sub:"#ff6b6b", accent:"#ff2222", accent2:"#cc0000" },
  pink:     { name:"Soft Pink 🌸",   bg:"#1a0010", surface:"#220018", card:"#2e0020", border:"#5c1040", text:"#ffe4f0", sub:"#ff8cbf", accent:"#ff69b4", accent2:"#ff1493" },
  forest:   { name:"Forest Green",   bg:"#020d05", surface:"#041508", card:"#071e0d", border:"#0e3a1a", text:"#e8f5e9", sub:"#81c784", accent:"#4caf50", accent2:"#2e7d32" },
  night:    { name:"Night Study",    bg:"#05050f", surface:"#0a0a1a", card:"#10102a", border:"#1a1a3a", text:"#ccd6f6", sub:"#8892b0", accent:"#64ffda", accent2:"#00bcd4" },
  sunset:   { name:"Sunset Orange",  bg:"#0d0500", surface:"#180900", card:"#221200", border:"#442200", text:"#fff3e0", sub:"#ffb74d", accent:"#ff6d00", accent2:"#e65100" },
  lavender: { name:"Lavender Dream", bg:"#0d0015", surface:"#160020", card:"#1e002e", border:"#3d0066", text:"#f3e5f5", sub:"#ce93d8", accent:"#ab47bc", accent2:"#7b1fa2" },
};

const ACHIEVEMENTS = [
  { id:"first_step",       icon:"🌱", name:"First Step",            desc:"Complete your first study session",   secret:false },
  { id:"apprentice",       icon:"📚", name:"Apprentice",            desc:"Study 10 hours total",                secret:false },
  { id:"dedicated",        icon:"🎯", name:"Dedicated",             desc:"Study 25 hours total",                secret:false },
  { id:"academic_weapon",  icon:"⚔️", name:"Academic Weapon",       desc:"Study 100 hours total",               secret:false },
  { id:"streak_3",         icon:"🔥", name:"On Fire",               desc:"3-day study streak",                  secret:false },
  { id:"disciplined",      icon:"🧘", name:"Disciplined",           desc:"7-day study streak",                  secret:false },
  { id:"iron_will",        icon:"🦾", name:"Iron Will",             desc:"30-day study streak",                 secret:false },
  { id:"champion",         icon:"🏆", name:"Champion",              desc:"Reach #1 on the leaderboard",         secret:false },
  { id:"task_slayer",      icon:"✅", name:"Task Slayer",           desc:"Complete 10 tasks",                   secret:false },
  { id:"task_master",      icon:"🗡️", name:"Task Master",          desc:"Complete 50 tasks",                   secret:false },
  { id:"pomodoro_warrior", icon:"🍅", name:"Pomodoro Warrior",      desc:"Complete 25 Pomodoro sessions",       secret:false },
  { id:"last_standing",    icon:"👑", name:"Last Student Standing", desc:"Win a Last Standing challenge",       secret:false },
  { id:"multi_subject",    icon:"🎓", name:"Polymath",              desc:"Study 5 different subjects",          secret:false },
  { id:"social",           icon:"👥", name:"Study Buddy",           desc:"Join your first group",               secret:false },
  { id:"focus_mode",       icon:"🔭", name:"Zone In",               desc:"Use focus mode 5 times",              secret:false },
  { id:"customizer",       icon:"🎨", name:"Interior Designer",     desc:"Try all 8 themes",                    secret:false },
  { id:"week_warrior",     icon:"📅", name:"Week Warrior",          desc:"Study every day for a week",          secret:false },
  { id:"night_owl",        icon:"🦉", name:"Night Owl",             desc:"Start a session after midnight",      secret:false },
  { id:"early_bird",       icon:"🐦", name:"Early Bird",            desc:"Start a session before 7am",          secret:false },
  { id:"ghost_student",    icon:"👻", name:"Ghost Student",         desc:"Study 3h while invisible",            secret:true  },
  { id:"perfectionist",    icon:"💎", name:"Perfectionist",         desc:"Study 7 days without chatting",       secret:true  },
  { id:"architect",        icon:"🏗️", name:"The Architect",        desc:"Discover the hidden easter egg",      secret:true  },
  { id:"streak_7",         icon:"🔥", name:"Week Warrior",          desc:"7-day study streak",                  secret:false },
  { id:"streak_14",        icon:"🟠", name:"Two Week Grind",        desc:"14-day study streak",                 secret:false },
  { id:"streak_90",        icon:"🔴", name:"Centurion",             desc:"90-day study streak",                 secret:false },
  { id:"streak_180",       icon:"💜", name:"Half Year Legend",      desc:"180-day study streak",                secret:false },
  { id:"streak_365",       icon:"💙", name:"Year of Discipline",    desc:"365-day study streak",                secret:false },
];




const getStreakFlame = (streak) => {
  if (streak >= 365) return { icon:"🔥", label:"Legendary",  color:"#4fc3f7", size:1.6 };
  if (streak >= 180) return { icon:"🔥", label:"Elite",      color:"#ce93d8", size:1.5 };
  if (streak >= 90)  return { icon:"🔥", label:"Veteran",    color:"#ff1744", size:1.4 };
  if (streak >= 30)  return { icon:"🔥", label:"Iron Will",  color:"#ff6d00", size:1.3 };
  if (streak >= 14)  return { icon:"🔥", label:"Rising",     color:"#ff9100", size:1.2 };
  if (streak >= 7)   return { icon:"🔥", label:"Warming Up", color:"#ffd600", size:1.1 };
  if (streak >= 3)   return { icon:"🔥", label:"Started",    color:"#ffb300", size:1.0 };
  return                    { icon:"🔥", label:"Starter",    color:"#555555", size:0.9 };
};
const fmtTime = (s) => {
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
  if(h>0)return `${h}h ${String(m).padStart(2,"0")}m`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
};
const fmtMins = (m) => {
  if(!m||m<=0)return "0m";
  if(m<60)return `${Math.round(m)}m`;
  return `${Math.floor(m/60)}h${m%60>0?" "+Math.round(m%60)+"m":""}`;
};
const genCode = () => Math.random().toString(36).substring(2,8).toUpperCase();

const QUOTES = {
  default: [
    "Small steps every day lead to big results.",
    "The expert was once a beginner.",
    "Study hard now, flex later.",
    "Discipline beats motivation every time.",
    "Your future self is watching. Don't let them down.",
    "One session at a time.",
  ],
  Math: ["Math is not about numbers, it's about understanding.", "Every problem has a solution — find it.", "Practice makes permanent."],
  Physics: ["Physics is the poetry of nature.", "Understand the 'why', not just the 'what'.", "Newton had an apple. You have StudyGrove."],
  Chemistry: ["Chemistry is everywhere — even in your focus.", "Balance the equation, balance your effort.", "Reactions happen when you put in the energy."],
  SVT: ["Life is complex — understand it deeply.", "Biology is the science of possibilities.", "Every cell in your body is rooting for you."],
  French: ["La pratique fait la perfection.", "Every language opens a new world.", "Consistency is the key to fluency."],
  English: ["Words are your most powerful tool.", "Read more. Write more. Know more.", "Language learning is a marathon, not a sprint."],
  Arabic: ["العلم نور — Knowledge is light.", "تعلم كل يوم شيئًا جديدًا.", "الصبر مفتاح الفرج."],
  Philosophy: ["The unexamined life is not worth living.", "Question everything — that's where wisdom starts.", "Think deeply. Act wisely."],
  Informatics: ["Code is just logic made visible.", "Every bug is a lesson in disguise.", "Debug your mind, then your code."],
};

// ── FRAMES ───────────────────────────────────────────────────────────────────
const FRAMES = {
  // Free
  sprout:    { id:"sprout",    name:"Sprout",    premium:false, colors:["#1b5e20","#4caf50","#a5d6a7","#4caf50","#1b5e20"], anim:"none",      particles:null },
  flame:     { id:"flame",     name:"Flame",     premium:false, colors:["#bf360c","#ff6d00","#ffcc02","#ff6d00","#bf360c"], anim:"pulse",     particles:null },
  champion:  { id:"champion",  name:"Champion",  premium:false, colors:["#7f5f00","#ffd600","#fffde7","#ffd600","#7f5f00"], anim:"shimmer",   particles:"stars" },
  nightowl:  { id:"nightowl",  name:"Night Owl", premium:false, colors:["#311b92","#7c4dff","#d1c4e9","#7c4dff","#311b92"], anim:"none",      particles:null },
  diamond:   { id:"diamond",   name:"Diamond",   premium:false, colors:["#004d60","#00e5ff","#ffffff","#00e5ff","#004d60"], anim:"sparkle",   particles:"sparks" },
  scholar:   { id:"scholar",   name:"Scholar",   premium:false, colors:["#0a2a6e","#1565c0","#90caf9","#1565c0","#0a2a6e"], anim:"breathe",  particles:"books" },
  warrior:   { id:"warrior",   name:"Warrior",   premium:false, colors:["#7f0000","#d50000","#ff6d6d","#d50000","#7f0000"], anim:"heartbeat", particles:"sparks" },
  // Pro
  aurora:    { id:"aurora",    name:"Aurora",    premium:true,  colors:["#00bcd4","#7c4dff","#f48fb1","#00e5ff","#00bcd4"], anim:"rotate",    particles:null },
  inferno:   { id:"inferno",   name:"Inferno",   premium:true,  colors:["#7f0000","#ff1744","#ff6d00","#ff1744","#7f0000"], anim:"fastpulse", particles:null },
  lightning: { id:"lightning", name:"Lightning", premium:true,  colors:["#e65100","#ffea00","#ffffff","#ffea00","#e65100"], anim:"flash",     particles:"lightning" },
  ocean:     { id:"ocean",     name:"Ocean",     premium:true,  colors:["#01579b","#0091ea","#b3e5fc","#0091ea","#01579b"], anim:"wave",      particles:"bubbles" },
  sakura:    { id:"sakura",    name:"Sakura",    premium:true,  colors:["#880e4f","#f06292","#fce4ec","#f06292","#880e4f"], anim:"pulse",     particles:"petals" },
  glitch:    { id:"glitch",    name:"Glitch",    premium:true,  colors:["#1b5e20","#76ff03","#ccff90","#76ff03","#1b5e20"], anim:"glitch",    particles:"glitch" },
};

const frameGrad = (f) =>
  `linear-gradient(135deg,${f.colors.join(",")})`;

const PARTICLE_SETS = {
  stars:     [{c:"★",col:"#ffd700"},{c:"✦",col:"#fffacd"},{c:"★",col:"#ffeb3b"},{c:"✦",col:"#fff176"},{c:"★",col:"#ffd700"},{c:"✦",col:"#ffe57f"}],
  sparks:    [{c:"✦",col:"#ffffff"},{c:"·",col:"#e0f7fa"},{c:"✦",col:"#b2ebf2"},{c:"·",col:"#ffffff"},{c:"✦",col:"#e0f7fa"},{c:"·",col:"#fff"}],
  books:     [{c:"📖",col:"#42a5f5"},{c:"✏️",col:"#90caf9"},{c:"📚",col:"#64b5f6"},{c:"⭐",col:"#fff"},{c:"📖",col:"#42a5f5"}],
  lightning: [{c:"⚡",col:"#ffea00"},{c:"✦",col:"#fff"},{c:"⚡",col:"#fff176"},{c:"✦",col:"#ffea00"},{c:"⚡",col:"#ffffff"},{c:"⚡",col:"#ffe57f"},{c:"✦",col:"#ffff00"},{c:"⚡",col:"#fff"}],
  bubbles:   [{c:"○",col:"#80d8ff"},{c:"◌",col:"#b3e5fc"},{c:"○",col:"#ffffff"},{c:"◌",col:"#80d8ff"},{c:"○",col:"#e1f5fe"},{c:"◌",col:"#fff"}],
  petals:    [{c:"🌸",col:"#f48fb1"},{c:"✿",col:"#fce4ec"},{c:"🌸",col:"#f06292"},{c:"✿",col:"#ff80ab"},{c:"🌸",col:"#fce4ec"},{c:"🌺",col:"#f48fb1"},{c:"✾",col:"#ffb3c6"},{c:"🌸",col:"#ff80ab"}],
  glitch:    [{c:"▪",col:"#76ff03"},{c:"▫",col:"#00ff00"},{c:"▪",col:"#ccff90"},{c:"░",col:"#76ff03"},{c:"▪",col:"#fff"},{c:"▓",col:"#76ff03"},{c:"░",col:"#00e676"},{c:"▪",col:"#b2ff59"},{c:"▓",col:"#fff"}],
};

const FrameParticles = ({ size, ptype }) => {
  const set = PARTICLE_SETS[ptype] || [];
  const count = set.length;
  return (
    <>
      {set.map((p, i) => {
        const dur = 3.5 + i * 0.35;
        return (
          <div key={i} style={{
            position:"absolute", inset:0,
            borderRadius:"50%",
            pointerEvents:"none",
            animation:`fpSpin ${dur}s infinite linear`,
            animationDelay:`-${(dur/count)*i}s`,
            zIndex:10,
          }}>
            <div style={{
              position:"absolute",
              top:"50%", left:"50%",
              transform:`rotate(${(360/count)*i}deg) translateY(-${size*0.47}px)`,
              fontSize: size * 0.19,
              lineHeight:1,
              color: p.col,
              filter:"drop-shadow(0 0 3px currentColor)",
              marginTop: -(size*0.1),
              marginLeft: -(size*0.1),
            }}>{p.c}</div>
          </div>
        );
      })}
    </>
  );
};

const FramedAvatar = ({ size=40, avatarUrl, username, frameId, unlockedFrames, isPro, accentColor }) => {
  const frame  = frameId && frameId !== "none" ? FRAMES[frameId] : null;
  const owned  = frame && (unlockedFrames.includes(frameId) || (frame.premium && isPro));
  const ring   = Math.max(4, size * 0.13); // ring thickness
  const gap    = Math.max(2, size * 0.04); // dark gap between ring and avatar
  const inner  = size - (ring + gap) * 2;

  const animName = owned && frame ? {
    pulse:     "faPulse",
    shimmer:   "faShimmer",
    sparkle:   "faSparkle",
    breathe:   "faBreathe",
    heartbeat: "faHeartbeat",
    rotate:    "faRotate",
    fastpulse: "faFastPulse",
    flash:     "faFlash",
    wave:      "faWave",
    glitch:    "faGlitch",
  }[frame.anim] || "" : "";

  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      {/* Ring */}
      {owned && (
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          background: frameGrad(frame),
          animation: animName ? (()=>{const dur=frame.anim==="glitch"?"0.15s":frame.anim==="fastpulse"?"0.6s":frame.anim==="flash"?"0.4s":frame.anim==="heartbeat"?"0.9s":frame.anim==="shimmer"?"2.5s":frame.anim==="sparkle"?"1.8s":"2s";const timing=frame.anim==="spin"||frame.anim==="rotate"?"linear":"ease-in-out";return `${animName} ${dur} infinite ${timing}`;})() : "none",
        }}/>
      )}
      {/* Dark gap */}
      {owned && (
        <div style={{
          position:"absolute",
          inset: ring,
          borderRadius:"50%",
          background:"rgba(0,0,0,0.55)",
        }}/>
      )}
      {/* Avatar */}
      <div style={{
        position:"absolute",
        inset: owned ? ring + gap : 0,
        borderRadius:"50%",
        background: accentColor || "#00e676",
        overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontWeight:900, fontSize: inner * 0.42, color:"#000",
      }}>
        {avatarUrl
          ? <img src={avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="pfp"/>
          : <span>{(username||"?")[0].toUpperCase()}</span>
        }
      </div>
      {owned && frame?.particles && size >= 56 && (
        <FrameParticles size={size} ptype={frame.particles}/>
      )}
    </div>
  );
};

// Inject frame keyframes once
if (typeof document !== "undefined" && !document.getElementById("sg-frame-kf")) {
  const s = document.createElement("style");
  s.id = "sg-frame-kf";
  s.textContent = `
    @keyframes faPulse     { 0%,100%{filter:brightness(1) opacity(0.95)} 50%{filter:brightness(1.6) opacity(1)} }
    @keyframes faShimmer   { 0%{filter:brightness(0.9) contrast(1.1)} 50%{filter:brightness(1.8) contrast(1.4) hue-rotate(15deg)} 100%{filter:brightness(0.9) contrast(1.1)} }
    @keyframes faRotate    { 0%{filter:hue-rotate(0deg) brightness(1.1)} 100%{filter:hue-rotate(360deg) brightness(1.1)} }
    @keyframes faFastPulse { 0%,100%{filter:brightness(1)}   50%{filter:brightness(2.2) saturate(1.5)} }
    @keyframes faFlash     { 0%{filter:brightness(1)  saturate(1)}   40%{filter:brightness(4) saturate(3)} 100%{filter:brightness(1) saturate(1)} }
    @keyframes faWave      { 0%,100%{filter:brightness(1)   hue-rotate(0deg)} 50%{filter:brightness(1.4) hue-rotate(25deg)} }
    @keyframes faGlitch    { 0%{filter:hue-rotate(0deg)   saturate(4) brightness(1.2)} 33%{filter:hue-rotate(90deg)  saturate(6) brightness(1.8)} 66%{filter:hue-rotate(180deg) saturate(4) brightness(1.2)} 100%{filter:hue-rotate(270deg) saturate(6) brightness(1.8)} }
    @keyframes fpSpin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  `;
  document.head.appendChild(s);
}
// ──────────────────────────────────────────────────────────────────────────────

export default function StudyGrove() {
  const [theme, setTheme] = useState(()=>localStorage.getItem("sg_theme")||"amoled");
  const T = THEMES[theme];

  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authScreen, setAuthScreen] = useState("login"); // login|register|otp|forgot|forgot_sent|reset_password
  const [newPassword, setNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loginForm, setLoginForm] = useState({email:"",password:""});
  const [regForm, setRegForm] = useState({username:"",email:"",password:""});
  const [otpCode, setOtpCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(()=>typeof window!=="undefined"&&window.innerWidth<=600);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(()=>{
    const on=()=>setIsOnline(true);
    const off=()=>setIsOnline(false);
    window.addEventListener("online",on);
    window.addEventListener("offline",off);
    return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const ONBOARDING_STEPS=[
    {emoji:"👋",title:`Welcome to StudyGrove${profile?.username?", "+profile.username:""}!`,desc:"Your personal study companion. Track your time, compete with friends, and build habits that last. Let's show you around real quick.",tip:null},
    {emoji:"⏱",title:"The Study Timer",desc:"Hit Start Studying to begin a session. Pick your subject, use Pomodoro for focused 25-min bursts, or go Focus Mode for zero distractions.",tip:"💡 Sessions under 25 minutes don't count toward your streak — so commit!"},
    {emoji:"👥",title:"Groups & Friends",desc:"Create a group and share the code with your friends. Study together in real-time, see who's online, and chat whenever you want.",tip:"💡 Go to the Social tab to add friends by code and start a group."},
    {emoji:"🔥",title:"Streaks & Leaderboard",desc:"Study at least 25 minutes every day to keep your streak alive. The longer your streak, the higher your flame level. Compete on the leaderboard weekly.",tip:"💡 You get 3 free streak revives per month if you miss a day."},
    {emoji:"🚀",title:"You're all set!",desc:"That's everything you need to know. Now stop reading and start studying — your streak isn't going to build itself.",tip:null},
  ];
  const obStep=ONBOARDING_STEPS[onboardingStep]||ONBOARDING_STEPS[0];
  const obIsLast=onboardingStep===ONBOARDING_STEPS.length-1;
  const finishOnboarding=()=>{if(authUser)localStorage.setItem(`sg_onboarded_${authUser.id}`,"1");setShowOnboarding(false);};
  useEffect(()=>{
    const handler=()=>setIsMobile(window.innerWidth<=600);
    window.addEventListener("resize",handler);
    return()=>window.removeEventListener("resize",handler);
  },[]);

  const [tab, setTab] = useState("study");
  const [studying, setStudying] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [subjects, setSubjects] = useState([...DEFAULT_SUBJECTS]);
  const [newSubject, setNewSubject] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [invisible, setInvisible] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [pomodoroSecs, setPomodoroSecs] = useState(25*60);
  const [pomodorosToday, setPomodorosToday] = useState(0);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [easterClicks, setEasterClicks] = useState(0);
  const [friendNotif, setFriendNotif] = useState(null);

  const [stats, setStats] = useState({total_minutes:0,today_minutes:0,weekly_minutes:0,streak:0,total_sessions:0,pomodoros_total:0,tasks_completed:0,subject_minutes:{},achievements:[],invisible_minutes:0,night_sessions:0,early_sessions:0,groups_joined:0,focus_uses:0,themes_used:1,challenge_wins:0});
  const [isPro] = useState(false); // set to true when payment confirmed
  const [selectedFrame, setSelectedFrame] = useState(()=>localStorage.getItem("sg_frame")||"none");
  const [profileTitle, setProfileTitle] = useState(()=>localStorage.getItem("sg_title")||"");
  const [currentQuote, setCurrentQuote] = useState("");
  const [showProModal, setShowProModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("Math");
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendSearchResult, setFriendSearchResult] = useState(null);
  const [friendSearchError, setFriendSearchError] = useState("");
  const [friendSearchLoading, setFriendSearchLoading] = useState(false);
  const [unlockedFrames, setUnlockedFrames] = useState(()=>{ try{return JSON.parse(localStorage.getItem("sg_unlocked_frames")||"[]");}catch{return [];} });
  const [quoteTimer, setQuoteTimer] = useState(null);
  const [devCheatUsed, setDevCheatUsed] = useState(()=>localStorage.getItem("sg_dev_cheat")==="true");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [nicknames, setNicknames] = useState(() => { try { return JSON.parse(localStorage.getItem("sg_nicknames")||"{}"); } catch { return {}; } });
  const [editingNickname, setEditingNickname] = useState(null);
  const [nicknameInput, setNicknameInput] = useState("");
  const [mutedGroups, setMutedGroups] = useState(() => { try { return JSON.parse(localStorage.getItem("sg_muted_groups")||"{}"); } catch { return {}; } });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem("sg_notifs") !== "false");
  const [inAppNotif, setInAppNotif] = useState(null);
  const [activeDM, setActiveDM] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [dmInput, setDmInput] = useState("");
  const [mutedDMs, setMutedDMs] = useState(() => { try { return JSON.parse(localStorage.getItem("sg_muted_dms")||"{}"); } catch { return {}; } });
  const [unreadDMs, setUnreadDMs] = useState({});
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardFrame, setLeaderboardFrame] = useState("weekly");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupAction, setGroupAction] = useState("join");
  const [groupCode, setGroupCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [groupError, setGroupError] = useState("");
  const [onlineMembers, setOnlineMembers] = useState([]);

  const timerRef = useRef(null);
  const pomRef = useRef(null);
  const chatBottomRef = useRef(null);
  const channelRef = useRef(null);
  const dmChannelRef = useRef(null);

  useEffect(()=>{
    const isOffline = !navigator.onLine;

    supabase.auth.getSession().then(({data:{session}})=>{
      if(session){
        // Save session to localStorage for offline use
        localStorage.setItem("sg_cached_session", JSON.stringify(session));
        setAuthUser(session.user);
      } else if(isOffline) {
        // Offline and no server session — try cached session
        try{
          const cached = localStorage.getItem("sg_cached_session");
          if(cached){
            const s = JSON.parse(cached);
            if(s?.user) setAuthUser(s.user);
          }
        }catch(e){}
      } else {
        setAuthUser(null);
        localStorage.removeItem("sg_cached_session");
      }
      setAuthLoading(false);
    }).catch(()=>{
      // Network error — fall back to cached session
      try{
        const cached = localStorage.getItem("sg_cached_session");
        if(cached){
          const s = JSON.parse(cached);
          if(s?.user) setAuthUser(s.user);
        }
      }catch(e){}
      setAuthLoading(false);
    });

    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      setAuthUser(session?.user??null);
      if(session) localStorage.setItem("sg_cached_session", JSON.stringify(session));
      if(event==="SIGNED_OUT") localStorage.removeItem("sg_cached_session");
      if(event==="PASSWORD_RECOVERY") setAuthScreen("reset_password");
    });
    // Also catch token in URL hash on first load
    const hash=window.location.hash;
    if(hash.includes("type=recovery")||hash.includes("type=email")){
      setAuthScreen("reset_password");
    }
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!authUser){setProfile(null);return;}
    loadProfile();
    if(navigator.onLine){
      loadTasks();
      loadGroup();
      loadFriends();
    } else {
      // Load cached tasks
      try{
        const t=localStorage.getItem(`sg_cached_tasks_${authUser.id}`);
        if(t)setTasks(JSON.parse(t));
      }catch(e){}
    }
  },[authUser]);

  const loadProfile=async()=>{
    const isOffline = !navigator.onLine;
    if(isOffline){
      // Use cached profile
      try{
        const cached = localStorage.getItem(`sg_cached_profile_${authUser.id}`);
        if(cached){
          const data = JSON.parse(cached);
          setProfile(data);
          if(data.stats)setStats(data.stats);
          if(data.subjects)setSubjects(data.subjects);
          if(data.stats)checkFrameUnlocks(data.stats);
          if(data.avatar_url)setAvatarUrl(data.avatar_url);
        }
      }catch(e){}
      return;
    }
    const{data}=await supabase.from("profiles").select("*").eq("id",authUser.id).single();
    if(data){
      // Cache for offline
      localStorage.setItem(`sg_cached_profile_${authUser.id}`, JSON.stringify(data));
      setProfile(data);
      // Use fake stats if active, otherwise real
      const fakeStats=localStorage.getItem("sg_fake_stats");
      if(fakeStats){try{setStats(JSON.parse(fakeStats));}catch(e){if(data.stats)setStats(data.stats);}}
      else if(data.stats)setStats(data.stats);
      if(data.subjects)setSubjects(data.subjects);
      if(data.stats)checkFrameUnlocks(data.stats);
      if(data.avatar_url)setAvatarUrl(data.avatar_url);
      // Show onboarding if first time
      const key=`sg_onboarded_${data.id}`;
      if(!localStorage.getItem(key)){
        setShowOnboarding(true);
        setOnboardingStep(0);
      }
    }
  };

  const uploadPfp=async(file)=>{
    if(!file||!authUser)return;
    setUploadingPfp(true);
    try{
      const reader=new FileReader();
      reader.onload=async(e)=>{
        const base64=e.target.result;
        setAvatarUrl(base64);
        await supabase.from("profiles").update({avatar_url:base64,updated_at:new Date().toISOString()}).eq("id",authUser.id);
        setUploadingPfp(false);
      };
      reader.readAsDataURL(file);
    }catch(err){setUploadingPfp(false);}
  };

  const saveStats=async(newStats)=>{
    if(!authUser||!newStats||typeof newStats.streak==="undefined")return;
    if((newStats.streak||0)===0 && (stats.streak||0)>0 && !newStats.last_study_date) return;
    setStats(newStats);
    try{
      const cached=localStorage.getItem(`sg_cached_profile_${authUser.id}`);
      if(cached){const p=JSON.parse(cached);localStorage.setItem(`sg_cached_profile_${authUser.id}`,JSON.stringify({...p,stats:newStats}));}
    }catch(e){}
    if(!navigator.onLine)return;
    await supabase.from("profiles").update({stats:newStats,updated_at:new Date().toISOString()}).eq("id",authUser.id);
    checkFrameUnlocks(newStats);
  };

  const checkFrameUnlocks=(ns)=>{
    const ach=ns.achievements||[];
    const frames=[...unlockedFrames];
    let changed=false;
    if(ach.includes("first_step")&&!frames.includes("sprout")){frames.push("sprout");changed=true;}
    if((ns.streak||0)>=7&&!frames.includes("flame")){frames.push("flame");changed=true;}
    if(ach.includes("night_owl")&&!frames.includes("nightowl")){frames.push("nightowl");changed=true;}
    if(ach.includes("perfectionist")&&!frames.includes("diamond")){frames.push("diamond");changed=true;}
    if(ach.includes("multi_subject")&&!frames.includes("scholar")){frames.push("scholar");changed=true;}
    if(ach.includes("academic_weapon")&&!frames.includes("warrior")){frames.push("warrior");changed=true;}
    if(changed){
      setUnlockedFrames(frames);
      localStorage.setItem("sg_unlocked_frames",JSON.stringify(frames));
    }
  };

  const rotateQuote=(subject)=>{
    const pool=[...(QUOTES[subject]||[]),...QUOTES.default];
    const q=pool[Math.floor(Math.random()*pool.length)];
    setCurrentQuote(q);
  };

  const loadTasks=async()=>{
    const{data}=await supabase.from("tasks").select("*").eq("user_id",authUser.id).order("created_at",{ascending:false});
    if(data){
      setTasks(data);
      localStorage.setItem(`sg_cached_tasks_${authUser.id}`,JSON.stringify(data));
    }
  };

  const loadGroup=async()=>{
    const{data:mem}=await supabase.from("group_members").select("group_id").eq("user_id",authUser.id).maybeSingle();
    if(!mem)return;
    const{data:grp}=await supabase.from("groups").select("*").eq("id",mem.group_id).single();
    if(grp){setGroup(grp);loadGroupMembers(grp.id);loadMessages(grp.id);subscribeGroup(grp.id);}
  };

  const loadGroupMembers=async(gid)=>{
    const{data}=await supabase.from("group_members").select("profiles(*)").eq("group_id",gid);
    const members=(data||[]).map(m=>m.profiles).filter(Boolean);
    setGroupMembers(members);
    setLeaderboard([...members].sort((a,b)=>(b.stats?.weekly_minutes||0)-(a.stats?.weekly_minutes||0)));
  };

  const loadMessages=async(gid)=>{
    const{data}=await supabase.from("messages").select("*").eq("group_id",gid).order("created_at",{ascending:true}).limit(100);
    if(data)setMessages(data);
    setTimeout(()=>chatBottomRef.current?.scrollIntoView({behavior:"smooth"}),100);
  };

  const subscribeGroup=(gid)=>{
    if(channelRef.current)supabase.removeChannel(channelRef.current);
    const ch=supabase.channel(`grp-${gid}`,{
      config:{
        broadcast:{self:false},
        presence:{key:authUser.id}
      }
    });
    // Real-time messages
    ch.on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`group_id=eq.${gid}`},p=>{
      setMessages(prev=>{
        if(prev.find(m=>m.id===p.new.id))return prev; // dedupe
        return [...prev,p.new];
      });
      setTimeout(()=>chatBottomRef.current?.scrollIntoView({behavior:"smooth"}),100);
      // In-app notification
      if(p.new.user_id!==authUser?.id&&notificationsEnabled&&!isGroupMuted(gid)){
        setInAppNotif({text:p.new.text,username:p.new.username,type:"group"});
        setTimeout(()=>setInAppNotif(null),4000);
      }
    });
    // Presence
    ch.on("presence",{event:"sync"},()=>{
      const state=ch.presenceState();
      setOnlineMembers(Object.values(state).flat());
    });
    ch.subscribe(async(s)=>{
      if(s==="SUBSCRIBED"){
        await ch.track({user_id:authUser.id,username:profile?.username||"...",status:"online",subject:selectedSubject});
      }
    });
    channelRef.current=ch;
  };

  useEffect(()=>{
    if(!channelRef.current||!profile)return;
    channelRef.current.track({user_id:authUser?.id,username:profile?.username,status:studying?(invisible?"invisible":"studying"):"online",subject:selectedSubject});
  },[studying,invisible,selectedSubject,profile]);

  useEffect(()=>{
    if(studying){
      timerRef.current=setInterval(()=>setSessionSecs(s=>s+1),1000);
      if(isPro){
        rotateQuote(selectedSubject);
        const qt=setInterval(()=>rotateQuote(selectedSubject),60000);
        setQuoteTimer(qt);
      }
    }else{
      clearInterval(timerRef.current);
      if(quoteTimer){clearInterval(quoteTimer);setQuoteTimer(null);}
      setCurrentQuote("");
    }
    return()=>{clearInterval(timerRef.current);};
  },[studying]);

  useEffect(()=>{
    if(studying&&pomodoroMode){
      pomRef.current=setInterval(()=>setPomodoroSecs(s=>{if(s<=1){setPomodorosToday(p=>p+1);return 25*60;}return s-1;}),1000);
    }else clearInterval(pomRef.current);
    return()=>clearInterval(pomRef.current);
  },[studying,pomodoroMode]);

  const unlockAchievement=(id,current)=>{
    if((current||[]).includes(id))return current;
    const next=[...(current||[]),id];
    const a=ACHIEVEMENTS.find(x=>x.id===id);
    if(a){setNewAchievement(a);setTimeout(()=>setNewAchievement(null),4000);}
    return next;
  };

  const startStop=async()=>{
    if(!studying){
      setStudying(true);
      if(pomodoroMode)setPomodoroSecs(25*60);
      const h=new Date().getHours();
      const ns={...stats};
      if(h>=0&&h<5)ns.night_sessions=(ns.night_sessions||0)+1;
      if(h<7)ns.early_sessions=(ns.early_sessions||0)+1;
      let ach=ns.achievements||[];
      if((ns.night_sessions||0)>=1)ach=unlockAchievement("night_owl",ach);
      if((ns.early_sessions||0)>=1)ach=unlockAchievement("early_bird",ach);
      ns.achievements=ach;
      await saveStats(ns);
    }else{
      setStudying(false);
      const mins=Math.floor(sessionSecs/60);
      if(mins>0){
        let nsBase={...stats,
          total_minutes:(stats.total_minutes||0)+mins,
          today_minutes:(stats.today_minutes||0)+mins,
          weekly_minutes:(stats.weekly_minutes||0)+mins,
          total_sessions:(stats.total_sessions||0)+1,
          sessions_count:(stats.sessions_count||0)+1,
          longest_session:Math.max(stats.longest_session||0, mins),
          subject_minutes:{...(stats.subject_minutes||{}),[selectedSubject]:((stats.subject_minutes||{})[selectedSubject]||0)+mins},
          invisible_minutes:invisible?(stats.invisible_minutes||0)+mins:(stats.invisible_minutes||0),
        };
        const ns = await updateStreak(nsBase, mins);
        let ach=ns.achievements||[];
        if(ns.total_sessions>=1)ach=unlockAchievement("first_step",ach);
        if(ns.total_minutes>=600)ach=unlockAchievement("apprentice",ach);
        if(ns.total_minutes>=1500)ach=unlockAchievement("dedicated",ach);
        if(ns.total_minutes>=6000)ach=unlockAchievement("academic_weapon",ach);
        if(ns.invisible_minutes>=180)ach=unlockAchievement("ghost_student",ach);
        if(Object.keys(ns.subject_minutes||{}).length>=5)ach=unlockAchievement("multi_subject",ach);
        if((ns.streak||0)>=3)ach=unlockAchievement("streak_3",ach);
        if((ns.streak||0)>=7)ach=unlockAchievement("disciplined",ach);
        if((ns.streak||0)>=7)ach=unlockAchievement("streak_7",ach);
        if((ns.streak||0)>=14)ach=unlockAchievement("streak_14",ach);
        if((ns.streak||0)>=30)ach=unlockAchievement("iron_will",ach);
        if((ns.streak||0)>=90)ach=unlockAchievement("streak_90",ach);
        if((ns.streak||0)>=180)ach=unlockAchievement("streak_180",ach);
        if((ns.streak||0)>=365)ach=unlockAchievement("streak_365",ach);
        if(ns.streak_revived) setNewAchievement({icon:"🛡️",name:"Streak Saved!",desc:`A revive was used automatically. ${getRevivesLeft()-1} revives left this month.`});
        ns.achievements=ach;
        await saveStats(ns);
      }
      setSessionSecs(0);
    }
  };

  const handleLogin=async()=>{
    setAuthError("");setAuthLoading(true);
    const{error}=await supabase.auth.signInWithPassword({email:loginForm.email,password:loginForm.password});
    if(error){setAuthError(error.message);setAuthLoading(false);return;}
    // Send OTP
    const{error:otpErr}=await supabase.auth.signInWithOtp({email:loginForm.email,options:{shouldCreateUser:false}});
    if(otpErr){setAuthError(otpErr.message);setAuthLoading(false);return;}
    setAuthScreen("otp");
    setAuthSuccess(`We sent a 6-digit code to ${loginForm.email}. Check your inbox!`);
    setAuthLoading(false);
  };

  const handleVerifyOtp=async()=>{
    setAuthError("");setAuthLoading(true);
    const{error}=await supabase.auth.verifyOtp({email:loginForm.email,token:otpCode,type:"email"});
    if(error){setAuthError("Wrong code. Check for typos and try again.");setAuthLoading(false);return;}
    setAuthLoading(false);
  };

  const handleForgotPassword=async()=>{
    setAuthError("");setAuthLoading(true);
    if(!forgotEmail.trim()){setAuthError("Enter your email address");setAuthLoading(false);return;}
    const{error}=await supabase.auth.resetPasswordForEmail(forgotEmail,{redirectTo:"https://studygrove-gilt.vercel.app"});
    if(error){setAuthError(error.message);setAuthLoading(false);return;}
    setAuthScreen("forgot_sent");
    setAuthLoading(false);
  };

  const handleRegister=async()=>{
    setAuthError("");
    if(!regForm.username.trim()){setAuthError("Username is required");return;}
    if(regForm.password.length<6){setAuthError("Password must be at least 6 characters");return;}
    setAuthLoading(true);
    const{data,error}=await supabase.auth.signUp({email:regForm.email,password:regForm.password});
    if(error){setAuthError(error.message);setAuthLoading(false);return;}
    if(data.user){
      const friendCode=Math.random().toString(36).substring(2,7).toUpperCase();
      await supabase.from("profiles").insert({id:data.user.id,username:regForm.username,email:regForm.email,friend_code:friendCode,stats:{total_minutes:0,today_minutes:0,weekly_minutes:0,streak:0,total_sessions:0,pomodoros_total:0,tasks_completed:0,subject_minutes:{},achievements:[],invisible_minutes:0,night_sessions:0,early_sessions:0,groups_joined:0},subjects:DEFAULT_SUBJECTS,created_at:new Date().toISOString()});
    }
    setAuthLoading(false);
  };

  const loadFriends=async()=>{
    const{data:sent}=await supabase.from("friendships").select("*, profiles!friendships_receiver_id_fkey(*)").eq("sender_id",authUser.id).eq("status","accepted");
    const{data:received}=await supabase.from("friendships").select("*, profiles!friendships_sender_id_fkey(*)").eq("receiver_id",authUser.id).eq("status","accepted");
    const{data:pending}=await supabase.from("friendships").select("*, profiles!friendships_sender_id_fkey(*)").eq("receiver_id",authUser.id).eq("status","pending");
    const sentFriends=(sent||[]).map(f=>f.profiles).filter(Boolean);
    const receivedFriends=(received||[]).map(f=>f.profiles).filter(Boolean);
    setFriends([...sentFriends,...receivedFriends]);
    setFriendRequests((pending||[]).map(f=>({...f.profiles,friendship_id:f.id})).filter(Boolean));
  };

  const searchFriend=async()=>{
    setFriendSearchError("");setFriendSearchResult(null);setFriendSearchLoading(true);

    if(friendSearch.toLowerCase()==="fakest1"){
      // Generate fake stats — stored separately, never touches real data
      const fakeHistory={};
      const fakeSubjects=["Math","Physics","Chemistry","SVT","English","French"];
      const fakeSubjectMins={};
      let fakeTotalMins=0;
      for(let i=0;i<60;i++){
        if(Math.random()>0.25){// 75% chance of studying on any day
          const d=new Date();d.setDate(d.getDate()-i);
          const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
          const mins=Math.floor(Math.random()*150)+30;// 30–180 mins
          fakeHistory[key]=mins;
          fakeTotalMins+=mins;
          const sub=fakeSubjects[Math.floor(Math.random()*fakeSubjects.length)];
          fakeSubjectMins[sub]=(fakeSubjectMins[sub]||0)+mins;
        }
      }
      const fakeStats={
        total_minutes:fakeTotalMins,
        today_minutes:fakeHistory[localDateStr()]||Math.floor(Math.random()*90)+30,
        weekly_minutes:Math.floor(fakeTotalMins*0.12),
        streak:Math.floor(Math.random()*21)+7,
        total_sessions:Math.floor(fakeTotalMins/45),
        sessions_count:Math.floor(fakeTotalMins/45),
        longest_session:Math.floor(Math.random()*60)+90,
        tasks_completed:Math.floor(Math.random()*40)+10,
        subject_minutes:fakeSubjectMins,
        study_history:fakeHistory,
        achievements:["first_step","apprentice","streak_3","disciplined","social","early_bird","multi_subject","task_slayer"],
      };
      localStorage.setItem("sg_fake_stats",JSON.stringify(fakeStats));
      setStats(fakeStats);
      setFriendSearch("");setFriendSearchLoading(false);
      setFriendSearchError("🎭 Fake stats loaded! Use fakest2 to restore your real stats.");
      return;
    }

    if(friendSearch.toLowerCase()==="fakest2"){
      localStorage.removeItem("sg_fake_stats");
      // Restore real stats from DB
      const{data}=await supabase.from("profiles").select("stats").eq("id",authUser.id).single();
      if(data?.stats)setStats(data.stats);
      setFriendSearch("");setFriendSearchLoading(false);
      setFriendSearchError("✅ Real stats restored!");
      return;
    }

    if(friendSearch.toLowerCase()==="toot06"){
      setOnboardingStep(0);
      setShowOnboarding(true);
      setFriendSearch("");setFriendSearchLoading(false);return;
    }

    // Dev cheat — unlock all free frames
    if(friendSearch==="12252006"){
      if(devCheatUsed){
        setFriendSearchError("bro you already took everything, what do you want, my kidneys too? 🫀");
        setFriendSearch("");setFriendSearchLoading(false);return;
      }
      const allFreeFrames=Object.values(FRAMES).filter(f=>!f.premium).map(f=>f.id);
      setUnlockedFrames(allFreeFrames);
      localStorage.setItem("sg_unlocked_frames",JSON.stringify(allFreeFrames));
      setDevCheatUsed(true);
      localStorage.setItem("sg_dev_cheat","true");
      setFriendSearch("");setFriendSearchLoading(false);
      setFriendSearchError("🎨 shhh... all free frames unlocked. act normal 🕵️");
      return;
    }

    // Dev cheat — unlock ALL frames including pro
    if(friendSearch==="25122006"){
      const allFrames=Object.values(FRAMES).map(f=>f.id);
      setUnlockedFrames(allFrames);
      localStorage.setItem("sg_unlocked_frames",JSON.stringify(allFrames));
      setFriendSearch("");setFriendSearchLoading(false);
      setFriendSearchError("👑 Pro frames unlocked. You didn't see anything. 🤫");
      return;
    }

    // Secret cheat code
    if(friendSearch.toLowerCase()==="streakdebug"){
      const{data}=await supabase.from("profiles").select("stats").eq("id",authUser.id).single();
      const s=data?.stats||{};
      setFriendSearchError(`🔍 DB streak: ${s.streak||0} | last_study_date: ${s.last_study_date||"never"} | today: ${localDateStr()}`);
      setFriendSearch("");setFriendSearchLoading(false);return;
    }

    const streakMatch = friendSearch.toLowerCase().match(/^streakcheat(\d{0,3})$/);
    if(streakMatch){
      const daysToAdd = Math.min(parseInt(streakMatch[1]||"1")||1, 365);
      let ns = {...stats};
      // Set last_study_date to yesterday so updateStreak counts today
      const yd=new Date();yd.setDate(yd.getDate()-1);
      const yesterday=`${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,"0")}-${String(yd.getDate()).padStart(2,"0")}`;
      ns.last_study_date = yesterday;
      ns.streak = Math.max((ns.streak||0) + daysToAdd - 1, 0);
      ns = await updateStreak(ns, 25);
      let ach=ns.achievements||[];
      if((ns.streak||0)>=3)ach=unlockAchievement("streak_3",ach);
      if((ns.streak||0)>=7)ach=unlockAchievement("streak_7",ach);
      if((ns.streak||0)>=14)ach=unlockAchievement("streak_14",ach);
      if((ns.streak||0)>=30)ach=unlockAchievement("iron_will",ach);
      if((ns.streak||0)>=90)ach=unlockAchievement("streak_90",ach);
      if((ns.streak||0)>=180)ach=unlockAchievement("streak_180",ach);
      if((ns.streak||0)>=365)ach=unlockAchievement("streak_365",ach);
      ns.achievements=ach;
      await saveStats(ns);
      setFriendSearch("");setFriendSearchLoading(false);
      setFriendSearchError(`🔥 Streak set to ${ns.streak} days!`);
      return;
    }

    if(!friendSearch.trim()){setFriendSearchError("Enter a friend code");setFriendSearchLoading(false);return;}
    const{data,error}=await supabase.from("profiles").select("*").eq("friend_code",friendSearch.toUpperCase()).single();
    if(error||!data){setFriendSearchError("No user found with that code. Check for typos.");setFriendSearchLoading(false);return;}
    if(data.id===authUser.id){setFriendSearchError("That's your own code!");setFriendSearchLoading(false);return;}
    setFriendSearchResult(data);setFriendSearchLoading(false);
  };

  const sendFriendRequest=async(receiverId)=>{
    const{error}=await supabase.from("friendships").insert({sender_id:authUser.id,receiver_id:receiverId,status:"pending",created_at:new Date().toISOString()});
    if(error&&error.code!=="23505"){setFriendSearchError(error.message);return;}
    setFriendSearchResult(null);setFriendSearch("");
    setFriendSearchError("");
    alert("Friend request sent!");
  };

  const acceptFriend=async(friendshipId)=>{
    await supabase.from("friendships").update({status:"accepted"}).eq("id",friendshipId);
    loadFriends();
  };

  const declineFriend=async(friendshipId)=>{
    await supabase.from("friendships").delete().eq("id",friendshipId);
    loadFriends();
  };

  const removeFriend=async(friendId)=>{
    await supabase.from("friendships").delete().or(`and(sender_id.eq.${authUser.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${authUser.id})`);
    loadFriends();
  };

  // Nickname helpers
  const saveNickname = (friendId, name) => {
    const updated = { ...nicknames, [friendId]: name };
    setNicknames(updated);
    localStorage.setItem("sg_nicknames", JSON.stringify(updated));
    setEditingNickname(null);
  };
  const removeNickname = (friendId) => {
    const updated = { ...nicknames };
    delete updated[friendId];
    setNicknames(updated);
    localStorage.setItem("sg_nicknames", JSON.stringify(updated));
  };
  const displayName = (friend) => nicknames[friend.id] || friend.username;

  // Mute helpers
  const muteGroup = (groupId, duration) => {
    const until = duration === "forever" ? "forever" : new Date(Date.now() + duration * 3600000).toISOString();
    const updated = { ...mutedGroups, [groupId]: until };
    setMutedGroups(updated);
    localStorage.setItem("sg_muted_groups", JSON.stringify(updated));
  };
  const unmuteGroup = (groupId) => {
    const updated = { ...mutedGroups };
    delete updated[groupId];
    setMutedGroups(updated);
    localStorage.setItem("sg_muted_groups", JSON.stringify(updated));
  };
  const isGroupMuted = (groupId) => {
    const until = mutedGroups[groupId];
    if (!until) return false;
    if (until === "forever") return true;
    return new Date(until) > new Date();
  };
  const muteDM = (friendId, duration) => {
    const until = duration === "forever" ? "forever" : new Date(Date.now() + duration * 3600000).toISOString();
    const updated = { ...mutedDMs, [friendId]: until };
    setMutedDMs(updated);
    localStorage.setItem("sg_muted_dms", JSON.stringify(updated));
  };
  const isDMMuted = (friendId) => {
    const until = mutedDMs[friendId];
    if (!until) return false;
    if (until === "forever") return true;
    return new Date(until) > new Date();
  };

  // DM functions
  const openDM = async (friend) => {
    setActiveDM(friend);
    setUnreadDMs(prev => ({ ...prev, [friend.id]: 0 }));
    const dmId = [authUser.id, friend.id].sort().join("_");
    const { data } = await supabase.from("direct_messages").select("*").eq("dm_id", dmId).order("created_at", { ascending: true }).limit(50);
    if (data) setDmMessages(data);
    // Subscribe to DM channel
    if (dmChannelRef.current) supabase.removeChannel(dmChannelRef.current);
    const ch = supabase.channel(`dm-${dmId}`);
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `dm_id=eq.${dmId}` }, p => {
      setDmMessages(prev => [...prev, p.new]);
    });
    ch.subscribe();
    dmChannelRef.current = ch;
  };

  const sendDM = async () => {
    if (!dmInput.trim() || !activeDM) return;
    const dmId = [authUser.id, activeDM.id].sort().join("_");
    const text=dmInput;
    setDmInput("");
    const{data}=await supabase.from("direct_messages").insert({dm_id:dmId,sender_id:authUser.id,receiver_id:activeDM.id,sender_username:profile?.username,text,created_at:new Date().toISOString()}).select().single();
    if(data){
      setDmMessages(prev=>prev.find(m=>m.id===data.id)?prev:[...prev,data]);
    }
  };

  const handleLogout=async()=>{
    if(channelRef.current)supabase.removeChannel(channelRef.current);
    await supabase.auth.signOut();
    setGroup(null);setGroupMembers([]);setMessages([]);setProfile(null);setStats({total_minutes:0,today_minutes:0,weekly_minutes:0,streak:0,total_sessions:0,pomodoros_total:0,tasks_completed:0,subject_minutes:{},achievements:[],invisible_minutes:0,last_study_date:null});
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Planner
  const [plannerEvents, setPlannerEvents] = useState(()=>{try{return JSON.parse(localStorage.getItem("sg_planner_events")||"[]");}catch{return [];}});
  const [plannerMonth, setPlannerMonth] = useState(()=>new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({title:"",date:"",time:"",type:"Exam",color:"#00e676",note:"",reminderMins:30,reminderEnabled:false});

  const savePlannerEvents=(evs)=>{
    setPlannerEvents(evs);
    localStorage.setItem("sg_planner_events",JSON.stringify(evs));
  };

  const deleteEvent=(id)=>savePlannerEvents(plannerEvents.filter(e=>e.id!==id));

  const saveEvent=()=>{
    if(!eventForm.title.trim()||!eventForm.date)return;
    const ev={...eventForm,id:editingEvent?.id||Date.now().toString(),created_at:new Date().toISOString()};
    if(editingEvent){
      savePlannerEvents(plannerEvents.map(e=>e.id===editingEvent.id?ev:e));
    } else {
      savePlannerEvents([...plannerEvents,ev]);
    }
    // Schedule reminder
    if(ev.reminderEnabled&&ev.date&&ev.time){
      const evTime=new Date(`${ev.date}T${ev.time}`).getTime();
      const remTime=evTime-(ev.reminderMins*60000);
      const msUntil=remTime-Date.now();
      if(msUntil>0&&"Notification" in window){
        Notification.requestPermission().then(p=>{
          if(p==="granted"){
            setTimeout(()=>{
              new Notification(`⏰ Reminder: ${ev.title}`,{body:`Starting in ${ev.reminderMins} minutes!`,icon:"/icon-192.png"});
            },msUntil);
          }
        });
      }
    }
    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm({title:"",date:"",time:"",type:"Exam",color:"#00e676",note:"",reminderMins:30,reminderEnabled:false});
  };

  const handleDeleteAccount=async()=>{
    if(deleteConfirmText!=="DELETE")return;
    setDeleting(true);
    try{
      const uid=authUser.id;
      // Delete all user data
      await supabase.from("tasks").delete().eq("user_id",uid);
      await supabase.from("friendships").delete().or(`sender_id.eq.${uid},receiver_id.eq.${uid}`);
      await supabase.from("group_members").delete().eq("user_id",uid);
      await supabase.from("direct_messages").delete().or(`sender_id.eq.${uid},receiver_id.eq.${uid}`);
      await supabase.from("messages").delete().eq("user_id",uid);
      await supabase.from("profiles").delete().eq("id",uid);
      await supabase.auth.signOut();
      // Clear all local storage
      localStorage.clear();
    }catch(e){
      setDeleting(false);
      alert("Something went wrong. Try again.");
    }
  };

  const createGroup=async()=>{
    setGroupError("");
    if(!newGroupName.trim()){setGroupError("Enter a group name");return;}
    const code=genCode();
    const{data:grp,error}=await supabase.from("groups").insert({name:newGroupName,code,owner_id:authUser.id,created_at:new Date().toISOString()}).select().single();
    if(error){setGroupError(error.message);return;}
    await supabase.from("group_members").insert({group_id:grp.id,user_id:authUser.id,joined_at:new Date().toISOString()});
    const ns={...stats,groups_joined:(stats.groups_joined||0)+1};
    let ach=unlockAchievement("social",ns.achievements||[]);
    ns.achievements=ach;
    await saveStats(ns);
    setGroup(grp);setShowGroupModal(false);
    loadGroupMembers(grp.id);subscribeGroup(grp.id);
  };

  const joinGroup=async()=>{
    setGroupError("");
    if(!groupCode.trim()){setGroupError("Enter a group code");return;}
    const{data:grp,error}=await supabase.from("groups").select("*").eq("code",groupCode.toUpperCase()).single();
    if(error||!grp){setGroupError("Group not found. Check the code.");return;}
    await supabase.from("group_members").upsert({group_id:grp.id,user_id:authUser.id,joined_at:new Date().toISOString()},{onConflict:"group_id,user_id"});
    const ns={...stats,groups_joined:(stats.groups_joined||0)+1};
    let ach=unlockAchievement("social",ns.achievements||[]);
    ns.achievements=ach;
    await saveStats(ns);
    setGroup(grp);setShowGroupModal(false);
    loadGroupMembers(grp.id);loadMessages(grp.id);subscribeGroup(grp.id);
  };

  const leaveGroup=async()=>{
    if(!group)return;
    await supabase.from("group_members").delete().eq("group_id",group.id).eq("user_id",authUser.id);
    if(channelRef.current)supabase.removeChannel(channelRef.current);
    setGroup(null);setGroupMembers([]);setMessages([]);setOnlineMembers([]);
  };

  const sendMessage=async()=>{
    if(!chatInput.trim()||!group)return;
    if(studying){setStudying(false);}
    const text=chatInput;
    setChatInput("");
    const{data}=await supabase.from("messages").insert({group_id:group.id,user_id:authUser.id,username:profile?.username||"?",text,created_at:new Date().toISOString()}).select().single();
    if(data){
      setMessages(prev=>prev.find(m=>m.id===data.id)?prev:[...prev,data]);
      setTimeout(()=>chatBottomRef.current?.scrollIntoView({behavior:"smooth"}),100);
    }
  };

  const addTask=async()=>{
    if(!newTask.trim())return;
    const{data}=await supabase.from("tasks").insert({user_id:authUser.id,text:newTask,subject:newTaskSubject,done:false,created_at:new Date().toISOString()}).select().single();
    if(data)setTasks(prev=>[data,...prev]);
    setNewTask("");
  };

  const toggleTask=async(task)=>{
    const done=!task.done;
    await supabase.from("tasks").update({done}).eq("id",task.id);
    setTasks(prev=>prev.map(t=>t.id===task.id?{...t,done}:t));
    if(done){
      const ns={...stats,tasks_completed:(stats.tasks_completed||0)+1};
      let ach=ns.achievements||[];
      if(ns.tasks_completed>=10)ach=unlockAchievement("task_slayer",ach);
      if(ns.tasks_completed>=50)ach=unlockAchievement("task_master",ach);
      ns.achievements=ach;
      await saveStats(ns);
    }
  };

  const deleteTask=async(id)=>{
    await supabase.from("tasks").delete().eq("id",id);
    setTasks(prev=>prev.filter(t=>t.id!==id));
  };

  const handleTheme=async(t)=>{
    setTheme(t);localStorage.setItem("sg_theme",t);setShowThemePanel(false);
    if(authUser){const ns={...stats,themes_used:(stats.themes_used||0)+1};await saveStats(ns);}
  };

  const handleEaster=async()=>{
    const n=easterClicks+1;setEasterClicks(n);
    if(n>=5&&!(stats.achievements||[]).includes("architect")){
      const ns={...stats,achievements:unlockAchievement("architect",stats.achievements||[])};
      await saveStats(ns);
    }
  };



  // Returns YYYY-MM-DD in LOCAL time — consistent across all calls
  const localDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  // Streak calculation — requires 25 min minimum
  const updateStreak = async (currentStats, sessionMins) => {
    if (sessionMins < 25) return currentStats;
    const today = localDateStr();
    const lastStudy = currentStats.last_study_date;
    if (lastStudy === today) return currentStats; // already counted today

    // yesterday in YYYY-MM-DD
    const yd = new Date(); yd.setDate(yd.getDate()-1);
    const yesterday = `${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,"0")}-${String(yd.getDate()).padStart(2,"0")}`;

    let streak = currentStats.streak || 0;
    if (lastStudy === yesterday) {
      streak += 1;
    } else if (lastStudy && lastStudy !== today) {
      // Missed a day — check revives
      const thisMonth = today.substring(0,7);
      const revivesThisMonth = currentStats.revives_month === thisMonth ? (currentStats.revives_used||0) : 0;
      if (revivesThisMonth < 3) {
        return { ...currentStats, streak: streak+1, last_study_date: today, revives_used: revivesThisMonth+1, revives_month: thisMonth, streak_revived: true,
          study_history: {...(currentStats.study_history||{}), [today]: (currentStats.study_history?.[today]||0) + sessionMins}
        };
      } else {
        streak = 1;
      }
    } else {
      streak = 1; // first ever session
    }
    return { ...currentStats, streak, last_study_date: today, streak_revived: false,
      study_history: {...(currentStats.study_history||{}), [today]: (currentStats.study_history?.[today]||0) + sessionMins}
    };
  };

  const getRevivesLeft = () => {
    const thisMonth = new Date().toISOString().substring(0,7);
    if (stats.revives_month !== thisMonth) return 3;
    return Math.max(0, 3 - (stats.revives_used||0));
  };

  // Rotate motivational quote every 3 minutes while studying
  useEffect(()=>{
    if(!studying||!isPro)return;
    const pool=[...(QUOTES[selectedSubject]||[]),...QUOTES.default];
    const pick=()=>setCurrentQuote(pool[Math.floor(Math.random()*pool.length)]);
    pick();
    const iv=setInterval(pick,180000);
    return()=>clearInterval(iv);
  },[studying,selectedSubject,isPro]);

  // Reset daily/weekly stats at midnight — only runs after profile is loaded from DB
  useEffect(() => {
    if (!authUser || !profile) return;
    const checkReset = async () => {
      const today = localDateStr();
      const lastReset = localStorage.getItem(`sg_last_reset_${authUser.id}`);
      if (lastReset === today) return;
      localStorage.setItem(`sg_last_reset_${authUser.id}`, today);
      const isMonday = new Date().getDay() === 1;
      // Read fresh from DB to avoid stale closure
      const { data } = await supabase.from("profiles").select("stats").eq("id", authUser.id).single();
      if (!data?.stats) return;

      // Check if streak should die
      const yd = new Date(); yd.setDate(yd.getDate()-1);
      const yesterday = `${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,"0")}-${String(yd.getDate()).padStart(2,"0")}`;
      const lastStudy = data.stats.last_study_date;
      let streakUpdate = {};
      if(lastStudy && lastStudy !== today && lastStudy !== yesterday){
        // Missed at least one day — check revives
        const thisMonth = today.substring(0,7);
        const revivesUsed = data.stats.revives_month === thisMonth ? (data.stats.revives_used||0) : 0;
        if(revivesUsed < 3){
          // Auto revive
          streakUpdate = {revives_used: revivesUsed+1, revives_month: thisMonth};
        } else {
          // Kill streak
          streakUpdate = {streak: 0};
        }
      }

      const updated = { ...data.stats, today_minutes: 0, ...(isMonday ? { weekly_minutes: 0 } : {}), ...streakUpdate };
      await supabase.from("profiles").update({ stats: updated, updated_at: new Date().toISOString() }).eq("id", authUser.id);
      setStats(updated);
    };
    checkReset();
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, [authUser, profile]);

  // Friend online notifications
  useEffect(() => {
    if (!onlineMembers.length || !friends.length) return;
    const onlineFriendIds = onlineMembers.map(m => m.user_id);
    const onlineFriend = friends.find(f => onlineFriendIds.includes(f.id) && onlineMembers.find(m => m.user_id === f.id)?.status === "studying");
    if (onlineFriend) {
      setFriendNotif(onlineFriend);
      setTimeout(() => setFriendNotif(null), 5000);
    }
  }, [onlineMembers]);

  // Heatmap — last 28 weeks (196 days)
  const heatmapDays = (() => {
    const days = [];
    const today = new Date();
    for(let i=195; i>=0; i--){
      const d = new Date(today);
      d.setDate(d.getDate()-i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const mins = stats.study_history?.[key] || 0;
      days.push({key, mins, day:d.getDay()});
    }
    return days;
  })();
  const heatmapMax = Math.max(...heatmapDays.map(d=>d.mins), 1);
  const heatmapColor = (mins) => {
    if(!mins) return T.surface;
    const pct = mins/heatmapMax;
    if(pct < 0.25) return "#7f1d1d"; // very low — dark red
    if(pct < 0.5)  return "#dc2626"; // low — red
    if(pct < 0.75) return "#f59e0b"; // medium — amber
    if(pct < 0.9)  return "#84cc16"; // good — yellow-green
    return "#22c55e";                // great — full green
  };

  const pomPct=((25*60-pomodoroSecs)/(25*60))*100;

  // Planner constants
  const plannerToday=new Date();
  const plannerTodayStr=`${plannerToday.getFullYear()}-${String(plannerToday.getMonth()+1).padStart(2,"0")}-${String(plannerToday.getDate()).padStart(2,"0")}`;
  const plannerYear=plannerMonth.getFullYear();
  const plannerMonthIdx=plannerMonth.getMonth();
  const plannerFirstDay=new Date(plannerYear,plannerMonthIdx,1).getDay();
  const plannerDaysInMonth=new Date(plannerYear,plannerMonthIdx+1,0).getDate();
  const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const EVENT_TYPES=["Exam","Test","Vacation Start","Vacation End","Custom"];
  const EVENT_COLORS=["#00e676","#ff6d00","#ff1744","#2979ff","#aa00ff","#ffea00","#f06292","#00bcd4","#ffffff","#ff9100"];
  const plannerEventsOnDay=(d)=>{
    const ds=`${plannerYear}-${String(plannerMonthIdx+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return plannerEvents.filter(e=>e.date===ds).sort((a,b)=>a.time>b.time?1:-1);
  };
  const plannerTodayEvents=plannerEvents.filter(e=>e.date===plannerTodayStr).sort((a,b)=>a.time>b.time?1:-1);
  const plannerUpcoming=[...plannerEvents].filter(e=>e.date>=plannerTodayStr).sort((a,b)=>a.date>b.date?1:a.date<b.date?-1:a.time>b.time?1:-1).slice(0,10);
  const openNewEvent=(dateStr)=>{
    setEditingEvent(null);
    setEventForm({title:"",date:dateStr||plannerTodayStr,time:"09:00",type:"Exam",color:"#00e676",note:"",reminderMins:30,reminderEnabled:false});
    setShowEventModal(true);
  };
  const openEditEvent=(ev)=>{setEditingEvent(ev);setEventForm({...ev});setShowEventModal(true);};

  const css={
    app:{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Outfit','Segoe UI',sans-serif",transition:"background 0.4s,color 0.4s"},
    card:{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:20,marginBottom:16},
    btn:{background:T.accent,color:"#000",border:"none",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontWeight:700,fontSize:14,transition:"all 0.2s"},
    btnO:{background:"transparent",color:T.accent,border:`1.5px solid ${T.accent}`,borderRadius:10,padding:"8px 18px",cursor:"pointer",fontWeight:600,fontSize:13},
    btnD:{background:"#cc2222",color:"#fff",border:"none",borderRadius:10,padding:"8px 16px",cursor:"pointer",fontWeight:600,fontSize:13},
    input:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",width:"100%",boxSizing:"border-box"},
    tBtn:(a)=>({padding:"8px 14px",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:13,border:"none",background:a?T.accent:"transparent",color:a?"#000":T.sub,transition:"all 0.2s",whiteSpace:"nowrap"}),
    dot:(st)=>({width:10,height:10,borderRadius:"50%",flexShrink:0,background:st==="studying"?T.accent:st==="idle"?"#f59e0b":st==="online"?"#22c55e":"transparent",border:st==="invisible"?`2px dashed ${T.sub}`:"none",display:"inline-block"}),
    av:()=>({width:36,height:36,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#000",flexShrink:0}),
  };

  if(authLoading)return(
    <div style={{...css.app,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet"/>
      <div style={{textAlign:"center"}}><div style={{fontSize:40}}>📖</div><div style={{color:T.sub,marginTop:10}}>Loading StudyGrove...</div></div>
    </div>
  );

  if(!authUser)return(
    <div style={{...css.app,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet"/>
      <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 30% 20%,${T.accent}18 0%,transparent 60%)`,pointerEvents:"none"}}/>
      <div style={{...css.card,width:"100%",maxWidth:420,position:"relative",zIndex:1,boxShadow:`0 0 60px ${T.accent}20`}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <span onClick={handleEaster} style={{fontSize:42,cursor:"default",userSelect:"none"}}>📖</span>
          <div style={{fontSize:28,fontWeight:900,letterSpacing:-1,marginTop:4}}>Study<span style={{color:T.accent}}>Grove</span></div>
          <div style={{color:T.sub,fontSize:13,marginTop:4}}>Study together. Rise together.</div>
          <div style={{color:T.border,fontSize:10,marginTop:12,letterSpacing:2,textTransform:"uppercase"}}>built by aziz zl</div>
        </div>
        {(authScreen==="login"||authScreen==="register")&&(
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            <button style={{...css.tBtn(authScreen==="login"),flex:1}} onClick={()=>{setAuthScreen("login");setAuthError("");setAuthSuccess("");}}>Sign In</button>
            <button style={{...css.tBtn(authScreen==="register"),flex:1}} onClick={()=>{setAuthScreen("register");setAuthError("");setAuthSuccess("");}}>Create Account</button>
          </div>
        )}
        {authError&&<div style={{background:"#cc222220",border:"1px solid #cc2222",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#ff6b6b",marginBottom:12}}>{authError}</div>}
        {authSuccess&&<div style={{background:`${T.accent}20`,border:`1px solid ${T.accent}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:T.accent,marginBottom:12}}>{authSuccess}</div>}

        {authScreen==="otp"?(
          <>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:32}}>📧</div>
              <div style={{fontWeight:700,fontSize:16,marginTop:8}}>Enter your code</div>
              <div style={{color:T.sub,fontSize:13,marginTop:4}}>We sent a 6-digit code to your email</div>
            </div>
            <input style={{...css.input,marginBottom:20,textAlign:"center",fontSize:24,fontWeight:700,letterSpacing:8}} placeholder="000000" maxLength={6} value={otpCode} onChange={e=>setOtpCode(e.target.value.replace(/\D/g,""))} onKeyDown={e=>e.key==="Enter"&&handleVerifyOtp()}/>
            <button style={{...css.btn,width:"100%",padding:14,fontSize:15}} onClick={handleVerifyOtp}>Verify Code</button>
            <div style={{textAlign:"center",marginTop:12,color:T.sub,fontSize:12}}>Didn't get it? <span style={{color:T.accent,cursor:"pointer"}} onClick={handleLogin}>Resend code</span></div>
            <div style={{textAlign:"center",marginTop:8,color:T.sub,fontSize:12,cursor:"pointer"}} onClick={()=>{setAuthScreen("login");setAuthError("");setAuthSuccess("");setOtpCode("");}}>← Back to login</div>
          </>
        ):authScreen==="forgot"?(
          <>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:32}}>🔑</div>
              <div style={{fontWeight:700,fontSize:16,marginTop:8}}>Reset Password</div>
              <div style={{color:T.sub,fontSize:13,marginTop:4}}>We'll send a reset link to your email</div>
            </div>
            <input style={{...css.input,marginBottom:20}} placeholder="Your email address" type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleForgotPassword()}/>
            <button style={{...css.btn,width:"100%",padding:14,fontSize:15}} onClick={handleForgotPassword}>Send Reset Link</button>
            <div style={{textAlign:"center",marginTop:12,color:T.sub,fontSize:12,cursor:"pointer"}} onClick={()=>{setAuthScreen("login");setAuthError("");}}>← Back to login</div>
          </>
        ):authScreen==="forgot_sent"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48}}>📬</div>
            <div style={{fontWeight:700,fontSize:18,marginTop:12}}>Check your email</div>
            <div style={{color:T.sub,fontSize:13,marginTop:8,lineHeight:1.6}}>We sent a password reset link to <strong>{forgotEmail}</strong>. Click the link in the email to set a new password. If you didn't request this, you can safely ignore it.</div>
            <button style={{...css.btnO,marginTop:20}} onClick={()=>{setAuthScreen("login");setAuthError("");}}>← Back to login</button>
          </div>
        ):authScreen==="reset_password"?(
          <div style={{textAlign:"center",padding:"10px 0"}}>
            <div style={{fontSize:48}}>🔐</div>
            <div style={{fontWeight:700,fontSize:18,marginTop:12,marginBottom:6}}>Set New Password</div>
            <div style={{color:T.sub,fontSize:13,marginBottom:20}}>Choose a new password for your account</div>
            {authError&&<div style={{color:"#ff6b6b",fontSize:13,marginBottom:10,padding:"8px 12px",background:"#ff6b6b18",borderRadius:8}}>{authError}</div>}
            {authSuccess&&<div style={{color:"#00e676",fontSize:13,marginBottom:10,padding:"8px 12px",background:"#00e67618",borderRadius:8}}>{authSuccess}</div>}
            <div style={{position:"relative",marginBottom:16}}>
              <input style={{...css.input,width:"100%",boxSizing:"border-box",paddingRight:40}} placeholder="New password (min 6 chars)" type={showNewPass?"text":"password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)} onKeyDown={async e=>{
                if(e.key==="Enter"){
                  if(newPassword.length<6){setAuthError("Password must be at least 6 characters");return;}
                  setAuthError("");
                  const{error}=await supabase.auth.updateUser({password:newPassword});
                  if(error){setAuthError(error.message);}
                  else{setAuthSuccess("✅ Password updated! Redirecting...");setNewPassword("");setTimeout(()=>{setAuthScreen("login");setAuthSuccess("");},2000);}
                }
              }}/>
              <span onClick={()=>setShowNewPass(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:18,color:T.sub,userSelect:"none"}}>{showNewPass?"🙈":"👁️"}</span>
            </div>
            <button style={{...css.btn,width:"100%",padding:14,fontSize:15}} onClick={async()=>{
              if(newPassword.length<6){setAuthError("Password must be at least 6 characters");return;}
              setAuthError("");
              const{error}=await supabase.auth.updateUser({password:newPassword});
              if(error){setAuthError(error.message);}
              else{setAuthSuccess("✅ Password updated! Redirecting...");setNewPassword("");setTimeout(()=>{setAuthScreen("login");setAuthSuccess("");},2000);}
            }}>Update Password</button>
          </div>
        ):authScreen==="login"?(
          <>
            <input style={{...css.input,marginBottom:12}} placeholder="Email" type="email" value={loginForm.email} onChange={e=>setLoginForm(p=>({...p,email:e.target.value}))}/>
            <div style={{position:"relative",marginBottom:8}}>
              <input style={{...css.input,width:"100%",boxSizing:"border-box",paddingRight:40}} placeholder="Password" type={showLoginPass?"text":"password"} value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
              <span onClick={()=>setShowLoginPass(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:18,color:T.sub,userSelect:"none"}}>{showLoginPass?"🙈":"👁️"}</span>
            </div>
            <div style={{textAlign:"right",marginBottom:16}}><span style={{fontSize:12,color:T.accent,cursor:"pointer"}} onClick={()=>{setAuthScreen("forgot");setAuthError("");}}>Forgot password?</span></div>
            <button style={{...css.btn,width:"100%",padding:14,fontSize:15}} onClick={handleLogin}>Sign In</button>
          </>
        ):(
          <>
            <input style={{...css.input,marginBottom:12}} placeholder="Username (shown to friends)" value={regForm.username} onChange={e=>setRegForm(p=>({...p,username:e.target.value}))}/>
            <input style={{...css.input,marginBottom:12}} placeholder="Email" type="email" value={regForm.email} onChange={e=>setRegForm(p=>({...p,email:e.target.value}))}/>
            <div style={{position:"relative",marginBottom:20}}>
              <input style={{...css.input,width:"100%",boxSizing:"border-box",paddingRight:40}} placeholder="Password (min 6 chars)" type={showRegPass?"text":"password"} value={regForm.password} onChange={e=>setRegForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleRegister()}/>
              <span onClick={()=>setShowRegPass(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:18,color:T.sub,userSelect:"none"}}>{showRegPass?"🙈":"👁️"}</span>
            </div>
            <button style={{...css.btn,width:"100%",padding:14,fontSize:15}} onClick={handleRegister}>Create Account</button>
            <div style={{fontSize:11,color:T.sub,textAlign:"center",marginTop:12,lineHeight:1.6}}>By creating an account you agree to our <a href="/privacy.html" target="_blank" style={{color:T.accent}}>Privacy Policy</a></div>
          </>
        )}
      </div>
      <div style={{display:"flex",gap:6,marginTop:14,flexWrap:"wrap",justifyContent:"center"}}>
        {Object.entries(THEMES).map(([k,v])=>(
          <button key={k} onClick={()=>handleTheme(k)} style={{background:"transparent",border:`1.5px solid ${theme===k?T.accent:T.border}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",fontSize:11,color:theme===k?T.accent:T.sub}}>{v.name}</button>
        ))}
      </div>
    </div>
  );

  const otherOnline=onlineMembers.filter(m=>m.user_id!==authUser?.id);

  return(
    <div style={css.app}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet"/>
      <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 20% 10%,${T.accent}10 0%,transparent 50%)`,pointerEvents:"none",zIndex:0}}/>

      {/* In-app message notification */}
      {inAppNotif&&(
        <div onClick={()=>{setTab("social");setInAppNotif(null);}} style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:1001,background:T.card,border:`1.5px solid ${T.border}`,borderRadius:14,padding:"12px 20px",boxShadow:`0 0 30px rgba(0,0,0,0.5)`,cursor:"pointer",maxWidth:300,animation:"slideIn 0.3s ease"}}>
          <div style={{fontSize:11,color:T.sub,marginBottom:4}}>💬 {inAppNotif.type==="group"?"Group message":"Direct message"}</div>
          <div style={{fontWeight:700,fontSize:13,color:T.accent}}>{inAppNotif.username}</div>
          <div style={{fontSize:13,color:T.text,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inAppNotif.text}</div>
          <div style={{fontSize:11,color:T.sub,marginTop:4}}>Tap to open</div>
        </div>
      )}

      {/* DM Modal */}
      {activeDM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...css.card,width:"100%",maxWidth:420,height:500,display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={css.av()}>{(activeDM.username||"?")[0].toUpperCase()}</div>
                <div>
                  <div style={{fontWeight:700}}>{displayName(activeDM)}</div>
                  {nicknames[activeDM.id]&&<div style={{fontSize:11,color:T.sub}}>@{activeDM.username}</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                {isDMMuted(activeDM.id)
                  ?<button style={{...css.btnO,fontSize:11,padding:"4px 10px"}} onClick={()=>{const u={...mutedDMs};delete u[activeDM.id];setMutedDMs(u);localStorage.setItem("sg_muted_dms",JSON.stringify(u));}}>🔔 Unmute</button>
                  :<select style={{...css.input,width:"auto",fontSize:11,padding:"4px 8px"}} onChange={e=>{if(e.target.value)muteDM(activeDM.id,e.target.value);e.target.value="";}}>
                    <option value="">🔕 Mute...</option>
                    <option value="1">1 hour</option>
                    <option value="8">8 hours</option>
                    <option value="24">24 hours</option>
                    <option value="forever">Forever</option>
                  </select>
                }
                <button style={{...css.btnO,fontSize:11,padding:"4px 10px"}} onClick={()=>setActiveDM(null)}>✕ Close</button>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",paddingRight:4}}>
              {dmMessages.length===0&&<div style={{color:T.sub,fontSize:13,textAlign:"center",marginTop:30}}>No messages yet. Say something! 👋</div>}
              {dmMessages.map(m=>(
                <div key={m.id} style={{marginBottom:10,textAlign:m.sender_id===authUser?.id?"right":"left"}}>
                  <div style={{display:"inline-block",background:m.sender_id===authUser?.id?T.accent:T.surface,color:m.sender_id===authUser?.id?"#000":T.text,padding:"8px 12px",borderRadius:12,fontSize:13,maxWidth:"80%"}}>
                    {m.text}
                  </div>
                  <div style={{fontSize:10,color:T.sub,marginTop:2}}>{new Date(m.created_at).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <input style={{...css.input,flex:1}} placeholder="Message..." value={dmInput} onChange={e=>setDmInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendDM()}/>
              <button style={css.btn} onClick={sendDM}>→</button>
            </div>
          </div>
        </div>
      )}

      {newAchievement&&(
        <div style={{position:"fixed",top:20,right:20,zIndex:1000,background:T.card,border:`1.5px solid ${T.accent}`,borderRadius:14,padding:"14px 20px",boxShadow:`0 0 30px ${T.accent}40`,animation:"slideIn 0.4s ease",maxWidth:280}}>
          <div style={{fontSize:11,color:T.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>🎖 Achievement Unlocked!</div>
          <div style={{fontSize:18,marginTop:4}}>{newAchievement.icon} <strong>{newAchievement.name}</strong></div>
          <div style={{fontSize:12,color:T.sub,marginTop:2}}>{newAchievement.desc}</div>
        </div>
      )}

      {friendNotif&&(
        <div style={{position:"fixed",top:newAchievement?80:20,right:20,zIndex:999,background:T.card,border:`1.5px solid #22c55e`,borderRadius:14,padding:"12px 18px",boxShadow:`0 0 20px #22c55e30`,animation:"slideIn 0.4s ease",maxWidth:260}}>
          <div style={{fontSize:11,color:"#22c55e",fontWeight:700}}>🟢 Friend Online</div>
          <div style={{fontSize:14,marginTop:4,fontWeight:600}}>{friendNotif.username} started studying!</div>
        </div>
      )}

      {/* Pro Modal */}
      {/* ── ONBOARDING ── */}
      {showOnboarding&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...css.card,maxWidth:420,width:"100%",textAlign:"center",padding:32,boxShadow:`0 0 60px ${T.accent}30`}}>
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:24}}>
              {ONBOARDING_STEPS.map((_,i)=>(
                <div key={i} style={{width:i===onboardingStep?24:8,height:8,borderRadius:4,background:i===onboardingStep?T.accent:T.border,transition:"all 0.3s"}}/>
              ))}
            </div>
            <div style={{fontSize:56,marginBottom:16}}>{obStep.emoji}</div>
            <div style={{fontSize:20,fontWeight:900,marginBottom:12,lineHeight:1.3}}>{obStep.title}</div>
            <div style={{fontSize:14,color:T.sub,lineHeight:1.7,marginBottom:obStep.tip?16:24}}>{obStep.desc}</div>
            {obStep.tip&&(
              <div style={{fontSize:12,color:T.accent,background:`${T.accent}12`,border:`1px solid ${T.accent}30`,borderRadius:10,padding:"10px 14px",marginBottom:24,textAlign:"left"}}>{obStep.tip}</div>
            )}
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              {onboardingStep>0&&(
                <button style={{...css.btnO,padding:"10px 20px"}} onClick={()=>setOnboardingStep(v=>v-1)}>← Back</button>
              )}
              <button style={{...css.btn,padding:"12px 32px",fontSize:15,flex:1}} onClick={()=>{obIsLast?finishOnboarding():setOnboardingStep(v=>v+1);}}>
                {obIsLast?"Let's Go 🚀":"Next →"}
              </button>
            </div>
            {!obIsLast&&(
              <button style={{background:"none",border:"none",color:T.sub,fontSize:12,cursor:"pointer",marginTop:14}} onClick={finishOnboarding}>Skip tutorial</button>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...css.card,maxWidth:400,width:"100%",textAlign:"center",padding:32}}>
            <div style={{fontSize:48}}>⚠️</div>
            <div style={{fontWeight:900,fontSize:20,marginTop:12,color:"#ff4444"}}>Delete Account</div>
            <div style={{fontSize:13,color:T.sub,marginTop:8,marginBottom:20,lineHeight:1.7}}>
              This will permanently delete your profile, stats, streak, friends, tasks and all data. <strong style={{color:T.text}}>This cannot be undone.</strong>
            </div>
            <div style={{fontSize:13,color:T.sub,marginBottom:8}}>Type <strong style={{color:"#ff4444",letterSpacing:2}}>DELETE</strong> to confirm</div>
            <input
              style={{...css.input,marginBottom:16,textAlign:"center",letterSpacing:2,fontWeight:700,borderColor:deleteConfirmText==="DELETE"?"#ff4444":T.border}}
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={e=>setDeleteConfirmText(e.target.value.toUpperCase())}
            />
            <button
              style={{...css.btn,width:"100%",padding:14,background:deleteConfirmText==="DELETE"?"#cc2222":"#555",color:"#fff",marginBottom:8,cursor:deleteConfirmText==="DELETE"?"pointer":"not-allowed"}}
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText!=="DELETE"||deleting}
            >{deleting?"Deleting everything...":"💀 Delete My Account Forever"}</button>
            <button style={{...css.btnO,width:"100%"}} onClick={()=>{setShowDeleteModal(false);setDeleteConfirmText("");}}>Cancel</button>
          </div>
        </div>
      )}

      {showProModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...css.card,width:"100%",maxWidth:420,textAlign:"center",boxShadow:`0 0 60px ${T.accent}30`}}>
            <div style={{fontSize:48}}>👑</div>
            <div style={{fontWeight:900,fontSize:24,marginTop:8}}>StudyGrove <span style={{color:T.accent}}>Pro</span></div>
            <div style={{color:T.sub,fontSize:13,marginTop:4,marginBottom:20}}>Unlock the full experience</div>
            {[["💬","Subject quotes & jokes while you study"],["🖼️","Animated profile frames"],["🎁","Weekly mystery box rewards"],["🔥","10 streak revivals/month"],["📊","Study heatmap & weekly reports"],["👑","Exclusive Pro badge & profile titles"]].map(([icon,text])=>(
              <div key={text} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`,textAlign:"left"}}>
                <span style={{fontSize:20}}>{icon}</span>
                <span style={{fontSize:13}}>{text}</span>
              </div>
            ))}
            <div style={{marginTop:20,fontWeight:900,fontSize:22,color:T.accent}}>$2.99<span style={{fontSize:14,fontWeight:400,color:T.sub}}>/month</span></div>
            <div style={{fontSize:12,color:"#f59e0b",marginTop:4,marginBottom:16}}>🚀 Launching soon — join the waitlist!</div>
            <button style={{...css.btn,width:"100%",padding:14,fontSize:15}} onClick={()=>{window.open("https://studygrove-gilt.vercel.app","_blank");setShowProModal(false);}}>Join Waitlist</button>
            <button style={{...css.btnO,width:"100%",marginTop:8}} onClick={()=>setShowProModal(false)}>Maybe later</button>
          </div>
        </div>
      )}

      {focusMode&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:800,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:13,color:T.sub,marginBottom:8,textTransform:"uppercase",letterSpacing:2}}>Focus Mode</div>
          <div style={{fontSize:80,fontWeight:900,color:T.accent,fontVariantNumeric:"tabular-nums",letterSpacing:-2}}>{fmtTime(sessionSecs)}</div>
          <div style={{fontSize:16,color:T.sub,marginTop:8}}>{selectedSubject}</div>
          {pomodoroMode&&<div style={{marginTop:16,width:200}}><div style={{height:4,background:T.border,borderRadius:2}}><div style={{height:"100%",background:T.accent,borderRadius:2,width:`${pomPct}%`,transition:"width 1s linear"}}/></div><div style={{fontSize:12,color:T.sub,textAlign:"center",marginTop:6}}>🍅 {fmtTime(pomodoroSecs)}</div></div>}
          <div style={{display:"flex",gap:10,marginTop:32}}>
            <button style={css.btnO} onClick={()=>setFocusMode(false)}>Exit</button>
            <button style={css.btnD} onClick={startStop}>Stop</button>
          </div>
        </div>
      )}

      {showGroupModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...css.card,width:"100%",maxWidth:400,boxShadow:`0 0 40px ${T.accent}20`}}>
            <div style={{fontWeight:800,fontSize:18,marginBottom:16}}>Study Groups</div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <button style={css.tBtn(groupAction==="join")} onClick={()=>setGroupAction("join")}>Join Group</button>
              <button style={css.tBtn(groupAction==="create")} onClick={()=>setGroupAction("create")}>Create Group</button>
            </div>
            {groupError&&<div style={{color:"#ff6b6b",fontSize:12,marginBottom:10}}>{groupError}</div>}
            {groupAction==="join"?(
              <>
                <div style={{fontSize:12,color:T.sub,marginBottom:6}}>Enter the code your friend shared</div>
                <input style={{...css.input,marginBottom:12}} placeholder="Group code (e.g. AB12CD)" value={groupCode} onChange={e=>setGroupCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinGroup()}/>
                <button style={{...css.btn,width:"100%"}} onClick={joinGroup}>Join</button>
              </>
            ):(
              <>
                <div style={{fontSize:12,color:T.sub,marginBottom:6}}>Name your group</div>
                <input style={{...css.input,marginBottom:12}} placeholder="e.g. Physics Study Crew" value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createGroup()}/>
                <button style={{...css.btn,width:"100%"}} onClick={createGroup}>Create Group</button>
              </>
            )}
            <button style={{...css.btnO,width:"100%",marginTop:10}} onClick={()=>setShowGroupModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showThemePanel&&(
        <div style={{position:"fixed",top:58,right:16,zIndex:300,background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:16,minWidth:200,boxShadow:`0 10px 40px rgba(0,0,0,0.5)`}}>
          {Object.entries(THEMES).map(([k,v])=>(
            <div key={k} onClick={()=>handleTheme(k)} style={{padding:"8px 12px",borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:8,background:theme===k?`${T.accent}22`:"transparent",marginBottom:2}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:v.accent}}/>
              <span style={{fontSize:13,color:theme===k?T.accent:T.text,fontWeight:theme===k?700:400}}>{v.name}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        {/* Left: logo + group name */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span onClick={handleEaster} style={{fontSize:22,cursor:"default",userSelect:"none"}}>📖</span>
          <span style={{fontWeight:900,fontSize:18,letterSpacing:-0.5}}>Study<span style={{color:T.accent}}>Grove</span></span>
          {group&&<span style={{fontSize:11,color:T.sub,background:T.card,padding:"2px 8px",borderRadius:20,display:"none"}} className="desktop-only">{group.name} · <strong style={{color:T.accent}}>{group.code}</strong></span>}
        </div>

        {/* Desktop right buttons */}
        {!isMobile&&<div style={{display:"flex",alignItems:"center",gap:8}}>
          {studying&&<span style={{fontSize:11,color:T.accent,fontWeight:700,padding:"3px 10px",border:`1px solid ${T.accent}`,borderRadius:20}}>● LIVE</span>}
          <button style={{...css.btnO,padding:"4px 10px",fontSize:11}} onClick={()=>setInvisible(v=>!v)}>{invisible?"👻 Invisible":"🟢 Visible"}</button>
          <button style={{...css.btnO,padding:"4px 10px",fontSize:11}} onClick={()=>setShowThemePanel(v=>!v)}>🎨</button>
          <button style={{...css.btnO,padding:"4px 10px",fontSize:11}} onClick={()=>setShowGroupModal(true)}>👥 Groups</button>
          <button style={{...css.btn,padding:"4px 10px",fontSize:11,background:"linear-gradient(135deg,#ffd700,#ff6d00)",color:"#000"}} onClick={()=>setShowProModal(true)}>👑 Pro</button>
          <div style={{cursor:"pointer"}} onClick={()=>setTab("settings")}>
            <FramedAvatar size={36} avatarUrl={avatarUrl} username={profile?.username} frameId={selectedFrame} unlockedFrames={unlockedFrames} isPro={isPro} accentColor={T.accent}/>
          </div>
        </div>}

        {/* Mobile right — avatar + hamburger only */}
        {isMobile&&<div style={{display:"flex",alignItems:"center",gap:8}}>
          {studying&&<span style={{fontSize:10,color:T.accent,fontWeight:700,padding:"2px 8px",border:`1px solid ${T.accent}`,borderRadius:20}}>● LIVE</span>}
          <div style={{cursor:"pointer"}} onClick={()=>setTab("settings")}>
            <FramedAvatar size={32} avatarUrl={avatarUrl} username={profile?.username} frameId={selectedFrame} unlockedFrames={unlockedFrames} isPro={isPro} accentColor={T.accent}/>
          </div>
          <button onClick={()=>setShowMobileMenu(v=>!v)} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:16,color:T.text,lineHeight:1}}>☰</button>
        </div>}

      </div>{/* ── END HEADER ── */}

      {!isOnline&&(
        <div style={{background:"#f59e0b",color:"#000",textAlign:"center",padding:"6px 16px",fontSize:12,fontWeight:700}}>
          ⚡ You're offline — timer still works, changes will sync when you reconnect
        </div>
      )}

      {isMobile&&showMobileMenu&&(
        <div style={{position:"fixed",top:58,right:12,zIndex:500,background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:12,display:"flex",flexDirection:"column",gap:8,minWidth:180,boxShadow:`0 10px 40px rgba(0,0,0,0.5)`}}>
          <button style={{...css.btnO,fontSize:13,textAlign:"left"}} onClick={()=>{setInvisible(v=>!v);setShowMobileMenu(false);}}>{invisible?"👻 Go Visible":"🟢 Go Invisible"}</button>
          <button style={{...css.btnO,fontSize:13,textAlign:"left"}} onClick={()=>{setShowThemePanel(v=>!v);setShowMobileMenu(false);}}>🎨 Change Theme</button>
          <button style={{...css.btnO,fontSize:13,textAlign:"left"}} onClick={()=>{setShowGroupModal(true);setShowMobileMenu(false);}}>👥 Groups</button>
          <button style={{...css.btn,fontSize:13,background:"linear-gradient(135deg,#ffd700,#ff6d00)",color:"#000",textAlign:"left"}} onClick={()=>{setShowProModal(true);setShowMobileMenu(false);}}>👑 Upgrade to Pro</button>
          {group&&<div style={{fontSize:11,color:T.sub,padding:"4px 8px",borderTop:`1px solid ${T.border}`,marginTop:4}}>Group: <strong style={{color:T.accent}}>{group.name} · {group.code}</strong></div>}
        </div>
      )}

      <div style={{display:"flex",gap:4,padding:"10px 16px",overflowX:"auto",borderBottom:`1px solid ${T.border}`,background:T.surface,position:"sticky",top:57,zIndex:99}}>
        {[["study","⏱ Study"],["social","👥 Social"],["leaderboard","🏆 Ranks"],["stats","📊 Stats"],["planner","📅 Planner"],["achievements","🎖 Badges"],["settings","⚙️ Settings"]].map(([t,l])=>(
          <button key={t} style={css.tBtn(tab===t)} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      <div style={{padding:16,maxWidth:900,margin:"0 auto",position:"relative",zIndex:1}}>

        {tab==="study"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{...css.card,gridColumn:"1/-1",textAlign:"center",boxShadow:studying?`0 0 40px ${T.accent}25`:"none",transition:"box-shadow 0.4s"}}>
              <div style={{fontSize:12,color:T.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:2,marginBottom:12}}>{studying?`Studying ${selectedSubject}`:"Ready to Study?"}</div>
              <div style={{fontSize:72,fontWeight:900,color:studying?T.accent:T.text,fontVariantNumeric:"tabular-nums",letterSpacing:-2,lineHeight:1}}>{fmtTime(sessionSecs)}</div>
              <div style={{display:"flex",justifyContent:"center",gap:24,margin:"12px 0",fontSize:13,color:T.sub,flexWrap:"wrap"}}>
                <span>Today <strong style={{color:T.text}}>{fmtMins(stats.today_minutes||0)}</strong></span>
                <span>Week <strong style={{color:T.text}}>{fmtMins(stats.weekly_minutes||0)}</strong></span>
                <span>Total <strong style={{color:T.text}}>{fmtMins(stats.total_minutes||0)}</strong></span>
                <span>Streak <strong style={{color:getStreakFlame(stats.streak||0).color}}>{stats.streak||0} {getStreakFlame(stats.streak||0).icon}</strong> <span style={{fontSize:10,color:T.sub}}>({getStreakFlame(stats.streak||0).label})</span></span>
              </div>
              {/* Motivational quote */}
              {studying&&(
                <div style={{margin:"12px 0",padding:"10px 16px",background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,fontSize:13,color:T.sub,fontStyle:"italic",textAlign:"center",minHeight:40}}>
                  {isPro&&currentQuote?`"${currentQuote}"`:<span>💬 Subject-based quotes — <span style={{color:T.accent,cursor:"pointer"}} onClick={()=>setShowProModal(true)}>Pro feature</span></span>}
                </div>
              )}
              <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",margin:"14px 0"}}>
                {subjects.map(s=>(
                  <button key={s} onClick={()=>!studying&&setSelectedSubject(s)} style={{...css.btnO,padding:"5px 12px",fontSize:12,background:selectedSubject===s?T.accent:"transparent",color:selectedSubject===s?"#000":T.sub,borderColor:selectedSubject===s?T.accent:T.border}}>{s}</button>
                ))}
                <button onClick={()=>setShowAddSubject(v=>!v)} style={{...css.btnO,padding:"5px 10px",fontSize:12,borderStyle:"dashed"}}>+ Add</button>
              </div>
              {showAddSubject&&(
                <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}}>
                  <input style={{...css.input,maxWidth:180}} placeholder="Subject name" value={newSubject} onChange={e=>setNewSubject(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newSubject.trim()){setSubjects(p=>[...p,newSubject]);setNewSubject("");setShowAddSubject(false);}}}/>
                  <button style={css.btn} onClick={()=>{if(newSubject.trim()){setSubjects(p=>[...p,newSubject]);setNewSubject("");setShowAddSubject(false);}}}>Add</button>
                </div>
              )}
              <button onClick={startStop} style={{...css.btn,padding:"14px 48px",fontSize:18,background:studying?"#cc2222":T.accent,color:studying?"#fff":"#000",borderRadius:14,boxShadow:studying?`0 0 20px #cc222240`:`0 0 20px ${T.accent}40`}}>
                {studying?"⏹ Stop Studying":"▶ Start Studying"}
              </button>
              <div style={{marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
                <button onClick={()=>setPomodoroMode(v=>!v)} style={{...css.btnO,fontSize:12,padding:"4px 12px",borderColor:pomodoroMode?T.accent:T.border,color:pomodoroMode?T.accent:T.sub}}>🍅 Pomodoro {pomodoroMode?"ON":"OFF"}</button>
                {pomodoroMode&&<span style={{fontSize:13,color:T.accent}}>{fmtTime(pomodoroSecs)} · {pomodorosToday} done</span>}
                <button onClick={()=>{setFocusMode(true);if(!studying)startStop();}} style={{...css.btnO,fontSize:12,padding:"4px 12px"}}>🎯 Focus Mode</button>
              </div>
              {pomodoroMode&&<div style={{marginTop:10,height:4,background:T.border,borderRadius:2}}><div style={{height:"100%",background:T.accent,borderRadius:2,width:`${pomPct}%`,transition:"width 1s linear"}}/></div>}
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>📚 Subject Hours</div>
              {Object.keys(stats.subject_minutes||{}).length===0&&<div style={{color:T.sub,fontSize:13}}>Start studying to track subjects</div>}
              {Object.entries(stats.subject_minutes||{}).map(([sub,mins])=>{
                const max=Math.max(...Object.values(stats.subject_minutes||{}),1);
                return(<div key={sub} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}><span>{sub}</span><span style={{color:T.accent,fontWeight:600}}>{fmtMins(mins)}</span></div>
                  <div style={{height:4,background:T.border,borderRadius:2}}><div style={{height:"100%",background:T.accent,borderRadius:2,width:`${(mins/max)*100}%`}}/></div>
                </div>);
              })}
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🟢 Who's Online</div>
              {!group&&<div style={{color:T.sub,fontSize:13}}>Join a group to see friends</div>}
              {[{user_id:authUser?.id,username:profile?.username||"You",status:studying?(invisible?"invisible":"studying"):"online",subject:selectedSubject},...otherOnline].map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={css.av()}>{(m.username||"?")[0].toUpperCase()}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{m.username}{m.user_id===authUser?.id?" (you)":""}</div>
                      <div style={{fontSize:11,color:T.sub}}>{m.status==="studying"?`Studying ${m.subject}`:m.status}</div>
                    </div>
                  </div>
                  <span style={css.dot(m.status)}/>
                </div>
              ))}
            </div>

            <div style={{...css.card,gridColumn:"1/-1"}}>
              <div style={{fontWeight:700,marginBottom:12}}>⚔️ Challenges</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {[{icon:"👑",name:"Last Student Standing",desc:"All start together – first to stop is out!"},{icon:"⚡",name:"24-Hour Grind",desc:"Who studies the most in 24 hours?"},{icon:"📅",name:"30-Day Challenge",desc:"Consistent grind for 30 days."}].map(c=>(
                  <div key={c.name} style={{...css.card,background:T.surface,padding:14}}>
                    <div style={{fontSize:24}}>{c.icon}</div>
                    <div style={{fontWeight:700,fontSize:13,marginTop:6}}>{c.name}</div>
                    <div style={{fontSize:11,color:T.sub,marginTop:4}}>{c.desc}</div>
                    {!group&&<div style={{fontSize:11,color:"#f59e0b",marginTop:6}}>Join a group to start</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{...css.card,gridColumn:"1/-1"}}>
              <div style={{fontWeight:700,marginBottom:12}}>✅ Tasks <span style={{fontWeight:400,fontSize:12,color:T.sub}}>({tasks.filter(t=>!t.done).length} remaining)</span></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                <input style={{...css.input,flex:1,minWidth:160}} placeholder="Add a task..." value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()}/>
                <select style={{...css.input,width:130}} value={newTaskSubject} onChange={e=>setNewTaskSubject(e.target.value)}>
                  {subjects.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button style={css.btn} onClick={addTask}>Add</button>
              </div>
              {tasks.length===0&&<div style={{color:T.sub,fontSize:13}}>No tasks yet — add something to study!</div>}
              {tasks.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                  <button onClick={()=>toggleTask(t)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${t.done?T.accent:T.border}`,background:t.done?T.accent:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {t.done&&<span style={{color:"#000",fontSize:12,fontWeight:900}}>✓</span>}
                  </button>
                  <span style={{flex:1,fontSize:13,textDecoration:t.done?"line-through":"none",color:t.done?T.sub:T.text}}>{t.text}</span>
                  <span style={{fontSize:11,color:T.accent,padding:"2px 8px",background:`${T.accent}18`,borderRadius:20}}>{t.subject}</span>
                  <button onClick={()=>deleteTask(t.id)} style={{background:"transparent",border:"none",color:T.sub,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="social"&&(
          <div>
            {/* ── GROUP SECTION ── */}
            {!group?(
              <div style={{...css.card,textAlign:"center",padding:32,marginBottom:16}}>
                <div style={{fontSize:40}}>👥</div>
                <div style={{fontWeight:700,fontSize:18,marginTop:10}}>No group yet</div>
                <div style={{color:T.sub,fontSize:13,marginTop:6,marginBottom:16}}>Create one or join with a code to study together</div>
                <button style={css.btn} onClick={()=>setShowGroupModal(true)}>Join or Create a Group</button>
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                <div style={{...css.card,height:420,display:"flex",flexDirection:"column"}}>
                  <div style={{fontWeight:700,marginBottom:8}}>💬 Group Chat</div>
                  <div style={{fontSize:11,color:"#f59e0b",marginBottom:10,padding:"6px 10px",background:"#f59e0b18",borderRadius:8}}>⚠️ Sending a message pauses your timer</div>
                  <div style={{flex:1,overflowY:"auto",paddingRight:4}}>
                    {messages.length===0&&<div style={{color:T.sub,fontSize:13,textAlign:"center",marginTop:20}}>No messages yet. Say hi! 👋</div>}
                    {messages.map(m=>(
                      <div key={m.id} style={{marginBottom:10}}>
                        <span style={{fontWeight:700,fontSize:13,color:m.user_id===authUser?.id?T.accent:T.sub}}>{m.username}</span>
                        <span style={{fontSize:11,color:T.sub,marginLeft:6}}>{new Date(m.created_at).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}</span>
                        <div style={{fontSize:13,marginTop:2,color:T.text}}>{m.text}</div>
                      </div>
                    ))}
                    <div ref={chatBottomRef}/>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <input style={{...css.input,flex:1}} placeholder="Message..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
                    <button style={css.btn} onClick={sendMessage}>→</button>
                  </div>
                </div>
                <div style={css.card}>
                  <div style={{fontWeight:700,marginBottom:4}}>{group.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:12}}>Code: <strong style={{color:T.accent,letterSpacing:2}}>{group.code}</strong></span>
                    <button onClick={()=>{navigator.clipboard.writeText(group.code||"");alert("Copied!");}} style={{...css.btn,padding:"3px 10px",fontSize:11,borderRadius:8}}>📋 Copy</button>
                  </div>
                  <div style={{fontSize:11,color:T.sub,marginBottom:12}}>Share this code to invite friends</div>
                  {groupMembers.map((m,i)=>{
                    const online=onlineMembers.find(o=>o.user_id===m.id);
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                        <div style={css.av()}>{(m.username||"?")[0].toUpperCase()}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:13}}>{m.username}{m.id===authUser?.id?" (you)":""}</div>
                          <div style={{fontSize:11,color:T.sub}}>{online?.status==="studying"?`Studying ${online.subject}`:online?.status||"offline"}</div>
                        </div>
                        <span style={css.dot(online?.status||"offline")}/>
                      </div>
                    );
                  })}
                  <div style={{marginTop:12,borderTop:`1px solid ${T.border}`,paddingTop:10}}>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>🔕 Mute Group Chat</div>
                    {isGroupMuted(group?.id)?(
                      <button style={{...css.btnO,width:"100%",fontSize:12,marginBottom:6}} onClick={()=>unmuteGroup(group?.id)}>🔔 Unmute</button>
                    ):(
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                        {[["1","1h"],["8","8h"],["24","24h"],["forever","Forever"]].map(([val,label])=>(
                          <button key={val} onClick={()=>muteGroup(group?.id,val)} style={{...css.btnO,fontSize:11,padding:"4px 10px"}}>{label}</button>
                        ))}
                      </div>
                    )}
                    <button style={{...css.btnD,width:"100%",fontSize:12}} onClick={leaveGroup}>Leave Group</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── FRIENDS SECTION ── */}
            {friendRequests.length>0&&(
              <div style={{...css.card,border:`1.5px solid #f59e0b`,marginBottom:0}}>
                <div style={{fontWeight:700,marginBottom:12,color:"#f59e0b"}}>📬 Friend Requests ({friendRequests.length})</div>
                {friendRequests.map(r=>(
                  <div key={r.friendship_id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                    <div style={css.av()}>{(r.username||"?")[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:14}}>{r.username}</div>
                      <div style={{fontSize:11,color:T.sub}}>#{r.friend_code}</div>
                    </div>
                    <button style={{...css.btn,padding:"6px 12px",fontSize:12,marginRight:6}} onClick={()=>acceptFriend(r.friendship_id)}>Accept</button>
                    <button style={{...css.btnD,padding:"6px 12px",fontSize:12}} onClick={()=>declineFriend(r.friendship_id)}>Decline</button>
                  </div>
                ))}
              </div>
            )}
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:4}}>🔍 Add a Friend</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:T.sub}}>Your code:</span>
                <strong style={{color:T.accent,letterSpacing:3,fontSize:16}}>#{profile?.friend_code||"..."}</strong>
                <button onClick={()=>{navigator.clipboard.writeText(profile?.friend_code||"");alert("Code copied!");}} style={{...css.btn,padding:"4px 12px",fontSize:11,borderRadius:8}}>📋 Copy</button>
              </div>
              <div style={{display:"flex",gap:8}}>
                <input style={{...css.input,flex:1}} placeholder="Enter friend code (e.g. AZ7K2)" value={friendSearch} onChange={e=>setFriendSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchFriend()}/>
                <button style={css.btn} onClick={searchFriend}>{friendSearchLoading?"...":"Search"}</button>
              </div>
              {friendSearchError&&<div style={{color:"#ff6b6b",fontSize:12,marginTop:8}}>{friendSearchError}</div>}
              {friendSearchResult&&(
                <div style={{marginTop:12,padding:14,background:T.surface,borderRadius:12,border:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={css.av()}>{(friendSearchResult.username||"?")[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15}}>{friendSearchResult.username}</div>
                      <div style={{fontSize:12,color:T.sub}}>#{friendSearchResult.friend_code} · {fmtMins(friendSearchResult.stats?.total_minutes||0)} studied total</div>
                    </div>
                    <button style={{...css.btn,padding:"8px 16px",fontSize:13}} onClick={()=>sendFriendRequest(friendSearchResult.id)}>Add Friend</button>
                  </div>
                </div>
              )}
            </div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>👥 Friends ({friends.length})</div>
              {friends.length===0&&<div style={{color:T.sub,fontSize:13}}>No friends yet. Share your code <strong style={{color:T.accent}}>#{profile?.friend_code}</strong></div>}
              {friends.map((f,i)=>{
                const online=onlineMembers.find(o=>o.user_id===f.id);
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
                    <div style={{position:"relative"}}>
                      <div style={css.av()}>{(f.username||"?")[0].toUpperCase()}</div>
                      <span style={{...css.dot(online?.status||"offline"),position:"absolute",bottom:0,right:0,border:`2px solid ${T.card}`}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14}}>{f.username}</div>
                      <div style={{fontSize:11,color:T.sub,marginTop:2}}>
                        {online?.status==="studying"?<span style={{color:T.accent}}>📖 Studying {online.subject}</span>:online?.status==="online"?"🟢 Online":"⚫ Offline"}
                      </div>
                      <div style={{display:"flex",gap:12,marginTop:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:T.sub}}>Today: <strong style={{color:T.text}}>{fmtMins(f.stats?.today_minutes||0)}</strong></span>
                        <span style={{fontSize:11,color:T.sub}}>Week: <strong style={{color:T.text}}>{fmtMins(f.stats?.weekly_minutes||0)}</strong></span>
                        <span style={{fontSize:11,color:T.sub}}>Total: <strong style={{color:T.accent}}>{fmtMins(f.stats?.total_minutes||0)}</strong></span>
                        <span style={{fontSize:11,color:T.sub}}>🔥 {f.stats?.streak||0} streak</span>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <button onClick={()=>openDM(f)} style={{...css.btn,padding:"5px 12px",fontSize:12,position:"relative"}}>
                        💬 DM {unreadDMs[f.id]>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#cc2222",color:"#fff",borderRadius:"50%",fontSize:10,width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreadDMs[f.id]}</span>}
                      </button>
                      <div style={{display:"flex",gap:4}}>
                        {editingNickname===f.id?(
                          <div style={{display:"flex",gap:4}}>
                            <input style={{...css.input,padding:"3px 8px",fontSize:11,width:100}} placeholder="Nickname" value={nicknameInput} onChange={e=>setNicknameInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveNickname(f.id,nicknameInput);if(e.key==="Escape")setEditingNickname(null);}} autoFocus/>
                            <button style={{...css.btn,padding:"3px 8px",fontSize:11}} onClick={()=>saveNickname(f.id,nicknameInput)}>✓</button>
                          </div>
                        ):(
                          <button onClick={()=>{setEditingNickname(f.id);setNicknameInput(nicknames[f.id]||"");}} style={{...css.btnO,padding:"3px 8px",fontSize:11}}>{nicknames[f.id]?"✏️ Nick":"🏷️ Nick"}</button>
                        )}
                        <button onClick={()=>removeFriend(f.id)} style={{...css.btnO,padding:"3px 8px",fontSize:11,borderColor:"#cc2222",color:"#cc2222"}}>×</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="leaderboard"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {["daily","weekly","monthly"].map(f=>(
                <button key={f} style={css.tBtn(leaderboardFrame===f)} onClick={()=>setLeaderboardFrame(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
              ))}
            </div>
            {!group?(
              <div style={{...css.card,textAlign:"center",padding:40}}>
                <div style={{fontSize:48}}>🏆</div>
                <div style={{fontWeight:700,fontSize:18,marginTop:12}}>Join a group to see rankings</div>
                <div style={{color:T.sub,fontSize:13,marginTop:8,marginBottom:20}}>Compete with your study group on the leaderboard</div>
                <button style={css.btn} onClick={()=>setTab("social")}>Go to Social</button>
              </div>
            ):(
              leaderboard.length===0?(
                <div style={{...css.card,textAlign:"center",padding:40}}>
                  <div style={{fontSize:48}}>📊</div>
                  <div style={{fontWeight:700,fontSize:18,marginTop:12}}>No data yet</div>
                  <div style={{color:T.sub,fontSize:13,marginTop:8}}>Start studying to appear on the leaderboard!</div>
                </div>
              ):(
                <div style={css.card}>
                  <div style={{fontWeight:700,marginBottom:16}}>🏆 {leaderboardFrame.charAt(0).toUpperCase()+leaderboardFrame.slice(1)} Rankings</div>
                  {[...leaderboard].sort((a,b)=>{
                    const key=leaderboardFrame==="daily"?"today_minutes":leaderboardFrame==="monthly"?"total_minutes":"weekly_minutes";
                    return (b.stats?.[key]||0)-(a.stats?.[key]||0);
                  }).map((m,i)=>{
                    const key=leaderboardFrame==="daily"?"today_minutes":leaderboardFrame==="monthly"?"total_minutes":"weekly_minutes";
                    const mins=m.stats?.[key]||0;
                    const isMe=m.id===authUser?.id;
                    const medals=["🥇","🥈","🥉"];
                    return(
                      <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:`1px solid ${T.border}`,background:isMe?`${T.accent}08`:"transparent",borderRadius:isMe?8:0,padding:isMe?"12px 10px":"14px 0"}}>
                        <div style={{fontSize:i<3?22:14,fontWeight:700,width:28,textAlign:"center",color:i<3?undefined:T.sub}}>{i<3?medals[i]:`#${i+1}`}</div>
                        <div style={css.av()}>{(m.username||"?")[0].toUpperCase()}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,fontSize:14,color:isMe?T.accent:T.text}}>{m.username}{isMe?" (you)":""}</div>
                          <div style={{fontSize:11,color:T.sub,marginTop:2}}>🔥 {m.stats?.streak||0} day streak</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontWeight:900,fontSize:16,color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":T.text}}>{fmtMins(mins)}</div>
                          <div style={{fontSize:10,color:T.sub}}>{leaderboardFrame}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}

        {tab==="stats"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{...css.card,gridColumn:"1/-1"}}>
                <div style={{fontWeight:700,marginBottom:16}}>📊 Overview</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,textAlign:"center"}}>
                  {[
                    {label:"Today",val:fmtMins(stats.today_minutes||0),icon:"📅"},
                    {label:"This Week",val:fmtMins(stats.weekly_minutes||0),icon:"📆"},
                    {label:"Total",val:fmtMins(stats.total_minutes||0),icon:"⏱"},
                    {label:"Streak",val:`${stats.streak||0}d`,icon:getStreakFlame(stats.streak||0).icon},
                  ].map(s=>(
                    <div key={s.label} style={{padding:16,background:T.surface,borderRadius:12,border:`1px solid ${T.border}`}}>
                      <div style={{fontSize:24}}>{s.icon}</div>
                      <div style={{fontSize:20,fontWeight:900,color:T.accent,marginTop:6}}>{s.val}</div>
                      <div style={{fontSize:11,color:T.sub,marginTop:4}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={css.card}>
                <div style={{fontWeight:700,marginBottom:12}}>📚 Subject Breakdown</div>
                {Object.keys(stats.subject_minutes||{}).length===0
                  ?<div style={{color:T.sub,fontSize:13}}>Start studying to see your subject stats</div>
                  :Object.entries(stats.subject_minutes||{}).sort((a,b)=>b[1]-a[1]).map(([sub,mins])=>{
                    const max=Math.max(...Object.values(stats.subject_minutes||{}),1);
                    return(<div key={sub} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                        <span style={{fontWeight:600}}>{sub}</span>
                        <span style={{color:T.accent,fontWeight:700}}>{fmtMins(mins)}</span>
                      </div>
                      <div style={{height:6,background:T.border,borderRadius:3}}>
                        <div style={{height:"100%",background:T.accent,borderRadius:3,width:`${(mins/max)*100}%`,transition:"width 0.5s"}}/>
                      </div>
                    </div>);
                  })
                }
              </div>

              <div style={css.card}>
                <div style={{fontWeight:700,marginBottom:12}}>🔥 Streak Info</div>
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{fontSize:48*getStreakFlame(stats.streak||0).size,filter:`drop-shadow(0 0 12px ${getStreakFlame(stats.streak||0).color})`}}>{getStreakFlame(stats.streak||0).icon}</div>
                  <div style={{fontSize:36,fontWeight:900,color:getStreakFlame(stats.streak||0).color,marginTop:8}}>{stats.streak||0}</div>
                  <div style={{fontSize:13,color:T.sub,marginTop:4}}>day streak · {getStreakFlame(stats.streak||0).label}</div>
                </div>
                <div style={{marginTop:8}}>
                  {[[7,"🟡","7-day"],[14,"🟠","14-day"],[90,"🔴","90-day"],[180,"💜","180-day"],[365,"💙","365-day"]].map(([n,icon,label])=>(
                    <div key={n} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`,opacity:(stats.streak||0)>=n?1:0.35}}>
                      <span style={{fontSize:18}}>{icon}</span>
                      <span style={{fontSize:13,flex:1}}>{label} streak</span>
                      {(stats.streak||0)>=n?<span style={{fontSize:11,color:T.accent,fontWeight:700}}>✓ Reached</span>:<span style={{fontSize:11,color:T.sub}}>{n-(stats.streak||0)} days left</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{...css.card,gridColumn:"1/-1"}}>
                <div style={{fontWeight:700,marginBottom:4}}>📊 Study Heatmap</div>
                <div style={{fontSize:12,color:T.sub,marginBottom:12}}>Last 28 weeks · colors are relative to your personal best day</div>
                <div style={{overflowX:"auto",paddingBottom:8}}>
                  <div style={{display:"flex",gap:3,minWidth:420}}>
                    {Array(28).fill(null).map((_,col)=>{
                      const weekDays=heatmapDays.slice(col*7,(col+1)*7);
                      const firstOfMonth=weekDays.find(d=>d.key.endsWith("-01"));
                      return(
                        <div key={col} style={{display:"flex",flexDirection:"column",gap:3,alignItems:"center"}}>
                          <div style={{fontSize:8,color:firstOfMonth?T.accent:"transparent",fontWeight:700,height:12,whiteSpace:"nowrap"}}>
                            {firstOfMonth?new Date(firstOfMonth.key).toLocaleString("en",{month:"short"}):"·"}
                          </div>
                          {weekDays.map((day)=>(
                            <div key={day.key} title={`${day.key}: ${fmtMins(day.mins)}`} style={{width:14,height:14,borderRadius:3,background:heatmapColor(day.mins),flexShrink:0,cursor:"default"}}/>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8,fontSize:11,color:T.sub}}>
                  <span>None</span>
                  {[T.surface,"#7f1d1d","#dc2626","#f59e0b","#84cc16","#22c55e"].map((c,i)=>(
                    <div key={i} style={{width:12,height:12,borderRadius:2,background:c,border:`1px solid ${T.border}`}}/>
                  ))}
                  <span>🔥 Great</span>
                </div>
              </div>

              <div style={{...css.card,gridColumn:"1/-1"}}>
                <div style={{fontWeight:700,marginBottom:12}}>🏆 Leaderboard Position</div>
                <div style={{color:T.sub,fontSize:13}}>Check the <span style={{color:T.accent,cursor:"pointer",fontWeight:700}} onClick={()=>{}}>🏆 Ranks</span> tab to see where you stand</div>
                <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap"}}>
                  <div style={{padding:"12px 20px",background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,textAlign:"center"}}>
                    <div style={{fontSize:11,color:T.sub}}>Total sessions</div>
                    <div style={{fontSize:22,fontWeight:900,color:T.accent,marginTop:4}}>{stats.sessions_count||0}</div>
                  </div>
                  <div style={{padding:"12px 20px",background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,textAlign:"center"}}>
                    <div style={{fontSize:11,color:T.sub}}>Longest session</div>
                    <div style={{fontSize:22,fontWeight:900,color:T.accent,marginTop:4}}>{fmtMins(stats.longest_session||0)}</div>
                  </div>
                  <div style={{padding:"12px 20px",background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,textAlign:"center"}}>
                    <div style={{fontSize:11,color:T.sub}}>Badges earned</div>
                    <div style={{fontSize:22,fontWeight:900,color:T.accent,marginTop:4}}>{(stats.achievements||[]).length}/{ACHIEVEMENTS.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="planner"&&(
          <div>
            {/* Event Modal */}
            {showEventModal&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
                <div style={{...css.card,width:"100%",maxWidth:420,maxHeight:"90vh",overflowY:"auto"}}>
                  <div style={{fontWeight:800,fontSize:16,marginBottom:16}}>{editingEvent?"✏️ Edit Event":"➕ New Event"}</div>
                  <input style={{...css.input,marginBottom:10}} placeholder="Event title *" value={eventForm.title} onChange={e=>setEventForm(p=>({...p,title:e.target.value}))}/>
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    <input style={{...css.input,flex:1}} type="date" value={eventForm.date} onChange={e=>setEventForm(p=>({...p,date:e.target.value}))}/>
                    <input style={{...css.input,flex:1}} type="time" value={eventForm.time} onChange={e=>setEventForm(p=>({...p,time:e.target.value}))}/>
                  </div>
                  <select style={{...css.input,marginBottom:10}} value={eventForm.type} onChange={e=>setEventForm(p=>({...p,type:e.target.value}))}>
                    {EVENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:12,color:T.sub,marginBottom:6}}>Event Color</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {EVENT_COLORS.map(c=>(
                        <div key={c} onClick={()=>setEventForm(p=>({...p,color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:eventForm.color===c?"3px solid #fff":"3px solid transparent",transition:"all 0.15s"}}/>
                      ))}
                    </div>
                  </div>
                  <textarea style={{...css.input,marginBottom:10,resize:"vertical",minHeight:70}} placeholder="Note (optional)" value={eventForm.note} onChange={e=>setEventForm(p=>({...p,note:e.target.value}))}/>
                  <div style={{...css.card,background:T.surface,padding:12,marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{fontSize:13,fontWeight:600}}>🔔 Reminder</div>
                      <button onClick={()=>setEventForm(p=>({...p,reminderEnabled:!p.reminderEnabled}))} style={{...css.btn,padding:"4px 12px",fontSize:12,background:eventForm.reminderEnabled?T.accent:"#555",color:eventForm.reminderEnabled?"#000":"#fff"}}>{eventForm.reminderEnabled?"ON":"OFF"}</button>
                    </div>
                    {eventForm.reminderEnabled&&(
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,flexWrap:"wrap"}}>
                        <input style={{...css.input,width:70}} type="number" min="1" max="10080" value={eventForm.reminderMins} onChange={e=>setEventForm(p=>({...p,reminderMins:Number(e.target.value)}))}/>
                        <span style={{fontSize:13,color:T.sub}}>minutes before</span>
                        <div style={{display:"flex",gap:4}}>
                          {[[15,"15m"],[30,"30m"],[60,"1h"],[1440,"1d"]].map(([v,l])=>(
                            <button key={v} onClick={()=>setEventForm(p=>({...p,reminderMins:v}))} style={{...css.btnO,padding:"2px 8px",fontSize:11,borderColor:eventForm.reminderMins===v?T.accent:T.border,color:eventForm.reminderMins===v?T.accent:T.sub}}>{l}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button style={{...css.btn,flex:1,padding:12}} onClick={saveEvent}>{editingEvent?"Save Changes":"Add Event"}</button>
                    <button style={{...css.btnO,padding:12}} onClick={()=>{setShowEventModal(false);setEditingEvent(null);}}>Cancel</button>
                    {editingEvent&&<button style={{...css.btnD,padding:12}} onClick={()=>{deleteEvent(editingEvent.id);setShowEventModal(false);setEditingEvent(null);}}>Delete</button>}
                  </div>
                </div>
              </div>
            )}

            {/* Calendar */}
            <div style={css.card}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <button style={{...css.btnO,padding:"4px 12px"}} onClick={()=>setPlannerMonth(new Date(plannerYear,plannerMonthIdx-1,1))}>←</button>
                <div style={{fontWeight:900,fontSize:16}}>{MONTH_NAMES[plannerMonthIdx]} {plannerYear}</div>
                <button style={{...css.btnO,padding:"4px 12px"}} onClick={()=>setPlannerMonth(new Date(plannerYear,plannerMonthIdx+1,1))}>→</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
                {DAY_NAMES.map(d=><div key={d} style={{textAlign:"center",fontSize:11,color:T.sub,fontWeight:700,padding:"4px 0"}}>{d}</div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                {Array(plannerFirstDay).fill(null).map((_,i)=><div key={"e"+i}/>)}
                {Array(plannerDaysInMonth).fill(null).map((_,i)=>{
                  const d=i+1;
                  const ds=`${plannerYear}-${String(plannerMonthIdx+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  const dayEvs=plannerEventsOnDay(d);
                  const isToday=ds===plannerTodayStr;
                  const isSelected=selectedDay===ds;
                  return(
                    <div key={d} onClick={()=>setSelectedDay(isSelected?null:ds)} style={{minHeight:44,padding:"4px 2px",borderRadius:8,cursor:"pointer",background:isSelected?`${T.accent}25`:isToday?`${T.accent}12`:"transparent",border:isToday?`1px solid ${T.accent}`:"1px solid transparent",textAlign:"center"}}>
                      <div style={{fontSize:12,fontWeight:isToday?900:400,color:isToday?T.accent:T.text}}>{d}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:2,justifyContent:"center",marginTop:2}}>
                        {dayEvs.slice(0,3).map(ev=>(
                          <div key={ev.id} style={{width:6,height:6,borderRadius:"50%",background:ev.color||T.accent}}/>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button style={{...css.btn,width:"100%",marginTop:14,padding:10}} onClick={()=>openNewEvent(selectedDay||plannerTodayStr)}>+ Add Event</button>
            </div>

            {/* Selected day */}
            {selectedDay&&(
              <div style={css.card}>
                <div style={{fontWeight:700,marginBottom:12}}>📋 {MONTH_NAMES[parseInt(selectedDay.split("-")[1])-1]} {parseInt(selectedDay.split("-")[2])}, {selectedDay.split("-")[0]}</div>
                {plannerEvents.filter(e=>e.date===selectedDay).length===0&&<div style={{color:T.sub,fontSize:13}}>No events. <span style={{color:T.accent,cursor:"pointer"}} onClick={()=>openNewEvent(selectedDay)}>+ Add one</span></div>}
                {plannerEvents.filter(e=>e.date===selectedDay).sort((a,b)=>a.time>b.time?1:-1).map(ev=>(
                  <div key={ev.id} onClick={()=>openEditEvent(ev)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,marginBottom:8,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",borderLeft:`4px solid ${ev.color||T.accent}`}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14}}>{ev.title}</div>
                      <div style={{fontSize:12,color:T.sub}}>{ev.type}{ev.time?" · "+ev.time:""}</div>
                      {ev.note&&<div style={{fontSize:11,color:T.sub,marginTop:4,fontStyle:"italic"}}>{ev.note}</div>}
                    </div>
                    {ev.reminderEnabled&&<span>🔔</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Today's schedule */}
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>📅 Today's Schedule</div>
              {plannerTodayEvents.length===0&&<div style={{color:T.sub,fontSize:13}}>Nothing today. <span style={{color:T.accent,cursor:"pointer"}} onClick={()=>openNewEvent(plannerTodayStr)}>+ Add event</span></div>}
              {plannerTodayEvents.map(ev=>(
                <div key={ev.id} onClick={()=>openEditEvent(ev)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,marginBottom:8,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",borderLeft:`4px solid ${ev.color||T.accent}`}}>
                  <div style={{fontSize:18,fontWeight:900,color:ev.color||T.accent,minWidth:50,textAlign:"center"}}>{ev.time||"--:--"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{ev.title}</div>
                    <div style={{fontSize:12,color:T.sub}}>{ev.type}</div>
                    {ev.note&&<div style={{fontSize:11,color:T.sub,fontStyle:"italic"}}>{ev.note}</div>}
                  </div>
                  {ev.reminderEnabled&&<span>🔔</span>}
                </div>
              ))}
            </div>

            {/* Upcoming */}
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🔮 Upcoming Events</div>
              {plannerUpcoming.length===0&&<div style={{color:T.sub,fontSize:13}}>No upcoming events.</div>}
              {plannerUpcoming.map(ev=>(
                <div key={ev.id} onClick={()=>openEditEvent(ev)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,marginBottom:8,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",borderLeft:`4px solid ${ev.color||T.accent}`}}>
                  <div style={{textAlign:"center",minWidth:44}}>
                    <div style={{fontSize:18,fontWeight:900,color:ev.color||T.accent}}>{parseInt(ev.date.split("-")[2])}</div>
                    <div style={{fontSize:10,color:T.sub}}>{MONTH_NAMES[parseInt(ev.date.split("-")[1])-1].slice(0,3)}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{ev.title}</div>
                    <div style={{fontSize:12,color:T.sub}}>{ev.type}{ev.time?" · "+ev.time:""}{ev.date===plannerTodayStr?" · Today":""}</div>
                  </div>
                  <div style={{width:10,height:10,borderRadius:"50%",background:ev.color||T.accent,flexShrink:0}}/>
                </div>
              ))}
            </div>
          </div>
        )}


        {tab==="achievements"&&(
          <div>
            <div style={{...css.card,marginBottom:16}}>
              <div style={{fontWeight:700}}>🎖 Badges: {(stats.achievements||[]).length} / {ACHIEVEMENTS.length}</div>
              <div style={{height:8,background:T.border,borderRadius:4,marginTop:10}}><div style={{height:"100%",background:T.accent,borderRadius:4,width:`${((stats.achievements||[]).length/ACHIEVEMENTS.length)*100}%`}}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
              {ACHIEVEMENTS.map(a=>{
                const unlocked=(stats.achievements||[]).includes(a.id);
                return(<div key={a.id} style={{...css.card,padding:14,textAlign:"center",opacity:unlocked?1:0.4,border:`1.5px solid ${unlocked?T.accent:T.border}`,background:unlocked?`${T.accent}08`:T.card}}>
                  <div style={{fontSize:28}}>{a.secret&&!unlocked?"❓":a.icon}</div>
                  <div style={{fontWeight:700,fontSize:13,marginTop:6}}>{a.secret&&!unlocked?"???":a.name}</div>
                  <div style={{fontSize:11,color:T.sub,marginTop:4}}>{a.secret&&!unlocked?"Hidden achievement":a.desc}</div>
                  {a.secret&&<div style={{fontSize:10,color:T.accent,marginTop:4,fontWeight:700}}>SECRET</div>}
                  {unlocked&&<div style={{fontSize:10,color:T.accent,marginTop:6,fontWeight:700}}>✓ UNLOCKED</div>}
                </div>);
              })}
            </div>
          </div>
        )}

        {tab==="settings"&&(
          <div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>👤 Account</div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                {/* Clickable avatar */}
                <input type="file" accept="image/*" id="pfp-upload" style={{display:"none"}} onChange={e=>{if(e.target.files[0])uploadPfp(e.target.files[0]);}}/>
                <label htmlFor="pfp-upload" style={{cursor:"pointer",position:"relative",flexShrink:0}}>
                  <FramedAvatar size={68} avatarUrl={avatarUrl} username={profile?.username} frameId={selectedFrame} unlockedFrames={unlockedFrames} isPro={isPro} accentColor={T.accent}/>
                  <div style={{position:"absolute",bottom:2,right:2,background:T.bg,borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,border:`1px solid ${T.border}`,zIndex:10}}>📷</div>
                </label>
                <div>
                  <div style={{fontWeight:700,fontSize:16}}>{profile?.username}</div>
                  <div style={{fontSize:12,color:T.sub}}>{profile?.email}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,color:T.accent}}>Your code: <strong style={{letterSpacing:2}}>#{profile?.friend_code||"..."}</strong></span>
                    <button onClick={()=>{navigator.clipboard.writeText(profile?.friend_code||"");alert("Code copied!");}} style={{...css.btn,padding:"3px 10px",fontSize:11,borderRadius:8}}>📋 Copy</button>
                  </div>
                  {avatarUrl&&<button onClick={async()=>{setAvatarUrl(null);await supabase.from("profiles").update({avatar_url:null}).eq("id",authUser.id);}} style={{...css.btnO,marginTop:6,padding:"3px 10px",fontSize:11,color:"#cc2222",borderColor:"#cc2222"}}>Remove photo</button>}
                </div>
              </div>
              <button style={css.btnD} onClick={handleLogout}>Sign Out</button>
              <button style={{...css.btnD,marginTop:8,background:"transparent",border:"1px solid #cc2222",color:"#cc2222",fontSize:12}} onClick={()=>{setShowDeleteModal(true);setDeleteConfirmText("");}}>🗑️ Delete Account</button>
            </div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🎨 Themes</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                {Object.entries(THEMES).map(([k,v])=>(
                  <button key={k} onClick={()=>handleTheme(k)} style={{...css.btnO,padding:"10px",textAlign:"left",display:"flex",alignItems:"center",gap:8,borderColor:theme===k?T.accent:T.border,background:theme===k?`${T.accent}15`:"transparent"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:v.accent,flexShrink:0}}/>
                    <span style={{fontSize:12,fontWeight:theme===k?700:400,color:theme===k?T.accent:T.text}}>{v.name}</span>
                    {theme===k&&<span style={{marginLeft:"auto",color:T.accent}}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:4}}>👑 StudyGrove Pro</div>
              <div style={{fontSize:12,color:T.sub,marginBottom:12}}>Unlock animated frames, quotes, mystery box and more</div>
              <button style={{...css.btn,width:"100%",padding:12}} onClick={()=>setShowProModal(true)}>✨ View Pro Features — $2.99/month</button>
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:4}}>🔒 Privacy</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0"}}>
                <div><div style={{fontSize:14,fontWeight:600}}>Invisible Mode</div><div style={{fontSize:12,color:T.sub}}>Timer still counts. You appear offline.</div></div>
                <button onClick={()=>setInvisible(v=>!v)} style={{...css.btn,padding:"6px 14px",fontSize:12,background:invisible?"#cc2222":T.accent,color:invisible?"#fff":"#000"}}>{invisible?"👻 ON":"🟢 OFF"}</button>
              </div>
            </div>


            {/* Go Pro Banner */}
            <div style={{...css.card,border:`1.5px solid #ffd600`,background:`linear-gradient(135deg,${T.card},#ffd60010)`,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div>
                  <div style={{fontWeight:900,fontSize:18}}>👑 StudyGrove <span style={{color:"#ffd600"}}>Pro</span></div>
                  <div style={{fontSize:12,color:T.sub,marginTop:4}}>Animated frames · Weekly mystery box · Quotes · Heatmap · 10 streak revivals · <span style={{color:"#4caf50"}}>No ads ever</span></div>
                  <div style={{fontSize:13,color:"#ffd600",fontWeight:700,marginTop:6}}>$2.99/month</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <button style={{...css.btn,background:"#ffd600",color:"#000",padding:"10px 20px",fontSize:14,borderRadius:12}}>Coming Soon 🚀</button>
                  <div style={{fontSize:10,color:T.sub,marginTop:4}}>Be the first to know</div>
                </div>
              </div>
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🔔 Notifications</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600}}>In-app notifications</div>
                  <div style={{fontSize:12,color:T.sub}}>Show toast when group or DM message arrives</div>
                </div>
                <button onClick={()=>{setNotificationsEnabled(v=>!v);localStorage.setItem("sg_notifs",String(!notificationsEnabled));}} style={{...css.btn,padding:"6px 14px",fontSize:12,background:notificationsEnabled?T.accent:"#555",color:notificationsEnabled?"#000":"#fff"}}>
                  {notificationsEnabled?"🔔 ON":"🔕 OFF"}
                </button>
              </div>
            </div>

            {/* Profile Picture */}
            {/* Profile Frames */}
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🖼️ Profile Frames</div>
              <div style={{fontSize:12,color:T.sub,marginBottom:12}}>Select your frame — unlock more by completing achievements</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
                {/* No frame option */}
                <div onClick={()=>{setSelectedFrame("none");localStorage.setItem("sg_frame","none");}} style={{...css.card,padding:10,textAlign:"center",cursor:"pointer",border:`2px solid ${selectedFrame==="none"||!selectedFrame?T.accent:T.border}`,background:selectedFrame==="none"||!selectedFrame?`${T.accent}15`:T.card}}>
                  <div style={{fontSize:22}}>⬜</div>
                  <div style={{fontSize:10,marginTop:4,color:T.sub}}>None</div>
                </div>
                {Object.values(FRAMES).map(f=>{
                  const owned=unlockedFrames.includes(f.id);
                  const active=selectedFrame===f.id;
                  const accent=f.colors[1];
                  return(
                    <div key={f.id} onClick={()=>{
                      if(owned){setSelectedFrame(f.id);localStorage.setItem("sg_frame",f.id);}
                    }} style={{...css.card,padding:8,textAlign:"center",cursor:owned?"pointer":"default",border:`2px solid ${active?accent:owned?accent+"66":T.border}`,background:active?`${accent}20`:T.card,opacity:owned?1:0.38,position:"relative",transition:"all 0.15s"}}>
                      <div style={{display:"flex",justifyContent:"center",marginBottom:4}}>
                        <FramedAvatar size={40} avatarUrl={null} username="A" frameId={f.id} unlockedFrames={owned?[f.id]:[]} isPro={true} accentColor={T.accent}/>
                      </div>
                      <div style={{fontSize:9,color:active?accent:owned?accent:T.sub,fontWeight:active?700:400}}>{f.name}</div>
                      {f.premium&&<div style={{position:"absolute",top:2,right:2,fontSize:7,background:"#ffd600",color:"#000",borderRadius:3,padding:"1px 4px",fontWeight:700}}>PRO</div>}
                      {!owned&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,borderRadius:8}}>🔒</div>}
                      {active&&<div style={{position:"absolute",top:2,left:2,fontSize:7,background:accent,color:"#000",borderRadius:3,padding:"1px 4px",fontWeight:700}}>ON</div>}
                    </div>
                  );
                })}
              </div>
              {unlockedFrames.length===0&&<div style={{fontSize:12,color:T.sub,padding:"8px 0"}}>🔒 Complete achievements to unlock frames! Try finishing your first study session to get the 🌱 Sprout frame.</div>}
            </div>

            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:4}}>📖 About</div>
              <div style={{fontSize:12,color:T.sub}}>StudyGrove v2.0 · Built by Aziz ZL</div>
              <div style={{fontSize:11,color:T.border,marginTop:8,fontStyle:"italic"}}>Click the 📖 logo 5 times for a secret...</div>
              <div style={{marginTop:10,fontSize:12}}><a href="/privacy.html" target="_blank" style={{color:T.accent}}>📄 Privacy Policy</a></div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}select option{background:${T.card};color:${T.text}}.desktop-header{display:flex!important}.mobile-header{display:none!important}@media(max-width:600px){.desktop-header{display:none!important}.mobile-header{display:flex!important}}`}</style>
    </div>
  );
}
