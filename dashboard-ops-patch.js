(function(){
const SUPA='https://wihopmnjpsfsgujugyzl.supabase.co';
const UPLOAD=SUPA+'/functions/v1/upload-dashboard';
function st(t){const e=document.getElementById('status');if(e)e.textContent=t}
function resetMapContainer(){
  const el=document.getElementById('map');
  if(!el)return;
  // Leaflet marks the DOM node with _leaflet_id. The dashboard's own loadBuf()
  // creates the map again after an upload, so remove the old DOM/map marker first.
  try{
    if(el._leaflet_id){
      el.innerHTML='';
      delete el._leaflet_id;
    }
  }catch(_){el.innerHTML='';try{delete el._leaflet_id}catch(__){}}
}
function upload(){
  const input=document.getElementById('file');
  if(!input||input.dataset.patch==='1')return;
  input.dataset.patch='1';
  input.onchange=async e=>{
    const f=e.target.files&&e.target.files[0];
    if(!f)return;
    try{
      st('جاري رفع شيت اليوم...');
      const body=new FormData();
      body.append('file',f,f.name);
      const r=await fetch(UPLOAD,{method:'POST',body,cache:'no-store'});
      const tx=await r.text();
      let j={};try{j=JSON.parse(tx)}catch(_){ }
      if(!r.ok||j.ok===false)throw Error(j.error||tx||('HTTP '+r.status));
      st('جاري تحديث الداشبورد...');
      resetMapContainer();
      if(typeof loadBuf!=='function')throw Error('Excel loader unavailable');
      await loadBuf(await f.arrayBuffer());
      // Let the dashboard renderer own all KPIs, zones, routes and map.
      // No second map initialization is performed here.
      st('تم رفع الشيت وتحديث الداشبورد ✓');
    }catch(e){
      console.error('Upload/read failed:',e);
      st('فشل رفع/قراءة الملف');
      alert('فشل رفع/قراءة الملف:\n'+(e.message||e));
    }finally{input.value=''}
  };
}
setTimeout(upload,300);
})();
