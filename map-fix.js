(()=>{
  function bootMapFix(){
    const el=document.getElementById('map');
    if(!el || typeof L==='undefined') return setTimeout(bootMapFix,300);
    const old=window.__finalMap;
    if(old){try{old.remove()}catch(e){}}
    el.innerHTML='';
    const warehouse=[29.8515,31.3505];
    const zones=[
      [1,'15 May / Helwan',29.851,31.335],
      [2,'Maadi / Mokattam',29.968,31.265],
      [3,'Central Cairo',30.045,31.235],
      [4,'Nasr City / Heliopolis',30.073,31.325],
      [5,'New Cairo',30.027,31.470],
      [6,'East Cairo',30.130,31.475],
      [7,'Mohandessin / Giza',30.045,31.200],
      [8,'Haram / Faisal / Omraniya',29.994,31.170],
      [9,'October / Zayed',30.015,30.975],
      [10,'North Coast',30.900,28.950]
    ];
    const mp=L.map(el,{zoomControl:true,preferCanvas:true}).setView([30.02,31.30],10);
    window.__finalMap=mp;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(mp);
    const points=[warehouse];
    L.marker(warehouse).addTo(mp).bindPopup('<b>0 · Warehouse</b><br>2B Warehouse · 15 May');
    const data=Array.isArray(window.D)?window.D:[];
    const normalize=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/أ|إ|آ/g,'ا').replace(/[\s_\-()./]/g,'').trim();
    const aliases=[
      ['15 مايو','حلوان','15 may'],['المعادي','المعادى','زهراء المعادي','زهراء المعادى','المقطم'],['وسط البلد','باب الشعرية','الظاهر','الضاهر','دار السلام','السيدة زينب','شبرا مصر','المنيل'],['مدينة نصر','مدينه نصر','مصر الجديدة','مصر الجديده','النزهة','روكسي','جسر السويس','حدائق القبة','الزيتون','المطرية','عين شمس'],['القاهرة الجديدة','القاهره الجديده','التجمع','التجمع الاول','التجمع الأول','التجمع الثالث','التجمع الخامس','الرحاب','مدينتي','مدينتي الجديدة'],['العبور','الشروق','مدينة الشروق','بدر','العاصمة الادارية الجديدة','العاصمة الإدارية الجديدة'],['المهندسين','أرض اللواء','ارض اللواء','الزمالك','العجوزة','الدقي','جيزة','الجيزة'],['الهرم','فيصل','العمرانية','حدائق الاهرام','حدائق الأهرام','الطالبية'],['6 أكتوبر','6 اكتوبر','السادس من أكتوبر','السادس من اكتوبر','حدائق أكتوبر','حدائق اكتوبر','الشيخ زايد','زايد'],['الساحل الشمالى','الساحل الشمالي','الساحل','العلمين','سيدي عبد الرحمن','سيدي عبدالرحمن']
    ];
    const zoneOf=v=>{const n=normalize(v);for(let i=0;i<aliases.length;i++){if(aliases[i].some(a=>normalize(a)===n))return zones[i];}return null};
    const grouped=zones.map(z=>({z,rows:data.filter(r=>zoneOf(r.a)?.[0]===z[0])})).filter(x=>x.rows.length);
    grouped.forEach(x=>{
      const orders=[...new Set(x.rows.map(r=>r.o).filter(Boolean))];
      const addresses=[...new Set(x.rows.map(r=>r.ad).filter(Boolean))];
      const marker=L.marker([x.z[2],x.z[3]]).addTo(mp);
      marker.bindPopup(`<b>Zone ${x.z[0]} · ${x.z[1]}</b><br>Orders: ${orders.length}<br>${orders.slice(0,30).join(' · ')}<br><br>${addresses.slice(0,8).join('<br>')}`);
      points.push([x.z[2],x.z[3]]);
      x.rows.filter(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lng)&&r.lat!==0&&r.lng!==0).forEach(r=>{
        L.circleMarker([r.lat,r.lng],{radius:6,weight:2,fillOpacity:.9}).addTo(mp).bindPopup(`<b>Order ${r.o||'—'}</b><br>${r.c||'—'}<br>${r.p||'—'}<br>${r.a||'—'}<br>${r.ad||'—'}`);
      });
    });
    if(points.length>1)L.polyline(points,{weight:3,dashArray:'8 8',opacity:.85}).addTo(mp);
    mp.fitBounds(L.latLngBounds(points).pad(.08));
    setTimeout(()=>mp.invalidateSize(),100);
    setTimeout(()=>mp.invalidateSize(),500);
  }
  setTimeout(bootMapFix,1200);
})();