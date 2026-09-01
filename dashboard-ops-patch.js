(function(){
  const SUPA='https://wihopmnjpsfsgujugyzl.supabase.co';
  const UPLOAD=SUPA+'/functions/v1/upload-dashboard';
  const XLSX_URL='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  const DEPOT={lat:29.831871,lng:31.360050,name:'15 May Warehouse'};
  const ROUTE_COLORS=['#ff7900','#22c55e','#3b82f6','#a855f7','#ef4444','#06b6d4','#eab308'];
  let booted=false;
  function st(t){const e=document.getElementById('status');if(e)e.textContent=t}
  function ensureXLSX(){
    if(window.XLSX&&typeof window.XLSX.read==='function')return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const old=document.querySelector('script[data-xlsx-stable]');
      if(old){
        old.addEventListener('load',()=>window.XLSX&&typeof window.XLSX.read==='function'?resolve():reject(new Error('XLSX failed to initialize')),{once:true});
        old.addEventListener('error',()=>reject(new Error('Excel library failed to load')),{once:true});
        return;
      }
      const s=document.createElement('script');
      s.src=XLSX_URL;s.async=false;s.dataset.xlsxStable='1';
      s.onload=()=>window.XLSX&&typeof window.XLSX.read==='function'?resolve():reject(new Error('XLSX failed to initialize'));
      s.onerror=()=>reject(new Error('Excel library failed to load'));
      document.head.appendChild(s);
    });
  }
  function resetMap(){
    const el=document.getElementById('map');
    if(!el)return;
    try{if(window.map&&window.map.remove){window.map.remove()}}catch(_){ }
    try{if(el._leaflet_id)delete el._leaflet_id}catch(_){ }
    el.innerHTML='';
    if(window.map)window.map=null;
  }
  function installVehicles(){
    const original=window.allocate;
    if(typeof original!=='function'||original.__patched)return;
    function allocate(cbm){
      if(!Number(cbm)||Number(cbm)<=0){
        return {vehicles:1,names:['Minimum 1 vehicle'],short:false,remaining:0};
      }
      return original(cbm);
    }
    allocate.__patched=true;
    window.allocate=allocate;
  }
  function installMap(){
    if(!window.L)return;
    window.DEPOTS.W100={lat:DEPOT.lat,lng:DEPOT.lng};
    const originalDraw=window.drawMap;
    if(typeof originalDraw!=='function'||originalDraw.__patched)return;
    function drawMap(zr){
      resetMap();
      const map=L.map('map').setView([DEPOT.lat,DEPOT.lng],9);
      window.map=map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
      const depot=L.marker([DEPOT.lat,DEPOT.lng]).addTo(map).bindPopup('<b>15 May Warehouse</b><br>Start / End Depot');
      const bounds=[L.latLng(DEPOT.lat,DEPOT.lng)];
      const overlays={};
      zr.forEach(([ri,rs])=>{
        const color=ROUTE_COLORS[ri%ROUTE_COLORS.length];
        const group=L.layerGroup().addTo(map);
        const u=[...new Map(rs.filter(r=>r.order).map(r=>[r.order,r])).values()];
        const pts=[L.latLng(DEPOT.lat,DEPOT.lng)];
        u.forEach((r,j)=>{
          const c=window.ROUTE_CENTERS[ri]||[30.03,31.25];
          let lat=(r.lat>20&&r.lat<35)?r.lat:c[0];
          let lng=(r.lng>20&&r.lng<40)?r.lng:c[1];
          if(!(r.lat>20&&r.lat<35&&r.lng>20&&r.lng<40)){
            const spread=0.003;
            lat+=((j%3)-1)*spread;
            lng+=(Math.floor(j/3))*spread;
          }
          const p=L.latLng(lat,lng);pts.push(p);bounds.push(p);
          L.circleMarker(p,{radius:8,color,fillColor:color,fillOpacity:.9,weight:2})
            .bindPopup(`<b>${E(window.ROUTES[ri][0])}</b><br>Stop ${j+1}<br>Order: ${E(r.order)}<br>Customer: ${E(r.customer)}<br>Area: ${E(r.area)}<br>Phone: ${E(r.phone)}<br>Address: ${E(r.address)}<br>SKU: ${E(r.sku)}<br>QTY: ${r.qty}`)
            .addTo(group);
        });
        pts.push(L.latLng(DEPOT.lat,DEPOT.lng));
        L.polyline(pts,{color,weight:4,opacity:.9}).addTo(group);
        overlays[window.ROUTES[ri][0]]=group;
      });
      if(Object.keys(overlays).length)L.control.layers(null,overlays,{collapsed:false,position:'topright'}).addTo(map);
      if(bounds.length>1)map.fitBounds(L.latLngBounds(bounds),{padding:[25,25]});
      const sub=document.querySelector('#map')?.parentElement?.querySelector('.sub');
      if(sub)sub.textContent='15 May Warehouse هو نقطة البداية والنهاية. كل Route منفصلة بلون مستقل؛ GPS من الشيت عند وجوده، وإلا تظهر كنقطة Route تقريبية.';
      window.map=map;
    }
    drawMap.__patched=true;
    window.drawMap=drawMap;
  }
  async function handleUpload(file){
    st('جاري تجهيز قارئ Excel...');
    await ensureXLSX();
    installVehicles();
    installMap();
    st('جاري رفع شيت اليوم...');
    const body=new FormData();body.append('file',file,file.name);
    const r=await fetch(UPLOAD,{method:'POST',body,cache:'no-store'});
    const tx=await r.text();let j={};try{j=JSON.parse(tx)}catch(_){ }
    if(!r.ok||j.ok===false)throw new Error(j.error||tx||('HTTP '+r.status));
    st('جاري تحديث الداشبورد...');
    await window.loadBuf(file.arrayBuffer());
    st('تم رفع الشيت وتحديث الداشبورد ✓');
  }
  function patchInput(){
    const input=document.getElementById('file');
    if(!input||input.dataset.stablePatch==='1')return;
    input.dataset.stablePatch='1';
    input.onchange=async e=>{
      const f=e.target.files&&e.target.files[0];if(!f)return;
      try{await handleUpload(f)}catch(err){console.error('Upload/read failed:',err);st('فشل رفع/قراءة الملف');alert('فشل رفع/قراءة الملف:\n'+(err.message||err))}finally{input.value=''}
    };
  }
  async function boot(){
    if(booted)return;booted=true;
    try{await ensureXLSX();installVehicles();installMap();patchInput();st('جاهز — اختاري الشيت')}catch(e){console.error('Excel setup failed:',e);patchInput();st('جاهز — اختاري الشيت')}
  }
  setTimeout(boot,800);
  setTimeout(patchInput,2000);
})();
