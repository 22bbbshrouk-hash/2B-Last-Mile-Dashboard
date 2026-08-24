(function(){
  function patch(){
    try{
      var f=document.getElementById('dash');var d=f&&f.contentDocument,w=f&&f.contentWindow;
      if(!d||!w||!Array.isArray(w.data)||!w.data.length)return false;
      var brand=d.querySelector('.brand');
      if(brand&&!brand.querySelector('.logo')){var logo=d.createElement('div');logo.className='logo';logo.textContent='2B';brand.insertBefore(logo,brand.firstChild);}
      var acRe=/\bac\b|air\s*condition|تكييف/i,qty=function(x){return Number(x.qty)||1;};
      var acTotal=w.data.reduce(function(s,x){return s+(acRe.test(String(x.product||''))?qty(x):0);},0),totalVehicles=Math.ceil(acTotal/13);
      var kv=d.getElementById('kVehicles');if(kv)kv.innerHTML=totalVehicles+'<div style="font-size:10px;color:#8793a3;margin-top:4px;font-weight:700">'+acTotal+' AC / 13 AC لكل عربية</div>';
      d.querySelectorAll('.routeCard').forEach(function(card){var title=card.querySelector('.routeTitle'),badge=card.querySelector('.vehicle');if(!title||!badge)return;var z=title.textContent.replace(/^.*?—\s*/,'').trim();var ac=w.data.reduce(function(s,x){return String(x.zone||'').trim()===z&&acRe.test(String(x.product||''))?s+qty(x):s;},0),cars=Math.ceil(ac/13);badge.textContent=cars?'🚚 '+cars+' Vehicle'+(cars>1?'s':'')+' · '+ac+' AC':'';badge.style.display=cars?'':'none';});
      var mapEl=d.getElementById('map');if(!mapEl||!w.L||!w.COORD)return true;if(mapEl.dataset.fixedMap==='1')return true;mapEl.dataset.fixedMap='1';mapEl.innerHTML='';
      var map=w.L.map(mapEl,{scrollWheelZoom:true,zoomControl:true}).setView([30.02,31.25],10);w.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:19}).addTo(map);
      function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
      function routeIndex(area){for(var i=0;i<(w.ROUTES||[]).length;i++)if((w.ROUTES[i][1]||[]).some(function(a){return String(a).trim()===String(area||'').trim();}))return i;return -1;}
      var groups=new Map();w.data.forEach(function(x){var c=w.COORD[x.area];if(!c)return;var k=String(x.order||'').trim()+'|'+String(x.area||'').trim();if(!groups.has(k))groups.set(k,x);});
      var bounds=[],i=0;groups.forEach(function(x){var c=w.COORD[x.area];i++;bounds.push(c);var ri=routeIndex(x.area),color=(w.COLORS||[])[ri%((w.COLORS||[]).length||1)]||'#ff7900';var icon=w.L.divIcon({className:'',html:'<div style="width:30px;height:30px;border-radius:50%;background:'+color+';color:#111;border:2px solid #fff;box-shadow:0 2px 7px #777;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px">'+i+'</div>',iconSize:[30,30],iconAnchor:[15,15]});var popup='<div dir="rtl" style="min-width:230px;font-family:Arial,sans-serif"><b style="color:'+color+'">2B STOP #'+i+'</b><br><b>Order:</b> '+esc(x.order)+'<br><b>Area:</b> '+esc(x.area)+'<br><b>Address:</b> '+esc(x.address||'—')+'<br><b>Product:</b> '+esc(x.product||'—')+'</div>';w.L.marker(c,{icon:icon}).addTo(map).bindPopup(popup);});
      (w.ROUTES||[]).forEach(function(r,idx){var pts=r[1].map(function(a){return w.COORD[a];}).filter(Boolean);if(pts.length>1)w.L.polyline(pts,{color:(w.COLORS||[])[idx%((w.COLORS||[]).length||1)]||'#ff7900',weight:4,opacity:.8}).addTo(map);});
      var wh=w.COORD['15 مايو']||[29.86,31.37],whIcon=w.L.divIcon({className:'',html:'<div style="width:44px;height:38px;border-radius:10px;background:#fff;border:3px solid #ff7900;color:#111;display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:18px;box-shadow:0 2px 8px #888">🚚</div>',iconSize:[44,38],iconAnchor:[22,19]});w.L.marker(wh,{icon:whIcon}).addTo(map).bindPopup('<b>📍 2B Vehicle Warehouse</b><br>15 مايو — عند أول سور مدينة الأبطال وبجوار المدرسة اليابانية.');bounds.push(wh);
      if(bounds.length)map.fitBounds(bounds,{padding:[30,30],maxZoom:12});setTimeout(function(){map.invalidateSize(true);},300);return true;
    }catch(e){console.error('meeting patch',e);return false;}
  }
  var tries=0,t=setInterval(function(){if(patch()||++tries>180)clearInterval(t);},500);
})();
