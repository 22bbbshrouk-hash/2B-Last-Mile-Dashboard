(function(){
  const CLUSTERS = [
    {name:'Route 1 — New Cairo', areas:['التجمع الاول','التجمع الأول','التجمع الثالث','التجمع الخامس','الرحاب','القاهرة الجديدة','القاهره الجديده']},
    {name:'Route 2 — East Cairo', areas:['مدينة نصر','مدينه نصر','مصر الجديدة','مصر الجديده','النزهة','روكسي','جسر السويس','الزيتون']},
    {name:'Route 3 — East Cities', areas:['العبور','الشروق','مدينتي','بدر']},
    {name:'Route 4 — South Cairo', areas:['المعادي','المعادى','زهراء المعادي','زهراء المعادى','البساتين','دار السلام','مصر القديمة','السيدة زينب','المقطم']},
    {name:'Route 5 — South Extension', areas:['حلوان','15 مايو','المعصرة','التبين']},
    {name:'Route 6 — West', areas:['6 أكتوبر','6 اكتوبر','السادس من أكتوبر','السادس من اكتوبر','اكتوبر','أكتوبر','أكتوبر الجديدة','الشيخ زايد','مدينة الشيخ زايد','حدائق الأهرام','حدائق الاهرام']},
    {name:'Route 7 — Giza', areas:['الجيزة','جيزة','فيصل','الهرم','العمرانية','أبو النمرس','ابو النمرس']},
    {name:'Route 8 — North Cairo', areas:['شبرا مصر','شبرا','شبرا الخيمة','رمسيس','باب الشعرية','بولاق','الزاوية','حدائق القبة','الأميرية','عين شمس','المطرية','عزبة النخل','الخصوص','قليوب','الخانكة']}
  ];
  const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[\s_\-()./]/g,'').trim();
  const aliases=new Map(); CLUSTERS.forEach((c,i)=>c.areas.forEach(a=>aliases.set(norm(a),i)));
  function clusterFor(area){
    const n=norm(area); if(aliases.has(n)) return aliases.get(n);
    const rules=[[/نصر|مصرالجديده|هليوبوليس|روكسي|النزهه|جسربسويس|زيتون/,1],[/عبور|شروق|مدينتي|بدر/,2],[/معادي|معادى|بساتين|دارالسلام|مصرالقديمه|سيدهنبين|مقطم/,3],[/حلوان|مايو|معصره|تبين/,4],[/اكتوبر|زايد|اهرام/,5],[/جيزه|فيصل|هرم|عمرانيه|ابوالنمرس/,6],[/شبرا|رمسيس|شعريه|بولاق|زاويه|قبه|اميريه|عينشمس|مطريه|نخل|خصوص|قليوب|خانكه/,7],[/تجمع|رحاب|قاهرهجديده/,0]];
    for(const [re,i] of rules) if(re.test(n)) return i; return -1;
  }
  function ensureClusters(){
    const dynamic=[];(data||[]).forEach(r=>{if(!r.area)return;const i=clusterFor(r.area);if(i<0&&!dynamic.some(x=>norm(x.name)===norm(r.area)))dynamic.push({name:'Route '+(CLUSTERS.length+dynamic.length+1)+' — '+r.area,areas:[r.area]});});return CLUSTERS.concat(dynamic);
  }
  function rowsByCluster(){
    const cs=ensureClusters(),out=cs.map(()=>[]);(data||[]).forEach(r=>{let i=clusterFor(r.area);if(i<0)i=cs.findIndex(c=>c.areas.some(a=>norm(a)===norm(r.area)));if(i<0)i=cs.length-1;(out[i]||(out[i]=[])).push(r);});return out.map((rs,i)=>[i,rs]).filter(([,rs])=>rs.length);
  }
  function addCourierButton(){if(document.getElementById('courierSheet'))return;const bar=document.querySelector('.bar');if(!bar)return;const b=document.createElement('button');b.id='courierSheet';b.className='btn secondary';b.textContent='🚚 شيت المندوب';b.onclick=downloadCourierSheet;bar.insertBefore(b,document.getElementById('refresh'));}
  function downloadCourierSheet(){
    const name=prompt('اكتب اسم المندوب فقط:','');if(!name||!name.trim())return;const cs=ensureClusters(),rows=[];
    rowsByCluster().forEach(([i,rs])=>{const route=cs[i]?.name||('Route '+(i+1));const seen=new Set();rs.forEach(r=>{const key=(r.order||'')+'|'+(r.area||'');if(r.order&&!seen.has(key)){seen.add(key);rows.push({'Route':route,'Zone / Area':r.area||'غير مصنف','Order No.':r.order,'Courier Name':name.trim()});}});});
    const ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=[{wch:28},{wch:24},{wch:20},{wch:24}];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Courier Sheet');XLSX.writeFile(wb,'Courier_Sheet_'+name.trim().replace(/\s+/g,'_')+'.xlsx');
  }
  function renderGeo(){
    const cs=ensureClusters(),zr=rowsByCluster(),am=new Map();(data||[]).forEach(r=>{if(!am.has(r.area))am.set(r.area,new Set());if(r.order)am.get(r.area).add(r.order);});
    const groups=zr.map(([i,rs])=>{const areas=[...am].filter(([a])=>clusterFor(a)===i).map(([a,s])=>[a,s.size]);const orders=new Set(rs.map(r=>r.order).filter(Boolean));const qty=rs.reduce((s,r)=>s+r.qty,0),cbm=rs.reduce((s,r)=>s+r.cbm,0);return{i,rs,areas,orders:orders.size,qty,cbm,vehicles:allocate(cbm)}});
    const mx=Math.max(1,...groups.flatMap(c=>c.areas.map(x=>x[1])));
    $('rank').innerHTML=groups.map(c=>`<div style="margin:14px 0 18px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px"><b style="color:#ff7900">${E(cs[c.i].name)}</b><span class="chip">${c.orders} Orders · ${c.qty} QTY</span></div>${c.areas.sort((a,b)=>b[1]-a[1]).map(x=>`<div class="area"><div>${E(x[0])}</div><div class="bg"><div class="fill" style="width:${x[1]/mx*100}%"></div></div><b>${x[1]}</b></div>`).join('')}</div>`).join('')||'<div class="empty">لا توجد بيانات</div>';
    $('zones').innerHTML=groups.map(c=>`<div class="zone"><div><span class="zn">${c.i+1}</span><b>${E(cs[c.i].name)}</b></div><div class="muted">Areas: ${c.areas.length} · Orders: ${c.orders} · QTY: ${c.qty} · CBM: ${c.cbm.toFixed(3)}</div><div class="chip">🚚 ${c.vehicles.vehicles||1} vehicle${(c.vehicles.vehicles||1)!==1?'s':''}</div></div>`).join('')||'<div class="empty">لا توجد mapped zones</div>';
    $('routes').innerHTML=groups.map(c=>{const u=uniqueOrders(c.rs);return`<div class="route"><div class="routeTop"><span class="rn">${c.i+1}</span><div><b>${E(cs[c.i].name)}</b><div class="muted">${c.orders} Orders · ${c.qty} QTY · ${c.cbm.toFixed(3)} CBM</div></div><div class="vehicle">🚚 ${c.vehicles.names.join(' + ')||'1 vehicle'}</div></div>${u.map((r,j)=>`<div class="stop"><span class="stopno">${j+1}</span><b>${E(r.order)}</b> · ${E(r.customer)} · ${E(r.area)} · ${E(r.address)}</div>`).join('')}</div>`}).join('')||'<div class="empty">لا توجد Routes</div>';
    (data||[]).forEach(r=>{const i=clusterFor(r.area);r.route=i>=0?cs[i].name:'Route — '+r.area;});renderDetails();if($('status')&&data.length)$('status').textContent='تم تطبيق Geographic Clustering ✓';
  }
  function install(){try{if(typeof render!=='function'||typeof loadBuf!=='function')return setTimeout(install,250);const originalLoadBuf=loadBuf;render=renderGeo;loadBuf=async function(buf){await originalLoadBuf(buf);renderGeo();};addCourierButton();if(data&&data.length)renderGeo();}catch(e){console.error('Geo clustering install failed',e);}}
  install();
})();