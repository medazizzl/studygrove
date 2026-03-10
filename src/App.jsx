import { useState, useEffect, useRef } from "react";
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
];

const fmtTime = (s) => {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  if (h>0) return `${h}h ${String(m).padStart(2,"0")}m`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
};
const fmtMins = (m) => {
  if (!m||m<=0) return "0m";
  if (m<60) return `${Math.round(m)}m`;
  return `${Math.floor(m/60)}h${m%60>0?" "+Math.round(m%60)+"m":""}`;
};
const genCode = () => Math.random().toString(36).substring(2,8).toUpperCase();

export default function StudyGrove() {
  const [theme, setTheme] = useState(()=>localStorage.getItem("sg_theme")||"amoled");
  const T = THEMES[theme];

  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authScreen, setAuthScreen] = useState("login"); // login|register|otp|forgot|forgot_sent
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loginForm, setLoginForm] = useState({email:"",password:""});
  const [regForm, setRegForm] = useState({username:"",email:"",password:""});
  const [otpCode, setOtpCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

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

  const [stats, setStats] = useState({total_minutes:0,today_minutes:0,weekly_minutes:0,streak:0,total_sessions:0,pomodoros_total:0,tasks_completed:0,subject_minutes:{},achievements:[],invisible_minutes:0,night_sessions:0,early_sessions:0,groups_joined:0,focus_uses:0,themes_used:1,challenge_wins:0});
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("Math");
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

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setAuthUser(session?.user??null);
      setAuthLoading(false);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>setAuthUser(session?.user??null));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!authUser){setProfile(null);return;}
    loadProfile();
    loadTasks();
    loadGroup();
  },[authUser]);

  const loadProfile=async()=>{
    const{data}=await supabase.from("profiles").select("*").eq("id",authUser.id).single();
    if(data){setProfile(data);if(data.stats)setStats(data.stats);if(data.subjects)setSubjects(data.subjects);}
  };

  const saveStats=async(newStats)=>{
    setStats(newStats);
    await supabase.from("profiles").update({stats:newStats,updated_at:new Date().toISOString()}).eq("id",authUser.id);
  };

  const loadTasks=async()=>{
    const{data}=await supabase.from("tasks").select("*").eq("user_id",authUser.id).order("created_at",{ascending:false});
    if(data)setTasks(data);
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
    const ch=supabase.channel(`grp-${gid}`,{config:{presence:{key:authUser.id}}});
    ch.on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`group_id=eq.${gid}`},p=>{
      setMessages(prev=>[...prev,p.new]);
      setTimeout(()=>chatBottomRef.current?.scrollIntoView({behavior:"smooth"}),100);
    });
    ch.on("presence",{event:"sync"},()=>{
      const state=ch.presenceState();
      setOnlineMembers(Object.values(state).flat());
    });
    ch.subscribe(async(s)=>{
      if(s==="SUBSCRIBED")await ch.track({user_id:authUser.id,username:profile?.username||"...",status:"online",subject:selectedSubject});
    });
    channelRef.current=ch;
  };

  useEffect(()=>{
    if(!channelRef.current||!profile)return;
    channelRef.current.track({user_id:authUser?.id,username:profile?.username,status:studying?(invisible?"invisible":"studying"):"online",subject:selectedSubject});
  },[studying,invisible,selectedSubject,profile]);

  useEffect(()=>{
    if(studying){timerRef.current=setInterval(()=>setSessionSecs(s=>s+1),1000);}
    else clearInterval(timerRef.current);
    return()=>clearInterval(timerRef.current);
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
        const ns={...stats,
          total_minutes:(stats.total_minutes||0)+mins,
          today_minutes:(stats.today_minutes||0)+mins,
          weekly_minutes:(stats.weekly_minutes||0)+mins,
          total_sessions:(stats.total_sessions||0)+1,
          subject_minutes:{...(stats.subject_minutes||{}),[selectedSubject]:((stats.subject_minutes||{})[selectedSubject]||0)+mins},
          invisible_minutes:invisible?(stats.invisible_minutes||0)+mins:(stats.invisible_minutes||0),
        };
        let ach=ns.achievements||[];
        if(ns.total_sessions>=1)ach=unlockAchievement("first_step",ach);
        if(ns.total_minutes>=600)ach=unlockAchievement("apprentice",ach);
        if(ns.total_minutes>=1500)ach=unlockAchievement("dedicated",ach);
        if(ns.total_minutes>=6000)ach=unlockAchievement("academic_weapon",ach);
        if(ns.invisible_minutes>=180)ach=unlockAchievement("ghost_student",ach);
        if(Object.keys(ns.subject_minutes||{}).length>=5)ach=unlockAchievement("multi_subject",ach);
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
    const{error}=await supabase.auth.resetPasswordForEmail(forgotEmail,{redirectTo:window.location.origin});
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
      await supabase.from("profiles").insert({id:data.user.id,username:regForm.username,email:regForm.email,stats:{total_minutes:0,today_minutes:0,weekly_minutes:0,streak:0,total_sessions:0,pomodoros_total:0,tasks_completed:0,subject_minutes:{},achievements:[],invisible_minutes:0,night_sessions:0,early_sessions:0,groups_joined:0},subjects:DEFAULT_SUBJECTS,created_at:new Date().toISOString()});
    }
    setAuthLoading(false);
  };

  const handleLogout=async()=>{
    if(channelRef.current)supabase.removeChannel(channelRef.current);
    await supabase.auth.signOut();
    setGroup(null);setGroupMembers([]);setMessages([]);setProfile(null);setStats({total_minutes:0,today_minutes:0,weekly_minutes:0,streak:0,total_sessions:0,pomodoros_total:0,tasks_completed:0,subject_minutes:{},achievements:[],invisible_minutes:0});
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
    await supabase.from("messages").insert({group_id:group.id,user_id:authUser.id,username:profile?.username||"?",text:chatInput,created_at:new Date().toISOString()});
    setChatInput("");
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

  const pomPct=((25*60-pomodoroSecs)/(25*60))*100;

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
        ):authScreen==="login"?(
          <>
            <input style={{...css.input,marginBottom:12}} placeholder="Email" type="email" value={loginForm.email} onChange={e=>setLoginForm(p=>({...p,email:e.target.value}))}/>
            <input style={{...css.input,marginBottom:8}} placeholder="Password" type="password" value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            <div style={{textAlign:"right",marginBottom:16}}><span style={{fontSize:12,color:T.accent,cursor:"pointer"}} onClick={()=>{setAuthScreen("forgot");setAuthError("");}}>Forgot password?</span></div>
            <button style={{...css.btn,width:"100%",padding:14,fontSize:15}} onClick={handleLogin}>Sign In</button>
          </>
        ):(
          <>
            <input style={{...css.input,marginBottom:12}} placeholder="Username (shown to friends)" value={regForm.username} onChange={e=>setRegForm(p=>({...p,username:e.target.value}))}/>
            <input style={{...css.input,marginBottom:12}} placeholder="Email" type="email" value={regForm.email} onChange={e=>setRegForm(p=>({...p,email:e.target.value}))}/>
            <input style={{...css.input,marginBottom:20}} placeholder="Password (min 6 chars)" type="password" value={regForm.password} onChange={e=>setRegForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleRegister()}/>
            <button style={{...css.btn,width:"100%",padding:14,fontSize:15}} onClick={handleRegister}>Create Account</button>
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

      {newAchievement&&(
        <div style={{position:"fixed",top:20,right:20,zIndex:1000,background:T.card,border:`1.5px solid ${T.accent}`,borderRadius:14,padding:"14px 20px",boxShadow:`0 0 30px ${T.accent}40`,animation:"slideIn 0.4s ease",maxWidth:280}}>
          <div style={{fontSize:11,color:T.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>🎖 Achievement Unlocked!</div>
          <div style={{fontSize:18,marginTop:4}}>{newAchievement.icon} <strong>{newAchievement.name}</strong></div>
          <div style={{fontSize:12,color:T.sub,marginTop:2}}>{newAchievement.desc}</div>
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

      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span onClick={handleEaster} style={{fontSize:22,cursor:"default",userSelect:"none"}}>📖</span>
          <span style={{fontWeight:900,fontSize:18,letterSpacing:-0.5}}>Study<span style={{color:T.accent}}>Grove</span></span>
          {group&&<span style={{fontSize:11,color:T.sub,background:T.card,padding:"2px 8px",borderRadius:20}}>{group.name} · <strong style={{color:T.accent}}>{group.code}</strong></span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          {studying&&<span style={{fontSize:11,color:T.accent,fontWeight:700,padding:"3px 10px",border:`1px solid ${T.accent}`,borderRadius:20}}>● LIVE</span>}
          <button style={{...css.btnO,padding:"4px 10px",fontSize:11}} onClick={()=>setInvisible(v=>!v)}>{invisible?"👻 Invisible":"🟢 Visible"}</button>
          <button style={{...css.btnO,padding:"4px 10px",fontSize:11}} onClick={()=>setShowThemePanel(v=>!v)}>🎨</button>
          <button style={{...css.btnO,padding:"4px 10px",fontSize:11}} onClick={()=>setShowGroupModal(true)}>👥 Groups</button>
          <div style={{width:32,height:32,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#000",cursor:"pointer"}} onClick={()=>setTab("settings")}>
            {(profile?.username||"?")[0].toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:4,padding:"10px 16px",overflowX:"auto",borderBottom:`1px solid ${T.border}`,background:T.surface,position:"sticky",top:57,zIndex:99}}>
        {[["study","⏱ Study"],["group","👥 Group"],["leaderboard","🏆 Ranks"],["stats","📊 Stats"],["tasks","✅ Tasks"],["achievements","🎖 Badges"],["settings","⚙️ Settings"]].map(([t,l])=>(
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
                <span>Streak <strong style={{color:T.accent}}>{stats.streak||0}🔥</strong></span>
              </div>
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
          </div>
        )}

        {tab==="group"&&(
          <div>
            {!group?(
              <div style={{...css.card,textAlign:"center",padding:40}}>
                <div style={{fontSize:48}}>👥</div>
                <div style={{fontWeight:700,fontSize:20,marginTop:12}}>You're not in a group yet</div>
                <div style={{color:T.sub,fontSize:14,marginTop:8,marginBottom:20}}>Create one and share the code with friends, or join with a code</div>
                <button style={css.btn} onClick={()=>setShowGroupModal(true)}>Join or Create a Group</button>
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div style={{...css.card,height:520,display:"flex",flexDirection:"column"}}> 
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
                  <div style={{fontSize:12,marginBottom:4}}>Code: <strong style={{color:T.accent,letterSpacing:2}}>{group.code}</strong></div>
                  <div style={{fontSize:11,color:T.sub,marginBottom:16}}>Share this code with friends to invite them</div>
                  {groupMembers.map((m,i)=>{
                    const online=onlineMembers.find(o=>o.user_id===m.id);
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                        <div style={css.av()}>{(m.username||"?")[0].toUpperCase()}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:13}}>{m.username}{m.id===authUser?.id?" (you)":""}</div>
                          <div style={{fontSize:11,color:T.sub}}>{online?.status==="studying"?`Studying ${online.subject}`:online?.status||"offline"}</div>
                        </div>
                        <span style={css.dot(online?.status||"offline")}/>
                      </div>
                    );
                  })}
                  <button style={{...css.btnD,width:"100%",marginTop:14,fontSize:12}} onClick={leaveGroup}>Leave Group</button>
                </div>
              </div>
            )}
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
                <button style={{...css.btn,marginTop:16}} onClick={()=>setShowGroupModal(true)}>Join a Group</button>
              </div>
            ):(
              <div style={css.card}>
                <div style={{fontWeight:700,marginBottom:4}}>🏆 {group.name}</div>
                <div style={{fontSize:12,color:T.sub,marginBottom:16}}>{leaderboardFrame} rankings — updates when members study</div>
                {leaderboard.length===0&&<div style={{color:T.sub,fontSize:13}}>No data yet — start studying!</div>}
                {leaderboard.map((m,i)=>(
                  <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.border}`,background:i===0?`${T.accent}10`:"transparent",borderRadius:i===0?8:0,paddingLeft:i===0?8:0}}>
                    <div style={{width:32,textAlign:"center",fontWeight:900,fontSize:i===0?20:15,color:i===0?T.accent:i===1?"#c0c0c0":i===2?"#cd7f32":T.sub}}>
                      {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}
                    </div>
                    <div style={css.av()}>{(m.username||"?")[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14}}>{m.username}{m.id===authUser?.id&&<span style={{fontSize:11,color:T.accent}}> (you)</span>}</div>
                      <div style={{fontSize:11,color:T.sub}}>🔥 {m.stats?.streak||0} day streak</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,color:T.accent}}>{fmtMins(leaderboardFrame==="weekly"?(m.stats?.weekly_minutes||0):leaderboardFrame==="daily"?(m.stats?.today_minutes||0):(m.stats?.total_minutes||0))}</div>
                      <div style={{fontSize:11,color:T.sub}}>studied</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="stats"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
              {[{l:"Total Hours",v:fmtMins(stats.total_minutes||0),i:"⏱"},{l:"Streak",v:`${stats.streak||0}d 🔥`,i:"🔥"},{l:"Sessions",v:stats.total_sessions||0,i:"📚"},{l:"Pomodoros",v:stats.pomodoros_total||0,i:"🍅"},{l:"Tasks Done",v:stats.tasks_completed||0,i:"✅"},{l:"Achievements",v:`${(stats.achievements||[]).length}/${ACHIEVEMENTS.length}`,i:"🎖"}].map(s=>(
                <div key={s.l} style={{...css.card,textAlign:"center",padding:16}}>
                  <div style={{fontSize:24}}>{s.i}</div>
                  <div style={{fontWeight:900,fontSize:18,color:T.accent,marginTop:4}}>{s.v}</div>
                  <div style={{fontSize:11,color:T.sub,marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>🎯 Subject Distribution</div>
              {Object.keys(stats.subject_minutes||{}).length===0&&<div style={{color:T.sub,fontSize:13}}>Start studying to see your breakdown</div>}
              {Object.entries(stats.subject_minutes||{}).map(([sub,mins])=>{
                const total=Object.values(stats.subject_minutes||{}).reduce((a,b)=>a+b,1);
                const pct=Math.round((mins/total)*100);
                return(<div key={sub} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{width:90,fontSize:12,color:T.text}}>{sub}</span>
                  <div style={{flex:1,height:8,background:T.border,borderRadius:4}}><div style={{height:"100%",background:T.accent,borderRadius:4,width:`${pct}%`}}/></div>
                  <span style={{fontSize:12,color:T.accent,fontWeight:600,width:80,textAlign:"right"}}>{pct}% · {fmtMins(mins)}</span>
                </div>);
              })}
            </div>
          </div>
        )}

        {tab==="tasks"&&(
          <div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>➕ Add Task</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <input style={{...css.input,flex:1,minWidth:200}} placeholder="What do you need to study?" value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()}/>
                <select style={{...css.input,width:140}} value={newTaskSubject} onChange={e=>setNewTaskSubject(e.target.value)}>
                  {subjects.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button style={css.btn} onClick={addTask}>Add</button>
              </div>
            </div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:12}}>📋 Tasks ({tasks.filter(t=>!t.done).length} remaining)</div>
              {tasks.length===0&&<div style={{color:T.sub,fontSize:13}}>No tasks yet. Add one above!</div>}
              {tasks.map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
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
                <div style={{width:50,height:50,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:"#000"}}>{(profile?.username||"?")[0].toUpperCase()}</div>
                <div><div style={{fontWeight:700,fontSize:16}}>{profile?.username}</div><div style={{fontSize:12,color:T.sub}}>{profile?.email}</div></div>
              </div>
              <button style={css.btnD} onClick={handleLogout}>Sign Out</button>
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
              <div style={{fontWeight:700,marginBottom:4}}>🔒 Privacy</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0"}}>
                <div><div style={{fontSize:14,fontWeight:600}}>Invisible Mode</div><div style={{fontSize:12,color:T.sub}}>Timer still counts. You appear offline.</div></div>
                <button onClick={()=>setInvisible(v=>!v)} style={{...css.btn,padding:"6px 14px",fontSize:12,background:invisible?"#cc2222":T.accent,color:invisible?"#fff":"#000"}}>{invisible?"👻 ON":"🟢 OFF"}</button>
              </div>
            </div>
            <div style={css.card}>
              <div style={{fontWeight:700,marginBottom:4}}>📖 About</div>
              <div style={{fontSize:12,color:T.sub}}>StudyGrove v2.0 · Built by Aziz ZL</div>
              <div style={{fontSize:11,color:T.border,marginTop:8,fontStyle:"italic"}}>Click the 📖 logo 5 times for a secret...</div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}select option{background:${T.card};color:${T.text}}`}</style>
    </div>
  );
}
