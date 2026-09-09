(function(){
  const CLUSTERS=[
    {name:'Route 1 — New Cairo',areas:['التجمع الاول','التجمع الأول','التجمع الثالث','التجمع الخامس','الرحاب','القاهرة الجديدة','القاهره الجديده']},
    {name:'Route 2 — East Cairo',areas:['مدينة نصر','مدينه نصر','مصر الجديدة','مصر الجديده','النزهة','روكسي','جسر السويس','الزيتون']},
    {name:'Route 3 — East Cities',areas:['العبور','الشروق','مدينتي','بدر']},
    {name:'Route 4 — South Cairo',areas:['المعادي','المعادى','زهراء المعادي','زهراء المعادى','البساتين','دار السلام','مصر القديمة','السيدة زينب','المقطم']},
    {name:'Route 5 — South Extension',areas:['حلوان','15 مايو','المعصرة','التبين']},
    {name:'Route 6 — West',areas:['6 أكتوبر','6 اكتوبر','السادس من أكتوبر','السادس من اكتوبر','اكتوبر','أكتوبر','أكتوبر الجديدة','الشيخ زايد','مدينة الشيخ زايد','حدائق الأهرام','حدائق الاهرام']},
    {name:'Route 7 — Giza',areas:['الجيزة','جيزة','فيصل','الهرم','العمرانية','أبو النمرس','ابو النمرس']},
    {name:'Route 8 — North Cairo',areas:['شبرا مصر','شبرا','شبرا الخيمة','رمسيس','باب الشعرية','بولاق','الزاوية','حدائق القبة','الأميرية','عين شمس','المطرية','عزبة النخل','الخصوص','قليوب','الخانكة']}
  ];
  const CENTERS=[[30.03,31.42],[30.10,31.32],[30.13,31.47],[29.95,31.25],[29.82,31.30],[30.02,30.98],[30.02,31.20],[30.12,31.25]];
  const COLORS=['#ff7900','#4bd7a2','#7aa2ff','#ff5f7a','#c084fc','#f59e0b','#22d3ee','#ef4444'];
  const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[\s_\-()./]/g,'').trim();
  const aliases=new Map();CLUSTERS.forEach((c,i)=>c.areas.forEach(a=>aliases.set(norm(a),i)));
  function clusterFor(area){const n=norm(area);if(aliases.has(n))return aliases.get(n);const rules=[[/تجمع|رحاب|قاهرهجديده/,0],[/نصر|مصرالجديده|هليوبوليس|روكسي|نزهه|جسربسويس|زيتون/,1],[/عبور|شروق|مدينتي|بدر/,2],[/معادي|معادى|بساتين|دارالسلام|مصرالقديمه|سيدهنبين|مقطم/,3],[/حلوان|مايو|معصره|تبين/,4],[/اكتوبر|زايد|اهرام/,5],[/جيزه|فيصل|هرم|عمرانيه|ابوالنمرس/,6],[/شبرا|رمسيس|شعريه|بولاق|زاويه|قبه|اميريه|عينشمس|مطريه|نخل|خصوص|قليوب|خانكه/,7]];for(const [re,i] of rules)if(re.test(n))return i;return -1;}
  function ensureClusters(){const out=CLUSTERS.map(c=>({name:c.name,areas:c.areas.slice()}));const known=new Set(out.flatMap(c=>c.areas.map(norm)));(data||[]).forEach(r=>{if(!r.area)return;const i=clusterFor(r.area);if(i<0&&!known.has(norm(r.area))){known.add(norm(r.area));out.push({name:'Route '+(out.length+1)+' — '+r.area,areas:[r.area]});}});return out;}
  function rowsByCluster(){const cs=ensureClusters(),out=cs.map(()=>[]);(data||[]).forEach(r=>{let i=clusterFor(r.area);if(i<0)i=cs.findIndex(c=>c.areas.some(a=>norm(a)===norm(r.area)));if(i>=0)out[i].push(r);});return out.map((rs,i)=>[i,rs]).filter(([,rs])=>rs.length);}
  function addCourierButton(){if(document.getElementById('courierSheet'))return;const bar=document.querySelector('.bar');if(!bar)return;const b=document.createElement('button');b.id='courierSheet';b.className='btn secondary';b.textContent='🚚 شيت المندوب';b.title='تحميل شيت جاهز لمدير الحركة';b.onclick=downloadCourierSheet;bar.insertBefore(b,document.getElementById('refresh'));}
  function vehiclePlan(cbm){const caps=[{name:'Container',count:10,cap:77},{name:'Jumbo 6 m Fixed',count:10,cap:31.5},{name:'Jumbo 4 m Fixed',count:5,cap:20},{name:'Jumbo Owned',count:4,cap:18},{name:'Dababa Owned',count:18,cap:5.75},{name:'Dababa Fixed',count:16,cap:5}];let remaining=Math.max(0,Number(cbm)||0),vehicles=0,names=[];for(const v of caps){while(remaining>0.0001&&v.count>0){remaining-=v.cap;v.count--;vehicles++;names.push(v.name);if(remaining<=0.0001)break;}}if(remaining>0.0001){const maxCap=77;vehicles+=Math.ceil(remaining/maxCap);for(let i=0;i<Math.ceil(remaining/maxCap);i++)names.push('Container');remaining=0;}return {vehicles,names,remaining};}
  async function loadExcelJS(){if(window.ExcelJS)return window.ExcelJS;return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';s.onload=()=>resolve(window.ExcelJS);s.onerror=reject;document.head.appendChild(s);});}
  async function downloadCourierSheet(){
      const cs=ensureClusters();
      const grouped=rowsByCluster().map(([i,rs])=>({i,route:cs[i]?.name||('Route '+(i+1)),rows:rs.filter(r=>r.order)})).filter(x=>x.rows.length);
      if(!grouped.length){alert('لا توجد Orders متاحة حاليًا.');return;}
      try{
        const ExcelJS=await loadExcelJS();
        const wb=new ExcelJS.Workbook();
        wb.creator='2B Egypt';wb.created=new Date();wb.properties.title='2B Courier Dispatch Board';
        const ws=wb.addWorksheet('Courier Board',{views:[{rightToLeft:true,showGridLines:false,zoomScale:85}]});
        const cols=grouped.map(g=>g.route);
        ws.mergeCells(1,1,1,cols.length);
        ws.getCell(1,1).value='2B EGYPT  |  COURIER DISPATCH BOARD';
        ws.getCell(1,1).font={bold:true,size:16,color:{argb:'FFFFFFFF'}};
        ws.getCell(1,1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF111821'}};
        ws.getCell(1,1).alignment={horizontal:'center',vertical:'middle'};
        ws.getRow(1).height=30;
        ws.mergeCells(2,1,2,cols.length);
        ws.getCell(2,1).value='Manager: enter Courier Name only in the yellow cells  |  Orders and areas are generated automatically from current dashboard data';
        ws.getCell(2,1).font={italic:true,size:9,color:{argb:'FF667085'}};
        ws.getCell(2,1).alignment={horizontal:'center',vertical:'middle'};
        ws.getRow(2).height=22;
        cols.forEach((route,idx)=>{
          const c=idx+1;
          ws.getColumn(c).width=18;
          const h=ws.getCell(4,c);h.value=route.replace(/^Route\s*\d+\s*[—-]\s*/,'');
          h.font={bold:true,size:10,color:{argb:'FFFFFFFF'}};h.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFF7900'}};h.alignment={horizontal:'center',vertical:'middle',wrapText:true};
          h.border={top:{style:'thin',color:{argb:'FF222222'}},bottom:{style:'thin',color:{argb:'FF222222'}},left:{style:'thin',color:{argb:'FF222222'}},right:{style:'thin',color:{argb:'FF222222'}}};
          const input=ws.getCell(5,c);input.value='';input.font={bold:true,size:11,color:{argb:'FF9A4B00'}};input.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFF200'}};input.alignment={horizontal:'center',vertical:'middle'};input.protection={locked:false};
          input.border={top:{style:'thin',color:{argb:'FFD6A800'}},bottom:{style:'thin',color:{argb:'FFD6A800'}},left:{style:'thin',color:{argb:'FFD6A800'}},right:{style:'thin',color:{argb:'FFD6A800'}}};
        });
        ws.getRow(4).height=32;ws.getRow(5).height=28;
        const maxRows=Math.max(...grouped.map(g=>g.rows.length));
        for(let r=0;r<maxRows;r++){
          const row=ws.getRow(6+r);row.height=23;
          grouped.forEach((g,idx)=>{
            const cell=row.getCell(idx+1),rec=g.rows[r];
            if(rec){cell.value=String(rec.order)+(rec.area?'  |  '+String(rec.area):'');cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};cell.font={bold:true,size:10,color:{argb:'FF1F2937'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:(r%2?'FFF8FAFC':'FFFFFFFF')}};}
            cell.border={top:{style:'hair',color:{argb:'FFD9DEE5'}},bottom:{style:'hair',color:{argb:'FFD9DEE5'}},left:{style:'hair',color:{argb:'FFD9DEE5'}},right:{style:'hair',color:{argb:'FFD9DEE5'}}};
          });
        }
        const footer=6+maxRows;
        ws.mergeCells(footer,1,footer,cols.length);
        ws.getCell(footer,1).value='Yellow cells = Courier Name input  •  White rows = Orders  •  2B Last Mile Operations';
        ws.getCell(footer,1).font={bold:true,size:9,color:{argb:'FF667085'}};ws.getCell(footer,1).alignment={horizontal:'center',vertical:'middle'};ws.getRow(footer).height=22;
        ws.freezePanes={xSplit:0,ySplit:5};
        ws.autoFilter={from:{row:4,column:1},to:{row:5,column:cols.length}};
        ws.pageSetup={orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:1,paperSize:9,printArea:`A1:${String.fromCharCode(64+Math.min(cols.length,26))}${footer}`,margins:{left:0.15,right:0.15,top:0.25,bottom:0.25,header:0.1,footer:0.1},horizontalDpi:300,verticalDpi:300};
        ws.headerFooter={oddHeader:'&C&"Arial,Bold"2B EGYPT - COURIER DISPATCH',oddFooter:'&CPage &P of &N'};
        await ws.protect('2B-Courier',{selectLockedCells:false,selectUnlockedCells:true});
        const buf=await wb.xlsx.writeBuffer();
        const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='2B_Courier_Dispatch_Board.xlsx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
      }catch(e){console.error('Courier Board ExcelJS failed',e);alert('تعذر إنشاء شيت المندوب بالشكل الاحترافي.');}
    }
  function renderGeo(){const cs=ensureClusters(),zr=rowsByCluster(),am=new Map();(data||[]).forEach(r=>{if(!am.has(r.area))am.set(r.area,new Set());if(r.order)am.get(r.area).add(r.order);});const groups=zr.map(([i,rs])=>{const areaMap=new Map();rs.forEach(r=>{const a=String(r.area||'').trim();if(!a)return;if(!areaMap.has(a))areaMap.set(a,new Set());if(r.order)areaMap.get(a).add(r.order);});const areas=[...areaMap].map(([a,s])=>[a,s.size]);const orders=new Set(rs.map(r=>r.order).filter(Boolean));const qty=rs.reduce((s,r)=>s+r.qty,0),cbm=rs.reduce((s,r)=>s+r.cbm,0);return{i,rs,areas,orders:orders.size,qty,cbm,vehicles:vehiclePlan(cbm)};});const totalCBM=(data||[]).reduce((s,r)=>s+r.cbm,0);$('ko').textContent=new Set((data||[]).map(r=>r.order).filter(Boolean)).size;$('ks').textContent=new Set((data||[]).map(r=>r.sku).filter(Boolean)).size;$('kq').textContent=(data||[]).reduce((s,r)=>s+r.qty,0);$('kz').textContent=new Set((data||[]).map(r=>N(r.area)).filter(Boolean)).size;const fleetVehicles=vehiclePlan(totalCBM).vehicles; $('kv').textContent=fleetVehicles>0?fleetVehicles:(data&&data.length?Math.max(1,groups.length):0);const mx=Math.max(1,...groups.flatMap(c=>c.areas.map(x=>x[1])));$('rank').innerHTML=groups.map(c=>`<div style="margin:14px 0 18px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px"><b style="color:#ff7900">${E(cs[c.i].name)}</b><span class="chip">${c.orders} Orders · ${c.qty} QTY</span></div>${c.areas.sort((a,b)=>b[1]-a[1]).map(x=>`<div class="area"><div>${E(x[0])}</div><div class="bg"><div class="fill" style="width:${x[1]/mx*100}%"></div></div><b>${x[1]}</b></div>`).join('')}</div>`).join('')||'<div class="empty">لا توجد بيانات</div>';$('zones').innerHTML=groups.map(c=>`<div class="zone"><div><span class="zn">${c.i+1}</span><b>${E(cs[c.i].name)}</b></div><div class="muted">Areas: ${c.areas.length} · Orders: ${c.orders} · QTY: ${c.qty} · CBM: ${c.cbm.toFixed(3)}</div><div class="chip">🚚 ${c.vehicles.vehicles||0} vehicle${c.vehicles.vehicles!==1?'s':''}</div></div>`).join('')||'<div class="empty">لا توجد mapped zones</div>';$('routes').innerHTML=groups.map(c=>{const u=uniqueOrders(c.rs);return`<div class="route"><div class="routeTop"><span class="rn">${c.i+1}</span><div><b>${E(cs[c.i].name)}</b><div class="muted">${c.orders} Orders · ${c.qty} QTY · ${c.cbm.toFixed(3)} CBM</div></div><div class="vehicle">🚚 ${c.vehicles.names.join(' + ')||'No vehicle'}</div></div>${u.map((r,j)=>`<div class="stop"><span class="stopno">${j+1}</span><b>${E(r.order)}</b> · ${E(r.customer)} · ${E(r.area)} · ${E(r.address)}</div>`).join('')}</div>`}).join('')||'<div class="empty">لا توجد Routes</div>';(data||[]).forEach(r=>{const i=clusterFor(r.area);r.route=i>=0?cs[i].name:'Route — '+r.area;});renderDetails();drawGeoMap(groups,cs);if($('status')&&data.length)$('status').textContent='تم تحميل الداتا وتطبيق Geographic Clustering ✓';}
  function drawGeoMap(groups,cs){try{if(!map){map=L.map('map').setView([30.03,31.25],9);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);}layer.forEach(x=>x.remove());layer=[];const all=[L.latLng(DEPOTS.W100.lat,DEPOTS.W100.lng)];layer.push(L.marker(all[0]).addTo(map).bindPopup('<b>W100 · Warehouse 1</b><br>Start Depot'));groups.forEach(c=>{const pts=[L.latLng(DEPOTS.W100.lat,DEPOTS.W100.lng)];const center=CENTERS[c.i]||[30.03,31.25];uniqueOrders(c.rs).forEach((r,j)=>{const lat=r.lat>20&&r.lat<35?r.lat:center[0],lng=r.lng>20&&r.lng<40?r.lng:center[1],p=L.latLng(lat,lng);pts.push(p);all.push(p);layer.push(L.marker(p).addTo(map).bindPopup(`<b>${E(cs[c.i].name)}</b><br>Stop: ${j+1}<br>Order: ${E(r.order)}<br>Customer: ${E(r.customer)}<br>Area: ${E(r.area)}<br>Phone: ${E(r.phone)}`));});if(pts.length>1)layer.push(L.polyline(pts,{weight:4,color:COLORS[c.i]||'#ff7900'}).addTo(map));});if(all.length>1)map.fitBounds(L.latLngBounds(all),{padding:[20,20]});setTimeout(()=>map.invalidateSize(),150);}catch(e){console.error('Geo map failed',e);}}
  function install(){try{if(typeof render!=='function'||typeof loadBuf!=='function'||typeof XLSX==='undefined'||typeof L==='undefined')return setTimeout(install,250);const originalLoadBuf=loadBuf;render=renderGeo;loadBuf=async function(buf){await originalLoadBuf(buf);renderGeo();};addCourierButton();if(data&&data.length)renderGeo();}catch(e){console.error('Geo clustering install failed',e);}}
  install();
})();