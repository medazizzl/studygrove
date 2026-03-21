import React from "react";
import { EVENT_TYPES, EVENT_COLORS, MONTH_NAMES, DAY_NAMES } from "./constants.js";

export default function PlannerTab({
  T, css,
  plannerEvents, plannerMonth, setPlannerMonth,
  selectedDay, setSelectedDay,
  showEventModal, setShowEventModal,
  editingEvent, setEditingEvent,
  eventForm, setEventForm,
  saveEvent, deleteEvent,
  plannerYear, plannerMonthIdx,
  plannerFirstDay, plannerDaysInMonth,
  plannerTodayStr, plannerTodayEvents,
  plannerUpcoming, plannerEventsOnDay,
  openNewEvent, openEditEvent,
}) {
  return (
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
  );
}
