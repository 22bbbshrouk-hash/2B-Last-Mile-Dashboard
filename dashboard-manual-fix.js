(function(){
  const iframe=document.getElementById('dash');
  if(!iframe)return;
  const GROUP_ORDER=['East Cairo','New Cairo','Central Cairo','West Cairo','October / Zayed','Maadi / Helwan / Mokattam','Heliopolis / Nasr City','North Coast','Other'];
  const GROUP_AREAS={
    'East Cairo':['العبور','الشروق','مدينتي','العاصمة الادارية الجديدة','العاصمة الإدارية الجديدة','بدر'],
    'New Cairo':['القاهرة الجديدة','التجمع','التجمع الأول','التجمع الاول','التجمع الثالث','التجمع الخامس','الرحاب'],
    'Central Cairo':['الضاهر','الظاهر','وسط البلد','باب الشعرية','دار السلام','شبرا مصر','السيدة زينب'],
    'West Cairo':['ترسا','الجيزة','فيصل','العمرانية','الهرم','أبو نمرس','ابو نمرس','المهندسين','أرض اللواء','ارض اللواء','بولاق الدكرور'],
    'October / Zayed':['حدائق أكتوبر','حدائق اكتوبر','6 أكتوبر','السادس من أكتوبر','الشيخ زايد','زايد','حدائق الأهرام','حدائق الاهرام'],
    'Maadi / Helwan / Mokattam':['المعادي','حلوان','مايو','المقطم','زهراء المعادي'],
    'Heliopolis / Nasr City':['مصر الجديدة','النزهة','روكسي','جسر السويس','حدائق القبة','الزيتون','المطرية','عين شمس','عين شمس- الشرقية','عزبة النخل','مدينة نصر'],
    'North Coast':['الساحل الشمالى','الساحل الشمالي']
  };
  const COLORS={'East Cairo':'#c77dff','New Cairo':'#45d69c','Central Cairo':'#577590','West Cairo':'#f72585','October / Zayed':'#4cc9f0','Maadi / Helwan / Mokattam':'#ff7900','Heliopolis / Nasr City':'#06d6a0','North Coast':'#90be6d','Other':'#ff5d66'};
  const norm=s=>String(s??'').toLowerCase().replace(/[\s_\-()./]/g,'');
  function groupForArea(area){const n=norm(area);for(const g of GROUP_ORDER){if(g==='Other')continue;if((GROUP_AREAS[g]||[]).some(x=>norm(x)===n))return g}return 'Other'}
  function num(v){const m=String(v??'').replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):0}
  function isAC(v){return /air.?condition|\bac\b|تكييف/i.test(String(v||''))}
  function rebuildSummary(d){
    const box=d.getElementById('zoneSummary');const tb=d.getElementById('details');if(!box||!tb)return;
    const data={};
    [...tb.querySelectorAll('tr')].forEach(tr=>{const c=tr.children;if(c.length<6)return;const area=(c[1]?.textContent||'').trim();const order=(c[2]?.textContent||'').trim();const sku=(c[3]?.textContent||'').trim();const product=(c[4]?.textContent||'').trim();const qty=num(c[5]?.textContent);const g=groupForArea(area);data[g]??={areas:new Set(),orders:new Set(),skus:new Set(),qty:0,ac:0};const x=data[g];if(area)x.areas.add(area);if(order)x.orders.add(order);if(sku)x.skus.add(sku);x.qty+=qty;if(isAC(product))x.ac+=qty||1});
    box.innerHTML=GROUP_ORDER.filter(g=>data[g]).map(g=>{const x=data[g],vehicles=x.ac?Math.ceil(x.ac/13):0;return '<div class="zoneCard" style="border-right:3px solid '+COLORS[g]+'"><div class="zoneTitle" style="color:'+COLORS[g]+'">'+g+'</div><div class="muted">'+[...x.areas].join(' · ')+'</div><div class="hint">Orders <b>'+x.orders.size+'</b> · SKU <b>'+x.skus.size+'</b> · QTY <b>'+x.qty+'</b> · AC <b>'+x.ac+'</b> · Vehicles <b>'+vehicles+'</b></div></div>'}).join('')||'<div class="empty">لا توجد بيانات</div>';
  }
  function removeDuplicateMap(d){
    const sections=[...d.querySelectorAll('.grid>section')];
    const maps=sections.filter(s=>/Map/i.test(s.querySelector('h2')?.textContent||''));
    const preferred=maps.find(s=>/Trip Group Route Map|Trip Zones & Routes/i.test(s.querySelector('h2')?.textContent||''));
    maps.filter(s=>s!==preferred && /Area Proximity Map|Proximity/i.test(s.querySelector('h2')?.textContent||'')).forEach(s=>s.remove());
  }
  function apply(){const d=iframe.contentDocument;if(!d)return;rebuildSummary(d);removeDuplicateMap(d)}
  iframe.addEventListener('load',()=>{setTimeout(apply,300);setTimeout(apply,1200);setTimeout(apply,2500)});
  if(iframe.contentDocument?.readyState==='complete')setTimeout(apply,300);
})();
