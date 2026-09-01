(function(){
  const SUPA='https://wihopmnjpsfsgujugyzl.supabase.co';
  const UPLOAD=SUPA+'/functions/v1/upload-dashboard';
  const XLSX_URL='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
  const DEPOT={lat:29.831871,lng:31.360050,name:'15 May Warehouse'};
  const ROUTE_COLORS=['#ff7900','#22c55e','#3b82f6','#a855f7','#ef4444','#06b6d4','#eab308'];
  let booted=false, loadingXlsx=null;
  function st(t){const e=document.getElementById('status');if(e)e.textContent=t}
  function ensureXLSX(){
    if(window.XLSX&&typeof window.XLSX.read==='function')return Promise.resolve(window.XLSX);
    if(loadingXlsx)return loadingXlsx;
    loadingXlsx=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=XLSX_URL;s.async=false;s.setAttribute('data-xlsx-stable','1');
      s.onload=()=>{if(window.XLSX&&typeof window.XLSX.read==='function')resolve(window.XLSX);else reject(new Error('Excel library loaded but XLSX is unavailable'))};
      s.onerror=()=>reject(new Error('Excel library could not be loaded (CDN)'));
      document.head.appendChild(s);
    });
    return loadingXlsx;
  }
  function resetMap(){const el=document.getElementById('map');if(!el)return;try{if(window.map&&window.map.remove)window.map.remove()}catch(_){ }try{if(el._leaflet_id)delete el._leaflet_id}catch(_){ }el.innerHTML='';window.map=null}
  function installVehicles(){
    const original=window.allocate;if(typeof original!=='function'||original.__stable)return;
    function allocate(cbm){if(!Number(cbm)||Number(cbm)<=0)return{vehicles:1,names:['Minimum 1 vehicle'],short:false,remaining:0};return original(cbm)}
    allocate.__stable=true;window.allocate=allocate;
  }
  function installMap(){
    if(!window.L||!window.ROUTES||typeof window.drawMap!=='function'||window.drawMap.__stable)return;
    if(window.DEPOTS)window.DEPOTS.W100={lat:DEPOT.lat,lng:DEPOT.lng};
    const drawMap=function(zr){
      resetMap();const map=L.map('map').setView([DEPOT.lat,DEPOT.lng],9);window.map=map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
      L.marker([DEPOT.lat,DEPOT.lng]).addTo(map).bindPopup('<b>15 May Warehouse</b><br>Start / End Depot');
      const bounds=[L.latLng(DEPOT.lat,DEPOT.lng)],overlays={};
      (zr||[]).forEach(([ri,rs])=>{const color=ROUTE_COLORS[ri%ROUTE_COLORS.length],group=L.layerGroup().addTo(map),u=[...new Map((rs||[]).filter(r=>r.order).map(r=>[r.order,r])).values()],pts=[L.latLng(DEPOT.lat,DEPOT.lng)];
        u.forEach((r,j)=>{const c=window.ROUTE_CENTERS&&window.ROUTE_CENTERS[ri]||[30.03,31.25];let lat=Number(r.lat),lng=Number(r.lng);if(!(lat>20&&lat<35&&lng>20&&lng<40)){lat=c[0]+((j%3)-1)*.003;lng=c[1]+Math.floor(j/3)*.003}const p=L.latLng(lat,lng);pts.push(p);bounds.push(p);L.circleMarker(p,{radius:8,color,fillColor:color,fillOpacity:.9,weight:2}).bindPopup('<b>'+E(window.ROUTES[ri][0])+'</b><br>Stop '+(j+1)+'<br>Order: '+E(r.order)+'<br>Customer: '+E(r.customer)+'<br>Area: '+E(r.area)+'<br>Phone: '+E(r.phone)+'<br>Address: '+E(r.address)+'<br>SKU: '+E(r.sku)+'<br>QTY: '+E(r.qty)).addTo(group)});
        pts.push(L.latLng(DEPOT.lat,DEPOT.lng));L.polyline(pts,{color,weight:4,opacity:.9}).addTo(group);overlays[window.ROUTES[ri][0]]=group;
      });
      if(Object.keys(overlays).length)L.control.layers(null,overlays,{collapsed:false,position:'topright'}).addTo(map);if(bounds.length>1)map.fitBounds(L.latLngBounds(bounds),{padding:[25,25]});
    };
    drawMap.__stable=true;window.drawMap=drawMap;
  }
  async function handleUpload(file){
    if(!file)throw new Error('No Excel file selected');
    st('جاري تجهيز قارئ Excel...');await ensureXLSX();
    // Parse locally first. This guarantees the dashboard can read the selected file even if Storage/API is slow.
    const buf=await file.arrayBuffer();
    const wb=window.XLSX.read(buf,{type:'array',cellDates:true});
    if(!wb.SheetNames.length)throw new Error('Excel file has no worksheets');
    const ws=wb.Sheets[wb.SheetNames[0]];
    const rows=window.XLSX.utils.sheet_to_json(ws,{defval:'',raw:false});
    if(!rows.length)throw new Error('Excel sheet is empty');
    installVehicles();installMap();
    // Update UI from the exact selected file first; upload is persisted second.
    if(typeof window.loadBuf!=='function')throw new Error('Dashboard Excel loader is unavailable');
    st('جاري تحديث الداشبورد...');await window.loadBuf(buf);
    st('جاري حفظ الشيت...');
    const body=new FormData();body.append('file',file,file.name);
    const r=await fetch(UPLOAD,{method:'POST',body,cache:'no-store'});const tx=await r.text();let j={};try{j=JSON.parse(tx)}catch(_){ }
    if(!r.ok||j.ok===false)throw new Error(j.error||tx||('Upload HTTP '+r.status));
    st('تم رفع الشيت وتحديث الداشبورد ✓');
  }
  function patchInput(){const input=document.getElementById('file');if(!input||input.dataset.stablePatch==='1')return;input.dataset.stablePatch='1';input.onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{await handleUpload(f)}catch(err){console.error('Upload/read failed:',err);st('فشل رفع/قراءة الملف');alert('فشل رفع/قراءة الملف:\n'+(err.message||err))}finally{input.value=''}}}
  async function boot(){if(booted)return;booted=true;try{await ensureXLSX();installVehicles();installMap();patchInput();st('جاهز — اختاري الشيت')}catch(e){console.error('Excel setup:',e);patchInput();st('جاهز — اختاري الشيت')}}
  setTimeout(boot,300);setTimeout(patchInput,1200);setTimeout(patchInput,2500);
})();
