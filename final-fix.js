(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const norm=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/أ|إ|آ/g,'ا').replace(/[\s_\-()./]/g,'').trim();
 const center={
 '15مايو':[29.851,31.335],'حلوان':[29.851,31.335],'المعادي':[29.968,31.265],'المقطم':[29.968,31.265],
 'مدينةنصر':[30.073,31.325],'مدينهنصر':[30.073,31.325],'مصرالجديدة':[30.073,31.325],
 'القاهرةالجديدة':[30.027,31.470],'التجمعالاول':[30.027,31.470],'التجمعالثالث':[30.027,31.470],'التجمعالخامس':[30.027,31.470],'الرحاب':[30.027,31.470],
 'الجيزة':[30.045,31.200],'جيزة':[30.045,31.200],'المهندسين':[30.045,31.200],'الدقي':[30.045,31.200],
 'الهرم':[29.994,31.170],'فيصل':[29.994,31.170],'العمرانية':[29.994,31.170],
 '6اكتوبر':[30.015,30.975],'6اكتـوبر':[30.015,30.975],'الشيخزايد':[30.015,30.975]
 };
 const warehouse=[29.8515,31.3505];
 function feedbackKey(rows){
  if(!rows.length)return null; const keys=[...new Set(rows.flatMap(r=>Object.keys(r||{})))];
  const score=k=>{let n=norm(k);let s=0;if(/feedback|customerfeedback|note|notes|comment|remark|request|action|followup|follow/.test(n))s+=10;if(/address|area|customer|phone|order|sku|product|status|lat|lng|latitude|longitude/.test(n))s-=8;return s};
  return keys.map(k=>[k,score(k)]).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
 }
 function patchFollow(){const rows=Array.isArray(window.D)?window.D:[];const tb=document.getElementById('follow');if(!tb||!rows.length)return;const fk=feedbackKey(rows);if(!fk)return;
  const html=rows.map(r=>`<tr><td>${esc(r.o)}</td><td>${esc(r.c)}</td><td>${esc(r.ph||r.phone)}</td><td>${esc(r.a)}</td><td>${esc(r.ad)}</td><td>${esc(r[fk])}</td></tr>`).join('');
  if(tb.innerHTML!==html)tb.innerHTML=html;
 }
 function patchMap(){
  const el=document.getElementById('map'); if(!el||typeof L==='undefined'||!Array.isArray(window.D)||!window.D.length)return;
  try{if(window.__dynamicMap)window.__dynamicMap.remove()}catch(e){} el.innerHTML='';
  const rows=window.D, groups=[]; const by=new Map();
  rows.forEach(r=>{const name=String(r.a??'').trim();if(!name)return;const key=norm(name);if(!by.has(key))by.set(key,{name,rows:[]});by.get(key).rows.push(r)});
  by.forEach(g=>groups.push(g));
  const mp=L.map(el,{zoomControl:true,preferCanvas:true});window.__dynamicMap=mp;L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(mp);
  const pts=[warehouse];L.marker(warehouse).addTo(mp).bindPopup('<b>0 · Warehouse</b><br>2B Warehouse · 15 May');
  groups.forEach((g,i)=>{let gps=g.rows.map(r=>[Number(r.lat),Number(r.lng)]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&p[0]>0&&p[1]>0);let p=gps.length?[gps.reduce((a,x)=>a+x[0],0)/gps.length,gps.reduce((a,x)=>a+x[1],0)/gps.length]:center[norm(g.name)];if(!p)return;pts.push(p);const orders=[...new Set(g.rows.map(r=>r.o).filter(Boolean))];const m=L.marker(p).addTo(mp);m.bindPopup(`<b>${esc(g.name)}</b><br>Orders: ${orders.length}<br>${orders.slice(0,40).map(esc).join(' · ')}`);g.rows.forEach(r=>{const q=[Number(r.lat),Number(r.lng)];if(Number.isFinite(q[0])&&Number.isFinite(q[1])&&q[0]>0&&q[1]>0)L.circleMarker(q,{radius:5,weight:2,fillOpacity:.9}).addTo(mp).bindPopup(`<b>Order ${esc(r.o)}</b><br>${esc(r.c)}<br>${esc(r.ad)}`)})});
  if(pts.length>1)L.polyline(pts,{weight:3,dashArray:'8 8',opacity:.85}).addTo(mp);mp.fitBounds(L.latLngBounds(pts).pad(.08));setTimeout(()=>mp.invalidateSize(),200);setTimeout(()=>mp.invalidateSize(),800);
 }
 function run(){patchFollow();patchMap()}
 setTimeout(run,1200);setTimeout(run,2500);setTimeout(run,5000);new MutationObserver(()=>setTimeout(run,100)).observe(document.body,{subtree:true,childList:true});
})();