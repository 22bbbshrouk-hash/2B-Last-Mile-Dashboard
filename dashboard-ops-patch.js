(function(){
  const fleet=[
    ['Dababa Owned',18,5.75,0.167,0],
    ['Jumbo Owned',4,18,0.5038,0],
    ['Dababa Fixed',16,5,8.85993,1599],
    ['Jumbo 4 m Fixed',5,20,14.23344,2658],
    ['Jumbo 6 m Fixed',10,31.5,14.714,3500],
    ['Container',10,77,27.1529,3615]
  ];
  const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  function patch(){
    const s=document.createElement('style');s.id='opsPatchStyle';
    s.textContent=`.search{gap:6px!important}.field{gap:3px!important}.field input,.field select{padding:6px 8px!important;height:32px!important;font-size:11px!important}.actions .btn{padding:7px 11px!important;height:32px!important}.field label{font-size:9px!important}.fleet-panel{margin:12px 0;padding:13px;border:1px solid #293542;border-radius:14px;background:#10161ef7}.fleet-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}.fleet-item{border:1px solid #293542;background:#0c1117;border-radius:9px;padding:9px}.fleet-name{font-size:10px;font-weight:900}.fleet-meta{font-size:9px;color:#8d99a8;margin-top:5px;line-height:1.5}.fleet-cap{color:#4bd7a2;font-weight:900}.data-required{color:#ffb477!important}@media(max-width:1000px){.fleet-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:600px){.fleet-grid{grid-template-columns:repeat(2,1fr)}}`;
    document.head.appendChild(s);
    const cards=document.querySelector('.cards');
    if(cards&&!document.querySelector('.fleet-panel')){
      const p=document.createElement('section');p.className='fleet-panel';
      p.innerHTML='<h2>Fleet Reference</h2><div class="sub">Capacity / Cost per KM / Fixed Cost من بيانات الأسطول المعتمدة. Vehicles Needed لا تُعرض كرقم عند غياب CBM فعلي للـSKU.</div><div class="fleet-grid">'+fleet.map(x=>`<div class="fleet-item"><div class="fleet-name">${esc(x[0])}</div><div class="fleet-meta"><span class="fleet-cap">${x[2]} CBM</span> · ${x[1]} trucks<br>Cost/KM: ${x[3]} · Fixed: ${x[4]?x[4]+' EGP':'—'}</div></div>`).join('')+'</div>';
      cards.parentNode.insertBefore(p,cards.nextSibling);
    }
    const kv=document.getElementById('kv');
    if(kv&&kv.textContent.trim()==='0'){kv.textContent='Data Required';kv.classList.add('data-required');}
    document.querySelectorAll('.chip').forEach(c=>{if(/🚚\s*0\s*vehicle/i.test(c.textContent)||/🚚\s*0\s*vehicles/i.test(c.textContent)){c.textContent='🚚 Data Required';c.classList.add('data-required')}});
    document.querySelectorAll('.vehicle').forEach(c=>{if(c.textContent.trim()==='🚚'){c.textContent='🚚 Data Required';c.classList.add('data-required')}});
  }
  setTimeout(patch,1200);setTimeout(patch,3000);setTimeout(patch,6000);
})();
