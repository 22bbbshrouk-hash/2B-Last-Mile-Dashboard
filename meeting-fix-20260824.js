(function(){
  function patch(){
    try{
      var f=document.getElementById('dash');
      var d=f&&f.contentDocument,w=f&&f.contentWindow;
      if(!d||!w||!Array.isArray(w.data)||!w.data.length)return false;
      var acRe=/\bac\b|air\s*condition|تكييف/i;
      var acTotal=w.data.reduce(function(s,x){return s+(acRe.test(String(x.product||''))?(Number(x.qty)||1):0);},0);
      var kv=d.getElementById('kVehicles');if(kv)kv.textContent=String(Math.ceil(acTotal/13));
      d.querySelectorAll('.routeCard').forEach(function(card){
        var title=card.querySelector('.routeTitle'),badge=card.querySelector('.vehicle');if(!title||!badge)return;
        var z=title.textContent.replace(/^.*?—\s*/,'').trim();
        var ac=w.data.reduce(function(s,x){return String(x.zone||'').trim()===z&&acRe.test(String(x.product||''))?s+(Number(x.qty)||1):s;},0);
        var cars=Math.ceil(ac/13);badge.textContent=cars?'🚚 '+cars+' Vehicle'+(cars>1?'s':''):'';badge.style.display=cars?'':'none';
      });
      var old=d.getElementById('map');if(!old||!w.L||!w.COORD)return true;
      var mapEl=old.cloneNode(false);old.parentNode.replaceChild(mapEl,old);
      var map=w.L.map(mapEl,{scrollWheelZoom:true,zoomControl:true,attributionControl:true}).setView([30.02,31.25],10);
      w.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
      function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
      var seen=new Set(),bounds=[],stop=0;
      w.data.forEach(function(x){var c=w.COORD[x.area];if(!c)return;var k=String(x.order||'')+'|'+String(x.area||'');if(seen.has(k))return;seen.add(k);stop++;bounds.push(c);var icon=w.L.divIcon({className:'',html:'<div style="width:28px;height:28px;border-radius:50%;background:#ff7900;color:#111;border:3px solid #fff;box-shadow:0 2px 8px #0008;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px">'+stop+'</div>',iconSize:[28,28],iconAnchor:[14,14]});var pop='<div dir="rtl" style="min-width:210px"><b style="color:#ff7900">2B STOP #'+stop+'</b><br><b>Order:</b> '+esc(x.order)+'<br><b>Area:</b> '+esc(x.area)+'<br><b>Address:</b> '+esc(x.address||'—')+'<br><b>Product:</b> '+esc(x.product||'—')+'</div>';w.L.marker(c,{icon:icon}).addTo(map).bindPopup(pop);});
      (w.ROUTES||[]).forEach(function(r,idx){var pts=r[1].map(function(a){return w.COORD[a];}).filter(Boolean);if(pts.length>1)w.L.polyline(pts,{color:(w.COLORS||[])[idx%((w.COLORS||[]).length||1)]||'#ff7900',weight:4,opacity:.75}).addTo(map);});
      var wh=w.COORD['15 مايو']||[29.86,31.37],whIcon=w.L.divIcon({className:'',html:'<div style="width:40px;height:40px;border-radius:10px;background:#07090d;border:3px solid #ff7900;color:#ff7900;display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:14px;box-shadow:0 2px 10px #0008">2B</div>',iconSize:[40,40],iconAnchor:[20,20]});w.L.marker(wh,{icon:whIcon}).addTo(map).bindPopup('<b>📍 Vehicle Warehouse</b><br>15 مايو — عند أول سور مدينة الأبطال وبجوار المدرسة اليابانية.');bounds.push(wh);
      if(bounds.length)map.fitBounds(bounds,{padding:[30,30]});setTimeout(function(){map.invalidateSize(true);},300);
      mapEl.dataset.meetingFixed='1';return true;
    }catch(e){console.error('meeting fix',e);return false;}
  }
  var tries=0,t=setInterval(function(){if(patch()||++tries>240)clearInterval(t);},500);
})();
