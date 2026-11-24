(function(){
const VF=window.VF,{C,SLOTS,LSLOTS,P,PL,EUR,hex,find,price,pSel,BR}=VF,H0=location.hash;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),wait=ms=>new Promise(r=>setTimeout(r,ms));
const SL=Object.fromEntries([...SLOTS,...LSLOTS]);
const MODES={
 tower:{slots:SLOTS,pre:P,ord:['case','mobo','psu','cpu','cooler','ram','gpu','storage','fans'],hud:'FORGE-01',rows:[['CPU','cpu'],['GPU','gpu'],['RAM','ram'],['SSD','storage']]},
 laptop:{slots:LSLOTS,pre:PL,ord:['lchassis','lscreen','lbat','lssd','lram','lcpu','lgpu'],hud:'FORGE-02',rows:[['CPU','lcpu'],['GPU','lgpu'],['RAM','lram'],['Écran','lscreen']]}};
const ALL=[...P.map(p=>({...p,mode:'tower'})),...PL.map(p=>({...p,mode:'laptop'}))];
const nm=(o,k)=>o.gb&&/ram$/.test(k)?o.gb+' Go DDR5':o.n;
/* ---- grille des builds ---- */
const grid=$('.vf_builds_grid');
if(grid){grid.innerHTML=ALL.map(p=>{const s=pSel(p),M=MODES[p.mode];return `<article class="vf_build"><div class="vf_build_top"><span class="vf_badge${p.hot?' is-hot':''}">${p.tag}</span><small>${p.mode==='tower'?'Tour':'Portable'} · ${p.use}</small></div><h3>${p.n}</h3><ul>${M.rows.map(([l,k])=>`<li>${l}<b>${nm(s[k],k)}</b></li>`).join('')}</ul><div class="vf_build_bot"><strong>${EUR(price(s))}</strong><button class="vf_btn vf_btn_sm" data-p="${p.id}">Configurer →</button></div></article>`}).join('');
 gsap.from('.vf_build',{y:60,opacity:0,stagger:.1,duration:1,ease:'expo.out',scrollTrigger:{trigger:grid,start:'top 85%'}});VF.tilt('.vf_build');
 grid.addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;VF.go('#configurator');setTimeout(()=>loadPreset(ALL.find(x=>x.id===b.dataset.p)),1000)})}
const st=$('.vf_cfg_stage'),left=$('.vf_cfg_left'),tray=$('.vf_tray'),tabs=$('.vf_tabs'),right=$('.vf_cfg_right');
let rig=VF.rigs&&VF.rigs.cfg;
if(!(st&&left&&tray&&tabs&&right&&rig))return;
const hasLap=!!(VF.rigs.lap&&VF.view),sel={};
let mode='tower',active='case',busy=false,budget=7000,sortK='rec',hide=false;
$$('.vf_cfg_left,.vf_cfg_right').forEach(e=>e.setAttribute('data-lenis-prevent',''));
/* ---- interface : colonne gauche (mode + budget) ---- */
left.insertAdjacentHTML('afterbegin',`<div class="vf_mode"${hasLap?'':' style="display:none"'}><button class="is-on" data-m="tower">Tour</button><button data-m="laptop">Portable</button></div><div class="vf_bud"><div class="vf_bud_h"><span>Budget max</span><b id="vfBv">Illimité</b></div><input class="vf_range" id="vfBr" type="range" min="800" max="7000" step="50" value="7000"><div class="vf_bud_r"><button class="vf_sortb is-on" data-k="rec">Reco</button><button class="vf_sortb" data-k="asc">Prix ↑</button><button class="vf_sortb" data-k="desc">Prix ↓</button><button class="vf_sortb" data-k="perf">Perf</button></div><label class="vf_chk"><input type="checkbox" id="vfHide"> Masquer ce qui dépasse</label><button class="vf_tool" id="vfAuto">✦ Build conseillé pour ce budget</button></div>`);
st.insertAdjacentHTML('beforeend',`<div class="vf_hud"><span class="vf_corner tl"></span><span class="vf_corner tr"></span><span class="vf_corner bl"></span><span class="vf_corner br"></span><div class="vf_hud_tl"><b>FORGE-01</b><span>● LIVE RENDER</span></div><div class="vf_hud_tr"><span>DRAG = ROTATION</span><span>WEBGL · 3D</span></div><div class="vf_empty"><i></i><strong>Glisse un composant ici</strong><span>ou clique dessus pour l'installer</span></div><div class="vf_boot"></div><div class="vf_toasts"></div><div class="vf_tools"><button class="vf_tool" data-a="explode">Vue éclatée</button><button class="vf_tool is-on" data-a="spin">Auto-rotation</button><button class="vf_tool" data-a="boot">⏻ Démarrer le PC</button><button class="vf_tool" data-a="reset">Tout retirer</button></div></div>`);
right.innerHTML=`<div class="vf_sum_head"><div class="vf_status is-inc" id="vfS"><span>EN CONSTRUCTION</span></div><small id="vfCnt">0/9</small></div><div class="vf_seg" id="vfSeg"></div><ul class="vf_list" id="vfList"></ul><div class="vf_bal" id="vfBal"><div class="vf_meter_h"><span>Équilibre CPU / GPU</span><b id="vfBalV">—</b></div><div class="vf_bal_t"><i class="vf_bal_m" id="vfBalM"></i></div><div class="vf_bal_l"><span>CPU limitant</span><span>Équilibré</span><span>GPU limitant</span></div><small id="vfBalS"></small></div><div class="vf_msgs" id="vfMsgs"></div><div class="vf_meter"><div class="vf_meter_h"><span>Consommation estimée</span><b id="vfW">0 W</b></div><div class="vf_bar"><i id="vfWB"></i></div><small id="vfWR"></small></div><div class="vf_meter"><div class="vf_meter_h"><span>Budget</span><b id="vfBuV"></b></div><div class="vf_bar"><i id="vfBuB"></i></div><small id="vfBuS"></small></div><div class="vf_perf">${['Gaming','Création','Thermique'].map(l=>`<div class="vf_perf_r"><span>${l}</span><div class="vf_bar"><i></i></div><b>0</b></div>`).join('')}</div><div class="vf_total"><small>Total estimé</small><strong id="vfT">0 €</strong></div><div class="vf_cta"><button class="vf_btn" id="vfCart" disabled>Ajouter au panier</button><button class="vf_btn vf_btn_ghost" id="vfBoot" disabled>⏻ Démarrer le PC</button><button class="vf_btn vf_btn_ghost" id="vfShare">Partager le lien</button></div>`;
const chips=$('.vf_presets');
function renderPresets(){if(!chips)return;chips.innerHTML=MODES[mode].pre.map(p=>`<button class="vf_chip" data-p="${p.id}"><b>${p.n}</b><span>${EUR(price(pSel(p)))}</span></button>`).join('')}
if(chips)chips.addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(b)loadPreset(ALL.find(x=>x.id===b.dataset.p))});
const ret=document.createElement('div');ret.className='vf_ret';ret.innerHTML='<i></i><span></span>';document.body.appendChild(ret);
const drag={on:false,slot:null,x:0,y:0};
function countTo(el,v,fmt){const o=el._o||(el._o={v:0});gsap.to(o,{v,duration:.8,overwrite:true,onUpdate:()=>el.textContent=fmt?fmt(o.v):Math.round(o.v)})}
function toast(h){const box=$('.vf_toasts',st),t=document.createElement('div');t.className='vf_toast';t.innerHTML=h;box.appendChild(t);while(box.children.length>3)box.firstChild.remove();
 gsap.fromTo(t,{x:-20,opacity:0},{x:0,opacity:1,duration:.4});gsap.to(t,{opacity:0,y:-10,delay:2.6,duration:.4,onComplete:()=>t.remove()})}
/* ---- onglets + tiroir (budget, tri, goulots) ---- */
function renderTabs(){tabs.innerHTML=MODES[mode].slots.map(([s,l],i)=>`<button class="vf_tab${s===active?' is-active':''}${sel[s]?' has':''}" data-s="${s}"><i>0${i+1}</i>${l}</button>`).join('')}
function setTab(s){active=s;renderTabs();renderTray(true)}
tabs.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(b)setTab(b.dataset.s)});
function renderTray(anim){tray.innerHTML='';
 const base=price(sel)-(sel[active]?sel[active].p:0),unl=budget>=7000,sc=o=>o.g!==undefined?o.g+(o.c||0):(o.cap||o.gb||o.p),list=[...C[active]];
 if(sortK==='asc')list.sort((a,b)=>a.p-b.p);else if(sortK==='desc')list.sort((a,b)=>b.p-a.p);else if(sortK==='perf')list.sort((a,b)=>sc(b)-sc(a));
 let hid=0;
 list.forEach(o=>{const on=sel[active]&&sel[active].id===o.id,over=!unl&&base+o.p>budget;
  if(over&&hide&&!on){hid++;return}
  const bad=VF.incompat(sel,active,o),h=VF.hint(sel,active,o),acc=o.acc||o.trim||BR[o.b]||0x00e5ff,el=document.createElement('div');
  el.className='vf_part'+(on?' is-on':'')+(bad?' is-bad':'')+(over?' is-over':'');
  el.innerHTML=`<div class="vf_part_th" style="--a:${hex(acc)};--c:${hex(o.col||0x1b2030)}"></div><div class="vf_part_tx"><small>${o.b}</small><strong>${o.n}</strong><span>${o.s}</span>${bad?`<u>${bad}</u>`:''}${h?`<u class="${h.loss>=30?'':'w'}">${h.loss?'Goulot CPU −'+h.loss+' %':'GPU limitant'}</u>`:''}${over?`<u class="w">+${EUR(base+o.p-budget)} hors budget</u>`:''}</div><em>${o.p?EUR(o.p):'—'}</em>`;
  bindDrag(el,active,o);tray.appendChild(el)});
 if(hid)tray.insertAdjacentHTML('beforeend',`<div class="vf_note">${hid} pièce(s) masquée(s) : au-dessus du budget</div>`);
 if(anim)gsap.from('.vf_part',{y:16,opacity:0,stagger:.05,duration:.5,ease:'power2.out'})}
/* ---- récapitulatif ---- */
function renderSum(){
 const a=VF.analyse(sel),SS=MODES[mode].slots,n=Object.keys(sel).length,T=price(sel),S=$('#vfS'),unl=budget>=7000;
 S.className='vf_status is-'+a.status;$('span',S).textContent=a.status==='err'?'CONFLIT DÉTECTÉ':a.status==='inc'?'EN CONSTRUCTION':'PRÊT À DÉMARRER';
 $('#vfCnt').textContent=n+'/'+SS.length;
 $('#vfSeg').innerHTML=SS.map(([s])=>'<i'+(sel[s]?' class="is-on"':'')+'></i>').join('');
 $('#vfList').innerHTML=n?SS.filter(([s])=>sel[s]).map(([s,l])=>`<li><i>▸</i><div><small>${l}</small><b>${sel[s].n}</b></div><em>${EUR(sel[s].p)}</em><button class="vf_x" data-s="${s}" aria-label="Retirer">×</button></li>`).join(''):'<li class="is-empty">Aucun composant installé</li>';
 const ic={ok:'✓',warn:'!',err:'✕',info:'…'};
 $('#vfMsgs').innerHTML=a.msgs.map(([k,t])=>`<div class="vf_msg ${k}"><i>${ic[k]}</i><span>${t}</span></div>`).join('');
 const b=VF.balance(sel),TX={err:'Goulot critique : ce CPU bride fortement le GPU.',warn:'Goulot modéré : un CPU plus puissant libérerait le GPU.','cpu+':'CPU surdimensionné : un meilleur GPU serait plus rentable.',ok:'Association équilibrée : aucun composant ne bride l’autre.'};
 $('#vfBal').dataset.k=b?b.kind:'';$('#vfBalM').style.left=(b?b.pos:50)+'%';
 $('#vfBalV').textContent=b?(b.loss?'−'+b.loss+' % perf GPU':b.kind==='cpu+'?'GPU limitant':'Équilibré'):'—';
 $('#vfBalS').textContent=b?TX[b.kind]:'Ajoute un processeur et une carte graphique pour mesurer l’équilibre.';
 const ps=sel.psu||sel.lbat;$('#vfW').textContent=a.draw+' W';
 $('#vfWB').style.width=(ps&&a.draw?clamp(a.draw/ps.cap)*100:a.draw?clamp(a.draw/1000)*100:0)+'%';
 $('#vfWR').textContent=ps&&a.draw?(mode==='laptop'?'Chargeur ':'Alim. ')+ps.cap+' W · charge '+Math.round(a.draw/ps.cap*100)+' %':a.draw?'Alimentation recommandée : '+a.rec+' W':'';
 $('#vfBuV').textContent=unl?'Illimité':EUR(budget);
 $('#vfBuB').style.width=clamp(T/(unl?7000:budget))*100+'%';$('#vfBuB').parentNode.classList.toggle('is-over',!unl&&T>budget);
 $('#vfBuS').textContent=unl?'':T>budget?'Dépassement de '+EUR(T-budget):'Reste '+EUR(budget-T);
 const pf=VF.perf(sel);$$('.vf_perf_r').forEach((r,i)=>{const v=pf[['g','c','t'][i]];$('.vf_bar i',r).style.width=v+'%';countTo($('b',r),v)});
 countTo($('#vfT'),T,EUR);
 $('#vfBoot').disabled=a.status!=='ok'&&!rig.on;$('#vfCart').disabled=a.status!=='ok';
 gsap.to($('.vf_empty',st),{opacity:n?0:1,duration:.5})}
function syncBoot(){const t=rig.on?'⏻ Éteindre':'⏻ Démarrer le PC';$('#vfBoot').textContent=t;$('[data-a=boot]',st).textContent=t}
const hashOf=()=>'#b='+[mode,...Object.entries(sel).map(([k,o])=>k+'.'+o.id)].join('~');
function refresh(anim){renderTabs();renderTray(!!anim);renderSum();syncBoot();
 if(Object.keys(sel).length)try{history.replaceState(null,'',hashOf())}catch(e){}}
right.addEventListener('click',e=>{const b=e.target.closest('.vf_x');if(b)removeSlot(b.dataset.s)});
/* ---- budget, tri, mode ---- */
const rg=$('#vfBr');
rg.addEventListener('input',()=>{budget=+rg.value;rg.style.setProperty('--p',(budget-800)/6200*100+'%');$('#vfBv').textContent=budget>=7000?'Illimité':EUR(budget);renderTray(false);renderSum()});
$('#vfHide').addEventListener('change',e=>{hide=e.target.checked;renderTray(true)});
left.addEventListener('click',e=>{const m=e.target.closest('[data-m]');if(m){if(!busy)setMode(m.dataset.m);return}
 const s=e.target.closest('.vf_sortb');if(s){sortK=s.dataset.k;$$('.vf_sortb',left).forEach(x=>x.classList.toggle('is-on',x===s));renderTray(true)}});
$('#vfAuto').onclick=()=>{if(busy)return;const pre=MODES[mode].pre.map(p=>({p,t:price(pSel(p))})).sort((a,b)=>a.t-b.t),ok=pre.filter(x=>x.t<=budget),pick=ok.length?ok[ok.length-1]:pre[0];
 if(!ok.length)toast('Budget trop bas : build le plus abordable chargé');loadPreset(ALL.find(x=>x.id===pick.p.id))};
async function setMode(m){if(m===mode||!hasLap||busy)return;busy=true;rig.power(false);
 Object.keys(sel).forEach(s=>{delete sel[s];rig.remove(s,true)});await wait(700);
 const old=rig;gsap.killTweensOf(old,'ex');old.ex=0;old.exp=false;
 mode=m;VF.mode=m;rig=m==='laptop'?VF.rigs.lap:VF.rigs.cfg;
 rig.yaw=old.yaw;rig.yawT=old.yawT;rig.pitch=old.pitch;rig.pitchT=old.pitchT;VF.view.rig=rig;
 active=MODES[m].slots[0][0];$$('.vf_mode button').forEach(b=>b.classList.toggle('is-on',b.dataset.m===m));
 $('.vf_hud_tl b',st).textContent=MODES[m].hud;
 const ex=$('[data-a=explode]',st);ex.classList.remove('is-on');ex.textContent='Vue éclatée';
 busy=false;renderPresets();refresh(true)}
/* ---- actions ---- */
function install(slot,o){if(busy)return;
 if(sel[slot]&&sel[slot].id===o.id){toast(o.n+' est déjà installé');return}
 const first=!sel[slot];sel[slot]=o;rig.set(slot,o,true);if(rig.on)rig.power(false);
 toast('<b>'+SL[slot]+'</b> · '+o.n);refresh(false);
 const b=VF.balance(sel);if(b&&b.kind==='err'){toast('<b>Goulot</b> · −'+b.loss+' % de perf GPU');gsap.fromTo(st,{x:-7},{x:0,duration:.7,ease:'elastic.out(1,.2)'})}
 if(first)setTimeout(()=>{if(active===slot){const m=MODES[mode].slots.find(([s])=>!sel[s]);if(m)setTab(m[0])}},900)}
function removeSlot(s){delete sel[s];rig.remove(s,true);rig.power(false);refresh(false)}
function clearAll(){Object.keys(sel).forEach(s=>{delete sel[s];rig.remove(s,true)});rig.power(false);refresh(false);toast('Établi vidé')}
const KM={cpu:['cpu','lcpu'],gpu:['gpu','lgpu'],ram:['ram','lram'],ssd:['storage','lssd']},g=k=>sel[KM[k][mode==='laptop'?1:0]];
function toggleBoot(){
 if(rig.on){rig.power(false);syncBoot();renderSum();return}
 const a=VF.analyse(sel);if(a.status!=='ok'){toast(a.status==='err'?'Conflit détecté : corrige la config':'Config incomplète');return}
 rig.power(true);syncBoot();
 const L=['VOLTFORGE BIOS v2.0 — POST','CPU  '+g('cpu').n,'RAM  '+g('ram').gb+' Go DDR5 ........ OK','GPU  '+(g('gpu')?g('gpu').n:'iGPU'),'SSD  '+g('ssd').n,'SYSTEM READY ▮'],b=$('.vf_boot',st);
 b.textContent='';gsap.set(b,{opacity:1});L.forEach((l,i)=>setTimeout(()=>{b.textContent+=l+'\n'},i*320));
 setTimeout(()=>gsap.to(b,{opacity:0,duration:.6,onComplete:()=>{b.textContent='';gsap.set(b,{opacity:1})}}),L.length*320+1800)}
async function loadPreset(p){if(!p||busy)return;if(p.mode!==mode)await setMode(p.mode);busy=true;rig.power(false);
 Object.keys(sel).forEach(s=>{delete sel[s];rig.remove(s,true)});refresh(false);await wait(550);
 for(const s of MODES[mode].ord){if(!p.sel[s])continue;sel[s]=find(s,p.sel[s]);rig.set(s,sel[s],true);refresh(false);await wait(400)}
 busy=false;toast('Build <b>'+p.n+'</b> chargé');
 setTimeout(()=>{if(!rig.on&&VF.analyse(sel).status==='ok')toggleBoot()},1800)}
$('#vfBoot').onclick=toggleBoot;
$('.vf_tools',st).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
 if(a==='explode'){const on=!rig.exp;rig.explode(on);b.classList.toggle('is-on',on);b.textContent=on?'Assembler':'Vue éclatée'}
 if(a==='spin'){rig.spin=!rig.spin;b.classList.toggle('is-on',rig.spin)}
 if(a==='reset')clearAll();if(a==='boot')toggleBoot()});
/* ---- partage par lien ---- */
$('#vfShare').onclick=()=>{const u=location.origin+location.pathname+hashOf();
 (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast('Lien du build copié')).catch(()=>toast('Copie impossible sur ce navigateur'))};
async function fromHash(){const m=H0.match(/^#b=(.+)$/);if(!m)return;const [md,...kv]=m[1].split('~'),s={};
 kv.forEach(x=>{const [k,id]=x.split('.');if(C[k]&&find(k,id))s[k]=id});
 if(!MODES[md]||!Object.keys(s).length)return;
 VF.go('#configurator');await wait(1500);loadPreset({n:'partagé',mode:md,sel:s})}
/* ---- panier (démo, localStorage) ---- */
let cart=[];try{cart=JSON.parse(localStorage.getItem('vf_cart')||'[]')}catch(e){}
const saveCart=()=>{try{localStorage.setItem('vf_cart',JSON.stringify(cart))}catch(e){}};
const nav=$('.vf_nav_in'),cb=document.createElement('button');cb.className='vf_cartbtn';cb.innerHTML='Panier <b>0</b>';
if(nav)nav.insertBefore(cb,nav.lastElementChild);
const dr=document.createElement('aside'),ov=document.createElement('div');dr.className='vf_cart';ov.className='vf_cart_ov';dr.setAttribute('data-lenis-prevent','');
dr.innerHTML='<div class="vf_cart_h"><strong>Panier</strong><button class="vf_x2" data-x aria-label="Fermer">×</button></div><div class="vf_cart_b"></div><div class="vf_cart_f"></div>';
document.body.append(ov,dr);
const openCart=o=>{dr.classList.toggle('is-open',o);ov.classList.toggle('is-open',o)};
const cartTotal=()=>cart.reduce((a,c)=>a+price(pSel({sel:c.ids}))*c.qty,0);
function renderCart(){const body=$('.vf_cart_b',dr),f=$('.vf_cart_f',dr);$('b',cb).textContent=cart.reduce((a,c)=>a+c.qty,0);
 body.innerHTML=cart.length?cart.map((c,i)=>{const s=pSel({sel:c.ids});return `<div class="vf_ci"><div class="vf_ci_t"><b>${c.name}</b><em>${EUR(price(s)*c.qty)}</em></div><ul>${Object.entries(s).map(([k,o])=>`<li>${SL[k]}<span>${o.n}</span></li>`).join('')}</ul><div class="vf_ci_a"><div class="vf_qty"><button data-q="${i}" data-d="-1">−</button><b>${c.qty}</b><button data-q="${i}" data-d="1">+</button></div><button class="vf_link" data-r="${i}">Retirer</button></div></div>`}).join(''):'<p class="vf_cart_e">Ton panier est vide.<br>Configure un PC puis ajoute-le ici.</p>';
 f.innerHTML=cart.length?`<div class="vf_total"><small>Total</small><strong>${EUR(cartTotal())}</strong></div><button class="vf_btn" data-co>Commander (démo)</button><small class="vf_cart_n">Démo d'entraînement : aucun paiement réel.</small>`:''}
cb.onclick=()=>openCart(true);ov.onclick=()=>openCart(false);
dr.addEventListener('click',e=>{const t=e.target;
 if(t.closest('[data-x]'))return openCart(false);
 const q=t.closest('[data-q]');if(q){const i=+q.dataset.q,c=cart[i];c.qty=clamp(c.qty+ +q.dataset.d,0,9);if(!c.qty)cart.splice(i,1);saveCart();return renderCart()}
 const r=t.closest('[data-r]');if(r){cart.splice(+r.dataset.r,1);saveCart();return renderCart()}
 if(t.closest('[data-co]')){const id='VF-'+Math.random().toString(36).slice(2,8).toUpperCase();cart=[];saveCart();renderCart();
  $('.vf_cart_b',dr).innerHTML=`<div class="vf_ok"><i></i><strong>Commande confirmée</strong><span>N° ${id} · démo d'entraînement</span></div>`;
  gsap.from('.vf_ok',{scale:.8,opacity:0,duration:.8,ease:'back.out(2)'})}});
$('#vfCart').onclick=()=>{const ids=Object.fromEntries(Object.entries(sel).map(([k,o])=>[k,o.id])),key=Object.keys(ids).sort().map(k=>k+ids[k]).join('|'),ex=cart.find(c=>c.k===key);
 ex?ex.qty++:cart.push({k:key,name:'PC '+(mode==='laptop'?'portable':'tour')+' sur mesure',ids,qty:1});saveCart();renderCart();toast('Ajouté au panier');openCart(true)};
/* ---- drag & drop depuis le tiroir vers la scène ---- */
function bindDrag(el,slot,o){el.addEventListener('pointerdown',e=>{if(e.button!==0)return;
 const sx=e.clientX,sy=e.clientY,touch=e.pointerType==='touch';let on=false,gh=null;
 const mv=ev=>{
  if(!on&&!touch&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>8){on=true;drag.on=true;drag.slot=slot;rig.hold=true;
   gh=document.createElement('div');gh.className='vf_ghost';gh.innerHTML='<b>'+o.n+'</b><span>'+(o.p?EUR(o.p):'')+'</span>';document.body.appendChild(gh);
   gsap.set(gh,{xPercent:-50,yPercent:-130});document.body.classList.add('vf-dragging');$('span',ret).textContent=SL[slot]}
  if(on){gsap.set(gh,{x:ev.clientX,y:ev.clientY});const r=st.getBoundingClientRect();
   st.classList.toggle('is-over',ev.clientX>r.left&&ev.clientX<r.right&&ev.clientY>r.top&&ev.clientY<r.bottom);
   ret.classList.toggle('is-hot',Math.hypot(ev.clientX-drag.x,ev.clientY-drag.y)<150)}};
 const end=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',cancel);
  document.body.classList.remove('vf-dragging');st.classList.remove('is-over');ret.classList.remove('is-hot');drag.on=false;rig.hold=false};
 const up=ev=>{const r=st.getBoundingClientRect(),inside=ev.clientX>r.left&&ev.clientX<r.right&&ev.clientY>r.top&&ev.clientY<r.bottom;end();
  if(on){gsap.to(gh,{scale:.2,opacity:0,duration:.25,onComplete:()=>gh.remove()});if(inside)install(slot,o)}
  else if(Math.hypot(ev.clientX-sx,ev.clientY-sy)<8)install(slot,o)};
 const cancel=()=>{end();if(gh)gh.remove()};
 addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',cancel)})}
gsap.ticker.add(()=>{if(!drag.on)return;const p=VF.slotScreen(drag.slot);if(p){drag.x=p.x;drag.y=p.y;gsap.set(ret,{x:p.x,y:p.y})}});
/* ---- rotation à la souris sur la scène ---- */
let rot=null;
st.addEventListener('pointerdown',e=>{if(e.target.closest('.vf_tools'))return;rot={x:e.clientX,y:e.clientY};rig.hold=true;st.classList.add('is-grab')});
addEventListener('pointermove',e=>{if(!rot)return;rig.yawT+=(e.clientX-rot.x)*.008;rig.pitchT=clamp(rig.pitchT+(e.clientY-rot.y)*.004,-.25,.4);rot.x=e.clientX;rot.y=e.clientY});
addEventListener('pointerup',()=>{if(!rot)return;rot=null;st.classList.remove('is-grab');if(!drag.on)rig.hold=false});
renderPresets();renderCart();refresh(true);setTimeout(fromHash,3200);
})();
