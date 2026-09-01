(function(){
  const fleet=[['Dababa Owned',18,5.75,0.167,0],['Jumbo Owned',4,18,0.5038,0],['Dababa Fixed',16,5,8.85993,1599],['Jumbo 4 m Fixed',5,20,14.23344,2658],['Jumbo 6 m Fixed',10,31.5,14.714,3500],['Container',10,77,27.1529,3615]];
  const SUPABASE='https://wihopmnjpsfsgujugyzl.supabase.co';
  const DATA_URL=SUPABASE+'/functions/v1/upload-dashboard';
  const XLSX_URL='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function ensureXLSX(){
    if(window.XLSX) return Promise.resolve();
    if(window.__xlsxLoader) return window.__xlsxLoader;
    window.__xlsxLoader=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=XLSX_URL+'?v=1';
      script.onload=()=>window.XLSX?resolve():reject(new Error('XLSX library loaded but global XLSX is missing'));
      script.onerror=()=>reject(new Error('Could not load Excel parser from CDN'));
      document.head.appendChild(script);
    });
    return window.__xlsxLoader;
  }

  async function loadLatest(){
    const status=document.getElementById('status');
    try{
      if(status) status.textContent='جاري تحميل آخر شيت من السيرفر...';
      await ensureXLSX();
      const r=await fetch(DATA_URL+'?v='+Date.now(),{method:'GET',cache:'no-store'});
      if(!r.ok) throw new Error((await r.text())||('HTTP '+r.status));
      const buf=await r.arrayBuffer();
      if(typeof loadBuf!=='function') throw new Error('Dashboard data loader is unavailable');
      await loadBuf(buf);
      if(status) status.textContent='تم تحميل آخر شيت ✓';
      return true;
    }catch(e){
      console.error('Live Excel load failed:',e);
      if(status) status.textContent='تعذر تحميل آخر شيت — استخدمي Upload Daily Excel';
      return false;
    }
  }

  function patchUpload(){
    const input=document.getElementById('file');
    if(!input||input.dataset.fixedUpload==='1') return;
    input.dataset.fixedUpload='1';
    input.onchange=async function(e){
      const file=e.target.files&&e.target.files[0];
      if(!file) return;
      const status=document.getElementById('status');
      try{
        if(status) status.textContent='جاري رفع شيت اليوم...';
        await ensureXLSX();
        const form=new FormData();
        form.append('file',file,file.name);
        const r=await fetch(DATA_URL,{method:'POST',body:form,cache:'no-store'});
        const text=await r.text();
        let result={};
        try{result=JSON.parse(text||'{}')}catch{}
        if(!r.ok||!result.ok) throw new Error(result.error||text||('HTTP '+r.status));
        const localBuf=await file.arrayBuffer();
        if(typeof loadBuf!=='function') throw new Error('Dashboard data loader is unavailable');
        await loadBuf(localBuf);
        if(status) status.textContent=`تم رفع الشيت وتحديث الداشبورد ✓ (${file.name})`;
      }catch(e){
        console.error('Excel upload failed:',e);
        alert('فشل رفع الملف:\n'+(e.message||e));
        if(status) status.textContent='مشكلة في رفع الملف — حاولي مرة أخرى';
      }finally{input.value=''}
    };
  }

  function patch(){
    const s=document.createElement('style');s.id='opsPatchStyle';
    s.textContent=`.search{gap:6px!important}.field{gap:3px!important}.field input,.field select{padding:6px 8px!important;height:32px!important;font-size:11px!important}.actions .btn{padding:7px 11px!important;height:32px!important}.field label{font-size:9px!important}.fleet-panel{margin:12px 0;padding:13px;border:1px solid #293542;border-radius:14px;background:#10161ef7}.fleet-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}.fleet-item{border:1px solid #293542;background:#0c1117;border-radius:9px;padding:9px}.fleet-name{font-size:10px;font-weight:900}.fleet-meta{font-size:9px;color:#8d99a8;margin-top:5px;line-height:1.5}.fleet-cap{color:#4bd7a2;font-weight:900}.data-required{color:#ffb477!important}@media(max-width:1000px){.fleet-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:600px){.fleet-grid{grid-template-columns:repeat(2,1fr)}}`;
    if(!document.getElementById('opsPatchStyle')) document.head.appendChild(s);
    const cards=document.querySelector('.cards');
    if(cards&&!document.querySelector('.fleet-panel')){
      const p=document.createElement('section');p.className='fleet-panel';
      p.innerHTML='<h2>Fleet Reference</h2><div class="sub">Capacity / Cost per KM / Fixed Cost من بيانات الأسطول المعتمدة. Vehicles Needed لا تُعرض كرقم عند غياب CBM فعلي للـSKU.</div><div class="fleet-grid">'+fleet.map(x=>`<div class="fleet-item"><div class="fleet-name">${esc(x[0])}</div><div class="fleet-meta"><span class="fleet-cap">${x[2]} CBM</span> · ${x[1]} trucks<br>Cost/KM: ${x[3]} · Fixed: ${x[4]?x[4]+' EGP':'—'}</div></div>`).join('')+'</div>';
      cards.parentNode.insertBefore(p,cards.nextSibling);
    }
    patchUpload();
    loadLatest();
  }
  setTimeout(patch,100);setTimeout(patch,1200);setTimeout(patch,3000);
})();
