(function(){
  const iframe=document.getElementById('dash');
  let timer=null, busy=false;

  const GROUP_ORDER=[
    'Maadi','October / Zayed','New Cairo','Other','East Cairo',
    'Mohandessin','Heliopolis','West Cairo','North Coast','Central Cairo'
  ];

  const GROUP_AREAS={
    'Maadi':['المقطم','زهراء المعادي','المعادي','حلوان','مايو'],
    'October / Zayed':['السادس من أكتوبر','6 أكتوبر','أكتوبر','حدائق الاهرام','حدائق الأهرام','الشيخ زايد','زايد','حدائق اكتوبر','حدائق أكتوبر'],
    'New Cairo':['القاهرة الجديدة','التجمع الخامس','الرحاب','التجمع الثالث'],
    'East Cairo':['الشروق','العاصمة الادارية الجديدة','العبور','مدينتي','بدر'],
    'Mohandessin':['ارض اللواء','أرض اللواء','المهندسين','بولاق الدكرور','الزمالك'],
    'Heliopolis':['عين شمس- الشرقية','عين شمس','جسر السويس','مصر الجديدة','النزهة','روكسي','حدائق القبة','الزيتون','المطرية','عزبة النخل'],
    'West Cairo':['فيصل','الهرم','العمرانية','الجيزة','ترسا','أبو النمرس'],
    'North Coast':['الساحل الشمالى','الساحل الشمالي'],
    'Central Cairo':['شبرا مصر','الضاهر','وسط القاهرة','باب الشعرية','دار السلام','السيدة زينب']
  };

  const COLORS={
    'Maadi':'#ff7900','October / Zayed':'#4cc9f0','New Cairo':'#45d69c','Other':'#ff5d66',
    'East Cairo':'#c77dff','Mohandessin':'#ffd166','Heliopolis':'#06d6a0','West Cairo':'#f72585',
    'North Coast':'#90be6d','Central Cairo':'#577590'
  };

  const norm=s=>String(s??'').toLowerCase().replace(/[\s_\-()./]/g,'');
  function groupForArea(area){
    const n=norm(area);
    for(const g of GROUP_ORDER){
      if(g==='Other') continue;
      if((GROUP_AREAS[g]||[]).some(x=>norm(x)===n)) return g;
    }
    return 'Other';
  }
  function groupRank(g){const i=GROUP_ORDER.indexOf(String(g||'').trim());return i<0?999:i;}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

  function injectStyle(d){
    if(d.getElementById('layoutPatchStyle')) return;
    const s=d.createElement('style');s.id='layoutPatchStyle';
    s.textContent=`
      .grid .layout-half{grid-column:span 1!important;min-width:0}
      .grid .layout-full,.grid .layout-map{grid-column:1/-1!important}
      @media(max-width:800px){.grid .layout-half{grid-column:1/-1!important}}
      #details tr.area-start td{border-top:1px solid #26313d}
      #details td.area-merged{font-weight:900;vertical-align:middle;border-right:3px solid var(--area-color,#ff7900);background:#0d131a}
      .routeCard.route-sorted{position:relative;border-color:color-mix(in srgb,var(--route-color,#ff7900) 45%, #26313d)}
      .routeCard.route-sorted .routeTitle{color:var(--route-color,#ff7900)}
      .route-order-badge{display:inline-block;margin-left:7px;padding:3px 7px;border-radius:999px;font-size:10px;font-weight:900;color:#111;background:var(--route-color,#ff7900)}
      .custom-legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px}
      .custom-legend span{font-size:10px;color:#aab3bf}
      .custom-legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-left:4px}
    `;d.head.appendChild(s);
  }

  function sortSections(){
    const d=iframe.contentDocument;if(!d)return;
    const sections=[...d.querySelectorAll('.grid>section')];
    const rank=sections.find(x=>/Area Load Ranking/i.test(x.querySelector('h2')?.textContent||''));
    const summary=sections.find(x=>/Operational Zone Summary|Trip Group Summary/i.test(x.querySelector('h2')?.textContent||''));
    const map=sections.find(x=>/Trip Group Route Map/i.test(x.querySelector('h2')?.textContent||''));
    const details=sections.find(x=>/Area → Orders → SKU → Product/i.test(x.querySelector('h2')?.textContent||''));
    if(rank){rank.classList.remove('full');rank.classList.add('layout-half')}
    if(summary){summary.classList.remove('full');summary.classList.add('layout-half')}
    if(map)map.classList.add('layout-map');
    if(details)details.classList.add('layout-full');
    if(rank&&summary&&rank.nextElementSibling!==summary)rank.parentElement.insertBefore(rank,summary);
  }

  function sortDetails(){
    const d=iframe.contentDocument,tb=d?.getElementById('details');
    if(!tb||busy)return;
    const rows=[...tb.querySelectorAll('tr')];if(rows.length<2)return;
    busy=true;
    try{
      rows.forEach(r=>{const old=r.querySelector('td.area-merged');if(old){old.removeAttribute('rowspan');old.classList.remove('area-merged')}});
      rows.sort((a,b)=>{
        const aa=(a.children[1]?.textContent||'').trim(),ab=(b.children[1]?.textContent||'').trim();
        const ra=groupRank(groupForArea(aa)),rb=groupRank(groupForArea(ab));
        if(ra!==rb)return ra-rb;
        const na=norm(aa),nb=norm(ab);if(na!==nb)return na.localeCompare(nb,'ar');
        return (a.textContent||'').localeCompare(b.textContent||'','ar');
      });
      const frag=d.createDocumentFragment();rows.forEach(r=>frag.appendChild(r));tb.appendChild(frag);
      let i=0;
      while(i<rows.length){
        const area=(rows[i].children[1]?.textContent||'').trim();const g=groupForArea(area);let j=i+1;
        while(j<rows.length&&norm(rows[j].children[1]?.textContent||'')===norm(area))j++;
        const cell=rows[i].children[1];
        if(cell){cell.rowSpan=j-i;cell.classList.add('area-merged');cell.style.setProperty('--area-color',COLORS[g]||'#ff7900')}
        rows[i].classList.add('area-start');i=j;
      }
    }finally{busy=false;}
  }

  function sortRoutes(){
    const d=iframe.contentDocument,box=d?.getElementById('routes');if(!box)return;
    const cards=[...box.querySelectorAll('.routeCard')];if(!cards.length)return;
    cards.forEach(c=>{
      const title=c.querySelector('.routeTitle')?.textContent||'';let g=GROUP_ORDER.find(x=>title.toLowerCase().includes(x.toLowerCase()));
      if(!g){const area=c.querySelector('.tripAreas .areaTag')?.textContent||'';g=groupForArea(area)}
      c.dataset.group=g;c.style.setProperty('--route-color',COLORS[g]||'#ff7900');c.classList.add('route-sorted');
      let badge=c.querySelector('.route-order-badge');if(!badge){badge=d.createElement('span');badge.className='route-order-badge';const h=c.querySelector('.routeTitle');if(h)h.appendChild(badge)}
      badge.textContent=String(groupRank(g)+1);
    });
    cards.sort((a,b)=>groupRank(a.dataset.group)-groupRank(b.dataset.group));const frag=d.createDocumentFragment();cards.forEach(c=>frag.appendChild(c));box.appendChild(frag);
  }

  function buildRouteMap(){
    const d=iframe.contentDocument,w=iframe.contentWindow,el=d?.getElementById('map1');if(!el||!w.L)return;
    if(w.__customRouteMap){try{w.__customRouteMap.remove()}catch(e){}w.__customRouteMap=null}
    el.innerHTML='';const map=w.L.map(el,{scrollWheelZoom:true}).setView([30.04,31.25],10);w.__customRouteMap=map;
    w.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
    const tb=d.getElementById('details'),grouped={};
    [...(tb?.querySelectorAll('tr')||[])].forEach(tr=>{const c=tr.children;if(c.length<2)return;const area=(c[1]?.textContent||'').trim(),g=groupForArea(area);grouped[g]??=[];if(!grouped[g].some(x=>norm(x.area)===norm(area)))grouped[g].push({area})});
    const coords={
      'المقطم':[30.02,31.31],'زهراء المعادي':[29.95,31.30],'المعادي':[29.96,31.25],'حلوان':[29.85,31.34],'مايو':[29.73,31.37],
      'السادس من أكتوبر':[29.97,30.95],'6 أكتوبر':[29.97,30.95],'حدائق الاهرام':[29.97,31.10],'حدائق الأهرام':[29.97,31.10],'حدائق اكتوبر':[29.95,30.93],'حدائق أكتوبر':[29.95,30.93],'الشيخ زايد':[30.02,30.98],'زايد':[30.02,30.98],
      'القاهرة الجديدة':[30.03,31.49],'التجمع الخامس':[30.01,31.47],'التجمع الثالث':[30.01,31.45],'الرحاب':[30.06,31.49],
      'الشروق':[30.14,31.62],'العاصمة الادارية الجديدة':[30.02,31.75],'العبور':[30.23,31.47],'مدينتي':[30.08,31.65],'بدر':[30.13,31.72],
      'ارض اللواء':[30.08,31.19],'أرض اللواء':[30.08,31.19],'المهندسين':[30.05,31.20],'بولاق الدكرور':[30.03,31.19],'الزمالك':[30.06,31.22],
      'عين شمس- الشرقية':[30.13,31.32],'عين شمس':[30.13,31.32],'جسر السويس':[30.12,31.34],'مصر الجديدة':[30.09,31.32],'النزهة':[30.12,31.35],'روكسي':[30.09,31.33],
      'فيصل':[30.00,31.17],'الهرم':[29.99,31.14],'العمرانية':[29.99,31.19],'الجيزة':[30.01,31.21],'ترسا':[29.995,31.18],'أبو النمرس':[29.95,31.15],
      'الساحل الشمالى':[30.85,28.95],'الساحل الشمالي':[30.85,28.95],
      'شبرا مصر':[30.08,31.25],'الضاهر':[30.06,31.27],'وسط القاهرة':[30.05,31.26],'باب الشعرية':[30.05,31.26],'دار السلام':[29.97,31.24],'السيدة زينب':[30.03,31.24],
      'مدينة نصر':[30.06,31.34],'التجمع الاول':[30.04,31.47],'حدائق اكتوبر':[29.95,30.93]
    };
    const old=d.getElementById('legend1');if(old)old.innerHTML='';const all=[];
    GROUP_ORDER.forEach((g,gi)=>{
      const color=COLORS[g],pts=(grouped[g]||[]).map(x=>({area:x.area,p:coords[x.area]})).filter(x=>x.p);
      const legend=d.createElement('span');legend.innerHTML='<i style="background:'+color+'"></i>'+esc(g)+(g==='Other'?' (0 Vehicles)':'');legend.style.order=String(gi);if(old)old.appendChild(legend);
      pts.forEach((x,i)=>{const icon=w.L.divIcon({className:'',html:'<div style="width:28px;height:28px;border-radius:50%;background:'+color+';color:#111;font-weight:900;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px #0008">'+(i+1)+'</div>',iconSize:[28,28],iconAnchor:[14,14]});w.L.marker(x.p,{icon}).addTo(map).bindPopup('<b>Stop '+(i+1)+' — '+esc(x.area)+'</b><br>Trip: '+esc(g));all.push(x.p)});
      if(pts.length>1)w.L.polyline(pts.map(x=>x.p),{color,weight:5,opacity:.9}).addTo(map);
    });
    if(all.length)map.fitBounds(w.L.latLngBounds(all).pad(.10));setTimeout(()=>map.invalidateSize(),200);
  }

  function apply(){const d=iframe.contentDocument;if(!d)return;injectStyle(d);sortSections();sortDetails();sortRoutes();buildRouteMap();}
  function observe(){const d=iframe.contentDocument;if(!d)return;const target=d.getElementById('details')||d.querySelector('.grid');if(!target)return;const ob=new MutationObserver(()=>{if(busy)return;clearTimeout(timer);timer=setTimeout(apply,300)});ob.observe(target,{childList:true,subtree:true});}
  function install(){setTimeout(apply,500);setTimeout(apply,1500);observe();}
  iframe.addEventListener('load',install);if(iframe.contentDocument?.readyState==='complete')install();
})();