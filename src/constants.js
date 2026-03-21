import React from "react";
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://cifpwjdhfiyidvympecs.supabase.co";
export const SUPABASE_KEY = "sb_publishable_HvSxWwjvK_zgI-PvQS4SyA_dCUUZJc9";
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const DEFAULT_SUBJECTS = ["Math","Physics","Chemistry","SVT","French","English","Arabic","Philosophy","Informatics"];

export const XP_LEVELS = [0,100,250,500,1000,2000,5000,10000,20000,40000];
export const LEVEL_TITLES = ["Beginner","Apprentice","Learner","Scholar","Academic","Strategist","Intellectual","Mastermind","Grand Scholar","Legend"];
export const LEVEL_ICONS  = ["🌱","📖","✏️","🎓","🔬","⚡","🧠","🏆","👑","🌟"];
export const LEVEL_REWARDS= [null,"Sprout frame unlocked 🌱","Scholar badge 🎓","Night Owl theme 🌙","Animated streak flames 🔥","Diamond frame 💎","Warrior frame ⚔️","Champion frame 👑","Legendary glow 🌟","You are a Legend ✦"];

export const getLevelFromXP=(xp)=>{
  let level=1;
  for(let i=0;i<XP_LEVELS.length;i++){if(xp>=XP_LEVELS[i])level=i+1;}
  return level;
};
export const getXPProgress=(xp)=>{
  const x=xp||0;
  const level=getLevelFromXP(x);
  const currentLevelXP=XP_LEVELS[level-1]||0;
  const nextLevelXP=XP_LEVELS[level]||currentLevelXP;
  const progress=x-currentLevelXP;
  const needed=nextLevelXP-currentLevelXP;
  const percent=needed===0?100:Math.min(Math.floor((progress/needed)*100),100);
  return{level,title:LEVEL_TITLES[level-1],icon:LEVEL_ICONS[level-1],reward:LEVEL_REWARDS[level-1],current:progress,needed,percent,totalXp:x,next:XP_LEVELS[level]||null};
};

export const MAX_DAILY_XP=600;
export const calcSessionXP=(currentStats,minutesStudied,pomodorosToday)=>{
  const todayStr=`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}-${String(new Date().getDate()).padStart(2,"0")}`;
  let gained=minutesStudied;
  const bonuses=[];
  if(currentStats.last_study_date!==todayStr){gained+=10;bonuses.push("+10 XP first session bonus");}
  if(pomodorosToday>=4){gained+=20;bonuses.push("+20 XP Focus Master");}
  const streak=(currentStats.streak||0)+1;
  if(streak===3){gained+=10;bonuses.push("+10 XP 3-day streak");}
  if(streak===7){gained+=25;bonuses.push("+25 XP 7-day streak");}
  if(streak===30){gained+=100;bonuses.push("+100 XP 30-day streak");}
  const dailyKey=`daily_xp_${todayStr}`;
  const dailySoFar=currentStats[dailyKey]||0;
  const remaining=Math.max(0,MAX_DAILY_XP-dailySoFar);
  if(gained>remaining){gained=remaining;if(remaining===0)bonuses.push("Daily cap reached (600 XP/day)");}
  const oldXP=currentStats.total_xp||0;
  const newXP=oldXP+gained;
  return{gained,newXP,oldLevel:getLevelFromXP(oldXP),newLevel:getLevelFromXP(newXP),leveledUp:getLevelFromXP(newXP)>getLevelFromXP(oldXP),bonuses,dailyKey,dailySoFar:dailySoFar+gained};
};

export const THEMES={
  amoled:   {name:"Void",           bg:"#000000",surface:"#0a0a0a",card:"#111111",border:"#222222",text:"#ffffff",sub:"#888888",accent:"#6ee7b7",accent2:"#34d399"},
  white:    {name:"Clean White",    bg:"#f8f9fa",surface:"#ffffff",card:"#f0f0f0",border:"#e0e0e0",text:"#111111",sub:"#666666",accent:"#2563eb",accent2:"#1d4ed8"},
  red:      {name:"Crimson Dusk",   bg:"#0f0a0a",surface:"#1a1010",card:"#221515",border:"#3a2020",text:"#f5e8e8",sub:"#a87070",accent:"#e05c5c",accent2:"#c43a3a"},
  pink:     {name:"Sakura Night 🌸",bg:"#0d080e",surface:"#160d18",card:"#1e1022",border:"#3a1f40",text:"#f0e0f5",sub:"#9b7aaa",accent:"#d47fc4",accent2:"#b85aad"},
  forest:   {name:"Emerald",        bg:"#080f0a",surface:"#0d1a10",card:"#112215",border:"#1a3a22",text:"#e0f0e8",sub:"#6aaa82",accent:"#2dd4a0",accent2:"#1aaf82"},
  night:    {name:"Night Study",    bg:"#05050f",surface:"#0a0a1a",card:"#10102a",border:"#1a1a3a",text:"#ccd6f6",sub:"#8892b0",accent:"#64ffda",accent2:"#00bcd4"},
  sunset:   {name:"Cyber",          bg:"#080a12",surface:"#0d1120",card:"#111828",border:"#1e2d45",text:"#e0eaff",sub:"#6680a0",accent:"#00d4ff",accent2:"#0099cc"},
  lavender: {name:"Lavender Dream", bg:"#0d0015",surface:"#160020",card:"#1e002e",border:"#3d0066",text:"#f3e5f5",sub:"#ce93d8",accent:"#ab47bc",accent2:"#7b1fa2"},
};

export const ACHIEVEMENTS=[
  {id:"first_step",      icon:"🌱",name:"First Step",           desc:"Complete your first study session",  secret:false},
  {id:"apprentice",      icon:"📚",name:"Apprentice",           desc:"Study 10 hours total",               secret:false},
  {id:"dedicated",       icon:"🎯",name:"Dedicated",            desc:"Study 25 hours total",               secret:false},
  {id:"academic_weapon", icon:"⚔️",name:"Academic Weapon",      desc:"Study 100 hours total",              secret:false},
  {id:"streak_3",        icon:"🔥",name:"On Fire",              desc:"3-day study streak",                 secret:false},
  {id:"disciplined",     icon:"🧘",name:"Disciplined",          desc:"7-day study streak",                 secret:false},
  {id:"iron_will",       icon:"🦾",name:"Iron Will",            desc:"30-day study streak",                secret:false},
  {id:"champion",        icon:"🏆",name:"Champion",             desc:"Reach #1 on the leaderboard",        secret:false},
  {id:"task_slayer",     icon:"✅",name:"Task Slayer",          desc:"Complete 10 tasks",                  secret:false},
  {id:"task_master",     icon:"🗡️",name:"Task Master",         desc:"Complete 50 tasks",                  secret:false},
  {id:"pomodoro_warrior",icon:"🍅",name:"Pomodoro Warrior",     desc:"Complete 25 Pomodoro sessions",      secret:false},
  {id:"last_standing",   icon:"👑",name:"Last Student Standing",desc:"Win a Last Standing challenge",      secret:false},
  {id:"multi_subject",   icon:"🎓",name:"Polymath",             desc:"Study 5 different subjects",         secret:false},
  {id:"social",          icon:"👥",name:"Study Buddy",          desc:"Join your first group",              secret:false},
  {id:"focus_mode",      icon:"🔭",name:"Zone In",              desc:"Use focus mode 5 times",             secret:false},
  {id:"customizer",      icon:"🎨",name:"Interior Designer",    desc:"Try all 8 themes",                   secret:false},
  {id:"week_warrior",    icon:"📅",name:"Week Warrior",         desc:"Study every day for a week",         secret:false},
  {id:"night_owl",       icon:"🦉",name:"Night Owl",            desc:"Start a session after midnight",     secret:false},
  {id:"early_bird",      icon:"🐦",name:"Early Bird",           desc:"Start a session before 7am",         secret:false},
  {id:"ghost_student",   icon:"👻",name:"Ghost Student",        desc:"Study 3h while invisible",           secret:true },
  {id:"perfectionist",   icon:"💎",name:"Perfectionist",        desc:"Study 7 days without chatting",      secret:true },
  {id:"architect",       icon:"🏗️",name:"The Architect",       desc:"Discover the hidden easter egg",     secret:true },
  {id:"streak_7",        icon:"🔥",name:"Week Warrior",         desc:"7-day study streak",                 secret:false},
  {id:"streak_14",       icon:"🔥",name:"Two Week Grind",       desc:"14-day study streak",                secret:false},
  {id:"streak_90",       icon:"🔥",name:"Centurion",            desc:"90-day study streak",                secret:false},
  {id:"streak_180",      icon:"🔥",name:"Half Year Legend",     desc:"180-day study streak",               secret:false},
  {id:"streak_365",      icon:"🔥",name:"Year of Discipline",   desc:"365-day study streak",               secret:false},
];

export const unlockAchievement=(id,current)=>{
  if(current.includes(id))return current;
  return [...current,id];
};

export const getStreakFlame=(streak)=>{
  if(streak>=365)return{label:"Legendary",glow:"#4fc3f7",filter:"hue-rotate(200deg) saturate(3) brightness(1.4)",particles:["✦","·","✦","·","✦"],particleColor:"#4fc3f7"};
  if(streak>=180)return{label:"Elite",    glow:"#ce93d8",filter:"hue-rotate(260deg) saturate(3) brightness(1.3)",particles:["✦","·","✦","·"],    particleColor:"#ce93d8"};
  if(streak>=90) return{label:"Veteran",  glow:"#ff1744",filter:"hue-rotate(340deg) saturate(4) brightness(1.2)",particles:["✦","·","✦","·"],    particleColor:"#ff4444"};
  if(streak>=30) return{label:"Iron Will",glow:"#ff6d00",filter:"saturate(3) brightness(1.1)",                   particles:["·","✦","·"],         particleColor:"#ff9100"};
  if(streak>=14) return{label:"Rising",   glow:"#ff9100",filter:"saturate(2) brightness(1.1)",                   particles:["·","✦"],             particleColor:"#ffb300"};
  if(streak>=7)  return{label:"Warming Up",glow:"#ffd600",filter:"saturate(1.5) brightness(1.1)",               particles:["·"],                  particleColor:"#ffd600"};
  if(streak>=3)  return{label:"Started",  glow:"#ffb300",filter:"saturate(1.2)",                                 particles:[],                    particleColor:"#ffb300"};
  return               {label:"Starter",  glow:"transparent",filter:"grayscale(1) opacity(0.35)",               particles:[],                    particleColor:"#555"};
};

export const fmtTime=(s)=>{
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
  if(h>0)return `${h}h ${String(m).padStart(2,"0")}m`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
};
export const fmtMins=(m)=>{
  if(!m||m<=0)return "0m";
  if(m<60)return `${Math.round(m)}m`;
  return `${Math.floor(m/60)}h${m%60>0?" "+Math.round(m%60)+"m":""}`;
};
export const genCode=()=>Math.random().toString(36).substring(2,8).toUpperCase();

export const QUOTES={
  default:["Small steps every day lead to big results.","The expert was once a beginner.","Study hard now, flex later.","Discipline beats motivation every time.","Your future self is watching. Don't let them down.","One session at a time."],
  Math:["Math is not about numbers, it's about understanding.","Every problem has a solution — find it.","Practice makes permanent."],
  Physics:["Physics is the poetry of nature.","Understand the 'why', not just the 'what'.","Newton had an apple. You have StudyGrove."],
  Chemistry:["Chemistry is everywhere — even in your focus.","Balance the equation, balance your effort.","Reactions happen when you put in the energy."],
  SVT:["Life is complex — understand it deeply.","Biology is the science of possibilities.","Every cell in your body is rooting for you."],
  French:["La pratique fait la perfection.","Every language opens a new world.","Consistency is the key to fluency."],
  English:["Words are your most powerful tool.","Read more. Write more. Know more.","Language learning is a marathon, not a sprint."],
  Arabic:["العلم نور — Knowledge is light.","تعلم كل يوم شيئًا جديدًا.","الصبر مفتاح الفرج."],
  Philosophy:["The unexamined life is not worth living.","Question everything — that's where wisdom starts.","Think deeply. Act wisely."],
  Informatics:["Code is just logic made visible.","Every bug is a lesson in disguise.","Debug your mind, then your code."],
};

export const SUBJECT_COLORS={"Math":"#3b82f6","Physics":"#f97316","Chemistry":"#a855f7","SVT":"#22c55e","French":"#ec4899","English":"#6366f1","Arabic":"#eab308","Philosophy":"#14b8a6","Informatics":"#06b6d4"};
export const SUBJECT_ICONS={"Math":"📘","Physics":"⚡","Chemistry":"🧪","SVT":"🧬","French":"🇫🇷","English":"🇬🇧","Arabic":"📖","Philosophy":"🤔","Informatics":"🖥️"};
export const getSubjectColor=(subject)=>SUBJECT_COLORS[subject]||"#6ee7b7";
export const getSubjectIcon=(subject)=>SUBJECT_ICONS[subject]||"📚";

export const EVENT_TYPES=["Exam","Test","Vacation Start","Vacation End","Custom"];
export const EVENT_COLORS=["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#6366f1","#a855f7","#ec4899","#14b8a6","#64748b"];
export const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
export const DAY_NAMES=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export const FRAMES={
  sprout:   {id:"sprout",  name:"Sprout",  premium:false,colors:["#1b5e20","#4caf50","#a5d6a7","#4caf50","#1b5e20"],anim:"none",     particles:null},
  flame:    {id:"flame",   name:"Flame",   premium:false,colors:["#bf360c","#ff6d00","#ffcc02","#ff6d00","#bf360c"],anim:"pulse",    particles:null},
  champion: {id:"champion",name:"Champion",premium:false,colors:["#7f5f00","#ffd600","#fffde7","#ffd600","#7f5f00"],anim:"shimmer",  particles:"stars"},
  nightowl: {id:"nightowl",name:"Night Owl",premium:false,colors:["#311b92","#7c4dff","#d1c4e9","#7c4dff","#311b92"],anim:"none",   particles:null},
  diamond:  {id:"diamond", name:"Diamond", premium:false,colors:["#004d60","#00e5ff","#ffffff","#00e5ff","#004d60"],anim:"sparkle",  particles:"sparks"},
  scholar:  {id:"scholar", name:"Scholar", premium:false,colors:["#0a2a6e","#1565c0","#90caf9","#1565c0","#0a2a6e"],anim:"breathe", particles:"books"},
  warrior:  {id:"warrior", name:"Warrior", premium:false,colors:["#7f0000","#d50000","#ff6d6d","#d50000","#7f0000"],anim:"heartbeat",particles:"sparks"},
  aurora:   {id:"aurora",  name:"Aurora",  premium:true, colors:["#00bcd4","#7c4dff","#f48fb1","#00e5ff","#00bcd4"],anim:"rotate",   particles:null},
  inferno:  {id:"inferno", name:"Inferno", premium:true, colors:["#7f0000","#ff1744","#ff6d00","#ff1744","#7f0000"],anim:"fastpulse",particles:null},
  lightning:{id:"lightning",name:"Lightning",premium:true,colors:["#e65100","#ffea00","#ffffff","#ffea00","#e65100"],anim:"flash",   particles:"lightning"},
  ocean:    {id:"ocean",   name:"Ocean",   premium:true, colors:["#01579b","#0091ea","#b3e5fc","#0091ea","#01579b"],anim:"wave",     particles:"bubbles"},
  sakura:   {id:"sakura",  name:"Sakura",  premium:true, colors:["#880e4f","#f06292","#fce4ec","#f06292","#880e4f"],anim:"pulse",    particles:"petals"},
  glitch:   {id:"glitch",  name:"Glitch",  premium:true, colors:["#1b5e20","#76ff03","#ccff90","#76ff03","#1b5e20"],anim:"glitch",   particles:"glitch"},
};

export const frameGrad=(f)=>`linear-gradient(135deg,${f.colors.join(",")})`;

const PARTICLE_SETS={
  stars:    [{c:"★",col:"#ffd700"},{c:"✦",col:"#fffacd"},{c:"★",col:"#ffeb3b"},{c:"✦",col:"#fff176"},{c:"★",col:"#ffd700"},{c:"✦",col:"#ffe57f"}],
  sparks:   [{c:"✦",col:"#ffffff"},{c:"·",col:"#e0f7fa"},{c:"✦",col:"#b2ebf2"},{c:"·",col:"#ffffff"},{c:"✦",col:"#e0f7fa"},{c:"·",col:"#fff"}],
  books:    [{c:"📖",col:"#42a5f5"},{c:"✏️",col:"#90caf9"},{c:"📚",col:"#64b5f6"},{c:"⭐",col:"#fff"},{c:"📖",col:"#42a5f5"}],
  lightning:[{c:"⚡",col:"#ffea00"},{c:"✦",col:"#fff"},{c:"⚡",col:"#fff176"},{c:"✦",col:"#ffea00"},{c:"⚡",col:"#ffffff"},{c:"⚡",col:"#ffe57f"},{c:"✦",col:"#ffff00"},{c:"⚡",col:"#fff"}],
  bubbles:  [{c:"○",col:"#80d8ff"},{c:"◌",col:"#b3e5fc"},{c:"○",col:"#ffffff"},{c:"◌",col:"#80d8ff"},{c:"○",col:"#e1f5fe"},{c:"◌",col:"#fff"}],
  petals:   [{c:"🌸",col:"#f48fb1"},{c:"✿",col:"#fce4ec"},{c:"🌸",col:"#f06292"},{c:"✿",col:"#ff80ab"},{c:"🌸",col:"#fce4ec"},{c:"🌺",col:"#f48fb1"},{c:"✾",col:"#ffb3c6"},{c:"🌸",col:"#ff80ab"}],
  glitch:   [{c:"▪",col:"#76ff03"},{c:"▫",col:"#00ff00"},{c:"▪",col:"#ccff90"},{c:"░",col:"#76ff03"},{c:"▪",col:"#fff"},{c:"▓",col:"#76ff03"},{c:"░",col:"#00e676"},{c:"▪",col:"#b2ff59"},{c:"▓",col:"#fff"}],
};

const FrameParticles=({size,ptype})=>{
  const set=PARTICLE_SETS[ptype]||[];
  const count=set.length;
  return(<>{set.map((p,i)=>{const dur=3.5+i*0.35;return(<div key={i} style={{position:"absolute",inset:0,borderRadius:"50%",pointerEvents:"none",animation:`fpSpin ${dur}s infinite linear`,animationDelay:`-${(dur/count)*i}s`,zIndex:10}}><div style={{position:"absolute",top:"50%",left:"50%",transform:`rotate(${(360/count)*i}deg) translateY(-${size*0.47}px)`,fontSize:size*0.19,lineHeight:1,color:p.col,filter:"drop-shadow(0 0 3px currentColor)",marginTop:-(size*0.1),marginLeft:-(size*0.1)}}>{p.c}</div></div>);})}</>);
};

export const FramedAvatar=({size=40,avatarUrl,username,frameId,unlockedFrames,isPro,accentColor})=>{
  const frame=frameId&&frameId!=="none"?FRAMES[frameId]:null;
  const owned=frame&&(unlockedFrames.includes(frameId)||frame.premium);
  const ring=Math.max(4,size*0.13);
  const gap=Math.max(2,size*0.04);
  const inner=size-(ring+gap)*2;
  const animName=owned&&frame?{pulse:"faPulse",shimmer:"faShimmer",sparkle:"faSparkle",breathe:"faBreathe",heartbeat:"faHeartbeat",rotate:"faRotate",fastpulse:"faFastPulse",flash:"faFlash",wave:"faWave",glitch:"faGlitch"}[frame.anim]||"":"";
  return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}>{owned&&(<div style={{position:"absolute",inset:0,borderRadius:"50%",background:frameGrad(frame),animation:animName?(()=>{const dur=frame.anim==="glitch"?"0.15s":frame.anim==="fastpulse"?"0.6s":frame.anim==="flash"?"0.4s":frame.anim==="heartbeat"?"0.9s":frame.anim==="shimmer"?"2.5s":frame.anim==="sparkle"?"1.8s":"2s";const timing=frame.anim==="spin"||frame.anim==="rotate"?"linear":"ease-in-out";return`${animName} ${dur} infinite ${timing}`;})():"none"}}/>)}{owned&&(<div style={{position:"absolute",inset:ring,borderRadius:"50%",background:"rgba(0,0,0,0.55)"}}/>)}<div style={{position:"absolute",inset:owned?ring+gap:0,borderRadius:"50%",background:accentColor||"#00e676",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:inner*0.42,color:"#000"}}>{avatarUrl?<img src={avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="pfp"/>:<span>{(username||"?")[0].toUpperCase()}</span>}</div>{owned&&frame?.particles&&size>=56&&(<FrameParticles size={size} ptype={frame.particles}/>)}</div>);
};

export const StreakFlame=({streak,size=56})=>{
  const f=getStreakFlame(streak);
  const alive=streak>=1;
  const glowStr=alive?`drop-shadow(0 0 ${size*0.15}px ${f.glow}) drop-shadow(0 0 ${size*0.3}px ${f.glow}88)`:"none";
  return(<div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:size*1.4,height:size*1.4}}>{alive&&<div style={{position:"absolute",width:size*0.8,height:size*0.8,borderRadius:"50%",background:`radial-gradient(circle,${f.glow}44 0%,transparent 70%)`,filter:"blur(8px)",animation:"flamePulse 1.8s ease-in-out infinite"}}/>}<div style={{fontSize:size,lineHeight:1,filter:`${f.filter} ${glowStr}`,animation:alive?"flameWobble 1.6s ease-in-out infinite":"none",userSelect:"none",position:"relative",zIndex:2}}>🔥</div>{f.particles.map((p,i)=>(<span key={i} style={{position:"absolute",left:`${15+i*22}%`,bottom:`${55+i*8}%`,fontSize:size*0.18,color:f.particleColor,fontWeight:700,animation:`flameSpark ${0.9+i*0.35}s ease-out infinite`,animationDelay:`${i*0.25}s`,"--sdx":`${(i%2===0?-1:1)*(i+1)*5}px`,zIndex:3}}>{p}</span>))}</div>);
};

// Inject keyframes once
if(typeof document!=="undefined"){
  if(!document.getElementById("sg-flame-kf")){
    const s=document.createElement("style");s.id="sg-flame-kf";
    s.textContent=`@keyframes flamePulse{0%,100%{transform:scale(1)}40%{transform:scale(1.08) translateY(-2px)}70%{transform:scale(0.96) translateY(1px)}}@keyframes flameSpark{0%{opacity:1;transform:translateY(0) translateX(0) scale(1)}100%{opacity:0;transform:translateY(-32px) translateX(var(--sdx)) scale(0.2)}}@keyframes flameWobble{0%,100%{transform:rotate(-2deg) scale(1)}50%{transform:rotate(2deg) scale(1.04)}}`;
    document.head.appendChild(s);
  }
  if(!document.getElementById("sg-frame-kf")){
    const s=document.createElement("style");s.id="sg-frame-kf";
    s.textContent=`@keyframes faPulse{0%,100%{filter:brightness(1) opacity(0.95)}50%{filter:brightness(1.6) opacity(1)}}@keyframes faShimmer{0%{filter:brightness(0.9) contrast(1.1)}50%{filter:brightness(1.8) contrast(1.4) hue-rotate(15deg)}100%{filter:brightness(0.9) contrast(1.1)}}@keyframes faRotate{0%{filter:hue-rotate(0deg) brightness(1.1)}100%{filter:hue-rotate(360deg) brightness(1.1)}}@keyframes faFastPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(2.2) saturate(1.5)}}@keyframes faFlash{0%{filter:brightness(1) saturate(1)}40%{filter:brightness(4) saturate(3)}100%{filter:brightness(1) saturate(1)}}@keyframes faWave{0%,100%{filter:brightness(1) hue-rotate(0deg)}50%{filter:brightness(1.4) hue-rotate(25deg)}}@keyframes faGlitch{0%{filter:hue-rotate(0deg) saturate(4) brightness(1.2)}33%{filter:hue-rotate(90deg) saturate(6) brightness(1.8)}66%{filter:hue-rotate(180deg) saturate(4) brightness(1.2)}100%{filter:hue-rotate(270deg) saturate(6) brightness(1.8)}}@keyframes fpSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`;
    document.head.appendChild(s);
  }
}
