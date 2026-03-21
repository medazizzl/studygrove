import React from "react";
import { ACHIEVEMENTS, fmtMins, getStreakFlame, StreakFlame } from "./constants.js";

export default function StatsTab({
  T, css, stats,
  weeklyBarData, weeklyBarMax,
  streakHistory,
  heatmapDays, heatmapColor,
  setShowWeeklyReport,
}) {
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

        {/* Overview */}
        <div style={{...css.card,gridColumn:"1/-1"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontWeight:700}}>📊 Overview</div>
            <button style={{...css.btnO,padding:"4px 12px",fontSize:12}} onClick={()=>setShowWeeklyReport(true)}>📋 Weekly Report</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,textAlign:"center"}}>
            {[
              {label:"Today",val:fmtMins(stats.today_minutes||0),icon:"📅"},
              {label:"This Week",val:fmtMins(stats.weekly_minutes||0),icon:"📆"},
              {label:"Total",val:fmtMins(stats.total_minutes||0),icon:"⏱"},
              {label:"Streak",val:`${stats.streak||0}d`,icon:"🔥"},
            ].map(s=>(
              <div key={s.label} style={{padding:16,background:T.surface,borderRadius:12,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:24}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:900,color:T.accent,marginTop:6}}>{s.val}</div>
                <div style={{fontSize:11,color:T.sub,marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Breakdown */}
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

        {/* Weekly Bar Chart */}
        <div style={{...css.card,gridColumn:"1/-1"}}>
          <div style={{fontWeight:700,marginBottom:16}}>📈 Weekly Study Hours</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120}}>
            {weeklyBarData.map((d,i)=>{
              const isToday=i===6;
              return(
                <div key={d.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{fontSize:10,color:T.sub}}>{d.mins>0?fmtMins(d.mins):""}</div>
                  <div style={{width:"100%",borderRadius:"4px 4px 0 0",background:isToday?T.accent:`${T.accent}55`,height:`${Math.max((d.mins/weeklyBarMax)*90,d.mins>0?4:0)}px`,transition:"height 0.5s"}}/>
                  <div style={{fontSize:10,color:isToday?T.accent:T.sub,fontWeight:isToday?700:400}}>{d.label}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:T.sub}}>
            <span>Week total: <strong style={{color:T.accent}}>{fmtMins(weeklyBarData.reduce((a,d)=>a+d.mins,0))}</strong></span>
            <span>Best: <strong style={{color:T.accent}}>{fmtMins(weeklyBarMax)}</strong></span>
          </div>
        </div>

        {/* 30-Day History */}
        <div style={{...css.card,gridColumn:"1/-1"}}>
          <div style={{fontWeight:700,marginBottom:12}}>📅 30-Day Study History</div>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {streakHistory.map((d,i)=>(
              <div key={d.key} title={d.key} style={{width:24,height:24,borderRadius:5,background:d.studied?T.accent:T.surface,border:`1px solid ${d.studied?T.accent:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,boxShadow:i===29?`0 0 6px ${T.accent}`:"none"}}>
                {d.studied?"✓":""}
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,fontSize:11,color:T.sub}}>
            <span>✓ studied · blank missed</span>
            <strong style={{color:T.accent}}>{streakHistory.filter(d=>d.studied).length}/30 days</strong>
          </div>
        </div>

        {/* Streak Info */}
        <div style={css.card}>
          <div style={{fontWeight:700,marginBottom:12}}>🔥 Streak Info</div>
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <StreakFlame streak={stats.streak||0} size={72}/>
            <div style={{fontSize:36,fontWeight:900,color:getStreakFlame(stats.streak||0).glow,marginTop:8}}>{stats.streak||0}</div>
            <div style={{fontSize:13,color:T.sub,marginTop:4}}>day streak · {getStreakFlame(stats.streak||0).label}</div>
          </div>
          <div style={{marginTop:8}}>
            {[[3,"🔥","3-day","Started"],[7,"🔥","7-day","Warming Up"],[14,"🔥","14-day","Rising"],[30,"🔥","30-day","Iron Will"],[90,"🔥","90-day","Veteran"],[180,"🔥","180-day","Elite"],[365,"🔥","365-day","Legendary"]].map(([n,icon,label,tier])=>(
              <div key={n} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`,opacity:(stats.streak||0)>=n?1:0.35}}>
                <span style={{fontSize:18,filter:getStreakFlame(n).filter}}>{icon}</span>
                <span style={{fontSize:13,flex:1}}>{label} · <span style={{color:getStreakFlame(n).glow,fontWeight:600}}>{tier}</span></span>
                {(stats.streak||0)>=n
                  ?<span style={{fontSize:11,color:T.accent,fontWeight:700}}>✓ Reached</span>
                  :<span style={{fontSize:11,color:T.sub}}>{n-(stats.streak||0)} days left</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div style={{...css.card,gridColumn:"1/-1"}}>
          <div style={{fontWeight:700,marginBottom:4}}>📊 Study Heatmap</div>
          <div style={{fontSize:12,color:T.sub,marginBottom:12}}>Last 28 weeks · relative to your best day</div>
          <div style={{overflowX:"auto",paddingBottom:4}}>
            <div style={{display:"flex",gap:2,minWidth:380}}>
              <div style={{display:"flex",flexDirection:"column",gap:2,marginRight:4,marginTop:16}}>
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d,i)=>(
                  <div key={d} style={{height:14,fontSize:9,color:i%2===0?T.sub:"transparent",lineHeight:"14px",userSelect:"none"}}>{d}</div>
                ))}
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:2,marginBottom:4,height:12}}>
                  {Array(28).fill(null).map((_,col)=>{
                    const weekStart=heatmapDays[col*7];
                    const showMonth=weekStart&&weekStart.date<=7;
                    return <div key={col} style={{flex:1,fontSize:9,color:T.accent,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden"}}>{showMonth?["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][weekStart.month]:""}</div>;
                  })}
                </div>
                <div style={{display:"flex",gap:2}}>
                  {Array(28).fill(null).map((_,col)=>(
                    <div key={col} style={{display:"flex",flexDirection:"column",gap:2,flex:1}}>
                      {Array(7).fill(null).map((_,row)=>{
                        const day=heatmapDays[col*7+row];
                        if(!day) return <div key={row} style={{height:14,borderRadius:2}}/>;
                        return <div key={row} title={`${day.key}: ${fmtMins(day.mins)}`} style={{height:14,borderRadius:2,background:heatmapColor(day.mins),cursor:"default"}}/>;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,fontSize:11,color:T.sub}}>
            <span>None</span>
            {[T.surface,"#7f1d1d","#dc2626","#f59e0b","#84cc16","#22c55e"].map((c,i)=>(
              <div key={i} style={{width:12,height:12,borderRadius:2,background:c,border:`1px solid ${T.border}`}}/>
            ))}
            <span>🔥 Best</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{...css.card,gridColumn:"1/-1"}}>
          <div style={{fontWeight:700,marginBottom:12}}>🏆 Quick Stats</div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {[
              {label:"Total sessions",val:stats.sessions_count||0},
              {label:"Longest session",val:fmtMins(stats.longest_session||0)},
              {label:"Badges earned",val:`${(stats.achievements||[]).length}/${ACHIEVEMENTS.length}`},
            ].map(s=>(
              <div key={s.label} style={{padding:"12px 20px",background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,textAlign:"center"}}>
                <div style={{fontSize:11,color:T.sub}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:900,color:T.accent,marginTop:4}}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
