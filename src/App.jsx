import React, { useState, useEffect, useRef } from "react";
import {
  supabase, THEMES, ACHIEVEMENTS, FRAMES, QUOTES, DEFAULT_SUBJECTS,
  SUBJECT_COLORS, SUBJECT_ICONS, EVENT_TYPES, EVENT_COLORS, MONTH_NAMES, DAY_NAMES,
  XP_LEVELS, LEVEL_TITLES, LEVEL_ICONS, LEVEL_REWARDS, MAX_DAILY_XP,
  getLevelFromXP, getXPProgress, calcSessionXP,
  getSubjectColor, getSubjectIcon, getStreakFlame,
  fmtTime, fmtMins, genCode, frameGrad,
  FramedAvatar, StreakFlame, unlockAchievement,
} from "./constants.js";
import SettingsTab from "./SettingsTab__1_.jsx";
import AchievementsTab from "./AchievementsTab__1_.jsx";
import StatsTab from "./StatsTab__1_.jsx";
import PlannerTab from "./PlannerTab__1_.jsx";
import ChallengesTab from "./ChallengesTab__2_.jsx";

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
  const [isOnline, setIsOnline] = useState(typeof navigator!=="undefined"?navigator.onLine:true);
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
  const [paused, setPaused] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [subjects, setSubjects] = useState([...DEFAULT_SUBJECTS]);
  const [newSubject, setNewSubject] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [levelUpData, setLevelUpData] = useState(null);
  const [showSessionSummary, setShowSessionSummary] = useState(null);
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
  const isPro = true; // all features free
  const [selectedFrame, setSelectedFrame] = useState(()=>localStorage.getItem("sg_frame")||"none");
  const [profileTitle, setProfileTitle] = useState(()=>localStorage.getItem("sg_title")||"");
  const [currentQuote, setCurrentQuote] = useState("");
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [globalTop, setGlobalTop] = useState([]);
  const [showFullGlobal, setShowFullGlobal] = useState(false);
  const [fullGlobal, setFullGlobal] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);

  // Social Challenges
  const [socialChallenges, setSocialChallenges] = useState([]);
  const [myChallengeMembers, setMyChallengeMembers] = useState({});
  const [challengeTab, setChallengeTab] = useState("daily"); // daily|weekly|social
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [challengeForm, setChallengeForm] = useState({title:"",goalHours:10,durationDays:7,friendCode:""});
  const [challengeFormError, setChallengeFormError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("Math");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskXpPopup, setTaskXpPopup] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null); // {id, task, timer}
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendSearchResult, setFriendSearchResult] = useState(null);
  const [friendSearchError, setFriendSearchError] = useState("");
  const [friendSearchLoading, setFriendSearchLoading] = useState(false);
  const searchRateRef = useRef({count:0, reset:Date.now()});
  const sanitize=(str)=>str.replace(/[<>'"]/g,"").trim().slice(0,100);
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
      loadSocialChallenges();
      loadGlobalTop();
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
    // Always rebuild from scratch based on achievements — don't rely on stale state
    const currentFrames=JSON.parse(localStorage.getItem("sg_unlocked_frames")||"[]");
    const frames=[...currentFrames];
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

  const pauseResume=()=>{
    setPaused(v=>!v);
  };

  useEffect(()=>{
    if(studying && !paused){
      timerRef.current=setInterval(()=>{
        setSessionSecs(s=>s+1);
      },1000);
      if(isPro){
        rotateQuote(selectedSubject);
        const qt=setInterval(()=>rotateQuote(selectedSubject),60000);
        setQuoteTimer(qt);
      }
    }else{
      clearInterval(timerRef.current);
      if(!paused){
        if(quoteTimer){clearInterval(quoteTimer);setQuoteTimer(null);}
        setCurrentQuote("");
      }
    }
    return()=>{clearInterval(timerRef.current);};
  },[studying, paused]);

  useEffect(()=>{
    if(studying&&pomodoroMode){
      pomRef.current=setInterval(()=>setPomodoroSecs(s=>{if(s<=1){setPomodorosToday(p=>p+1);return 25*60;}return s-1;}),1000);
    }else clearInterval(pomRef.current);
    return()=>clearInterval(pomRef.current);
  },[studying,pomodoroMode]);


  const startStop=async()=>{
    if(!studying){
      // Show task picker if user has tasks for this subject
      const subjectTasks=tasks.filter(t=>!t.done&&t.subject===selectedSubject);
      if(subjectTasks.length>0&&!showTaskPicker){
        setShowTaskPicker(true);
        return;
      }
      setShowTaskPicker(false);
      setStudying(true);
      setSessionXP(0);
      lastActivityRef.current=Date.now();
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
        const xpResult=calcSessionXP(stats,mins,pomodorosToday);

        let nsBase={...stats,
          total_minutes:(stats.total_minutes||0)+mins,
          today_minutes:(stats.today_minutes||0)+mins,
          weekly_minutes:(stats.weekly_minutes||0)+mins,
          total_sessions:(stats.total_sessions||0)+1,
          sessions_count:(stats.sessions_count||0)+1,
          pomodoros_total:(stats.pomodoros_total||0)+pomodorosToday,
          longest_session:Math.max(stats.longest_session||0,mins),
          subject_minutes:{...(stats.subject_minutes||{}),[selectedSubject]:((stats.subject_minutes||{})[selectedSubject]||0)+mins},
          invisible_minutes:invisible?(stats.invisible_minutes||0)+mins:(stats.invisible_minutes||0),
          total_xp:xpResult.newXP,
        };
        const ns=await updateStreak(nsBase,mins);
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
        if(ns.streak_revived)setNewAchievement({icon:"🛡️",name:"Streak Saved!",desc:`A revive was used. ${getRevivesLeft()-1} revives left this month.`});
        ns.achievements=ach;
        await saveStats(ns);

        if(xpResult.leveledUp){
          const lvData=getXPProgress(xpResult.newXP);
          setLevelUpData({level:lvData.level,name:lvData.title,icon:lvData.icon,reward:LEVEL_REWARDS[lvData.level-1]});
          setTimeout(()=>setLevelUpData(null),6000);
        }
        setSessionXP(xpResult.gained);
        setShowSessionSummary({mins,xpEarned:xpResult.gained,xpBreakdown:[`${mins} XP base`,...xpResult.bonuses],streak:ns.streak||0,levelData:getXPProgress(xpResult.newXP)});

        // Log time to selected task
        if(selectedTaskId&&mins>0){
          const task=tasks.find(t=>t.id===selectedTaskId);
          if(task){
            const newTimeSpent=(task.time_spent||0)+mins;
            await supabase.from("tasks").update({time_spent:newTimeSpent}).eq("id",selectedTaskId);
            setTasks(prev=>prev.map(t=>t.id===selectedTaskId?{...t,time_spent:newTimeSpent}:t));
          }
        }
      }
      setSessionSecs(0);
      setPaused(false);
      setSelectedTaskId(null);
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

  const loadGlobalTop=async()=>{
    const{data}=await supabase.from("profiles").select("id,username,avatar_url,stats").limit(100);
    if(data){
      const sorted=[...data]
        .filter(u=>(u.stats?.total_minutes||0)>0||(u.stats?.total_xp||0)>0)
        .sort((a,b)=>{
          // Use total_xp if exists, otherwise use total_minutes as proxy
          const aXP=(a.stats?.total_xp||0)||(a.stats?.total_minutes||0);
          const bXP=(b.stats?.total_xp||0)||(b.stats?.total_minutes||0);
          return bXP-aXP;
        })
        .slice(0,5);
      setGlobalTop(sorted);
    }
  };

  const loadFullGlobal=async()=>{
    setGlobalLoading(true);
    const{data}=await supabase.from("profiles").select("id,username,avatar_url,stats").limit(500);
    if(data){
      const sorted=[...data]
        .filter(u=>(u.stats?.total_minutes||0)>0||(u.stats?.total_xp||0)>0)
        .sort((a,b)=>{
          const aXP=(a.stats?.total_xp||0)||(a.stats?.total_minutes||0);
          const bXP=(b.stats?.total_xp||0)||(b.stats?.total_minutes||0);
          return bXP-aXP;
        });
      setFullGlobal(sorted);
    }
    setGlobalLoading(false);
  };

  const loadSocialChallenges=async()=>{
    if(!authUser)return;
    // Get all challenges I'm part of
    const{data:memberRows}=await supabase.from("challenge_members").select("challenge_id").eq("user_id",authUser.id);
    if(!memberRows||memberRows.length===0)return;
    const ids=memberRows.map(r=>r.challenge_id);
    const{data:chals}=await supabase.from("study_challenges").select("*").in("id",ids);
    if(!chals)return;
    setSocialChallenges(chals);
    // Load members for each challenge
    const membersMap={};
    for(const c of chals){
      const{data:mems}=await supabase.from("challenge_members").select("*").eq("challenge_id",c.id);
      if(mems){
        // Enrich with profile data
        const enriched=await Promise.all(mems.map(async m=>{
          const{data:p}=await supabase.from("profiles").select("username,avatar_url,stats").eq("id",m.user_id).single();
          return{...m,username:p?.username||"?",avatar_url:p?.avatar_url||null,weekly_minutes:p?.stats?.weekly_minutes||0,total_minutes:p?.stats?.total_minutes||0,study_history:p?.stats?.study_history||{}};
        }));
        membersMap[c.id]=enriched;
      }
    }
    setMyChallengeMembers(membersMap);
  };

  const createSocialChallenge=async()=>{
    setChallengeFormError("");
    if(!challengeForm.title.trim()){setChallengeFormError("Add a title");return;}
    if(challengeForm.goalHours<1||challengeForm.goalHours>1000){setChallengeFormError("Goal must be 1-1000 hours");return;}
    if(challengeForm.durationDays<1||challengeForm.durationDays>365){setChallengeFormError("Duration must be 1-365 days");return;}
    const endsAt=new Date();endsAt.setDate(endsAt.getDate()+parseInt(challengeForm.durationDays));
    const{data:chal,error}=await supabase.from("study_challenges").insert({
      creator_id:authUser.id,
      title:challengeForm.title,
      goal_hours:parseInt(challengeForm.goalHours),
      duration_days:parseInt(challengeForm.durationDays),
      ends_at:endsAt.toISOString(),
    }).select().single();
    if(error){setChallengeFormError(error.message);return;}
    // Add creator as member
    await supabase.from("challenge_members").insert({challenge_id:chal.id,user_id:authUser.id,username:profile?.username,avatar_url:avatarUrl,accepted:true});
    // Invite friend by code if provided
    if(challengeForm.friendCode.trim()){
      const{data:fp}=await supabase.from("profiles").select("id,username").eq("friend_code",challengeForm.friendCode.toUpperCase()).single();
      if(fp){
        await supabase.from("challenge_members").insert({challenge_id:chal.id,user_id:fp.id,username:fp.username,accepted:false});
      }
    }
    setShowCreateChallenge(false);
    setChallengeForm({title:"",goalHours:10,durationDays:7,friendCode:""});
    loadSocialChallenges();
  };

  const acceptSocialChallenge=async(challengeId)=>{
    await supabase.from("challenge_members").update({accepted:true}).eq("challenge_id",challengeId).eq("user_id",authUser.id);
    loadSocialChallenges();
  };

  const declineSocialChallenge=async(challengeId)=>{
    await supabase.from("challenge_members").delete().eq("challenge_id",challengeId).eq("user_id",authUser.id);
    loadSocialChallenges();
  };

  const getSocialChallengeProgress=(challenge,membersData)=>{
    const goalMins=challenge.goal_hours*60;
    const startDate=new Date(challenge.created_at);
    const endDate=new Date(challenge.ends_at);
    const now=new Date();
    const totalDays=Math.ceil((endDate-startDate)/(1000*60*60*24));
    const daysLeft=Math.max(0,Math.ceil((endDate-now)/(1000*60*60*24)));
    const dayNum=Math.min(totalDays-daysLeft+1,totalDays);
    const startStr=startDate.toISOString().slice(0,10);
    const members=(membersData||[]).filter(m=>m.accepted).map(m=>{
      // Sum study_history from challenge start date onwards — only source of truth
      let progressMins=0;
      const history=m.study_history||{};
      Object.entries(history).forEach(([date,mins])=>{
        if(date>=startStr) progressMins+=mins;
      });
      const progress=Math.min(progressMins,goalMins);
      return{...m,progress,pct:Math.min((progress/goalMins)*100,100)};
    }).sort((a,b)=>b.progress-a.progress);
    return{goalMins,daysLeft,dayNum,totalDays,members};
  };

  const searchFriend=async()=>{
    setFriendSearchError("");setFriendSearchResult(null);setFriendSearchLoading(true);
    // Rate limit: max 8 searches per minute
    const now=Date.now();
    if(now-searchRateRef.current.reset>60000){searchRateRef.current={count:0,reset:now};}
    searchRateRef.current.count++;
    if(searchRateRef.current.count>8){setFriendSearchError("Too many searches. Wait a minute.");setFriendSearchLoading(false);return;}
    const input=sanitize(friendSearch);

    if(input.toLowerCase()==="fakest1"){
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

    if(input.toLowerCase()==="fakest2"){
      localStorage.removeItem("sg_fake_stats");
      // Restore real stats from DB
      const{data}=await supabase.from("profiles").select("stats").eq("id",authUser.id).single();
      if(data?.stats)setStats(data.stats);
      setFriendSearch("");setFriendSearchLoading(false);
      setFriendSearchError("✅ Real stats restored!");
      return;
    }

    if(input.toLowerCase()==="toot06"){
      setOnboardingStep(0);
      setShowOnboarding(true);
      setFriendSearch("");setFriendSearchLoading(false);return;
    }

    // Dev cheat — unlock all free frames
    if(input==="12252006"){
      if(devCheatUsed&&unlockedFrames.length>0){
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
    if(input==="25122006"){
      const allFrames=Object.values(FRAMES).map(f=>f.id);
      setUnlockedFrames(allFrames);
      localStorage.setItem("sg_unlocked_frames",JSON.stringify(allFrames));
      setDevCheatUsed(true);
      localStorage.setItem("sg_dev_cheat","true");
      setFriendSearch("");setFriendSearchLoading(false);
      setFriendSearchError("👑 Pro frames unlocked. You didn't see anything. 🤫");
      return;
    }

    // Secret cheat code
    if(input.toLowerCase()==="streakdebug"){
      const{data}=await supabase.from("profiles").select("stats").eq("id",authUser.id).single();
      const s=data?.stats||{};
      setFriendSearchError(`🔍 DB streak: ${s.streak||0} | last_study_date: ${s.last_study_date||"never"} | today: ${localDateStr()}`);
      setFriendSearch("");setFriendSearchLoading(false);return;
    }

    if(input.toLowerCase()==="accountreset"){
      const freshStats={total_minutes:0,today_minutes:0,weekly_minutes:0,streak:0,total_sessions:0,sessions_count:0,longest_session:0,pomodoros_total:0,tasks_completed:0,subject_minutes:{},achievements:[],invisible_minutes:0,night_sessions:0,early_sessions:0,groups_joined:0,focus_uses:0,themes_used:1,challenge_wins:0,total_xp:0,last_study_date:null,study_history:{},revives_used:0};
      await supabase.from("profiles").update({stats:freshStats,updated_at:new Date().toISOString()}).eq("id",authUser.id);
      await supabase.from("tasks").delete().eq("user_id",authUser.id);
      setTasks([]);
      const keysToRemove=Object.keys(localStorage).filter(k=>k.includes(authUser.id)||k.includes("sg_fake")||k.includes("sg_unlocked")||k.includes("sg_frame")||k.includes("sg_title")||k.includes("challenge_")||k.includes("task_xp_")||k.includes("completed_tasks_")||k.includes("streak_warned_")||k==="sg_dev_cheat");
      keysToRemove.forEach(k=>localStorage.removeItem(k));
      setStats(freshStats);
      setUnlockedFrames([]);
      setSelectedFrame("none");
      setDevCheatUsed(false);
      localStorage.setItem("sg_frame","none");
      setFriendSearch("");setFriendSearchLoading(false);
      setFriendSearchError("💀 Account reset. Fresh start. Don't waste it.");
      return;
    }

    if(input.toLowerCase()==="streakreset"){
      const ns={...stats,streak:0,last_study_date:null};
      setStats(ns);
      await supabase.from("profiles").update({stats:ns,updated_at:new Date().toISOString()}).eq("id",authUser.id);
      setFriendSearch("");setFriendSearchLoading(false);
      setFriendSearchError("💀 Streak reset to 0.");
      return;
    }

    const streakMatch = input.toLowerCase().match(/^streakcheat(\d{0,3})$/);
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

    if(!input.trim()){setFriendSearchError("Enter a friend code");setFriendSearchLoading(false);return;}
    const{data,error}=await supabase.from("profiles").select("*").eq("friend_code",input.toUpperCase()).single();
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
    const task={user_id:authUser.id,text:newTask.trim(),subject:newTaskSubject,difficulty:newTaskDifficulty||null,estimate:newTaskTime||null,done:false,created_at:new Date().toISOString()};
    const{data}=await supabase.from("tasks").insert(task).select().single();
    if(data)setTasks(prev=>[data,...prev]);
    setNewTask("");setNewTaskDifficulty("");setNewTaskTime("");setShowTaskForm(false);
  };

  const toggleTask=async(task)=>{
    const done=!task.done;
    const done_at=done?new Date().toISOString():null;
    await supabase.from("tasks").update({done,done_at}).eq("id",task.id);
    setTasks(prev=>prev.map(t=>t.id===task.id?{...t,done,done_at}:t));
    if(done){
      const ns={...stats,tasks_completed:(stats.tasks_completed||0)+1};
      let ach=ns.achievements||[];
      if(ns.tasks_completed>=10)ach=unlockAchievement("task_slayer",ach);
      if(ns.tasks_completed>=50)ach=unlockAchievement("task_master",ach);
      // XP for task completion — +5 XP
      const xpGain=5;
      ns.total_xp=(ns.total_xp||0)+xpGain;
      setTaskXpPopup(`+${xpGain} XP`);
      setTimeout(()=>setTaskXpPopup(null),2000);
      ns.achievements=ach;
      await saveStats(ns);
    }
  };

  const deleteTask=(id)=>{
    const task=tasks.find(t=>t.id===id);
    if(!task)return;
    // Remove from UI immediately
    setTasks(prev=>prev.filter(t=>t.id!==id));
    // Cancel any existing pending delete
    if(pendingDelete?.timer) clearTimeout(pendingDelete.timer);
    // Set 5s undo window
    const timer=setTimeout(async()=>{
      await supabase.from("tasks").delete().eq("id",id);
      setPendingDelete(null);
    },5000);
    setPendingDelete({id,task,timer});
  };

  const undoDelete=()=>{
    if(!pendingDelete)return;
    clearTimeout(pendingDelete.timer);
    setTasks(prev=>[pendingDelete.task,...prev].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)));
    setPendingDelete(null);
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
    if(!studying)return;
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
  const notifiedFriendsRef = useRef(new Set());
  useEffect(() => {
    if (!onlineMembers.length || !friends.length) return;
    const studyingFriends = friends.filter(f => {
      const m = onlineMembers.find(o=>o.user_id===f.id);
      return m?.status==="studying";
    });
    studyingFriends.forEach(f=>{
      if(!notifiedFriendsRef.current.has(f.id)){
        notifiedFriendsRef.current.add(f.id);
        setFriendNotif(f);
        setTimeout(()=>setFriendNotif(null),5000);
        // Browser notification
        if("Notification" in window && Notification.permission==="granted"){
          new Notification(`📖 ${f.username} started studying!`,{body:"Open StudyGrove to study together",icon:"/icon-192.png"});
        }
      }
    });
    // Remove from set when they stop studying
    notifiedFriendsRef.current.forEach(id=>{
      const m=onlineMembers.find(o=>o.user_id===id);
      if(!m||m.status!=="studying") notifiedFriendsRef.current.delete(id);
    });
  }, [onlineMembers]);

  // Streak warning notification — fires at 8PM if no study today and streak > 0
  useEffect(()=>{
    if(!(stats.streak>0)) return;
    const checkStreakWarning=()=>{
      const now=new Date();
      const h=now.getHours();
      if(h>=20 && stats.last_study_date!==localDateStr()){
        if("Notification" in window && Notification.permission==="granted"){
          const key=`sg_streak_warned_${localDateStr()}`;
          if(!localStorage.getItem(key)){
            localStorage.setItem(key,"1");
            new Notification(`🔥 Your ${stats.streak}-day streak is at risk!`,{body:"Study at least 25 minutes today to keep it alive.",icon:"/icon-192.png"});
          }
        }
      }
    };
    checkStreakWarning();
    const iv=setInterval(checkStreakWarning,60000);
    return()=>clearInterval(iv);
  },[stats.streak, stats.last_study_date]);

  // Request notification permission on first load
  useEffect(()=>{
    if("Notification" in window && Notification.permission==="default"){
      Notification.requestPermission();
    }
  },[]);

  // Weekly bar chart data
  const weeklyBarData=(()=>{
    const days=[];
    for(let i=6;i>=0;i--){
      const d=new Date();d.setDate(d.getDate()-i);
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      days.push({key,label:i===0?"Today":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],mins:stats.study_history?.[key]||0});
    }
    return days;
  })();
  const weeklyBarMax=Math.max(...weeklyBarData.map(d=>d.mins),1);

  // 30-day streak history
  const streakHistory=(()=>{
    const days=[];
    for(let i=29;i>=0;i--){
      const d=new Date();d.setDate(d.getDate()-i);
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      days.push({key,studied:!!(stats.study_history?.[key])});
    }
    return days;
  })();

  // Heatmap — last 28 weeks (196 days)
  const heatmapDays = (() => {
    const days = [];
    const today = new Date();
    // Start from the Sunday before 28 weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - 196 + 1);
    // Align to previous Sunday
    start.setDate(start.getDate() - start.getDay());
    for(let i=0; i<196; i++){
      const d = new Date(start);
      d.setDate(d.getDate()+i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const mins = stats.study_history?.[key] || 0;
      days.push({key, mins, dayOfWeek:d.getDay(), month:d.getMonth(), date:d.getDate()});
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

  // Weekly report data
  const weeklyReport=(()=>{
    const totalMins=weeklyBarData.reduce((a,d)=>a+d.mins,0);
    const daysStudied=weeklyBarData.filter(d=>d.mins>0).length;
    const tasksDone=tasks.filter(t=>{
      if(!t.done||!t.created_at)return false;
      const d=new Date(t.created_at);
      const weekAgo=new Date();weekAgo.setDate(weekAgo.getDate()-7);
      return d>=weekAgo;
    }).length;
    const subjectMins=stats.subject_minutes||{};
    const topSubject=Object.entries(subjectMins).sort((a,b)=>b[1]-a[1])[0]?.[0]||"None";

    // Last week comparison
    let lastWeekMins=0;
    for(let i=7;i<14;i++){
      const d=new Date();d.setDate(d.getDate()-i);
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      lastWeekMins+=(stats.study_history?.[key]||0);
    }
    let comparison="";
    if(lastWeekMins===0&&totalMins>0) comparison="🆕 First week with data — great start!";
    else if(lastWeekMins===0) comparison="No study data yet — this week is your chance.";
    else{
      const diff=totalMins-lastWeekMins;
      const pct=Math.round(Math.abs(diff/lastWeekMins)*100);
      if(diff>0) comparison=`📈 You studied ${pct}% more than last week!`;
      else if(diff<0) comparison=`📉 You studied ${pct}% less than last week.`;
      else comparison="➡️ Same as last week. Time to push harder!";
    }
    // Streak message
    let streakMsg="";
    if(daysStudied===7) streakMsg="🏆 Perfect week — you studied every single day!";
    else if(daysStudied>=5) streakMsg="💪 You kept your streak alive all week.";

    return{totalMins,lastWeekMins,daysStudied,tasksDone,topSubject,streak:stats.streak||0,comparison,streakMsg};
  })();

  // ── CHALLENGES ──────────────────────────────────────────────────────────────
  // Count tasks completed today (based on done_at date or created_at as fallback)
  const todayStr=localDateStr();
  const weekStart=(()=>{const d=new Date();const mon=new Date(d);mon.setDate(d.getDate()-((d.getDay()+6)%7));return `${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,"0")}-${String(mon.getDate()).padStart(2,"0")}`;})();
  const tasksCompletedToday=tasks.filter(t=>t.done&&(t.done_at||t.updated_at||t.created_at||"").slice(0,10)===todayStr).length;
  const tasksCompletedThisWeek=tasks.filter(t=>t.done&&(t.done_at||t.updated_at||t.created_at||"").slice(0,10)>=weekStart).length;

  const DAILY_CHALLENGES=[
    {id:"daily_early",    title:"Morning Focus",    desc:"Study before 11AM",                  icon:"🌅", xp:15, color:"#22c55e", diff:"Easy",
     check:()=>{const h=new Date().getHours();return (stats.early_sessions||0)>0||(studying&&h<11);}},
    {id:"daily_tasks3",   title:"Task Crusher",     desc:"Complete 3 tasks today",             icon:"✅", xp:10, color:"#22c55e", diff:"Easy",
     check:()=>tasksCompletedToday>=3},
    {id:"daily_pomo4",    title:"Pomodoro Master",  desc:"Complete 4 pomodoros today",         icon:"🍅", xp:25, color:"#f59e0b", diff:"Medium",
     check:()=>pomodorosToday>=4},
    {id:"daily_1hour",    title:"Focused Study",    desc:"Study 1 hour today",                 icon:"⏱", xp:20, color:"#f59e0b", diff:"Medium",
     check:()=>(stats.today_minutes||0)>=60},
    {id:"daily_2hour",    title:"Deep Work",        desc:"Study 2 hours today (bonus if you did 1h)",icon:"🔥", xp:15, color:"#ef4444", diff:"Hard",
     requires:"daily_1hour", check:()=>(stats.today_minutes||0)>=120},
    {id:"daily_social",   title:"Study Together",   desc:"Study while a friend is studying",   icon:"👥", xp:15, color:"#6366f1", diff:"Easy",
     check:()=>studying&&onlineMembers.some(m=>m.user_id!==authUser?.id&&m.status==="studying")},
  ];
  const WEEKLY_CHALLENGES=[
    {id:"weekly_5days",   title:"Consistent",       desc:"Study 5 out of 7 days this week",   icon:"📅", xp:50, color:"#f59e0b", diff:"Medium",
     check:()=>weeklyBarData.filter(d=>d.mins>0).length>=5},
    {id:"weekly_tasks15", title:"Taskmaster",       desc:"Complete 15 tasks this week",        icon:"🗡️", xp:40, color:"#f59e0b", diff:"Medium",
     check:()=>tasksCompletedThisWeek>=15},
    {id:"weekly_10hours", title:"Grinder",          desc:"Study 10+ hours this week",          icon:"⚡", xp:60, color:"#ef4444", diff:"Hard",
     check:()=>(stats.weekly_minutes||0)>=600},
    {id:"weekly_streak7", title:"Streak Keeper",    desc:"Maintain a 7-day streak",            icon:"🔥", xp:75, color:"#ef4444", diff:"Hard",
     check:()=>(stats.streak||0)>=7},
    {id:"weekly_social",  title:"Group Scholar",    desc:"Study 3+ sessions with group online",icon:"🤝", xp:40, color:"#6366f1", diff:"Medium",
     check:()=>(stats.group_sessions_online||0)>=3},
  ];

  const getChallengeKey=(id,type)=>{
    const todayStr=localDateStr();
    if(type==="daily") return `challenge_${id}_${todayStr}`;
    // Get Monday of current week in local time
    const today=new Date();
    const mon=new Date(today);mon.setDate(today.getDate()-((today.getDay()+6)%7));
    const monStr=`${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,"0")}-${String(mon.getDate()).padStart(2,"0")}`;
    return `challenge_${id}_week_${monStr}`;
  };
  const isChallengeCompleted=(id,type)=>!!(stats[getChallengeKey(id,type)]);

  const claimChallenge=async(challenge,type)=>{
    if(isChallengeCompleted(challenge.id,type))return;
    if(!challenge.check())return;
    // If challenge requires another to be claimed first, enforce it
    if(challenge.requires&&!isChallengeCompleted(challenge.requires,type))return;
    const key=getChallengeKey(challenge.id,type);
    const xpGain=challenge.xp;
    const ns={...stats,[key]:true,total_xp:(stats.total_xp||0)+xpGain};
    await saveStats(ns);
    if(xpGain>0){
      setTaskXpPopup(`🏆 ${challenge.title} · +${xpGain} XP`);
      setTimeout(()=>setTaskXpPopup(null),3000);
    }
  };

  const getChallengeProgress=(challenge)=>{
    const today_mins=stats.today_minutes||0;
    const weekly_mins=stats.weekly_minutes||0;
    switch(challenge.id){
      case "daily_1hour":   return{cur:Math.min(today_mins,60),max:60};
      case "daily_2hour":   return{cur:Math.min(today_mins,120),max:120};
      case "daily_tasks3":  return{cur:Math.min(tasksCompletedToday,3),max:3};
      case "daily_pomo4":   return{cur:Math.min(pomodorosToday,4),max:4};
      case "daily_early":   return{cur:(stats.early_sessions||0)>0?1:0,max:1};
      case "daily_social":  return{cur:studying&&onlineMembers.some(m=>m.user_id!==authUser?.id&&m.status==="studying")?1:0,max:1};
      case "weekly_5days":  return{cur:Math.min(weeklyBarData.filter(d=>d.mins>0).length,5),max:5};
      case "weekly_tasks15":return{cur:Math.min(tasksCompletedThisWeek,15),max:15};
      case "weekly_10hours":return{cur:Math.min(weekly_mins,600),max:600};
      case "weekly_streak7":return{cur:Math.min(stats.streak||0,7),max:7};
      case "weekly_social": return{cur:Math.min(stats.group_sessions_online||0,3),max:3};
      default: return{cur:0,max:1};
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  const pomPct=((25*60-pomodoroSecs)/(25*60))*100;

  // Planner constants
  const plannerToday=new Date();
  const plannerTodayStr=`${plannerToday.getFullYear()}-${String(plannerToday.getMonth()+1).padStart(2,"0")}-${String(plannerToday.getDate()).padStart(2,"0")}`;
  const plannerYear=plannerMonth.getFullYear();
  const plannerMonthIdx=plannerMonth.getMonth();
  const plannerFirstDay=new Date(plannerYear,plannerMonthIdx,1).getDay();
  const plannerDaysInMonth=new Date(plannerYear,plannerMonthIdx+1,0).getDate();
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

      {/* Weekly Report Modal */}
      {showWeeklyReport&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...css.card,maxWidth:400,width:"100%",padding:32}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:36}}>📊</div>
              <div style={{fontWeight:900,fontSize:20,marginTop:8}}>Weekly Study Report</div>
              <div style={{fontSize:12,color:T.sub,marginTop:4}}>Last 7 days</div>
            </div>
            {[
              {icon:"⏱",label:"Time studied",val:fmtMins(weeklyReport.totalMins)},
              {icon:"📅",label:"Days studied",val:`${weeklyReport.daysStudied} / 7`},
              {icon:"✅",label:"Tasks completed",val:weeklyReport.tasksDone},
              {icon:"🔥",label:"Current streak",val:`${weeklyReport.streak} days`},
              {icon:"📘",label:"Top subject",val:weeklyReport.topSubject},
            ].map(r=>(
              <div key={r.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:14,color:T.sub}}>{r.icon} {r.label}</span>
                <strong style={{fontSize:15,color:T.accent}}>{r.val}</strong>
              </div>
            ))}
            {/* Comparison vs last week */}
            <div style={{marginTop:16,padding:"12px 16px",background:`${T.accent}12`,borderRadius:10,fontSize:13,color:T.accent,fontWeight:600}}>
              {weeklyReport.comparison}
            </div>
            {weeklyReport.streakMsg&&(
              <div style={{marginTop:8,padding:"10px 16px",background:"#ffd60018",borderRadius:10,fontSize:13,color:"#ffd600"}}>
                {weeklyReport.streakMsg}
              </div>
            )}
            {!weeklyReport.streakMsg&&(
              <div style={{marginTop:8,padding:"10px 16px",background:T.surface,borderRadius:10,fontSize:13,color:T.sub}}>
                {weeklyReport.totalMins>=300?"🔥 Great week! Keep the momentum going.":weeklyReport.totalMins>=60?"💪 Decent week. Push harder next time.":"📖 Every session counts — start strong next week."}
              </div>
            )}
            <button style={{...css.btn,width:"100%",marginTop:20}} onClick={()=>setShowWeeklyReport(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Pro Modal */}
      {/* Level Up Popup */}
      {levelUpData&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...css.card,maxWidth:380,width:"100%",textAlign:"center",padding:40,border:`2px solid #a855f7`,boxShadow:"0 0 60px #a855f760"}}>
            <div style={{fontSize:48,marginBottom:8}}>⬆️</div>
            <div style={{fontSize:13,color:"#a855f7",fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Level Up!</div>
            <div style={{fontSize:32,fontWeight:900,marginBottom:4}}>{levelUpData.icon} Level {levelUpData.level}</div>
            <div style={{fontSize:18,color:"#a855f7",fontWeight:700,marginBottom:16}}>{levelUpData.name}</div>
            {levelUpData.reward&&<div style={{fontSize:13,color:T.sub,background:T.surface,borderRadius:10,padding:"10px 16px",marginBottom:20}}>🎁 {levelUpData.reward}</div>}
            <button style={{...css.btn,padding:"12px 32px",background:"#a855f7",color:"#fff"}} onClick={()=>setLevelUpData(null)}>Keep Grinding 💪</button>
          </div>
        </div>
      )}

      {/* Session Summary */}
      {showSessionSummary&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1050,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...css.card,maxWidth:380,width:"100%",padding:28}}>
            <div style={{fontWeight:900,fontSize:18,marginBottom:16,textAlign:"center"}}>✅ Session Complete</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div style={{background:T.surface,borderRadius:10,padding:12,textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:900,color:T.accent}}>{fmtMins(showSessionSummary.mins)}</div>
                <div style={{fontSize:11,color:T.sub,marginTop:2}}>Study Time</div>
              </div>
              <div style={{background:T.surface,borderRadius:10,padding:12,textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:900,color:"#a855f7"}}>+{showSessionSummary.xpEarned} XP</div>
                <div style={{fontSize:11,color:T.sub,marginTop:2}}>XP Earned</div>
              </div>
              <div style={{background:T.surface,borderRadius:10,padding:12,textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:900,color:getStreakFlame(showSessionSummary.streak).glow}}>{showSessionSummary.streak} 🔥</div>
                <div style={{fontSize:11,color:T.sub,marginTop:2}}>Day Streak</div>
              </div>
              <div style={{background:T.surface,borderRadius:10,padding:12,textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:900,color:"#a855f7"}}>{showSessionSummary.levelData.icon} Lv.{showSessionSummary.levelData.level}</div>
                <div style={{fontSize:11,color:T.sub,marginTop:2}}>{showSessionSummary.levelData.title}</div>
              </div>
            </div>
            {/* XP breakdown */}
            <div style={{fontSize:12,color:T.sub,marginBottom:12}}>
              {showSessionSummary.xpBreakdown.map((b,i)=><div key={i} style={{padding:"3px 0",borderBottom:`1px solid ${T.border}`}}>{b}</div>)}
            </div>
            {/* Level progress bar */}
            {showSessionSummary.levelData.next&&(
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.sub,marginBottom:4}}>
                  <span>Level {showSessionSummary.levelData.level} → {showSessionSummary.levelData.level+1}</span>
                  <span style={{color:"#a855f7"}}>{showSessionSummary.levelData.current} / {showSessionSummary.levelData.needed} XP</span>
                </div>
                <div style={{height:8,background:T.border,borderRadius:4}}>
                  <div style={{height:"100%",background:"linear-gradient(90deg,#a855f7,#7c3aed)",borderRadius:4,width:`${showSessionSummary.levelData.percent}%`,transition:"width 0.8s"}}/>
                </div>
                <div style={{fontSize:11,color:T.sub,marginTop:4}}>Next reward: {showSessionSummary.levelData.reward||"Keep going!"} · {showSessionSummary.levelData.needed-showSessionSummary.levelData.current} XP away</div>
              </div>
            )}
            <button style={{...css.btn,width:"100%",padding:12}} onClick={()=>setShowSessionSummary(null)}>Let's Go 🚀</button>
          </div>
        </div>
      )}

      {/* ── TASK PICKER MODAL ── */}
      {showTaskPicker&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{...css.card,maxWidth:420,width:"100%",padding:28}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:32,marginBottom:8}}>🎯</div>
              <div style={{fontWeight:900,fontSize:18}}>Working on a task?</div>
              <div style={{fontSize:13,color:T.sub,marginTop:6}}>
                {selectedSubject} tasks — pick one to track your time
              </div>
            </div>

            {/* Subject tasks */}
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16,maxHeight:280,overflowY:"auto"}}>
              {tasks.filter(t=>!t.done&&t.subject===selectedSubject).map(t=>{
                const col=getSubjectColor(t.subject);
                const isSelected=selectedTaskId===t.id;
                return(
                  <div key={t.id} onClick={()=>setSelectedTaskId(isSelected?null:t.id)} style={{padding:"12px 14px",borderRadius:10,border:`2px solid ${isSelected?col:T.border}`,background:isSelected?`${col}18`:T.surface,cursor:"pointer",transition:"all 0.15s"}}>
                    <div style={{fontWeight:600,fontSize:14,color:isSelected?col:T.text}}>{t.text}</div>
                    {(t.difficulty||t.time_spent>0)&&(
                      <div style={{display:"flex",gap:8,marginTop:4}}>
                        {t.difficulty&&<span style={{fontSize:11,color:T.sub}}>{t.difficulty}</span>}
                        {t.time_spent>0&&<span style={{fontSize:11,color:T.accent}}>🕐 {fmtMins(t.time_spent)} so far</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{display:"flex",gap:8}}>
              <button style={{...css.btn,flex:1,padding:12}} onClick={()=>{setShowTaskPicker(false);startStop();}}>
                {selectedTaskId?"▶ Start with task":"▶ Start without task"}
              </button>
              <button style={{...css.btnO,padding:12}} onClick={()=>{setSelectedTaskId(null);setShowTaskPicker(false);}}>Cancel</button>
            </div>

            {selectedTaskId&&(
              <div style={{fontSize:11,color:T.accent,textAlign:"center",marginTop:10}}>
                ⏱ Time will be logged to: <strong>{tasks.find(t=>t.id===selectedTaskId)?.text}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GLOBAL XP POPUP ── */}
      {taskXpPopup&&(
        <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"#fff",borderRadius:16,padding:"10px 24px",fontSize:14,fontWeight:700,zIndex:2000,animation:"slideIn 0.3s ease",whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(168,85,247,0.5)",textAlign:"center"}}>
          {taskXpPopup}
        </div>
      )}

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


      {focusMode&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:800,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:13,color:T.sub,marginBottom:8,textTransform:"uppercase",letterSpacing:2}}>Focus Mode</div>
          <div style={{fontSize:80,fontWeight:900,color:T.accent,fontVariantNumeric:"tabular-nums",letterSpacing:-2}}>{fmtTime(sessionSecs)}</div>
          <div style={{fontSize:16,color:T.sub,marginTop:8}}>{selectedSubject}</div>
          {pomodoroMode&&<div style={{marginTop:16,width:200}}><div style={{height:4,background:T.border,borderRadius:2}}><div style={{height:"100%",background:T.accent,borderRadius:2,width:`${pomPct}%`,transition:"width 1s linear"}}/></div><div style={{fontSize:12,color:T.sub,textAlign:"center",marginTop:6}}>🍅 {fmtTime(pomodoroSecs)}</div></div>}
          <div style={{display:"flex",gap:10,marginTop:32}}>
            <button style={css.btnO} onClick={()=>setFocusMode(false)}>Exit</button>
            <button onClick={pauseResume} style={{...css.btnO,fontSize:18,padding:"8px 16px",borderColor:paused?T.accent:T.border,color:paused?T.accent:T.sub}}>{paused?"▶":"⏸"}</button>
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
          {group&&<div style={{fontSize:11,color:T.sub,padding:"4px 8px",borderTop:`1px solid ${T.border}`,marginTop:4}}>Group: <strong style={{color:T.accent}}>{group.name} · {group.code}</strong></div>}
        </div>
      )}

      <div style={{display:"flex",gap:4,padding:"10px 16px",overflowX:"auto",borderBottom:`1px solid ${T.border}`,background:T.surface,position:"sticky",top:57,zIndex:99}}>
        {[["study","⏱ Study"],["social","👥 Social"],["leaderboard","👤 Profile"],["stats","📊 Stats"],["challenges","⚔️ Challenges"],["planner","📅 Planner"],["achievements","🎖 Badges"],["settings","⚙️ Settings"]].map(([t,l])=>(
          <button key={t} style={css.tBtn(tab===t)} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      <div style={{padding:16,maxWidth:900,margin:"0 auto",position:"relative",zIndex:1}}>

        {tab==="study"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{...css.card,gridColumn:"1/-1",textAlign:"center",boxShadow:studying?`0 0 40px ${T.accent}25`:"none",transition:"box-shadow 0.4s"}}>
              <div style={{fontSize:12,color:T.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:2,marginBottom:12}}>{studying?`Studying ${selectedSubject}`:"Ready to Study?"}</div>
              <div style={{fontSize:72,fontWeight:900,color:paused?"#f59e0b":studying?T.accent:T.text,fontVariantNumeric:"tabular-nums",letterSpacing:-2,lineHeight:1}}>{fmtTime(sessionSecs)}</div>
              {paused&&<div style={{fontSize:12,color:"#f59e0b",fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginTop:4}}>⏸ Paused</div>}
              <div style={{display:"flex",justifyContent:"center",gap:24,margin:"12px 0",fontSize:13,color:T.sub,flexWrap:"wrap"}}>
                <span>Today <strong style={{color:T.text}}>{fmtMins(stats.today_minutes||0)}</strong></span>
                <span>Week <strong style={{color:T.text}}>{fmtMins(stats.weekly_minutes||0)}</strong></span>
                <span>Total <strong style={{color:T.text}}>{fmtMins(stats.total_minutes||0)}</strong></span>
                <span>Streak <strong style={{color:getStreakFlame(stats.streak||0).glow}}>{stats.streak||0} 🔥</strong> <span style={{fontSize:10,color:T.sub}}>({getStreakFlame(stats.streak||0).label})</span></span>
              </div>
              {/* XP Level bar */}
              {(()=>{const lv=getXPProgress(stats.total_xp||0);return(
                <div style={{margin:"10px 0",padding:"10px 16px",background:T.surface,borderRadius:10,border:`1px solid ${T.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontWeight:700,color:"#a855f7",fontSize:13}}>{lv.icon} Level {lv.level} · {lv.title}</span>
                    <span style={{color:"#a855f7",fontSize:12,fontWeight:700}}>{studying&&sessionXP>0?`+${sessionXP} XP this session`:lv.next?`${lv.current}/${lv.needed} XP`:"MAX LEVEL"}</span>
                  </div>
                  <div style={{height:8,background:T.border,borderRadius:4}}>
                    <div style={{height:"100%",background:"linear-gradient(90deg,#a855f7,#7c3aed)",borderRadius:4,width:`${lv.progress}%`,transition:"width 0.5s"}}/>
                  </div>
                  {lv.next&&<div style={{fontSize:10,color:T.sub,marginTop:4}}>Next: {LEVEL_REWARDS[lv.level]||LEVEL_TITLES[lv.level]} · {lv.needed-lv.current} XP away</div>}
                </div>
              );})()}
              {/* Inactivity warning */}

              {studying&&(
                <div style={{margin:"12px 0",padding:"10px 16px",background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,fontSize:13,color:T.sub,fontStyle:"italic",textAlign:"center",minHeight:40}}>
                  {currentQuote?`"${currentQuote}"`:<span style={{color:T.sub,fontSize:12}}>💬 Quote will appear while studying...</span>}
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
                  <button style={css.btn} onClick={()=>{if(newSubject.trim()&&!subjects.includes(newSubject.trim())){setSubjects(p=>[...p,newSubject.trim()]);setNewSubject("");setShowAddSubject(false);}}}>Add</button>
                </div>
              )}
              {studying&&selectedTaskId&&(
                <div style={{fontSize:12,color:T.accent,marginBottom:12,textAlign:"center",padding:"6px 12px",background:`${T.accent}12`,borderRadius:8}}>
                  ⏱ Logging time to: <strong>{tasks.find(t=>t.id===selectedTaskId)?.text}</strong>
                </div>
              )}

              <div style={{display:"flex",gap:10,justifyContent:"center",alignItems:"center"}}>
                <button onClick={startStop} style={{...css.btn,padding:"14px 48px",fontSize:18,background:studying?"#cc2222":T.accent,color:studying?"#fff":"#000",borderRadius:14,boxShadow:studying?`0 0 20px #cc222240`:`0 0 20px ${T.accent}40`}}>
                  {studying?"⏹ Stop":"▶ Start Studying"}
                </button>
                {studying&&(
                  <button onClick={pauseResume} style={{...css.btnO,padding:"14px 20px",fontSize:18,borderRadius:14,borderColor:paused?T.accent:T.border,color:paused?T.accent:T.sub}}>
                    {paused?"▶":"⏸"}
                  </button>
                )}
              </div>
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

            <div style={{...css.card,gridColumn:"1/-1",position:"relative"}}>
              {/* Undo delete toast */}
              {pendingDelete&&(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1a1a1a",border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",marginBottom:12}}>
                  <span style={{fontSize:13,color:T.sub}}>Task deleted</span>
                  <button onClick={undoDelete} style={{...css.btnO,padding:"4px 14px",fontSize:12,color:T.accent,borderColor:T.accent}}>↩ Undo (5s)</button>
                </div>
              )}

              {/* Header + progress */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
                <div style={{fontWeight:700,fontSize:15}}>✅ Tasks</div>
                <div style={{fontSize:12,color:T.sub}}>{tasks.filter(t=>t.done).length} / {tasks.length} completed</div>
              </div>
              {tasks.length>0&&(
                <div style={{marginBottom:16}}>
                  <div style={{height:6,background:T.border,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",background:T.accent,borderRadius:3,width:`${(tasks.filter(t=>t.done).length/tasks.length)*100}%`,transition:"width 0.5s"}}/>
                  </div>
                </div>
              )}

              {/* Add task form */}
              {showTaskForm?(
                <div style={{background:T.surface,borderRadius:12,padding:16,marginBottom:16,border:`1px solid ${T.border}`}}>
                  <input style={{...css.input,marginBottom:10}} placeholder="Task title *" value={newTask} onChange={e=>setNewTask(e.target.value)} autoFocus onKeyDown={e=>e.key==="Enter"&&addTask()}/>
                  <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                    <select style={{...css.input,flex:1,minWidth:120}} value={newTaskSubject} onChange={e=>setNewTaskSubject(e.target.value)}>
                      {subjects.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    <select style={{...css.input,flex:1,minWidth:100}} value={newTaskDifficulty} onChange={e=>setNewTaskDifficulty(e.target.value)}>
                      <option value="">Difficulty (optional)</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard 🔥</option>
                    </select>
                    <input style={{...css.input,flex:1,minWidth:100}} placeholder="Time (e.g. 30 min)" value={newTaskTime} onChange={e=>setNewTaskTime(e.target.value)}/>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button style={{...css.btn,flex:1}} onClick={addTask}>Add Task</button>
                    <button style={{...css.btnO}} onClick={()=>{setShowTaskForm(false);setNewTask("");setNewTaskDifficulty("");setNewTaskTime("");}}>Cancel</button>
                  </div>
                </div>
              ):(
                <button style={{...css.btn,width:"100%",marginBottom:16,padding:12,fontSize:14,borderRadius:12}} onClick={()=>setShowTaskForm(true)}>+ Add Task</button>
              )}

              {/* Active tasks grouped by subject */}
              {(()=>{
                const active=tasks.filter(t=>!t.done);
                if(active.length===0&&tasks.filter(t=>t.done).length===0) return <div style={{color:T.sub,fontSize:13,textAlign:"center",padding:"20px 0"}}>No tasks yet — hit + Add Task to get started!</div>;
                if(active.length===0) return null;
                const grouped={};
                active.forEach(t=>{if(!grouped[t.subject])grouped[t.subject]=[];grouped[t.subject].push(t);});
                return Object.entries(grouped).map(([subject,stasks])=>{
                  const col=getSubjectColor(subject);
                  return(
                    <div key={subject} style={{marginBottom:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:16}}>{getSubjectIcon(subject)}</span>
                        <span style={{fontWeight:700,fontSize:13,color:col}}>{subject}</span>
                        <span style={{fontSize:11,color:T.sub}}>({stasks.length})</span>
                      </div>
                      {stasks.map(t=>(
                        <div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",marginBottom:6,borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,borderLeft:`3px solid ${col}`,transition:"all 0.2s"}}>
                          <button onClick={()=>toggleTask(t)} style={{width:20,height:20,borderRadius:5,border:`2px solid ${col}`,background:"transparent",cursor:"pointer",flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            {t.done&&<span style={{color:col,fontSize:11,fontWeight:900}}>✓</span>}
                          </button>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:600,color:T.text}}>{t.text}</div>
                            <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                              {t.difficulty&&<span style={{fontSize:11,color:t.difficulty==="Hard"?"#ff6d00":t.difficulty==="Medium"?"#f59e0b":"#22c55e",fontWeight:600}}>{t.difficulty==="Hard"?"🔥":""}  {t.difficulty}</span>}
                              {t.estimate&&<span style={{fontSize:11,color:T.sub}}>⏱ {t.estimate}</span>}
                              {t.time_spent>0&&<span style={{fontSize:11,color:T.accent,fontWeight:600}}>🕐 {fmtMins(t.time_spent)} spent</span>}
                            </div>
                          </div>
                          <button onClick={()=>deleteTask(t.id)} style={{background:"transparent",border:"none",color:T.sub,cursor:"pointer",fontSize:16,lineHeight:1,flexShrink:0}}>×</button>
                        </div>
                      ))}
                    </div>
                  );
                });
              })()}

              {/* Completed section */}
              {tasks.filter(t=>t.done).length>0&&(
                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:12,marginTop:4}}>
                  <button onClick={()=>setCompletedExpanded(v=>!v)} style={{background:"transparent",border:"none",color:T.sub,cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6,marginBottom:completedExpanded?12:0}}>
                    {completedExpanded?"▼":"▶"} Completed ({tasks.filter(t=>t.done).length})
                  </button>
                  {completedExpanded&&tasks.filter(t=>t.done).map(t=>(
                    <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",marginBottom:4,borderRadius:8,background:T.surface,opacity:0.6}}>
                      <div style={{width:18,height:18,borderRadius:4,background:getSubjectColor(t.subject),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{color:"#000",fontSize:10,fontWeight:900}}>✓</span>
                      </div>
                      <span style={{flex:1,fontSize:13,textDecoration:"line-through",color:T.sub}}>{t.text}</span>
                      <span style={{fontSize:10,color:T.sub}}>{t.subject}</span>
                      <button onClick={()=>deleteTask(t.id)} style={{background:"transparent",border:"none",color:T.sub,cursor:"pointer",fontSize:14}}>×</button>
                    </div>
                  ))}
                </div>
              )}
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

            {/* ── SOCIAL CHALLENGES ── */}
            <div style={css.card}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:15}}>⚔️ Study Challenges</div>
                <button style={{...css.btn,padding:"5px 12px",fontSize:12}} onClick={()=>setShowCreateChallenge(true)}>+ New</button>
              </div>

              {/* Pending invites */}
              {socialChallenges.filter(c=>!((myChallengeMembers[c.id]||[]).find(m=>m.user_id===authUser?.id)?.accepted)).map(c=>(
                <div key={c.id} style={{padding:"12px 14px",borderRadius:10,border:"1.5px solid #f59e0b",background:"#f59e0b10",marginBottom:10}}>
                  <div style={{fontSize:11,color:"#f59e0b",fontWeight:700,marginBottom:4}}>📬 Invite — {c.title}</div>
                  <div style={{fontSize:12,color:T.sub,marginBottom:8}}>Goal: {c.goal_hours}h in {c.duration_days} days</div>
                  <div style={{display:"flex",gap:8}}>
                    <button style={{...css.btn,flex:1,padding:"6px"}} onClick={()=>acceptSocialChallenge(c.id)}>✅ Accept</button>
                    <button style={{...css.btnD,padding:"6px 12px"}} onClick={()=>declineSocialChallenge(c.id)}>Decline</button>
                  </div>
                </div>
              ))}

              {/* Active challenges */}
              {socialChallenges.filter(c=>(myChallengeMembers[c.id]||[]).find(m=>m.user_id===authUser?.id)?.accepted).map(c=>{
                const{goalMins,daysLeft,dayNum,totalDays,members}=getSocialChallengeProgress(c,myChallengeMembers[c.id]);
                return(
                  <div key={c.id} style={{padding:"12px 14px",borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <div style={{fontWeight:700,fontSize:14}}>{c.title}</div>
                      <div style={{fontSize:11,color:T.sub}}>Day {dayNum}/{totalDays}</div>
                    </div>
                    <div style={{fontSize:11,color:T.sub,marginBottom:10}}>{c.goal_hours}h goal · {daysLeft} days left</div>
                    {/* Progress bar with avatars */}
                    <div style={{position:"relative",height:26,marginBottom:8}}>
                      <div style={{position:"absolute",top:"50%",transform:"translateY(-50%)",left:0,right:0,height:6,background:T.border,borderRadius:3}}/>
                      {members.map((m,i)=>{
                        const pct=Math.min((m.progress/goalMins)*100,100);
                        const col=["#00e676","#f59e0b","#ef4444","#6366f1","#a855f7"][i%5];
                        return(
                          <div key={m.user_id} style={{position:"absolute",top:"50%",transform:"translateY(-50%)",left:0,right:0}}>
                            <div style={{position:"absolute",left:0,top:"-3px",height:6,background:col,borderRadius:3,width:`${pct}%`,opacity:0.6}}/>
                            <div title={`${m.username}: ${m.progress}m`} style={{position:"absolute",left:`calc(${pct}% - 12px)`,top:"50%",transform:"translateY(-50%)",width:24,height:24,borderRadius:"50%",background:col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#000",border:`2px solid ${T.bg}`,zIndex:i+1}}>
                              {(m.username||"?")[0].toUpperCase()}
                            </div>
                          </div>
                        );
                      })}
                      <div style={{position:"absolute",right:0,top:-3,width:2,height:20,background:T.accent,borderRadius:1}}/>
                    </div>
                    {members.map((m,i)=>(
                      <div key={m.user_id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,padding:"4px 0"}}>
                        <span style={{color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":T.sub}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</span>
                        <span style={{flex:1,fontWeight:m.user_id===authUser?.id?700:400,color:m.user_id===authUser?.id?T.accent:T.text}}>{m.username}{m.user_id===authUser?.id?" (you)":""}</span>
                        <span style={{color:T.accent,fontWeight:600}}>{Math.round((m.progress/goalMins)*100)}%</span>
                      </div>
                    ))}
                  </div>
                );
              })}

              {socialChallenges.length===0&&(
                <div style={{textAlign:"center",padding:"20px 0",color:T.sub,fontSize:13}}>
                  No challenges yet — create one and invite a friend!
                </div>
              )}
            </div>

            {/* Create Challenge Modal */}
            {showCreateChallenge&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
                <div style={{...css.card,width:"100%",maxWidth:420}}>
                  <div style={{fontWeight:800,fontSize:16,marginBottom:16}}>⚔️ Create Challenge</div>
                  {challengeFormError&&<div style={{color:"#ff6b6b",fontSize:12,marginBottom:10}}>{challengeFormError}</div>}
                  <input style={{...css.input,marginBottom:10}} placeholder='Title (e.g. "Study 10h in 7 days")' value={challengeForm.title} onChange={e=>setChallengeForm(p=>({...p,title:e.target.value}))}/>
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,color:T.sub,marginBottom:4}}>Goal (hours)</div>
                      <input style={css.input} type="number" min="1" max="1000" value={challengeForm.goalHours} onChange={e=>setChallengeForm(p=>({...p,goalHours:e.target.value}))}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,color:T.sub,marginBottom:4}}>Duration (days)</div>
                      <input style={css.input} type="number" min="1" max="365" value={challengeForm.durationDays} onChange={e=>setChallengeForm(p=>({...p,durationDays:e.target.value}))}/>
                    </div>
                  </div>
                  <input style={{...css.input,marginBottom:16}} placeholder="Invite friend by code (optional)" value={challengeForm.friendCode} onChange={e=>setChallengeForm(p=>({...p,friendCode:e.target.value}))}/>
                  <div style={{display:"flex",gap:8}}>
                    <button style={{...css.btn,flex:1}} onClick={createSocialChallenge}>Create Challenge</button>
                    <button style={{...css.btnO}} onClick={()=>{setShowCreateChallenge(false);setChallengeFormError("");}}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="leaderboard"&&(
          <div>
            {/* ── MY PROFILE ── */}
            {(()=>{
              const lv=getXPProgress(stats.total_xp||0);
              return(
                <div style={{...css.card,marginBottom:16,background:`linear-gradient(135deg,${T.card},${T.accent}08)`}}>
                  <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
                    <div style={{cursor:"pointer"}} onClick={()=>setTab("settings")}>
                      <FramedAvatar size={72} avatarUrl={avatarUrl} username={profile?.username} frameId={selectedFrame} unlockedFrames={unlockedFrames} isPro={isPro} accentColor={T.accent}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:900,fontSize:18}}>{profile?.username}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                        <span style={{fontSize:13,color:"#a855f7",fontWeight:700}}>{lv.icon} Level {lv.level}</span>
                        <span style={{fontSize:12,color:T.sub}}>· {lv.title}</span>
                      </div>
                      <div style={{fontSize:11,color:T.sub,marginTop:2}}>#{profile?.friend_code}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:20,fontWeight:900,color:"#a855f7"}}>{stats.total_xp||0}</div>
                      <div style={{fontSize:10,color:T.sub}}>Total XP</div>
                    </div>
                  </div>
                  {/* XP Progress */}
                  <div style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.sub,marginBottom:5}}>
                      <span style={{color:"#a855f7",fontWeight:600}}>{lv.title}</span>
                      <span>{lv.next?`${lv.current} / ${lv.needed} XP to Level ${lv.level+1}`:"MAX LEVEL"}</span>
                    </div>
                    <div style={{height:8,background:T.border,borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",background:"linear-gradient(90deg,#7c3aed,#a855f7)",borderRadius:4,width:`${lv.progress}%`,transition:"width 0.5s"}}/>
                    </div>
                    {lv.next&&<div style={{fontSize:11,color:T.sub,marginTop:4}}>🎁 Next reward: {LEVEL_REWARDS[lv.level]}</div>}
                  </div>
                  {/* Quick stats */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,textAlign:"center"}}>
                    {[
                      {label:"Streak",val:`${stats.streak||0}🔥`},
                      {label:"Total",val:fmtMins(stats.total_minutes||0)},
                      {label:"Badges",val:`${(stats.achievements||[]).length}/${ACHIEVEMENTS.length}`},
                      {label:"Tasks",val:stats.tasks_completed||0},
                    ].map(s=>(
                      <div key={s.label} style={{padding:"8px 4px",background:T.surface,borderRadius:8,border:`1px solid ${T.border}`}}>
                        <div style={{fontSize:14,fontWeight:900,color:T.accent}}>{s.val}</div>
                        <div style={{fontSize:10,color:T.sub,marginTop:2}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── FRIENDS MINI LEADERBOARD ── */}
            {friends.length>0&&(
              <div style={{...css.card,marginBottom:16}}>
                <div style={{fontWeight:700,marginBottom:12}}>👥 Friends Ranking</div>
                {[...friends,{id:authUser?.id,username:profile?.username,stats}]
                  .sort((a,b)=>(b.stats?.total_xp||0)-(a.stats?.total_xp||0))
                  .map((f,i)=>{
                    const isMe=f.id===authUser?.id;
                    const lv=getXPProgress(f.stats?.total_xp||0);
                    const medals=["🥇","🥈","🥉"];
                    return(
                      <div key={f.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`,background:isMe?`${T.accent}08`:"transparent",borderRadius:isMe?8:0,padding:isMe?"8px 10px":"10px 0"}}>
                        <div style={{fontSize:i<3?20:13,width:24,textAlign:"center",color:i<3?undefined:T.sub}}>{i<3?medals[i]:`#${i+1}`}</div>
                        <div style={{width:32,height:32,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#000",flexShrink:0}}>
                          {(f.username||"?")[0].toUpperCase()}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:isMe?T.accent:T.text}}>{f.username}{isMe?" (you)":""}</div>
                          <div style={{fontSize:11,color:"#a855f7"}}>{lv.icon} Lv.{lv.level} {lv.title}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#a855f7"}}>{f.stats?.total_xp||0} XP</div>
                          <div style={{fontSize:11,color:T.sub}}>{fmtMins(f.stats?.weekly_minutes||0)} this week</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* ── GROUP LEADERBOARD ── */}
            {group&&leaderboard.length>0&&(
              <div style={{...css.card,marginBottom:16}}>
                <div style={{fontWeight:700,marginBottom:4}}>🏆 Group: {group.name}</div>
                <div style={{fontSize:11,color:T.sub,marginBottom:12}}>Weekly ranking</div>
                {[...leaderboard].sort((a,b)=>(b.stats?.weekly_minutes||0)-(a.stats?.weekly_minutes||0)).map((m,i)=>{
                  const isMe=m.id===authUser?.id;
                  const medals=["🥇","🥈","🥉"];
                  return(
                    <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                      <div style={{fontSize:i<3?18:12,width:22,textAlign:"center"}}>{i<3?medals[i]:`#${i+1}`}</div>
                      <div style={{width:30,height:30,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,color:"#000",flexShrink:0}}>
                        {(m.username||"?")[0].toUpperCase()}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:isMe?T.accent:T.text}}>{m.username}{isMe?" (you)":""}</div>
                        <div style={{fontSize:11,color:T.sub}}>🔥 {m.stats?.streak||0} streak</div>
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":T.text}}>{fmtMins(m.stats?.weekly_minutes||0)}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── GLOBAL TOP 5 ── */}
            <div style={css.card}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontWeight:700}}>🌍 Global Top</div>
                <div style={{fontSize:11,color:T.sub}}>By total XP</div>
              </div>
              {globalTop.length===0&&<div style={{color:T.sub,fontSize:13}}>Loading...</div>}
              {globalTop.map((u,i)=>{
                const isMe=u.id===authUser?.id;
                const lv=getXPProgress(u.stats?.total_xp||0);
                const medals=["🥇","🥈","🥉"];
                return(
                  <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                    <div style={{fontSize:i<3?18:12,width:22,textAlign:"center"}}>{i<3?medals[i]:`#${i+1}`}</div>
                    <div style={{width:30,height:30,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,color:"#000",flexShrink:0,overflow:"hidden"}}>
                      {u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(u.username||"?")[0].toUpperCase()}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:isMe?T.accent:T.text}}>{u.username}{isMe?" (you)":""}</div>
                      <div style={{fontSize:11,color:"#a855f7"}}>{lv.icon} Lv.{lv.level} · {lv.title}</div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":T.text}}>{(u.stats?.total_xp||0)>0?`${u.stats.total_xp} XP`:fmtMins(u.stats?.total_minutes||0)}</div>
                  </div>
                );
              })}
              {!showFullGlobal?(
                <button style={{...css.btnO,width:"100%",marginTop:12,fontSize:13}} onClick={()=>{setShowFullGlobal(true);loadFullGlobal();}}>
                  🌍 See Full Global Leaderboard
                </button>
              ):(
                globalLoading?<div style={{color:T.sub,fontSize:13,textAlign:"center",padding:16}}>Loading...</div>:(
                  fullGlobal.map((u,i)=>{
                    const isMe=u.id===authUser?.id;
                    const lv=getXPProgress(u.stats?.total_xp||0);
                    if(i<5)return null; // already shown above
                    return(
                      <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                        <div style={{fontSize:12,width:22,color:T.sub,textAlign:"center"}}>#{i+1}</div>
                        <div style={{width:28,height:28,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,color:"#000",flexShrink:0,overflow:"hidden"}}>
                          {u.avatar_url?<img src={u.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(u.username||"?")[0].toUpperCase()}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:isMe?T.accent:T.text}}>{u.username}{isMe?" (you)":""}</div>
                          <div style={{fontSize:11,color:"#a855f7"}}>{lv.icon} Lv.{lv.level}</div>
                        </div>
                        <div style={{fontSize:13,fontWeight:700,color:T.text}}>{u.stats?.total_xp||0} XP</div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        )}

        {tab==="stats"&&(
          <StatsTab
            T={T} css={css} stats={stats}
            weeklyBarData={weeklyBarData} weeklyBarMax={weeklyBarMax}
            streakHistory={streakHistory}
            heatmapDays={heatmapDays} heatmapColor={heatmapColor}
            setShowWeeklyReport={setShowWeeklyReport}
          />
        )}

        {tab==="challenges"&&(
          <ChallengesTab
            T={T} css={css}
            challengeTab={challengeTab} setChallengeTab={setChallengeTab}
            DAILY_CHALLENGES={DAILY_CHALLENGES} WEEKLY_CHALLENGES={WEEKLY_CHALLENGES}
            isChallengeCompleted={isChallengeCompleted} getChallengeProgress={getChallengeProgress} claimChallenge={claimChallenge}
          />
        )}

                {tab==="planner"&&(
          <PlannerTab
            T={T} css={css}
            plannerEvents={plannerEvents} plannerMonth={plannerMonth} setPlannerMonth={setPlannerMonth}
            selectedDay={selectedDay} setSelectedDay={setSelectedDay}
            showEventModal={showEventModal} setShowEventModal={setShowEventModal}
            editingEvent={editingEvent} setEditingEvent={setEditingEvent}
            eventForm={eventForm} setEventForm={setEventForm}
            saveEvent={saveEvent} deleteEvent={deleteEvent}
            plannerYear={plannerYear} plannerMonthIdx={plannerMonthIdx}
            plannerFirstDay={plannerFirstDay} plannerDaysInMonth={plannerDaysInMonth}
            plannerTodayStr={plannerTodayStr} plannerTodayEvents={plannerTodayEvents}
            plannerUpcoming={plannerUpcoming} plannerEventsOnDay={plannerEventsOnDay}
            openNewEvent={openNewEvent} openEditEvent={openEditEvent}
          />
        )}

                {tab==="achievements"&&(
          <AchievementsTab T={T} css={css} stats={stats}/>
        )}

        {tab==="settings"&&(
          <SettingsTab
            T={T} css={css} theme={theme} handleTheme={handleTheme}
            profile={profile} avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl}
            authUser={authUser} uploadPfp={uploadPfp}
            selectedFrame={selectedFrame} setSelectedFrame={setSelectedFrame}
            unlockedFrames={unlockedFrames} isPro={isPro}
            invisible={invisible} setInvisible={setInvisible}
            notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled}
            handleLogout={handleLogout}
            setShowDeleteModal={setShowDeleteModal} setDeleteConfirmText={setDeleteConfirmText}
          />
        )}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}select option{background:${T.card};color:${T.text}}.desktop-header{display:flex!important}.mobile-header{display:none!important}@media(max-width:600px){.desktop-header{display:none!important}.mobile-header{display:flex!important}}`}</style>
    </div>
  );
}