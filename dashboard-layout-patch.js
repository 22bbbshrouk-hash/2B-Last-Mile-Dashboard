(function(){
  const iframe=document.getElementById('dash');
  function install(){
    const d=iframe.contentDocument,w=iframe.contentWindow;if(!d||!w)return;
    if(d.getElementById('layoutPatchStyle'))return;
    const s=d.createElement('style');s.id='layoutPatchStyle';s.textContent=`
      .grid .layout-half{grid-column:span 1!important;min-width:0}
      .grid .layout-full{grid-column:1/-1!important}
      .grid .layout-map{grid-column:1/-1!important}
      @media(max-width:800px){.grid .layout-half{grid-column:1/-1!important}}
      .area-order-group{margin:0 0 14px;padding:10px 12px;border:1px solid #26313d;border-radius:10px;background:#0c1117}
      .area-order-title{font-weight:900;font-size:13px;margin-bottom:7px;color:#ff7900}
      .second-map-wrap{height:360px;border-radius:10px;overflow:hidden;border:1px solid #26313d}
    `;d.head.appendChild(s);
    arrange();
    observe();
  }
  function sections(){return [...iframe.contentDocument.querySelectorAll('.grid>section')];}
  function arrange(){
    const d=iframe.contentDocument, ss=sections();
    const rank=ss.find(x=>/Area Load Ranking/i.test(x.querySelector('h2')?.textContent||''));
    const summary=ss.find(x=>/Operational Zone Summary|Trip Group Summary/i.test(x.querySelector('h2')?.textContent||''));
    const map=ss.find(x=>/Live Route Map/i.test(x.querySelector('h2')?.textContent||''));
    const details=ss.find(x=>/Area → Orders → SKU → Product/i.test(x.querySelector('h2')?.textContent||''));
    if(rank){rank.classList.remove('full');rank.classList.add('layout-half')}
    if(summary){summary.classList.remove('full');summary.classList.add('layout-half')}
    if(map)map.classList.add('layout-map');
    if(details)details.classList.add('layout-full');
    if(rank&&summary&&rank.nextElementSibling!==summary)rank.parentElement.insertBefore(rank,summary);
    sortDetails();
    makeSecondMap();
  }
  const areaOrder=[
    'المهندسين','ارض اللواء','الزمالك','بولاق الدكرور','ترسا','الجيزة','فيصل','العمرانية','الهرم','أبو النمرس',
    'المعادي','زهراء المعادي','المقطم','حلوان','مايو','مصر القديمة','السيدة عائشة',
    'وسط القاهرة','الضاهر','باب الشعرية','دار السلام','شبرا مصر','السيدة زينب',
    'مصر الجديدة','النزهة','روكسي','جسر السويس','حدائق القبة','الزيتون','المطرية','عين شمس','عزبة النخل',
    'القاهرة الجديدة','الرحاب','التجمع الأول','التجمع الثالث','التجمع الخامس',
    'العبور','الشروق','مدينتي','العاصمة الادارية الجديدة','بدر',
    'حدائق أكتوبر','حدائق الاهرام','6 أكتوبر','الشيخ زايد','الخانكة','المرج','الساحل الشمالى'
  ];
  const norm=x=>String(x||'').toLowerCase().replace(/[\s_\-()./]/g,'');
  const rankArea=a=>{const n=norm(a);let i=areaOrder.findIndex(x=>norm(x)===n);if(i<0)i=areaOrder.findIndex(x=>n.includes(norm(x))||norm(x).includes(n));return i<0?999:i};
  function sortDetails(){
    const tb=iframe.contentDocument.getElementById('details');if(!tb)return;
    const rows=[...tb.querySelectorAll('tr')];
    if(rows.length<2)return;
    rows.sort((a,b)=>{const aa=a.children[1]?.textContent.trim()||'',bb=b.children[1]?.textContent.trim()||'';const ra=rankArea(aa),rb=rankArea(bb);if(ra!==rb)return ra-rb;return aa.localeCompare(bb,'ar')});
    rows.forEach(r=>tb.appendChild(r));
  }
  const coords={
    'المهندسين':[30.0488,31.201], 'ارض اللواء':[30.066,31.191], 'الزمالك':[30.061,31.219], 'بولاق الدكرور':[30.036,31.184],
    'ترسا':[29.996,31.175], 'الجيزة':[30.013,31.208], 'فيصل':[29.995,31.165], 'العمرانية':[29.99,31.17], 'الهرم':[29.998,31.14],
    'المعادي':[29.96,31.255], 'زهراء المعادي':[29.95,31.29], 'المقطم':[30.02,31.31], 'حلوان':[29.85,31.335], 'مايو':[29.85,31.38],
    'مصر القديمة':[30.006,31.23], 'السيدة عائشة':[30.03,31.25], 'الضاهر':[30.06,31.265], 'باب الشعرية':[30.055,31.26],
    'دار السلام':[29.97,31.245], 'شبرا مصر':[30.08,31.245], 'السيدة زينب':[30.03,31.235], 'مصر الجديدة':[30.09,31.33],
    'النزهة':[30.12,31.36], 'روكسي':[30.08,31.33], 'جسر السويس':[30.13,31.37], 'حدائق القبة':[30.09,31.29], 'الزيتون':[30.10,31.30],
    'المطرية':[30.12,31.31], 'عين شمس':[30.13,31.34], 'عزبة النخل':[30.15,31.34], 'القاهرة الجديدة':[30.03,31.47],
    'الرحاب':[30.06,31.49], 'التجمع الأول':[30.05,31.43], 'التجمع الثالث':[30.02,31.45], 'التجمع الخامس':[30.01,31.44],
    'العبور':[30.22,31.47], 'الشروق':[30.11,31.61], 'مدينتي':[30.10,31.64], 'العاصمة الادارية الجديدة':[30.02,31.75], 'بدر':[30.13,31.72],
    'حدائق أكتوبر':[29.94,30.91], 'حدائق الاهرام':[29.97,31.08], '6 أكتوبر':[29.96,30.94], 'الشيخ زايد':[30.00,30.97],
    'الخانكة':[30.21,31.37], 'المرج':[30.15,31.34]
  };
  function makeSecondMap(){
    const d=iframe.contentDocument,w=iframe.contentWindow;
    const first=[...d.querySelectorAll('.grid>section')].find(x=>/Live Route Map/i.test(x.querySelector('h2')?.textContent||''));
    if(!first||!w.L)return;
    let sec=d.getElementById('tripMap2');
    if(!sec){
      sec=d.createElement('section');sec.id='tripMap2';sec.className='card layout-map';sec.innerHTML='<h2>🗺️ Area Proximity Map</h2><div class="sub">المناطق مرتبة حسب القرب والـTrip Group لتوضيح أفضل مسار.</div><div id="map2" class="second-map-wrap"></div>';
      first.parentElement.insertBefore(sec,first.nextElementSibling);
    }
    if(sec.dataset.ready==='1'){drawMap2();return;}
    sec.dataset.ready='1';
    setTimeout(drawMap2,150);
  }
  function drawMap2(){
    const d=iframe.contentDocument,w=iframe.contentWindow;if(!w.L)return;const el=d.getElementById('map2');if(!el)return;
    if(el._leaflet_id)return;
    const map=w.L.map(el,{scrollWheelZoom:true}).setView([30.02,31.25],10);
    w.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
    const tb=d.getElementById('details');const data={};
    [...(tb?.querySelectorAll('tr')||[])].forEach(tr=>{const c=tr.children;if(c.length<2)return;const g=c[0].textContent.trim(),a=c[1].textContent.trim();if(coords[a]){data[g]??=[];if(!data[g].some(x=>x.a===a))data[g].push({a,p:coords[a]})}});
    Object.entries(data).forEach(([g,pts])=>{if(!pts.length)return;pts.forEach(x=>w.L.marker(x.p).addTo(map).bindPopup('<b>'+g+'</b><br>'+x.a));if(pts.length>1)w.L.polyline(pts.map(x=>x.p),{weight:4}).addTo(map)});
    const all=Object.values(data).flat().map(x=>x.p);if(all.length)map.fitBounds(all,{padding:[25,25]});
    setTimeout(()=>map.invalidateSize(),100);
  }
  function observe(){
    const d=iframe.contentDocument;
    const target=d.getElementById('details')||d.querySelector('.grid');if(!target)return;
    const ob=new MutationObserver(()=>{sortDetails();makeSecondMap()});ob.observe(target,{childList:true,subtree:true});
  }
  iframe.addEventListener('load',install);if(iframe.contentDocument?.readyState==='complete')install();
})();
