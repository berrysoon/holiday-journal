import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { exportTripPdf } from "./exportPdf";

const TAGS = ["🍜 Food","🏛️ Culture","🥾 Adventure","🛍️ Shopping","😴 Rest","🏖️ Beach","🎭 Nightlife","🌿 Nature"];
const SEASONS = ["N/A (Tropical)","Spring 🌸","Summer ☀️","Autumn 🍂","Winter ❄️"];

// Country name → [lat, lng] for map pins
const COUNTRY_COORDS = {
  "Afghanistan":[33.93,67.71],"Albania":[41.15,20.17],"Algeria":[28.03,1.66],
  "Andorra":[42.55,1.60],"Angola":[-11.20,17.87],"Argentina":[-38.42,-63.62],
  "Armenia":[40.07,45.04],"Australia":[-25.27,133.77],"Austria":[47.52,14.55],
  "Azerbaijan":[40.14,47.58],"Bahrain":[26.02,50.55],"Bangladesh":[23.68,90.35],
  "Belarus":[53.71,27.95],"Belgium":[50.50,4.47],"Bolivia":[-16.29,-63.59],
  "Bosnia and Herzegovina":[43.92,17.68],"Botswana":[-22.33,24.68],
  "Brazil":[-14.24,-51.93],"Brunei":[4.94,114.95],"Bulgaria":[42.73,25.49],
  "Cambodia":[12.57,104.99],"Cameroon":[3.85,11.50],"Canada":[56.13,-106.35],
  "Chile":[-35.68,-71.54],"China":[35.86,104.20],"Colombia":[4.57,-74.30],
  "Costa Rica":[9.75,-83.75],"Croatia":[45.10,15.20],"Cuba":[21.52,-77.78],
  "Cyprus":[35.13,33.43],"Czech Republic":[49.82,15.47],"Czechia":[49.82,15.47],
  "Denmark":[56.26,9.50],"Dominican Republic":[18.74,-70.16],"Ecuador":[-1.83,-78.18],
  "Egypt":[26.82,30.80],"El Salvador":[13.79,-88.90],"Estonia":[58.60,25.01],
  "Ethiopia":[9.14,40.49],"Fiji":[-17.71,178.07],"Finland":[61.92,25.75],
  "France":[46.23,2.21],"Georgia":[42.31,43.36],"Germany":[51.17,10.45],
  "Ghana":[7.95,-1.02],"Greece":[39.07,21.82],"Guatemala":[15.78,-90.23],
  "Hong Kong":[22.32,114.17],"Hungary":[47.16,19.50],"Iceland":[64.96,-19.02],
  "India":[20.59,78.96],"Indonesia":[-0.79,113.92],"Iran":[32.43,53.69],
  "Iraq":[33.22,43.68],"Ireland":[53.41,-8.24],"Israel":[31.05,34.85],
  "Italy":[41.87,12.57],"Jamaica":[18.11,-77.30],"Japan":[36.20,138.25],
  "Jordan":[30.59,36.24],"Kazakhstan":[48.02,66.92],"Kenya":[-0.02,37.91],
  "Kuwait":[29.31,47.48],"Kyrgyzstan":[41.20,74.77],"Laos":[19.86,102.50],
  "Latvia":[56.88,24.60],"Lebanon":[33.85,35.86],"Libya":[26.34,17.23],
  "Liechtenstein":[47.17,9.56],"Lithuania":[55.17,23.88],"Luxembourg":[49.82,6.13],
  "Macao":[22.17,113.55],"Macau":[22.17,113.55],"Madagascar":[-18.77,46.87],
  "Malaysia":[4.21,108.10],"Maldives":[3.20,73.22],"Malta":[35.94,14.38],
  "Mauritius":[-20.35,57.55],"Mexico":[23.63,-102.55],"Moldova":[47.41,28.37],
  "Monaco":[43.73,7.41],"Mongolia":[46.86,103.85],"Montenegro":[42.71,19.37],
  "Morocco":[31.79,-7.09],"Mozambique":[-18.67,35.53],"Myanmar":[16.87,96.19],
  "Namibia":[-22.96,18.49],"Nepal":[28.39,84.12],"Netherlands":[52.13,5.29],
  "New Zealand":[-40.90,174.89],"Nigeria":[9.08,8.68],"North Korea":[40.34,127.51],
  "North Macedonia":[41.61,21.75],"Norway":[60.47,8.47],"Oman":[21.00,57.00],
  "Pakistan":[30.38,69.35],"Palestine":[31.95,35.23],"Panama":[8.54,-80.78],
  "Paraguay":[-23.44,-58.44],"Peru":[-9.19,-75.02],"Philippines":[12.88,121.77],
  "Poland":[51.92,19.15],"Portugal":[39.40,-8.22],"Puerto Rico":[18.22,-66.59],
  "Qatar":[25.35,51.18],"Romania":[45.94,24.97],"Russia":[61.52,105.32],
  "Rwanda":[-1.94,29.87],"Saudi Arabia":[23.89,45.08],"Senegal":[14.50,-14.45],
  "Serbia":[44.02,21.01],"Singapore":[1.35,103.82],"Slovakia":[48.67,19.70],
  "Slovenia":[46.15,14.99],"South Africa":[-30.56,22.94],"South Korea":[35.91,127.77],
  "Spain":[40.46,-3.75],"Sri Lanka":[7.87,80.77],"Sweden":[60.13,18.64],
  "Switzerland":[46.82,8.23],"Syria":[34.80,38.99],"Taiwan":[23.70,121.00],
  "Tajikistan":[38.86,71.28],"Tanzania":[-6.37,34.89],"Thailand":[15.87,100.99],
  "Trinidad and Tobago":[10.69,-61.22],"Tunisia":[33.89,9.54],"Turkey":[38.96,35.24],
  "Turkmenistan":[38.97,59.56],"Uganda":[1.37,32.29],"Ukraine":[48.38,31.17],
  "United Arab Emirates":[23.42,53.85],"UAE":[23.42,53.85],
  "United Kingdom":[55.38,-3.44],"UK":[55.38,-3.44],"Great Britain":[55.38,-3.44],
  "United States":[37.09,-95.71],"USA":[37.09,-95.71],"United States of America":[37.09,-95.71],
  "Uruguay":[-32.52,-55.77],"Uzbekistan":[41.38,64.59],"Venezuela":[6.42,-66.59],
  "Vietnam":[14.06,108.28],"Yemen":[15.55,48.52],"Zambia":[-13.13,27.85],
  "Zimbabwe":[-19.02,29.15],"Bahamas":[25.03,-77.40],"Barbados":[13.19,-59.54],
  "Belize":[17.19,-88.50],"Bhutan":[27.51,90.43],"Burkina Faso":[12.36,-1.56],
  "Burundi":[-3.37,29.92],"Cape Verde":[16.54,-23.04],"Chad":[15.45,18.73],
  "Djibouti":[11.83,42.59],"Dominica":[15.41,-61.37],"Timor-Leste":[-8.87,125.73],
  "Eritrea":[15.18,39.78],"Eswatini":[-26.52,31.47],"Swaziland":[-26.52,31.47],
  "Gabon":[-0.80,11.61],"Gambia":[13.44,-15.31],"Guinea":[9.95,-11.81],
  "Guinea-Bissau":[11.80,-15.18],"Guyana":[4.86,-58.93],"Haiti":[18.97,-72.29],
  "Honduras":[15.20,-86.24],"Lesotho":[-29.61,28.23],"Liberia":[6.43,-9.43],
  "Malawi":[-13.25,34.30],"Mali":[17.57,-3.99],"Mauritania":[21.01,-10.94],
  "Micronesia":[7.43,150.55],"Nicaragua":[12.87,-85.21],"Niger":[17.61,8.08],
  "Papua New Guinea":[-6.31,143.96],"Sierra Leone":[8.46,-11.78],
  "Solomon Islands":[-9.64,160.16],"Somalia":[5.15,46.20],"South Sudan":[6.88,31.31],
  "Suriname":[3.92,-56.03],"Togo":[8.62,0.82],"Tonga":[-21.18,-175.20],
  "Vanuatu":[-15.38,166.96],"Scotland":[56.49,-4.20],"Wales":[52.13,-3.78],
  "England":[52.36,-1.17],"Northern Ireland":[54.78,-6.49],
};

function getCountryCoords(name) {
  if (!name) return null;
  const key = Object.keys(COUNTRY_COORDS).find(k => k.toLowerCase() === name.toLowerCase().trim());
  return key ? COUNTRY_COORDS[key] : null;
}

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
    coverPhotoLinked:false, coverPhotoUrl:"", coverPhotoPreview:"",
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

// ── URL converter (shared by all modals) ─────────────────────────────────────
function toDirectUrl(raw) {
  raw = raw.trim();
  const gdA = raw.match(/\/file\/d\/([^/]+)/);
  const gdB = raw.match(/[?&]id=([^&]+)/);
  const id = gdA?.[1] || gdB?.[1];
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
  if (raw.includes("dropbox.com")) return raw.replace("dl=0","raw=1").replace("www.dropbox","dl.dropboxusercontent");
  return raw;
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

// ── Cover Photo Link Modal ────────────────────────────────────────────────────
function CoverLinkModal({onAdd, onClose}) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [err, setErr] = useState("");

  const handlePreview = () => {
    setErr("");
    if (!url.trim()) { setErr("Please paste a URL first."); return; }
    setPreview(toDirectUrl(url.trim()));
  };

  const handleAdd = () => {
    if (!preview) { setErr("Click Preview first."); return; }
    onAdd(preview);
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fffcf7",borderRadius:14,padding:22,width:"100%",maxWidth:480,boxShadow:"0 8px 32px rgba(0,0,0,.25)"}}>
        <div style={{fontWeight:700,fontSize:16,color:"#3d2b1a",marginBottom:4}}>🔗 Link Cover Photo</div>
        <div style={{fontSize:12,color:"#9a7a5a",marginBottom:14}}>Paste a Google Drive, Dropbox, or direct image URL.</div>

        <label style={{...I.lbl,display:"block",marginBottom:12}}>
          Photo URL
          <input style={I.inp} value={url}
            onChange={e=>{ setUrl(e.target.value); setPreview(""); setErr(""); }}
            placeholder="Paste link here…"/>
        </label>

        {err && <div style={{fontSize:12,color:"#c0392b",marginBottom:10}}>{err}</div>}

        {preview && (
          <div style={{marginBottom:12,borderRadius:8,overflow:"hidden",background:"#2a1f14",textAlign:"center"}}>
            <img src={preview} alt="preview"
              style={{maxWidth:"100%",maxHeight:180,objectFit:"contain"}}
              onError={()=>setErr("⚠️ Could not load image. Make sure the link is set to Anyone with link.")}/>
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
          <strong>Google Drive:</strong> Share → "Anyone with link" → copy link<br/>
          <strong>Dropbox:</strong> Share → copy link (auto-converted)<br/>
          <strong>Direct URL:</strong> Any public .jpg / .png / .webp link
        </div>
      </div>
    </div>
  );
}

// ── Trip Form ────────────────────────────────────────────────────────────────
function TripForm({initial, onSave, onCancel}) {
  const [f, setF] = useState(initial || eT());
  const [showCoverLink, setShowCoverLink] = useState(false);
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

      {/* Cover photo modal */}
      {showCoverLink && (
        <CoverLinkModal
          onAdd={url=>{ u("coverPhoto",url); u("coverPhotoLinked",true); }}
          onClose={()=>setShowCoverLink(false)}/>
      )}

      {/* Cover photo */}
      {f.coverPhoto
        ? <div style={{position:"relative",marginBottom:14}}>
            <img src={f.coverPhoto} style={{width:"100%",height:160,objectFit:"contain",background:"#2a1f14",borderRadius:9}} alt="cover"/>
            <button onClick={()=>{ u("coverPhoto",null); u("coverPhotoLinked",false); }}
              style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.6)",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12}}>
              Remove
            </button>
            {f.coverPhotoLinked && <span style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,.55)",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:20}}>🔗 Linked</span>}
          </div>
        : <div style={{display:"flex",gap:8,marginBottom:14}}>
            {/* Upload from device */}
            <label style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:72,border:"2px dashed #c4a882",borderRadius:9,background:"#faf7f0",cursor:"pointer",color:"#a08060",fontSize:12,gap:4}}>
              <span style={{fontSize:20}}>📷</span>Upload Photo
              <input type="file" accept="image/*" hidden onChange={e=>{
                const f2=e.target.files[0];
                if(f2) compress(f2,d=>{ u("coverPhoto",d); u("coverPhotoLinked",false); },900,0.65);
              }}/>
            </label>
            {/* Link from Google Drive */}
            <button onClick={()=>setShowCoverLink(true)}
              style={{flex:1,height:72,border:"2px dashed #a0b8d0",borderRadius:9,background:"#f0f4f8",cursor:"pointer",color:"#507090",fontSize:12,fontFamily:"Georgia,serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
              <span style={{fontSize:20}}>🔗</span>Link URL
            </button>
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
<button
  onClick={() => exportTripPdf(trip)}
  style={{...I.btnO, borderColor:"#a08060", color:"#6b4c2a"}}
>
  📄 Export PDF
</button>
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

// ── Map View ─────────────────────────────────────────────────────────────────
const PIN_ICON = (count) => L.divIcon({
  html: `<div style="background:#c8722a;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:${count>1?13:17}px;font-weight:700;font-family:Georgia,serif;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer">${count>1?count:"📍"}</div>`,
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

function MapView({trips, filterCountry, filterYear, onView}) {
  let shown = trips;
  if (filterCountry) shown = shown.filter(t => tripCountries(t).some(c => c === filterCountry));
  if (filterYear) shown = shown.filter(t => getYear(t) === filterYear);

  const byCountry = {};
  shown.forEach(t => {
    tripCountries(t).forEach(c => {
      if (!byCountry[c]) byCountry[c] = [];
      byCountry[c].push(t);
    });
  });

  const markers = Object.entries(byCountry)
    .map(([country, cts]) => ({ country, trips: cts, coords: getCountryCoords(country) }))
    .filter(m => m.coords);

  const unmapped = Object.keys(byCountry).filter(c => !getCountryCoords(c));

  return (
    <div>
      <div style={{height:480,borderRadius:12,overflow:"hidden",border:"1px solid #e0d4bc",marginBottom:unmapped.length?10:0}}>
        <MapContainer center={[20,10]} zoom={2} style={{height:"100%",width:"100%"}} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map(({country, trips:cts, coords}) => (
            <Marker key={country} position={coords} icon={PIN_ICON(cts.length)}>
              <Popup>
                <div style={{fontFamily:"Georgia,serif",minWidth:130}}>
                  <div style={{fontWeight:700,color:"#3d2b1a",marginBottom:7,fontSize:14}}>📍 {country}</div>
                  {cts.map(t => (
                    <div key={t.id} onClick={() => onView(t)}
                      style={{fontSize:13,color:"#c8722a",cursor:"pointer",marginBottom:4,textDecoration:"underline"}}>
                      {t.title || "Untitled"}
                    </div>
                  ))}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {unmapped.length > 0 && (
        <div style={{fontSize:11,color:"#9a7a5a",padding:"6px 10px",background:"#faf7f2",border:"1px solid #e0d4bc",borderRadius:8}}>
          ⚠️ No coordinates found for: {unmapped.join(", ")}
        </div>
      )}
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
  const [wallMode, setWallMode] = useState("grid"); // "grid" | "map"
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

            {/* View toggle */}
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              <button style={{...I.tag(wallMode==="grid"),padding:"8px 18px",fontSize:13}} onClick={()=>setWallMode("grid")}>⊞ Cards</button>
              <button style={{...I.tag(wallMode==="map"),padding:"8px 18px",fontSize:13}} onClick={()=>setWallMode("map")}>🗺️ Map View</button>
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
            : wallMode==="map"
              ? <MapView trips={trips} filterCountry={filterCountry} filterYear={filterYear}
                  onView={t=>{setViewing(t);setView("detail");}}/>
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
