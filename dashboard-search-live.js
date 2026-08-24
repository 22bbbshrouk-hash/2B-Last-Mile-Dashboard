// Live Search: Order / AREA / PRODUCT / SKU — driven by the dashboard's uploaded Excel data.
(function(){
  'use strict';
  var allData=[];
  var lastDataRef=null;
  var ids={area:'twoBArea',product:'twoBProduct',sku:'twoBSku',order:'twoBOrder',btn:'twoBSearchBtn'};
  var normText=function(v){return String(v==null?'':v).normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/\s+/g,' ').trim()};
  var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])})};
  function uniqueValues(rows,field){var m=new Map();rows.forEach(function(r){var v=String(r[field]==null?'':r[field]).trim();if(v)m.set(normText(v),v)});return Array.from(m.values()).sort(function(a,b){return a.localeCompare(b,'ar')})}
  function getBox(){return document.getElementById('twoBSearchBox')}
  function selected(id){var e=document.getElementById(id);return e?e.value:''}
  function matchingRows(ignoreField){
    var a=selected(ids.area),p=selected(ids.product),s=selected(ids.sku),o=normText(selected(ids.order));
    return allData.filter(function(r){
      if(ignoreField!=='area'&&a&&normText(r.area)!==normText(a))return false;
      if(ignoreField!=='product'&&p&&normText(r.product)!==normText(p))return false;
      if(ignoreField!=='sku'&&s&&normText(r.sku)!==normText(s))return false;
      if(ignoreField!=='order'&&o&&normText(r.order).indexOf(o)===-1)return false;
      return true;
    });
  }
  function fillSelect(id,values,current){
    var el=document.getElementById(id);if(!el)return;
    el.innerHTML='<option value="">الكل</option>'+values.map(function(v){return '<option value="'+esc(v)+'">'+esc(v)+'</option>'}).join('');
    if(current&&values.some(function(v){return normText(v)===normText(current)}))el.value=current;
  }
  function refreshOptions(){
    if(!allData.length)return;
    var av=selected(ids.area),pv=selected(ids.product),sv=selected(ids.sku),ov=selected(ids.order);
    fillSelect(ids.area,uniqueValues(matchingRows('area'),'area'),av);
    fillSelect(ids.product,uniqueValues(matchingRows('product'),'product'),pv);
    fillSelect(ids.sku,uniqueValues(matchingRows('sku'),'sku'),sv);
    var orderEl=document.getElementById(ids.order);if(orderEl)orderEl.value=ov;
  }
  function apply(){
    if(!allData.length)return;
    var a=selected(ids.area),p=selected(ids.product),s=selected(ids.sku),o=normText(selected(ids.order));
    data=allData.filter(function(r){
      return (!a||normText(r.area)===normText(a))&&(!p||normText(r.product)===normText(p))&&(!s||normText(r.sku)===normText(s))&&(!o||normText(r.order).indexOf(o)!==-1);
    });
    render();
    var box=getBox();if(box){var count=document.getElementById('twoBSearchCount');if(count)count.textContent=data.length+' نتيجة';}
    refreshOptions();
  }
  function build(){
    if(document.getElementById('twoBSearchBox'))return true;
    var grid=document.querySelector('.grid');
    if(!grid||!grid.firstElementChild)return false;
    var sec=document.createElement('section');sec.id='twoBSearchBox';sec.className='card full';
    sec.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><h2>🔎 بحث وتصفية</h2><div class="sub">ابحثي في نفس الداتا المرفوعة من Upload Daily Excel.</div></div><span id="twoBSearchCount" class="muted"></span></div><div style="display:grid;grid-template-columns:1.15fr 1fr 1fr 1fr auto;gap:9px;margin-top:10px;align-items:end"><label style="font-size:10px;color:#8793a3">📦 رقم الأوردر<input id="twoBOrder" type="search" placeholder="اكتبي رقم الأوردر" style="box-sizing:border-box;width:100%;margin-top:5px;padding:10px 11px;border-radius:9px;border:1px solid #34404d;background:#0c1117;color:#fff;outline:none"></label><label style="font-size:10px;color:#8793a3">📍 AREA<select id="twoBArea" style="box-sizing:border-box;width:100%;margin-top:5px;padding:10px 11px;border-radius:9px;border:1px solid #34404d;background:#0c1117;color:#fff;outline:none"><option value="">الكل</option></select></label><label style="font-size:10px;color:#8793a3">🛍️ PRODUCT<select id="twoBProduct" style="box-sizing:border-box;width:100%;margin-top:5px;padding:10px 11px;border-radius:9px;border:1px solid #34404d;background:#0c1117;color:#fff;outline:none"><option value="">الكل</option></select></label><label style="font-size:10px;color:#8793a3">🏷️ SKU<select id="twoBSku" style="box-sizing:border-box;width:100%;margin-top:5px;padding:10px 11px;border-radius:9px;border:1px solid #34404d;background:#0c1117;color:#fff;outline:none"><option value="">الكل</option></select></label><button id="twoBSearchBtn" class="btn" type="button">بحث</button></div><style>@media(max-width:900px){#twoBSearchBox>div:nth-child(2){grid-template-columns:1fr 1fr!important}#twoBSearchBtn{width:100%}}</style>';
    grid.insertBefore(sec,grid.firstElementChild);
    ['twoBArea','twoBProduct','twoBSku'].forEach(function(id){document.getElementById(id).addEventListener('change',function(){refreshOptions();apply()})});
    document.getElementById('twoBOrder').addEventListener('input',function(){apply()});
    document.getElementById('twoBSearchBtn').addEventListener('click',apply);
    return true;
  }
  function sync(){
    if(!build())return;
    if(typeof data==='undefined'||!Array.isArray(data))return;
    if(data!==lastDataRef){lastDataRef=data;allData=data.slice();refreshOptions();}
  }
  var tries=0;
  var timer=setInterval(function(){sync();if(++tries>240)clearInterval(timer)},500);
  sync();
})();