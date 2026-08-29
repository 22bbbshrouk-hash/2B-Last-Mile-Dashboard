(()=>{
function boot(){
 const el=document.getElementById('map'); if(!el||typeof L==='undefined') return setTimeout(boot,300);
 try{if(window.__finalMap)window.__finalMap.remove()}catch(e){} el.innerHTML='';
 const W=[29.8515,31.3505];
 const Z=[
 [1,'15 May / Helwan',29.851,31.335,['15 مايو','حلوان','15 may']],
 [2,'Maadi / Mokattam',29.968,31.265,['المعادي','المعادى','زهراء المعادي','زهراء المعادى','المقطم']],
 [3,'Central Cairo',30.045,31.235,['وسط البلد','باب الشعرية','الظاهر','الضاهر','دار السلام','السيدة زينب','شبرا مصر','المنيل']],
 [4,'Nasr City / Heliopolis',30.073,31.325,['مدينة نصر','مدينه نصر','مصر الجديدة','مصر الجديده','النزهة','روكسي','جسر السويس','حدائق القبة','الزيتون','المطرية','عين شمس']],
 [5,'New Cairo',30.027,31.470,['القاهرة الجديدة','القاهره الجديده','التجمع','التجمع الاول','التجمع الأول','التجمع الثالث','التجمع الخامس','الرحاب','مدينتي','مدينتي الجديدة']],
 [6,'East Cairo',30.130,31.475,['العبور','الشروق','مدينة الشروق','بدر','العاصمة الادارية الجديدة','العاصمة الإدارية الجديدة']],
 [7,'Mohandessin / Giza',30.045,31.200,['المهندسين','أرض اللواء','ارض اللواء','الزمالك','العجوزة','الدقي','جيزة','الجيزة']],
 [8,'Haram / Faisal / Omraniya',29.994,31.170,['الهرم','فيصل','العمرانية','حدائق الاهرام','حدائق الأهرام','الطالبية']],
 [9,'October / Zayed',30.015,30.975,['6 أكتوبر','6 اكتوبر','السادس من أكتوبر','السادس من اكتوبر','حدائق أكتوبر','حدائق اكتوبر','الشيخ زايد','زايد']],
 [10,'North Coast',30.900,28.950,['الساحل الشمالى','الساحل الشمالي','الساحل','العلمين','سيدي عبد الرحمن','سيدي عبدالرحمن']]
 ];
 const N=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/أ|إ|آ/g,'ا').replace(/[\s_\-()./]/g,'').trim();
 const zone=v=>{let n=N(v);return Z.find(z=>z[4].some(a=>N(a)===n))||Z.find(z=>N(z[1])===n)||null};
 const data=Array.isArray(window.D)?window.D:[];
 const mp=L.map(el,{zoomControl:true,preferCanvas:true}); window.__finalMap=mp;
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(mp);
 const points=[W]; L.marker(W).addTo(mp).bindPopup('<b>0 · Warehouse</b><br>2B Warehouse · 15 May');
 Z.forEach(z=>{
   const rows=data.filter(r=>zone(r.a)?.[0]===z[0]); if(!rows.length)return;
   const orders=[...new Set(rows.map(r=>r.o).filter(Boolean))];
   const ads=[...new Set(rows.map(r=>r.ad).filter(Boolean))];
   L.marker([z[2],z[3]]).addTo(mp).bindPopup(`<b>Zone ${z[0]} · ${z[1]}</b><br>Orders: ${orders.length}<br>${orders.slice(0,40).join(' · ')}<br><br>${ads.slice(0,10).join('<br>')}`);
   points.push([z[2],z[3]]);
   rows.forEach(r=>{const lat=Number(r.lat),lng=Number(r.lng);if(Number.isFinite(lat)&&Number.isFinite(lng)&&lat>0&&lng>0)L.circleMarker([lat,lng],{radius:6,weight:2,fillOpacity:.9}).addTo(mp).bindPopup(`<b>Order ${r.o||'—'}</b><br>${r.c||'—'}<br>${r.p||'—'}<br>${r.a||'—'}<br>${r.ad||'—'}`)});
 });
 if(points.length>1)L.polyline(points,{weight:3,dashArray:'8 8',opacity:.85}).addTo(mp);
 mp.setView(W,10); if(points.length>1)mp.fitBounds(L.latLngBounds(points).pad(.08));
 setTimeout(()=>mp.invalidateSize(),100);setTimeout(()=>mp.invalidateSize(),700);
}
setTimeout(boot,800);
})();