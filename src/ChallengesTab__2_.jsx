import React from "react";
import { fmtMins } from "./constants.js";

function ChallengeCard({ c, done, prog, canClaim, onClaim, T, css }) {
  const pct = Math.min((prog.cur / prog.max) * 100, 100);
  return (
    <div style={{borderRadius:12,padding:"14px 16px",background:done?`${c.color}15`:T.surface,border:`1px solid ${done?c.color:T.border}`,opacity:done?0.75:1,transition:"all 0.2s"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <span style={{fontSize:22}}>{done?"✅":c.icon}</span>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontWeight:700,fontSize:14,color:done?T.sub:T.text}}>{c.title}</span>
            <span style={{fontSize:10,color:c.color,fontWeight:700,padding:"1px 7px",background:`${c.color}22`,borderRadius:20}}>{c.diff}</span>
          </div>
          <div style={{fontSize:12,color:T.sub,marginTop:2}}>{c.desc}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:13,fontWeight:700,color:"#a855f7"}}>+{c.xp} XP</div>
          {!done&&<div style={{fontSize:11,color:T.sub}}>{c.id==="weekly_10hours"?fmtMins(prog.cur)+" / "+fmtMins(prog.max):`${prog.cur}/${prog.max}`}</div>}
          {done&&<div style={{fontSize:11,color:c.color,fontWeight:700}}>✓ Done</div>}
        </div>
      </div>
      <div style={{height:5,background:T.border,borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",background:done?"#22c55e":c.color,borderRadius:3,width:`${pct}%`,transition:"width 0.5s"}}/>
      </div>
      {canClaim&&(
        <button style={{...css.btn,width:"100%",marginTop:10,padding:"8px",fontSize:13,background:c.color,color:"#fff"}} onClick={onClaim}>
          🎁 Claim +{c.xp} XP
        </button>
      )}
    </div>
  );
}

export default function ChallengesTab({
  T, css,
  challengeTab, setChallengeTab,
  DAILY_CHALLENGES, WEEKLY_CHALLENGES,
  isChallengeCompleted, getChallengeProgress, claimChallenge,
  socialChallenges, myChallengeMembers, authUser,
  showCreateChallenge, setShowCreateChallenge,
  challengeForm, setChallengeForm, challengeFormError, setChallengeFormError,
  createSocialChallenge, acceptSocialChallenge, declineSocialChallenge,
  getSocialChallengeProgress,
}) {
  return (
    <div>
      {/* Tab switcher */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["daily","☀️ Daily"],["weekly","📅 Weekly"]].map(([k,l])=>(
          <button key={k} style={css.tBtn(challengeTab===k)} onClick={()=>setChallengeTab(k)}>{l}</button>
        ))}
      </div>

      {/* Daily */}
      {challengeTab==="daily"&&(
        <div style={css.card}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontWeight:800,fontSize:16}}>☀️ Daily Challenges</div>
            <div style={{fontSize:11,color:T.sub}}>Resets at midnight</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {DAILY_CHALLENGES.map(c=>(
              <ChallengeCard key={c.id} c={c} T={T} css={css}
                done={isChallengeCompleted(c.id,"daily")}
                prog={getChallengeProgress(c)}
                canClaim={!isChallengeCompleted(c.id,"daily")&&c.check()}
                onClaim={()=>claimChallenge(c,"daily")}
              />
            ))}
          </div>
        </div>
      )}

      {/* Weekly */}
      {challengeTab==="weekly"&&(
        <div>
          <div style={css.card}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:16}}>📅 Weekly Challenges</div>
              <div style={{fontSize:11,color:T.sub}}>Resets every Monday</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {WEEKLY_CHALLENGES.map(c=>(
                <ChallengeCard key={c.id} c={c} T={T} css={css}
                  done={isChallengeCompleted(c.id,"weekly")}
                  prog={getChallengeProgress(c)}
                  canClaim={!isChallengeCompleted(c.id,"weekly")&&c.check()}
                  onClaim={()=>claimChallenge(c,"weekly")}
                />
              ))}
            </div>
          </div>
          <div style={css.card}>
            <div style={{fontWeight:700,marginBottom:12}}>📊 This Week</div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {[
                {label:"Daily done today",val:`${DAILY_CHALLENGES.filter(c=>isChallengeCompleted(c.id,"daily")).length}/${DAILY_CHALLENGES.length}`,color:"#22c55e"},
                {label:"Weekly done",val:`${WEEKLY_CHALLENGES.filter(c=>isChallengeCompleted(c.id,"weekly")).length}/${WEEKLY_CHALLENGES.length}`,color:"#f59e0b"},
                {label:"XP from challenges",val:[...DAILY_CHALLENGES,...WEEKLY_CHALLENGES].filter(c=>isChallengeCompleted(c.id,DAILY_CHALLENGES.includes(c)?"daily":"weekly")).reduce((a,c)=>a+c.xp,0),color:"#a855f7"},
              ].map(s=>(
                <div key={s.label} style={{flex:1,padding:"12px 16px",background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:11,color:T.sub,marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
