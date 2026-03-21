import React from "react";
import { THEMES, FRAMES, FramedAvatar, supabase } from "./constants.js";

export default function SettingsTab({
  T, css, theme, handleTheme,
  profile, avatarUrl, setAvatarUrl, authUser, uploadPfp,
  selectedFrame, setSelectedFrame, unlockedFrames, isPro,
  invisible, setInvisible,
  notificationsEnabled, setNotificationsEnabled,
  handleLogout, setShowDeleteModal, setDeleteConfirmText,
}) {
  return (
    <div>
      {/* Account */}
      <div style={css.card}>
        <div style={{fontWeight:700,marginBottom:12}}>👤 Account</div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
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

      {/* Themes */}
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

      {/* Privacy */}
      <div style={css.card}>
        <div style={{fontWeight:700,marginBottom:4}}>🔒 Privacy</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0"}}>
          <div>
            <div style={{fontSize:14,fontWeight:600}}>Invisible Mode</div>
            <div style={{fontSize:12,color:T.sub}}>Timer still counts. You appear offline.</div>
          </div>
          <button onClick={()=>setInvisible(v=>!v)} style={{...css.btn,padding:"6px 14px",fontSize:12,background:invisible?"#cc2222":T.accent,color:invisible?"#fff":"#000"}}>{invisible?"👻 ON":"🟢 OFF"}</button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Profile Frames */}
      <div style={css.card}>
        <div style={{fontWeight:700,marginBottom:12}}>🖼️ Profile Frames</div>
        <div style={{fontSize:12,color:T.sub,marginBottom:12}}>Select your frame — unlock more by completing achievements</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
          <div onClick={()=>{setSelectedFrame("none");localStorage.setItem("sg_frame","none");}} style={{...css.card,padding:10,textAlign:"center",cursor:"pointer",border:`2px solid ${selectedFrame==="none"||!selectedFrame?T.accent:T.border}`,background:selectedFrame==="none"||!selectedFrame?`${T.accent}15`:T.card}}>
            <div style={{fontSize:22}}>⬜</div>
            <div style={{fontSize:10,marginTop:4,color:T.sub}}>None</div>
          </div>
          {Object.values(FRAMES).map(f=>{
            const owned=unlockedFrames.includes(f.id)||f.premium;
            const active=selectedFrame===f.id;
            const accent=f.colors[1];
            return(
              <div key={f.id} onClick={()=>{if(owned){setSelectedFrame(f.id);localStorage.setItem("sg_frame",f.id);}}} style={{...css.card,padding:8,textAlign:"center",cursor:owned?"pointer":"default",border:`2px solid ${active?accent:owned?accent+"66":T.border}`,background:active?`${accent}20`:T.card,opacity:owned?1:0.38,position:"relative",transition:"all 0.15s"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:4}}>
                  <FramedAvatar size={40} avatarUrl={null} username="A" frameId={f.id} unlockedFrames={owned?[f.id]:[]} isPro={true} accentColor={T.accent}/>
                </div>
                <div style={{fontSize:9,color:active?accent:owned?accent:T.sub,fontWeight:active?700:400}}>{f.name}</div>
                {!owned&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,borderRadius:8}}>🔒</div>}
                {active&&<div style={{position:"absolute",top:2,left:2,fontSize:7,background:accent,color:"#000",borderRadius:3,padding:"1px 4px",fontWeight:700}}>ON</div>}
              </div>
            );
          })}
        </div>
        {unlockedFrames.length===0&&<div style={{fontSize:12,color:T.sub,padding:"8px 0"}}>🔒 Complete achievements to unlock frames! Try finishing your first study session to get the 🌱 Sprout frame.</div>}
      </div>

      {/* About */}
      <div style={css.card}>
        <div style={{fontWeight:700,marginBottom:4}}>📖 About</div>
        <div style={{fontSize:12,color:T.sub}}>StudyGrove v2.0 · Built by Aziz ZL</div>
        <div style={{fontSize:11,color:T.border,marginTop:8,fontStyle:"italic"}}>Click the 📖 logo 5 times for a secret...</div>
        <div style={{marginTop:10,fontSize:12}}><a href="/privacy.html" target="_blank" style={{color:T.accent}}>📄 Privacy Policy</a></div>
      </div>
    </div>
  );
}
