(()=>{
const N=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[أإآ]/g,'ا').replace(/[\s_\-()./]/g,'');
function boot(){
 const el=document.getElementById('map');if(!el||typeof L==='undefined')return setTimeout(boot,300);
 const rows=Array.isArray(window.D)?window.D:[];
 const findKey=tests=>Object.keys(rows[0]||{}).find(k=>tests.some(t=>N(k).includes(N(t))));
 const areaKey=findKey(['area','zone','region','منطقه','المنطقه','المنطقة']);
 const latKey=findKey(['latitude','lat','خطالعرض']),lngKey=findKey(['longitude','lng','lon','long','خطالطول']);
 const orderKey=findKey(['order','orderid','shipment','awb','اوردر','بوليصة']);
 const addressKey=findKey(['address','العنوان']);
 const groups=[],seen={};
 rows.forEach(r=>{const a=areaKey?String(r[areaKey]??'').trim():'';if(!a)return;const n=N(a);if(!seen[n])seen[n]={name:a,rows:[]},groups.push(seen[n]);seen[n].rows.push(r)});
 try{window.__finalMap?.remove()}catch(e){}el.innerHTML='';
 const wh=[29.8515,31.3505],map=L.map(el,{zoomControl:true,preferCanvas:true});window.__finalMap=map;
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
 const route=[wh];L.marker(wh).addTo(map).bindPopup('<b>Warehouse</b><br>2B · 15 May');
 groups.forEach((g,i)=>{
  const gps=g.rows.map(r=>[Number(r[latKey]),Number(r[lngKey])]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&p[0]&&p[1]);
  let center=gps.length?[gps.reduce((s,p)=>s+p[0],0)/gps.length,gps.reduce((s,p)=>s+p[1],0)/gps.length]:null;
  if(!center){
   const f={'مدينه نصر':[30.073,31.325],'مدينه نصر':[30.073,31.325],'القاهرهالجديده':[30.027,31.470],'التجمعالاول':[30.027,31.470],'التجمعالخامس':[30.027,31.470],'المعادي':[29.968,31.265],'المقطم':[29.968,31.265],'الهرم':[29.994,31.170],'فيصل':[29.994,31.170],'العمرانيه':[29.994,31.170],'المهندسين':[30.045,31.200],'الجيزه':[30.045,31.200],'حلوان':[29.851,31.335],'15مايو':[29.851,31.335],'السادسمنأكتوبر':[30.015,30.975],'الشيخزايد':[30.015,30.975]};center=f[N(g.name)]||null;
  }
  if(!center)return;
  route.push(center);const orders=[...new Set(g.rows.map(r=>String(r[orderKey]??'').trim()).filter(Boolean))];
  L.marker(center).addTo(map).bindPopup(`<b>${i+1} · ${g.name}</b><br>Orders: ${orders.length}<br>${orders.slice(0,30).join(' · ')}`);
  gps.forEach(p=>L.circleMarker(p,{radius:5,weight:2,fillOpacity:.9}).addTo(map));
 });
 if(route.length>1)L.polyline(route,{weight:3,dashArray:'8 8',opacity:.85}).addTo(map);
 map.fitBounds(L.latLngBounds(route).pad(.1));setTimeout(()=>map.invalidateSize(),200);setTimeout(()=>map.invalidateSize(),1000);
}
setTimeout(boot,500);
})();