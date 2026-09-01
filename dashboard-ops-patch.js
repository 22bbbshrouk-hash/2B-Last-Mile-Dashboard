(function(){
const SUPA='https://wihopmnjpsfsgujugyzl.supabase.co';
const UPLOAD=SUPA+'/functions/v1/upload-dashboard';
const XLSX_FALLBACK='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
function st(t){const e=document.getElementById('status');if(e)e.textContent=t}
function ensureXLSX(){
  return new Promise((resolve,reject)=>{
    if(window.XLSX && typeof window.XLSX.read==='function') return resolve();
    const old=document.querySelector('script[data-xlsx-fallback]');
    if(old){old.addEventListener('load',()=>window.XLSX?resolve():reject(new Error('XLSX failed to initialize')));old.addEventListener('error',()=>reject(new Error('Excel library failed to load')));return;}
    const s=document.createElement('script');
    s.src=XLSX_FALLBACK;
    s.async=false;
    s.dataset.xlsxFallback='1';
    s.onload=()=>window.XLSX&&typeof window.XLSX.read==='function'?resolve():reject(new Error('XLSX failed to initialize'));
    s.onerror=()=>reject(new Error('Excel library failed to load'));
    document.head.appendChild(s);
  });
}
function resetMapContainer(){
  const el=document.getElementById('map');
  if(!el)return;
  try{if(el._leaflet_id){el.innerHTML='';delete el._leaflet_id}}catch(_){el.innerHTML='';try{delete el._leaflet_id}catch(__){}}
}
function upload(){
  const input=document.getElementById('file');
  if(!input||input.dataset.patch==='1')return;
  input.dataset.patch='1';
  input.onchange=async e=>{
    const f=e.target.files&&e.target.files[0];
    if(!f)return;
    try{
      st('جاري تجهيز قارئ Excel...');
      await ensureXLSX();
      st('جاري رفع شيت اليوم...');
      const body=new FormData();body.append('file',f,f.name);
      const r=await fetch(UPLOAD,{method:'POST',body,cache:'no-store'});
      const tx=await r.text();let j={};try{j=JSON.parse(tx)}catch(_){ }
      if(!r.ok||j.ok===false)throw Error(j.error||tx||('HTTP '+r.status));
      st('جاري تحديث الداشبورد...');
      resetMapContainer();
      if(typeof loadBuf!=='function')throw Error('Excel loader unavailable');
      await loadBuf(await f.arrayBuffer());
      st('تم رفع الشيت وتحديث الداشبورد ✓');
    }catch(e){console.error('Upload/read failed:',e);st('فشل رفع/قراءة الملف');alert('فشل رفع/قراءة الملف:\n'+(e.message||e));}
    finally{input.value=''}
  };
}
async function boot(){
  try{await ensureXLSX();}catch(e){console.error('Excel library fallback failed:',e);}
  upload();
}
setTimeout(boot,300);
})();
