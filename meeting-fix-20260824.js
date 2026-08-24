(function(){
  function patch(){
    try{
      var f=document.getElementById('dash');
      var d=f&&f.contentDocument;
      if(!d) return false;
      var w=f.contentWindow;
      if(!w || !w.data || !Array.isArray(w.data) || !w.data.length) return false;
      var brand=d.querySelector('.brand');
      if(brand && !brand.querySelector('.logo')){var logo=d.createElement('div');logo.className='logo';logo.textContent='2B';brand.insertBefore(logo,brand.firstChild);}
      var acRe=/\bac\b|air\s*condition|تكييف/i;
      var acTotal=w.data.filter(function(x){return x&&acRe.test(String(x.product||''));}).reduce(function(s,x){return s+(Number(x.qty)||1);},0);
      var kv=d.getElementById('kVehicles');if(kv)kv.textContent=Math.ceil(acTotal/13);
      d.querySelectorAll('.routeCard').forEach(function(card){var title=card.querySelector('.routeTitle'),badge=card.querySelector('.vehicle');if(!title||!badge)return;var z=title.textContent.replace(/^.*?—\s*/,'').trim();var rows=w.data.filter(function(x){return String(x.zone||'').trim()===z&&acRe.test(String(x.product||''));});var ac=rows.reduce(function(s,x){return s+(Number(x.qty)||1);},0);var cars=Math.ceil(ac/13);badge.textContent=cars?'🚚 '+cars+' Vehicle'+(cars>1?'s':''):'';badge.style.display=cars?'':'none';});
      var mapEl=d.getElementById('map');if(!mapEl||!w.L||!w.COORD)return true;if(mapEl.dataset.fixedMap==='1')return true;mapEl.dataset.fixedMap='1';mapEl.innerHTML='';if(mapEl._leaflet_id)delete mapEl._leaflet_id;
      var map=w.L.map(mapEl,{scrollWheelZoom:true,zoomControl:true}).setView([30.02,31.25],10);w.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:19}).addTo(map);
      var groups=new Map();w.data.forEach(function(x){var c=w.COORD[x.area];if(!c)return;var k=String(x.order||'').trim()+'|'+String(x.area||'').trim();if(!groups.has(k))groups.set(k,x);});
      var bounds=[],i=0;groups.forEach(function(x){var c=w.COORD[x.area];i++;bounds.push(c);var icon=w.L.divIcon({className:'',html:'<div style="width:30px;height:30px;border-radius:50%;background:#ff7900;color:#111;border:3px solid #fff;box-shadow:0 2px 8px #0008;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px">'+i+'</div>',iconSize:[30,30],iconAnchor:[15,15]});var popup='<div dir="rtl" style="min-width:190px"><b style="color:#ff7900">2B STOP #'+i+'</b><br><b>Order:</b> '+esc(x.order)+'<br><b>Area:</b> '+esc(x.area)+'<br><b>Address:</b> '+esc(x.address||'—')+'<br><b>Product:</b> '+esc(x.product||'—')+'</div>';w.L.marker(c,{icon:icon}).addTo(map).bindPopup(popup);});
      var routeIdx=0;(w.ROUTES||[]).forEach(function(r){var pts=r[1].map(function(a){return w.COORD[a];}).filter(Boolean);if(pts.length<2)return;var color=(w.COLORS||[])[routeIdx%(w.COLORS||[]).length]||'#ff7900';routeIdx++;w.L.polyline(pts,{color:color,weight:4,opacity:.75}).addTo(map);});
      var wh=w.COORD['15 مايو']||[29.86,31.37];var whIcon=w.L.divIcon({className:'',html:'<div style="width:38px;height:38px;border-radius:10px;background:#07090d;border:3px solid #ff7900;color:#ff7900;display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:14px;box-shadow:0 2px 10px #0008">2B</div>',iconSize:[38,38],iconAnchor:[19,19]});w.L.marker(wh,{icon:whIcon}).addTo(map).bindPopup('<b>📍 Vehicle Warehouse</b><br>15 مايو — عند أول سور مدينة الأبطال وبجوار المدرسة اليابانية.');bounds.push(wh);if(bounds.length)map.fitBounds(bounds,{padding:[25,25]});setTimeout(function(){map.invalidateSize();},200);
      function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}return true;
    }catch(e){console.error('meeting patch',e);return false;}
  }
  var tries=0,t=setInterval(function(){if(patch()||++tries>180)clearInterval(t);},500);
})();
