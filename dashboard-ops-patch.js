(function(){
const S='https://22bbbshrouk-hash.github.io/2B-Last-Mile-Dashboard/';
const XLSX_URL='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
const SUPA='https://wihopmnjpsfsgujugyzl.supabase.co';
const UPLOAD=SUPA+'/functions/v1/upload-dashboard';
function status(t){const e=document.getElementById('status');if(e)e.textContent=t}
function loadXLSX(){return new Promise((resolve,reject)=>{if(window.XLSX)return resolve();const s=document.createElement('script');s.src=XLSX_URL;s.onload=()=>window.XLSX?resolve():reject(new Error('XLSX library failed to initialize'));s.onerror=()=>reject(new Error('Could not load Excel library'));document.head.appendChild(s)})}
async function readLocal(file){await loadXLSX();const b=await file.arrayBuffer();const wb=XLSX.read(b,{type:'array',cellDates:true});const ws=wb.Sheets[wb.SheetNames[0]];const rows=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false});if(!rows.length)throw new Error('Excel sheet is empty');if(typeof window.__dashboardLoadRows==='function')return window.__dashboardLoadRows(rows);if(typeof window.loadRows==='function')return window.loadRows(rows);throw new Error('Dashboard row loader was not found')}
function patch(){const input=document.getElementById('file');if(!input||input.dataset.fixed==='1')return;input.dataset.fixed='1';input.onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{status('جاري قراءة الشيت...');await readLocal(file);status('جاري رفع شيت اليوم...');const f=new FormData();f.append('file',file,file.name);const r=await fetch(UPLOAD,{method:'POST',body:f,cache:'no-store'});const tx=await r.text();let j={};try{j=JSON.parse(tx)}catch{}if(!r.ok||j.ok===false)throw new Error(j.error||tx||'Upload failed');status('تم رفع الشيت وتحديث الداشبورد ✓');}catch(err){console.error(err);status('فشل: '+(err.message||err));alert('فشل رفع/قراءة الملف:\n'+(err.message||err))}finally{input.value=''}}}
function boot(){loadXLSX().then(()=>status('جاهز — اختاري الشيت')).catch(e=>{console.error(e);status('خطأ في تحميل مكتبة Excel')});patch()}
setTimeout(boot,200);setTimeout(patch,1200);setTimeout(patch,3000);
})();
