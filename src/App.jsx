import React, { useState } from "react";

const TAGS = ["🍜 Food","🏛️ Culture","🥾 Adventure","🛍️ Shopping","😴 Rest","🏖️ Beach","🎭 Nightlife","🌿 Nature"];
const SEASONS = ["N/A (Tropical)","Spring 🌸","Summer ☀️","Autumn 🍂","Winter ❄️"];

function uid() { return Math.random().toString(36).slice(2,9); }

// A trip can be single or multi-country.
// single: { country, city }
// multi:  { multiCountry: true, countryList: [{country, cities}] }
function eT() {
  return {
    id:uid(), title:"", multiCountry:false, country:"", city:"",
    countryList:[{country:"",cities:""}],
    startDate:"", days:"", season:"N/A (Tropical)",
    companions:"", budget:"", coverPhoto:null,
    reflection:"", rating:0, goAgain:"", highlights:"", tripDays:[]
  };
}
function eD(n) { return {id:uid(),dayNum:n,tags:[],activities:"",feelings:"",photos:[]}; }

// Helper: get all countries for a trip as array
function tripCountries(t) {
  if (t.multiCountry && t.countryList && t.countryList.length) {
    return t.countryList.map(c=>c.country).filter(Boolean);
  }
  return t.country ? [t.country] : [];
}

// Display label for location on card / detail
function tripLocationLabel(t) {
  if (t.multiCountry && t.countryList && t.countryList.length) {
    return t.countryList.map(c=>[c.cities,c.country].filter(Boolean).join(", ")).filter(Boolean).join(" · ");
  }
  return [t.city, t.country].filter(Boolean).join(", ") || "?";
}

function getYear(t) { return t.startDate ? t.startDate.slice(0,4) : "Unknown"; }

// ── Share link helpers ────────────────────────────────────────────────────────
function encodeTrip(trip) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(trip)))); }
  catch { return null; }
}
function decodeTrip(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch { return null; }
}
function getSharedTrip() {
  const hash = window.location.hash;
  if (hash.startsWith("#share=")) return decodeTrip(hash.slice(7));
  return null;
}

function compress(file, cb, maxW, quality) {
  maxW = maxW||800; quality = quality||0.60;
  const img = new Image(), u = URL.createObjectURL(file);
  img.onload = () => {
    const s = Math.min(1, maxW/img.width), c = document.createElement("canvas");
    c.width = img.width*s; c.height = img.height*s;
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    URL.revokeObjectURL(u); cb(c.toDataURL("image/jpeg", quality));
  }; img.src = u;
}

const I = {
  inp: {padding:"7px 9px",border:"1px solid #d4c5a9",borderRadius:7,background:"#faf7f2",color:"#3d2b1a",width:"100%",fontFamily:"Georgia,serif",fontSize:13},
  lbl: {display:"flex",flexDirection:"column",fontSize:11,color:"#7a5c3c",fontWeight:600,gap:3},
  btnP: {padding:"10px 22px",background:"#c8722a",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"Georgia,serif"},
  btnO: {padding:"10px 16px",background:"transparent",color:"#8a6040",border:"1px solid #c4a882",borderRadius:8,cursor:"pointer",fontSize:14,fontFamily:"Georgia,serif"},
  tag: (on) => ({padding:"4px 10px",borderRadius:20,fontSize:11,cursor:"pointer",background:on?"#c8722a":"#efe6d6",color:on?"#fff":"#6b4c2a",border:"none",fontFamily:"Georgia,serif",fontWeight:600}),
  chip: {background:"#f0e6d4",color:"#6b4c2a",fontSize:12,padding:"3px 11px",borderRadius:20},
};

function Stars({v, onChange}) {
  return <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(n=><span key={n} onClick={()=>onChange(n)} style={{fontSize:24,cursor:"pointer",color:n<=v?"#E8A838":"#d1c4a8"}}>★</span>)}</div>;
}

// ── Photo Gallery ────────────────────────────────────────────────────────────
function PhotoGallery({trip, onClose}) {
  const allPhotos = trip.tripDays.flatMap(d => d.photos.map(p=>({...p, dayNum:d.dayNum})));
  const [idx, setIdx] = useState(0);
  if (!allPhotos.length) return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <div style={{color:"#f5deb3",fontSize:18}}>No photos yet</div>
      <button style={I.btnO} onClick={onClose}>Close</button>
    </div>
  );
  const p = allPhotos[idx];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:200,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 18px",background:"rgba(0,0,0,.4)"}}>
        <span style={{color:"#f5deb3",fontWeight:700,fontSize:15}}>📸 {trip.title} — All Photos</span>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"none",borderRadius:7,padding:"5px 14px",cursor:"pointer",fontSize:13,fontFamily:"Georgia,serif"}}>✕ Close</button>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 56px",position:"relative"}}>
        {idx>0 && <button onClick={()=>setIdx(i=>i-1)} style={{position:"absolute",left:8,background:"rgba(255,255,255,.15)",color:"#fff",border:"none",borderRadius:"50%",width:40,height:40,cursor:"pointer",fontSize:22}}>‹</button>}
        <div style={{textAlign:"center",maxWidth:680}}>
          <img src={p.data} alt={p.caption} style={{maxWidth:"100%",maxHeight:"58vh",borderRadius:10,objectFit:"contain"}}/>
          <div style={{color:"rgba(255,255,255,.45)",fontSize:11,marginTop:6}}>Day {p.dayNum}</div>
          {p.caption && <div style={{color:"#f5deb3",fontSize:15,marginTop:5,fontStyle:"italic"}}>{p.caption}</div>}
          <div style={{color:"rgba(255,255,255,.35)",fontSize:11,marginTop:4}}>{idx+1} / {allPhotos.length}</div>
        </div>
        {idx<allPhotos.length-1 && <button onClick={()=>setIdx(i=>i+1)} style={{position:"absolute",right:8,background:"rgba(255,255,255,.15)",color:"#fff",border:"none",borderRadius:"50%",width:40,height:40,cursor:"pointer",fontSize:22}}>›</button>}
      </div>
      <div style={{display:"flex",gap:5,overflowX:"auto",padding:"10px 14px",background:"rgba(0,0,0,.4)"}}>
        {allPhotos.map((ph,i)=>(
          <img key={i} src={ph.data} onClick={()=>setIdx(i)} alt="" style={{width:58,height:42,objectFit:"cover",borderRadius:5,cursor:"pointer",border:i===idx?"2px solid #c8722a":"2px solid transparent",opacity:i===idx?1:.55,flexShrink:0}}/>
        ))}
      </div>
    </div>
  );
}

// ── Link Photo Modal ─────────────────────────────────────────────────────────
function LinkPhotoModal({onAdd, onClose}) {
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState("");
  const [err, setErr] = useState("");

  // Convert Google Drive share URL to direct image URL
  function toDirectUrl(raw) {
    raw = raw.trim();
    // Google Drive: /file/d/FILE_ID/view or id=FILE_ID
    const gdA = raw.match(/\/file\/d\/([^/]+)/);
    const gdB = raw.match(/[?&]id=([^&]+)/);
    const id = gdA?.[1] || gdB?.[1];
    if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
    // Dropbox: dl=0 → raw=1
    if (raw.includes("dropbox.com")) return raw.replace("dl=0","raw=1").replace("www.dropbox","dl.dropboxusercontent");
    // Direct image URL — use as-is
    return raw;
  }

  const handlePreview = () => {
    setErr("");
    if (!url.trim()) { setErr("Please paste a URL first."); return; }
    setPreview(toDirectUrl(url));
  };

  const handleAdd = () => {
    if (!preview) { setErr("Click Preview first."); return; }
    onAdd({ id: Math.random().toString(36).slice(2,9), data: preview, caption, linked: true });
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fffcf7",borderRadius:14,padding:22,width:"100%",maxWidth:480,boxShadow:"0 8px 32px rgba(0,0,0,.25)"}}>
        <div style={{fontWeight:700,fontSize:16,color:"#3d2b1a",marginBottom:4}}>🔗 Link a Photo</div>
        <div style={{fontSize:12,color:"#9a7a5a",marginBottom:14}}>Paste a Google Drive, Dropbox, or direct image URL.</div>

        <label style={{...I.lbl,display:"block",marginBottom:10}}>
          Photo URL
          <input style={I.inp} value={url} onChange={e=>{setUrl(e.target.value);setPreview("");setErr("");}} placeholder="Paste link here…"/>
        </label>
        <label style={{...I.lbl,display:"block",marginBottom:12}}>
          Caption (optional)
          <input style={I.inp} value={caption} onChange={e=>setCaption(e.target.value)} placeholder="e.g. Sunset at Santorini"/>
        </label>

        {err && <div style={{fontSize:12,color:"#c0392b",marginBottom:10}}>{err}</div>}

        {/* Preview */}
        {preview && (
          <div style={{marginBottom:12,borderRadius:8,overflow:"hidden",background:"#f0e6d4",textAlign:"center"}}>
            <img src={preview} alt="preview"
              style={{maxWidth:"100%",maxHeight:180,objectFit:"contain"}}
              onError={()=>setErr("⚠️ Could not load image. Check the link is publicly shared.")}/>
          </div>
        )}

        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {!preview
            ? <button style={{...I.btnP,padding:"8px 18px",fontSize:13}} onClick={handlePreview}>Preview</button>
            : <button style={{...I.btnP,padding:"8px 18px",fontSize:13}} onClick={handleAdd}>✓ Add Photo</button>
          }
          <button style={{...I.btnO,padding:"8px 14px",fontSize:13}} onClick={onClose}>Cancel</button>
        </div>

        <div style={{marginTop:14,fontSize:11,color:"#b09070",lineHeight:1.6}}>
          <strong>Google Drive:</strong> Share the file → "Anyone with link" → copy link<br/>
          <strong>Dropbox:</strong> Share → copy link (dl=0 is auto-converted)<br/>
          <strong>Direct URL:</strong> Any public .jpg / .png / .webp link
        </div>
      </div>
    </div>
  );
}

// ── Day Form ─────────────────────────────────────────────────────────────────
function DayForm({day, onChange, onPhotoAdd, onPhotoCaption, onPhotoDel}) {
  const [open, setOpen] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const u = (k,v) => onChange({...day,[k]:v});
  const tog = t => onChange({...day, tags: day.tags.includes(t)?day.tags.filter(x=>x!==t):[...day.tags,t]});
  return (
    <div style={{border:"1px solid #e0d4bc",borderRadius:9,marginBottom:7,overflow:"hidden"}}>
      {showLink && <LinkPhotoModal onAdd={p=>onPhotoAdd(day.id,p)} onClose={()=>setShowLink(false)}/>}
      <div onClick={()=>setOpen(!open)} style={{padding:"9px 13px",background:"#faf7f2",cursor:"pointer",display:"flex",justifyContent:"space-between",fontWeight:600,color:"#5a3e28",fontSize:14}}>
        <span>Day {day.dayNum}</span><span>{open?"▲":"▼"}</span>
      </div>
      {open && <div style={{padding:13,background:"#fffcf7"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:9}}>{TAGS.map(t=><button key={t} style={I.tag(day.tags.includes(t))} onClick={()=>tog(t)}>{t}</button>)}</div>
        <label style={{...I.lbl,display:"block",marginBottom:7}}>Activities<textarea style={{...I.inp,resize:"vertical"}} rows={2} value={day.activities} onChange={e=>u("activities",e.target.value)}/></label>
        <label style={{...I.lbl,display:"block",marginBottom:9}}>Note<textarea style={{...I.inp,resize:"vertical"}} rows={2} value={day.feelings} onChange={e=>u("feelings",e.target.value)}/></label>
        <div style={{fontSize:11,color:"#7a5c3c",fontWeight:600,marginBottom:5}}>Photos</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {day.photos.map(p=>(
            <div key={p.id} style={{width:95}}>
              <div style={{position:"relative"}}>
                <img src={p.data} style={{width:95,height:65,objectFit:"cover",borderRadius:6,border:"2px solid #e8dcc8",display:"block"}} alt=""/>
                <button onClick={()=>onPhotoDel(day.id,p.id)} style={{position:"absolute",top:2,right:2,background:"rgba(0,0,0,.6)",color:"#fff",border:"none",borderRadius:"50%",width:16,height:16,cursor:"pointer",fontSize:9}}>✕</button>
                {p.linked && <span style={{position:"absolute",bottom:2,left:2,fontSize:9,background:"rgba(0,0,0,.55)",color:"#fff",borderRadius:3,padding:"1px 3px"}}>🔗</span>}
              </div>
              <input style={{width:"100%",marginTop:2,fontSize:10,border:"1px solid #d4c5a9",borderRadius:3,padding:"2px 4px",background:"#faf7f2",fontFamily:"Georgia,serif"}} value={p.caption} placeholder="Caption…" onChange={e=>onPhotoCaption(day.id,p.id,e.target.value)}/>
            </div>
          ))}
          {/* Upload button */}
          <label style={{width:95,height:65,border:"2px dashed #c4a882",borderRadius:6,background:"#faf7f0",cursor:"pointer",color:"#a08060",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>
            +<input type="file" accept="image/*" multiple hidden onChange={e=>{Array.from(e.target.files).forEach(f=>compress(f,d=>onPhotoAdd(day.id,{id:uid(),data:d,caption:"",linked:false})));e.target.value="";}}/>
          </label>
          {/* Link button */}
          <button onClick={()=>setShowLink(true)} style={{width:95,height:65,border:"2px dashed #a0b8d0",borderRadius:6,background:"#f0f4f8",cursor:"pointer",color:"#507090",fontSize:11,fontWeight:700,fontFamily:"Georgia,serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
            <span style={{fontSize:16}}>🔗</span>Link
          </button>
        </div>
      </div>}
    </div>
  );
}

// ── Trip Form ────────────────────────────────────────────────────────────────
function TripForm({initial, onSave, onCancel}) {
  const [f, setF] = useState(initial || eT());
  const u = (k,v) => setF(x=>({...x,[k]:v}));

  const setDays = v => {
    const n=Math.max(0,parseInt(v)||0), c=f.tripDays;
    setF(x=>({...x,days:v,tripDays:n>c.length?[...c,...Array.from({length:n-c.length},(_,i)=>eD(c.length+i+1))]:c.slice(0,n)}));
  };

  // Multi-country helpers
  const setNumCountries = v => {
    const n = Math.max(1, parseInt(v)||1);
    const cur = f.countryList || [];
    let next;
    if (n > cur.length) next = [...cur, ...Array.from({length:n-cur.length},()=>({country:"",cities:""}))];
    else next = cur.slice(0,n);
    setF(x=>({...x, countryList:next}));
  };
  const updCountry = (i,k,v) => {
    const cl = f.countryList.map((c,ci)=>ci===i?{...c,[k]:v}:c);
    setF(x=>({...x,countryList:cl}));
  };

  const updateDay = d => setF(x=>({...x,tripDays:x.tripDays.map(y=>y.id===d.id?d:y)}));
  const addPhoto = (did,p) => setF(x=>({...x,tripDays:x.tripDays.map(d=>d.id===did?{...d,photos:[...d.photos,p]}:d)}));
  const capPhoto = (did,pid,cap) => setF(x=>({...x,tripDays:x.tripDays.map(d=>d.id===did?{...d,photos:d.photos.map(p=>p.id===pid?{...p,caption:cap}:p)}:d)}));
  const delPhoto = (did,pid) => setF(x=>({...x,tripDays:x.tripDays.map(d=>d.id===did?{...d,photos:d.photos.filter(p=>p.id!==pid)}:d)}));

  const secTitle = txt => <div style={{fontSize:16,fontWeight:700,color:"#5a3e28",margin:"18px 0 10px",borderTop:"1px solid #e0d4bc",paddingTop:14}}>{txt}</div>;

  return (
    <div style={{background:"#fffcf7",borderRadius:14,padding:22,maxWidth:740,margin:"0 auto"}}>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:18,color:"#3d2b1a"}}>{initial?"Edit Trip":"New Holiday ✈️"}</h2>

      {/* Cover photo */}
      {f.coverPhoto
        ? <div style={{position:"relative",marginBottom:12}}>
            <img src={f.coverPhoto} style={{width:"100%",height:160,objectFit:"contain",background:"#2a1f14",borderRadius:9}} alt="cover"/>
            <button onClick={()=>u("coverPhoto",null)} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.6)",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12}}>Remove</button>
            {f.coverPhotoLinked && <span style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,.55)",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:20}}>🔗 Linked</span>}
          </div>
        : <div style={{marginBottom:12}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              {/* Upload */}
              <label style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",height:72,border:"2px dashed #c4a882",borderRadius:9,background:"#faf7f0",cursor:"pointer",color:"#a08060",fontSize:13,gap:6,flexDirection:"column"}}>
                <span style={{fontSize:22}}>📷</span>Upload
                <input type="file" accept="image/*" hidden onChange={e=>{const f2=e.target.files[0];if(f2)compress(f2,d=>{u("coverPhoto",d);u("coverPhotoLinked",false);},900,0.65)}}/>
              </label>
              {/* Link */}
              <button onClick={()=>{
                const raw = prompt("Paste your Google Drive or image URL:");
                if (!raw) return;
                const url = toDirectUrl(raw.trim());
                u("coverPhoto", url);
                u("coverPhotoLinked", true);
              }} style={{flex:1,height:72,border:"2px dashed #a0b8d0",borderRadius:9,background:"#f0f4f8",cursor:"pointer",color:"#507090",fontSize:13,fontFamily:"Georgia,serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
                <span style={{fontSize:22}}>🔗</span>Link URL
              </button>
            </div>
            <div style={{fontSize:10,color:"#9a7a5a",textAlign:"center"}}>Upload from device · or · Link from Google Drive / Dropbox</div>
          </div>
      }

      {/* Basic fields */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <label style={{...I.lbl,gridColumn:"1/-1"}}>Title<input style={I.inp} value={f.title} onChange={e=>u("title",e.target.value)} placeholder="e.g. Golden Week in Kyoto"/></label>
        <label style={I.lbl}>Start Date<input type="date" style={I.inp} value={f.startDate} onChange={e=>u("startDate",e.target.value)}/></label>
        <label style={I.lbl}>Duration (days)<input type="number" min="0" style={I.inp} value={f.days} onChange={e=>setDays(e.target.value)} placeholder="e.g. 5"/></label>
        <label style={I.lbl}>Season<select style={I.inp} value={f.season} onChange={e=>u("season",e.target.value)}>{SEASONS.map(s=><option key={s}>{s}</option>)}</select></label>
        <label style={{...I.lbl,gridColumn:"1/-1"}}>Companions<input style={I.inp} value={f.companions} onChange={e=>u("companions",e.target.value)} placeholder="e.g. Wife, Jake"/></label>
        <label style={I.lbl}>Budget<input style={I.inp} value={f.budget} onChange={e=>u("budget",e.target.value)} placeholder="e.g. SGD 3,200"/></label>
        <label style={I.lbl}>Highlights<input style={I.inp} value={f.highlights} onChange={e=>u("highlights",e.target.value)} placeholder="Best moments"/></label>
      </div>

      {/* Multi-country toggle */}
      {secTitle("Destination")}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"10px 14px",background:"#f5ede0",borderRadius:9}}>
        <input type="checkbox" id="mc" checked={!!f.multiCountry} onChange={e=>u("multiCountry",e.target.checked)} style={{width:16,height:16,cursor:"pointer"}}/>
        <label htmlFor="mc" style={{fontSize:13,color:"#5a3e28",fontWeight:600,cursor:"pointer"}}>This is a multi-country trip</label>
      </div>

      {!f.multiCountry ? (
        /* Single country */
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <label style={I.lbl}>Country<input style={I.inp} value={f.country} onChange={e=>u("country",e.target.value)}/></label>
          <label style={I.lbl}>City / Cities<input style={I.inp} value={f.city} onChange={e=>u("city",e.target.value)} placeholder="e.g. Tokyo, Osaka"/></label>
        </div>
      ) : (
        /* Multi country */
        <div style={{marginBottom:14}}>
          <label style={{...I.lbl,display:"block",marginBottom:12}}>
            How many countries?
            <input type="number" min="2" max="20" style={{...I.inp,width:100,marginTop:4}} value={f.countryList.length} onChange={e=>setNumCountries(e.target.value)}/>
          </label>
          {f.countryList.map((cl,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10,padding:"12px 14px",background:"#f5ede0",borderRadius:9}}>
              <div style={{fontSize:12,fontWeight:700,color:"#7a5c3c",gridColumn:"1/-1"}}>Country {i+1}</div>
              <label style={I.lbl}>Country<input style={I.inp} value={cl.country} onChange={e=>updCountry(i,"country",e.target.value)}/></label>
              <label style={I.lbl}>City / Cities<input style={I.inp} value={cl.cities} onChange={e=>updCountry(i,"cities",e.target.value)} placeholder="e.g. Paris, Lyon"/></label>
            </div>
          ))}
        </div>
      )}

      {/* Day by Day */}
      {f.tripDays.length > 0 && <>
        {secTitle("Day by Day")}
        {f.tripDays.map(d=><DayForm key={d.id} day={d} onChange={updateDay} onPhotoAdd={addPhoto} onPhotoCaption={capPhoto} onPhotoDel={delPhoto}/>)}
      </>}

      {/* Reflections */}
      {secTitle("Reflections")}
      <label style={{...I.lbl,display:"block",marginBottom:12}}>Your thoughts<textarea style={{...I.inp,resize:"vertical"}} rows={3} value={f.reflection} onChange={e=>u("reflection",e.target.value)}/></label>
      <div style={{marginBottom:12}}><div style={{fontSize:11,color:"#7a5c3c",fontWeight:600,marginBottom:5}}>Rating</div><Stars v={f.rating} onChange={v=>u("rating",v)}/></div>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:11,color:"#7a5c3c",fontWeight:600,marginBottom:7}}>Go again?</div>
        <div style={{display:"flex",gap:7}}>{["Yes! 🙌","Maybe 🤔","No 🙅"].map(v=><button key={v} style={I.tag(f.goAgain===v)} onClick={()=>u("goAgain",v)}>{v}</button>)}</div>
      </div>
      <div style={{display:"flex",gap:9}}>
        <button style={I.btnP} onClick={()=>{if(!f.title){alert("Enter a title");return;}onSave(f);}}>Save Trip</button>
        <button style={I.btnO} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Trip Card ────────────────────────────────────────────────────────────────
function TripCard({trip, onView, onEdit, onDelete}) {
  const loc = tripLocationLabel(trip);
  const countries = tripCountries(trip);
  return (
    <div onClick={()=>onView(trip)} style={{borderRadius:12,overflow:"hidden",border:"1px solid #e0d4bc",background:"#fffcf7",cursor:"pointer",boxShadow:"0 2px 10px rgba(90,60,30,.07)"}}>
      <div style={{height:140,background:"#f0e6d4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,position:"relative",overflow:"hidden"}}>
        {trip.coverPhoto
          ? <img src={trip.coverPhoto} alt="" style={{width:"100%",height:"100%",objectFit:"contain",background:"#2a1f14"}}/>
          : (trip.multiCountry ? "🗺️" : "🌍")
        }
        {trip.rating>0 && <span style={{position:"absolute",bottom:7,left:7,background:"rgba(0,0,0,.55)",color:"#f5c842",fontSize:11,padding:"2px 7px",borderRadius:20}}>{"★".repeat(trip.rating)}</span>}
        {trip.startDate && <span style={{position:"absolute",top:7,right:7,background:"rgba(0,0,0,.5)",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:20}}>{getYear(trip)}</span>}
        {trip.multiCountry && <span style={{position:"absolute",top:7,left:7,background:"#c8722a",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{countries.length} countries</span>}
      </div>
      <div style={{padding:12}}>
        <div style={{fontSize:16,fontWeight:700,color:"#3d2b1a",marginBottom:3}}>{trip.title||"Untitled"}</div>
        <div style={{color:"#8a6040",fontSize:12,marginBottom:5}}>📍 {loc}</div>
        <div style={{fontSize:11,color:"#7a5c3c"}}>{trip.startDate?"📅 "+trip.startDate:""}{trip.days?" · "+trip.days+" days":""}{trip.goAgain?" "+trip.goAgain:""}</div>
        {trip.companions && <div style={{fontSize:11,color:"#9a7a5a",marginTop:3}}>👥 {trip.companions}</div>}
        <div style={{display:"flex",gap:6,marginTop:9}}>
          <button style={{padding:"5px 11px",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"Georgia,serif",background:"#efe6d6",color:"#6b4c2a"}} onClick={e=>{e.stopPropagation();onEdit(trip);}}>Edit</button>
          <button style={{padding:"5px 11px",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"Georgia,serif",background:"#fce8e8",color:"#b04040"}} onClick={e=>{e.stopPropagation();if(window.confirm("Delete?"))onDelete(trip.id);}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Trip Detail ──────────────────────────────────────────────────────────────
function TripDetail({trip, onBack, onEdit, readOnly}) {
  const [openDays, setOpenDays] = useState({});
  const [showGallery, setShowGallery] = useState(false);
  const [copied, setCopied] = useState(false);
  const tog = id => setOpenDays(s=>({...s,[id]:!s[id]}));
  const totalPhotos = trip.tripDays.reduce((a,d)=>a+d.photos.length,0);

  const handleShare = () => {
    // Remove locally uploaded photos (base64) — keep only linked photos (Google Drive etc)
    // This keeps the URL short enough for WhatsApp and TinyURL
    const stripped = {
      ...trip,
      tripDays: trip.tripDays.map(d=>({
        ...d,
        photos: d.photos.filter(p=>p.linked)
      })),
      // Keep cover photo only if it is a linked URL, strip if uploaded (base64)
      coverPhoto: trip.coverPhotoLinked ? trip.coverPhoto : null
    };
    const encoded = encodeTrip(stripped);
    if (!encoded) { alert("Could not generate share link."); return; }
    const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
    navigator.clipboard.writeText(url).then(()=>{
      setCopied(true);
      setTimeout(()=>setCopied(false), 3000);
    }).catch(()=>{
      prompt("Copy this link and send to your friend:", url);
    });
  };

  const locationChip = trip.multiCountry && trip.countryList
    ? trip.countryList.filter(c=>c.country).map(c=>`${c.country}${c.cities?" ("+c.cities+")":""}`).join(" → ")
    : [trip.city, trip.country].filter(Boolean).join(", ");

  const chips = [
    trip.startDate && `📅 ${trip.startDate}`,
    trip.days && `🗓 ${trip.days} days`,
    trip.season,
    trip.companions && `👥 ${trip.companions}`,
    trip.budget && `💰 ${trip.budget}`,
    trip.goAgain && `Go again? ${trip.goAgain}`
  ].filter(Boolean);

  return (
    <div style={{maxWidth:740,margin:"0 auto"}}>
      {showGallery && <PhotoGallery trip={trip} onClose={()=>setShowGallery(false)}/>}

      {/* Copied toast */}
      {copied && (
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",
          background:"#3d2b1a",color:"#f5deb3",padding:"10px 22px",borderRadius:24,
          fontSize:13,fontWeight:700,zIndex:300,boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>
          ✅ Link copied! Send it to your friend.
        </div>
      )}

      {/* Read-only banner */}
      {readOnly && (
        <div style={{background:"#f5ede0",border:"1px solid #e0c898",borderRadius:9,
          padding:"10px 14px",marginBottom:14,fontSize:13,color:"#5a3e28",
          display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:18}}>👀</span>
          <span>You are viewing a shared trip — <strong>read only</strong>. Uploaded photos are not included in shared links to keep the URL short.</span>
        </div>
      )}
      <div style={{height:220,borderRadius:12,background:"#2a1f14",display:"flex",alignItems:"flex-end",marginBottom:16,position:"relative",overflow:"hidden"}}>
        {trip.coverPhoto
          ? <img src={trip.coverPhoto} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain"}}/>
          : <div style={{position:"absolute",inset:0,background:"#f0e6d4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>{trip.multiCountry?"🗺️":"🌍"}</div>
        }
        <div style={{background:"linear-gradient(transparent,rgba(0,0,0,.7))",width:"100%",padding:"16px 18px"}}>
          <h1 style={{color:"#fff",fontSize:24,marginBottom:3}}>{trip.title||"Untitled"}</h1>
          <p style={{color:"rgba(255,255,255,.85)",fontSize:13}}>📍 {locationChip}</p>
        </div>
      </div>

      {/* Hero */}
      {trip.multiCountry && trip.countryList && trip.countryList.filter(c=>c.country).length>0 && (
        <div style={{background:"#f5ede0",borderRadius:9,padding:"10px 14px",marginBottom:14,display:"flex",flexWrap:"wrap",gap:8}}>
          {trip.countryList.filter(c=>c.country).map((c,i)=>(
            <span key={i} style={{background:"#fffcf7",border:"1px solid #e0d4bc",borderRadius:20,padding:"3px 12px",fontSize:12,color:"#5a3e28",fontWeight:600}}>
              {i+1}. {c.country}{c.cities?" · "+c.cities:""}
            </span>
          ))}
        </div>
      )}

      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>{chips.map((c,i)=><span key={i} style={I.chip}>{c}</span>)}</div>
      {trip.highlights && <div style={{background:"#fef9f0",border:"1px solid #f0ddb8",borderRadius:9,padding:"11px 14px",marginBottom:14,fontSize:13,color:"#5a3e28"}}>✨ {trip.highlights}</div>}

      {totalPhotos > 0 && (
        <button onClick={()=>setShowGallery(true)} style={{width:"100%",padding:11,marginBottom:16,background:"#3d2b1a",color:"#f5deb3",border:"none",borderRadius:9,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"Georgia,serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          📸 View All Photos ({totalPhotos})
        </button>
      )}

      {trip.tripDays.map(d=>(
        <div key={d.id} style={{border:"1px solid #e0d4bc",borderRadius:9,marginBottom:7,overflow:"hidden"}}>
          <div onClick={()=>tog(d.id)} style={{padding:"9px 13px",background:"#faf7f2",cursor:"pointer",display:"flex",justifyContent:"space-between",fontWeight:600,color:"#5a3e28",fontSize:14}}>
            <span>Day {d.dayNum}</span><span>{openDays[d.id]?"▲":"▼"}</span>
          </div>
          {openDays[d.id] && <div style={{padding:13,background:"#fffcf7"}}>
            {d.tags&&d.tags.length>0 && <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:9}}>{d.tags.map(t=><span key={t} style={I.tag(true)}>{t}</span>)}</div>}
            {d.activities && <p style={{fontSize:13,marginBottom:7}}><strong>Activities:</strong> {d.activities}</p>}
            {d.feelings && <p style={{fontSize:13,marginBottom:7}}><strong>Note:</strong> {d.feelings}</p>}
            {d.photos&&d.photos.length>0 && <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{d.photos.map(p=><div key={p.id} style={{width:110}}><img src={p.data} style={{width:110,height:75,objectFit:"cover",borderRadius:6}} alt=""/>{p.caption&&<div style={{fontSize:10,color:"#7a5c3c",marginTop:2}}>{p.caption}</div>}</div>)}</div>}
          </div>}
        </div>
      ))}

      {(trip.reflection||trip.rating>0) && (
        <div style={{background:"#fef9f0",border:"1px solid #f0ddb8",borderRadius:11,padding:16,marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:700,color:"#5a3e28",marginBottom:9}}>Reflection</div>
          {trip.rating>0 && <div style={{color:"#E8A838",fontSize:20,marginBottom:7}}>{"★".repeat(trip.rating)}{"☆".repeat(5-trip.rating)}</div>}
          <p style={{fontSize:13,lineHeight:1.7}}>{trip.reflection}</p>
        </div>
      )}
      <div style={{display:"flex",gap:9,marginTop:4,flexWrap:"wrap"}}>
        {readOnly
          ? <button style={I.btnO} onClick={()=>{window.location.hash="";window.location.reload();}}>← Go to App</button>
          : <>
              <button style={I.btnO} onClick={onBack}>← Back</button>
              <button style={I.btnP} onClick={()=>onEdit(trip)}>Edit</button>
              <button onClick={handleShare} style={{...I.btnO,borderColor:"#5b8ed4",color:"#5b8ed4"}}>
                🔗 Share Trip
              </button>
            </>
        }
      </div>
    </div>
  );
}

// ── Wall ─────────────────────────────────────────────────────────────────────
function Wall({trips, filterCountry, filterYear, onView, onEdit, onDelete}) {
  // Apply filters
  let shown = trips;
  if (filterCountry) shown = shown.filter(t => tripCountries(t).some(c=>c===filterCountry));
  if (filterYear) shown = shown.filter(t => getYear(t)===filterYear);

  if (!shown.length) return (
    <div style={{textAlign:"center",padding:"40px 20px",color:"#9a7a5a"}}>
      <div style={{fontSize:40}}>🔍</div>
      <p style={{marginTop:8}}>No trips match this filter.</p>
    </div>
  );

  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
      {shown.map(t=><TripCard key={t.id} trip={t} onView={onView} onEdit={onEdit} onDelete={onDelete}/>)}
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
const STORAGE_KEY = "holiday_journal_trips";

function loadTrips() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

export default function App() {
  // Check if this is a shared trip link
  const sharedTrip = getSharedTrip();
  if (sharedTrip) {
    return (
      <div style={{minHeight:"100vh",background:"#f7f0e6",fontFamily:"Georgia,serif"}}>
        <div style={{background:"#3d2b1a",padding:"0 16px",height:52,display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:99}}>
          <span style={{fontSize:20}}>✈️</span>
          <span style={{color:"#f5deb3",fontSize:18,fontWeight:700}}>My Holiday Journal</span>
          <span style={{marginLeft:"auto",fontSize:11,color:"rgba(245,222,179,.6)"}}>Shared Trip</span>
        </div>
        <div style={{maxWidth:860,margin:"0 auto",padding:"20px 14px"}}>
          <TripDetail trip={sharedTrip} readOnly={true} onBack={()=>{}} onEdit={()=>{}}/>
        </div>
      </div>
    );
  }
  const [trips, setTrips] = useState(loadTrips);
  const [view, setView] = useState("wall");
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [importErr, setImportErr] = useState("");
  const importRef = React.useRef();

  // Save to localStorage whenever trips change
  const persist = (updated) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); }
    catch { alert("Storage full! Please export a backup and delete some trips to free up space."); }
    setTrips(updated);
  };

  const save = t => { persist(editing ? trips.map(x=>x.id===t.id?t:x) : [t,...trips]); setEditing(null); setView("wall"); };

  // Export
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(trips, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `holiday-journal-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Import
  const handleImport = (e) => {
    setImportErr("");
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error("Invalid format");
        if (window.confirm(`Import ${data.length} trips? This will MERGE with your existing ${trips.length} trips.`)) {
          // Merge — avoid duplicates by id
          const existingIds = new Set(trips.map(t=>t.id));
          const newTrips = data.filter(t=>!existingIds.has(t.id));
          persist([...trips, ...newTrips]);
          alert(`✅ Imported ${newTrips.length} new trips successfully!`);
        }
      } catch { setImportErr("❌ Invalid file. Please use a backup file exported from this app."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Derive all unique countries and years from trips
  const allCountries = [...new Set(trips.flatMap(t=>tripCountries(t)))].sort();
  const allYears = [...new Set(trips.map(t=>getYear(t)).filter(y=>y!=="Unknown"))].sort((a,b)=>b-a);
  const totalPhotos = trips.reduce((a,t)=>a+t.tripDays.reduce((b,d)=>b+d.photos.length,0),0);

  // Storage usage estimate
  const dataStr = JSON.stringify(trips);
  const usedKB = Math.round((dataStr.length * 2) / 1024);
  const maxKB = 5120;
  const usedPct = Math.min(100, Math.round((usedKB / maxKB) * 100));
  const barColor = usedPct > 85 ? "#c0392b" : usedPct > 60 ? "#e67e22" : "#4caf50";

  return (
    <div style={{minHeight:"100vh",background:"#f7f0e6",fontFamily:"Georgia,serif"}}>
      {/* Header */}
      <div style={{background:"#3d2b1a",padding:"0 16px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:99}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:20}}>✈️</span><span style={{color:"#f5deb3",fontSize:18,fontWeight:700}}>My Holiday Journal</span></div>
        {view==="wall"
          ? <button style={I.btnP} onClick={()=>{setEditing(null);setView("form");}}>+ New Trip</button>
          : <button style={{...I.btnO,color:"#f5deb3",borderColor:"#6b4c2a"}} onClick={()=>{setView("wall");setEditing(null);setViewing(null);}}>← Wall</button>
        }
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"20px 14px"}}>
        {view==="form" && <TripForm initial={editing} onSave={save} onCancel={()=>{setView("wall");setEditing(null);}}/>}
        {view==="detail" && viewing && <TripDetail trip={trips.find(t=>t.id===viewing.id)||viewing} readOnly={false} onBack={()=>setView("wall")} onEdit={t=>{setEditing(t);setView("form");}}/>}

        {view==="wall" && <>
          {trips.length > 0 && <>
            {/* Stats */}
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
              {[["🗺️","Countries",allCountries.length],["✈️","Trips",trips.length],["📸","Photos",totalPhotos]].map(([ic,lb,vl])=>(
                <div key={lb} style={{background:"#fffcf7",border:"1px solid #e0d4bc",borderRadius:11,padding:"9px 14px",flex:1,minWidth:80,textAlign:"center"}}>
                  <div style={{fontSize:18}}>{ic}</div><div style={{fontSize:18,fontWeight:700,color:"#3d2b1a"}}>{vl}</div><div style={{fontSize:11,color:"#9a7a5a"}}>{lb}</div>
                </div>
              ))}
            </div>

            {/* Storage bar */}
            <div style={{background:"#fffcf7",border:"1px solid #e0d4bc",borderRadius:11,padding:"10px 14px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:12,fontWeight:600,color:"#7a5c3c"}}>💾 Storage Used</span>
                <span style={{fontSize:12,color:usedPct>85?"#c0392b":usedPct>60?"#e67e22":"#5a3e28",fontWeight:600}}>
                  {usedKB < 1024 ? `${usedKB} KB` : `${(usedKB/1024).toFixed(1)} MB`} / 5 MB ({usedPct}%)
                </span>
              </div>
              <div style={{background:"#e8dcc8",borderRadius:20,height:8,overflow:"hidden"}}>
                <div style={{width:`${usedPct}%`,height:"100%",background:barColor,borderRadius:20,transition:"width .4s ease"}}/>
              </div>
              {usedPct>85 && <div style={{fontSize:11,color:"#c0392b",marginTop:5}}>⚠️ Storage almost full — export a backup and delete some trips.</div>}
              {usedPct>60&&usedPct<=85 && <div style={{fontSize:11,color:"#e67e22",marginTop:5}}>Storage getting full — be selective with new photos.</div>}
            </div>

            {/* Export / Import */}
            <div style={{background:"#fffcf7",border:"1px solid #e0d4bc",borderRadius:11,padding:"10px 14px",marginBottom:18,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:600,color:"#7a5c3c",flex:1}}>🗄️ Backup</span>
              <button onClick={handleExport} style={{...I.tag(false),padding:"6px 14px",fontSize:12}}>⬇️ Export</button>
              <button onClick={()=>importRef.current.click()} style={{...I.tag(false),padding:"6px 14px",fontSize:12}}>⬆️ Import</button>
              <input ref={importRef} type="file" accept=".json" hidden onChange={handleImport}/>
              {importErr && <div style={{fontSize:11,color:"#c0392b",width:"100%"}}>{importErr}</div>}
            </div>

            {/* Filters */}
            <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
              <div style={I.lbl}>
                <span>Filter by Country</span>
                <select style={{...I.inp,width:"auto",minWidth:140}} value={filterCountry} onChange={e=>setFilterCountry(e.target.value)}>
                  <option value="">All Countries</option>
                  {allCountries.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={I.lbl}>
                <span>Filter by Year</span>
                <select style={{...I.inp,width:"auto",minWidth:120}} value={filterYear} onChange={e=>setFilterYear(e.target.value)}>
                  <option value="">All Years</option>
                  {allYears.map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
              {(filterCountry||filterYear) && (
                <button style={{...I.tag(false),alignSelf:"flex-end",padding:"7px 14px"}} onClick={()=>{setFilterCountry("");setFilterYear("");}}>✕ Clear</button>
              )}
            </div>
          </>}

          {trips.length === 0
            ? <div style={{textAlign:"center",padding:"60px 20px",color:"#9a7a5a"}}>
                <div style={{fontSize:52}}>🌍</div>
                <h2 style={{fontSize:20,color:"#5a3e28",margin:"12px 0 8px"}}>Your adventures await</h2>
                <p>Add your first holiday!</p>
                <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:16,flexWrap:"wrap"}}>
                  <button style={I.btnP} onClick={()=>setView("form")}>+ Add First Trip</button>
                  <button onClick={()=>importRef.current.click()} style={{...I.btnO}}>⬆️ Import Backup</button>
                  <input ref={importRef} type="file" accept=".json" hidden onChange={handleImport}/>
                </div>
                {importErr && <div style={{fontSize:11,color:"#c0392b",marginTop:8}}>{importErr}</div>}
              </div>
            : <Wall trips={trips} filterCountry={filterCountry} filterYear={filterYear}
                onView={t=>{setViewing(t);setView("detail");}}
                onEdit={t=>{setEditing(t);setView("form");}}
                onDelete={id=>persist(trips.filter(t=>t.id!==id))}/>
          }
        </>}
      </div>
    </div>
  );
}
