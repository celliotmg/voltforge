(function(){
const VF=window.VF;if(!VF||!window.gsap||!VF.rigs)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const cfg=$('.vf_cfg');if(!cfg)return;
/* ---- jeux : g = FPS GPU à 1080p pour un score GPU de 100, c = FPS CPU pour un score CPU de 100 ---- */
const GAMES=[
{n:'Valorant',t:'FPS tactique · compétitif',g:700,c:800,e:1},
{n:'Counter-Strike 2',t:'FPS tactique · compétitif',g:450,c:600,e:1},
{n:'Fortnite',t:'Battle royale · Épique',g:280,c:380},
{n:'Call of Duty: Warzone',t:'Battle royale · Élevé',g:220,c:300},
{n:'Cyberpunk 2077',t:'Ray tracing · Ultra',g:150,c:220,rt:1},
{n:'Baldur’s Gate 3',t:'RPG · Ultra',g:170,c:200},
{n:'Starfield',t:'Monde ouvert · Ultra',g:140,c:180},
{n:'Elden Ring',t:'Action-RPG · plafonné à 60',g:200,c:200,cap:60}];
const RES=['1080p','1440p','4K'],RF=[1,.72,.42],RFRT=[1,.66,.34];
/* ---- style injecté (aucun changement dans le Head) ---- */
const css=document.createElement('style');
css.textContent=`
.vf_fps{margin-top:16px;padding:clamp(20px,3vw,36px);border:1px solid var(--ln);border-radius:24px;background:radial-gradient(600px circle at 90% 0%,rgba(124,77,255,.14),transparent 60%),var(--pn);backdrop-filter:blur(22px)}
.vf_fps_hd{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:28px}
.vf_fps_t{font:700 clamp(26px,3vw,42px)/1 var(--hd);letter-spacing:-.03em;margin:0 0 10px}
.vf_fps_p{margin:0;color:var(--mu);font-size:14px;max-width:460px;line-height:1.5}
.vf_fps_res{display:flex;gap:4px;padding:4px;border:1px solid var(--ln);border-radius:14px;background:var(--gl)}
.vf_fps_res button{all:unset;cursor:pointer;padding:10px 18px;border-radius:10px;font:600 12px var(--mo);letter-spacing:.06em;color:var(--mu);transition:.3s}
.vf_fps_res button:hover{color:var(--tx)}.vf_fps_res button.is-on{background:var(--cy);color:#001}
.vf_fps_body{display:grid;grid-template-columns:minmax(200px,260px) 1fr;gap:clamp(20px,4vw,56px);align-items:center}
.vf_fps_g{position:relative;max-width:260px;width:100%;margin:0 auto}
.vf_fps_g svg{display:block;width:100%;transform:rotate(135deg);overflow:visible}
.vf_fps_g circle{fill:none;stroke-width:9;stroke-linecap:round}
.vf_fps_g .tr{stroke:rgba(255,255,255,.08);stroke-dasharray:377 503}
.vf_fps_g .va{stroke-dasharray:377 503;stroke-dashoffset:377;transition:stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 0 8px rgba(0,229,255,.6))}
.vf_fps_gc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center}
.vf_fps_gc b{font:700 clamp(46px,5vw,68px)/1 var(--hd);letter-spacing:-.04em}
.vf_fps_gc small{font:500 10px var(--mo);letter-spacing:.2em;text-transform:uppercase;color:var(--mu)}
.vf_fps_gc em{font:500 11px var(--mo);font-style:normal;color:var(--cy);margin-top:6px}
.vf_fps_l{display:grid;gap:10px}
.vf_fr{display:grid;grid-template-columns:minmax(150px,200px) 1fr 72px minmax(120px,150px);gap:16px;align-items:center;padding:12px 14px;border:1px solid var(--ln);border-radius:14px;background:var(--gl);transition:border-color .3s}
.vf_fr:hover{border-color:rgba(0,229,255,.45)}
.vf_fr_n{display:flex;flex-direction:column;gap:3px;min-width:0}.vf_fr_n b{font:600 14px var(--hd)}.vf_fr_n small{font:400 10px var(--mo);color:var(--mu)}
.vf_fr_b{position:relative;height:8px;border-radius:8px;background:rgba(255,255,255,.07)}
.vf_fr_b i{display:block;height:100%;width:0;border-radius:8px;transition:width .9s cubic-bezier(.2,.8,.2,1),background .4s,box-shadow .4s;background:var(--cy)}
.vf_fr_b i[data-c="0"]{background:#ff4d6d;box-shadow:0 0 12px #ff4d6d}
.vf_fr_b i[data-c="1"]{background:#ffb020;box-shadow:0 0 12px rgba(255,176,32,.6)}
.vf_fr_b i[data-c="2"]{background:linear-gradient(90deg,var(--cy),var(--vi));box-shadow:0 0 12px rgba(0,229,255,.5)}
.vf_fr_b i[data-c="3"]{background:linear-gradient(90deg,var(--vi),var(--mg));box-shadow:0 0 14px rgba(255,46,147,.55)}
.vf_fr_b span{position:absolute;top:-4px;bottom:-4px;width:1px;background:rgba(255,255,255,.28)}
.vf_fr_v{display:flex;align-items:baseline;gap:4px;justify-content:flex-end}.vf_fr_v b{font:700 22px var(--hd)}.vf_fr_v small{font:400 9px var(--mo);color:var(--mu)}
.vf_fr_t{display:flex;flex-direction:column;gap:2px;align-items:flex-end;text-align:right}
.vf_fr_t em{font:500 11px var(--mo);font-style:normal;color:var(--mu)}
.vf_fr_t[data-c="0"] em{color:#ff4d6d}.vf_fr_t[data-c="1"] em{color:#ffb020}.vf_fr_t[data-c="2"] em{color:var(--cy)}.vf_fr_t[data-c="3"] em{color:var(--mg)}
.vf_fr_t u{text-decoration:none;font:400 9px var(--mo);letter-spacing:.1em;text-transform:uppercase;color:var(--mu)}.vf_fr_t u.w{color:#ffb020}
.vf_fps_n{display:block;margin-top:22px;font:400 11px/1.6 var(--mo);color:var(--mu)}
@media(max-width:900px){.vf_fps_body{grid-template-columns:1fr}.vf_fr{grid-template-columns:1fr 64px;gap:10px 12px}.vf_fr_b{grid-column:1/-1;order:3}.vf_fr_t{grid-column:1/-1;order:4;flex-direction:row;justify-content:space-between;align-items:center}}`;
document.head.appendChild(css);
/* ---- structure ---- */
const sec=document.createElement('section');sec.className='vf_fps';
sec.innerHTML=`<div class="vf_fps_hd"><div><div class="vf_eyebrow">Performances en jeu</div><h3 class="vf_fps_t">FPS estimés en direct</h3><p class="vf_fps_p">Change la résolution, ajoute ou retire des pièces : les barres réagissent instantanément.</p></div><div class="vf_fps_res">${RES.map((r,i)=>`<button data-r="${i}" class="${i===1?'is-on':''}">${r}</button>`).join('')}</div></div>
<div class="vf_fps_body"><div class="vf_fps_g"><svg viewBox="0 0 200 200"><defs><linearGradient id="vfFG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00e5ff"/><stop offset=".55" stop-color="#7c4dff"/><stop offset="1" stop-color="#ff2e93"/></linearGradient></defs><circle class="tr" cx="100" cy="100" r="80"/><circle class="va" cx="100" cy="100" r="80" stroke="url(#vfFG)"/></svg><div class="vf_fps_gc"><b>0</b><small>FPS moyens</small><em>—</em></div></div>
<div class="vf_fps_l">${GAMES.map(g=>`<div class="vf_fr"><div class="vf_fr_n"><b>${g.n}</b><small>${g.t}</small></div><div class="vf_fr_b"><i></i><span style="left:20%"></span><span style="left:48%"></span></div><div class="vf_fr_v"><b>0</b><small>FPS</small></div><div class="vf_fr_t"><em>—</em><u></u></div></div>`).join('')}</div></div>
<small class="vf_fps_n"></small>`;
cfg.insertAdjacentElement('afterend',sec);
/* ---- calculs ---- */
let res=1;
const ctr=(el,v)=>{const o=el._o||(el._o={v:0});gsap.to(o,{v,duration:.8,overwrite:true,onUpdate:()=>el.textContent=Math.round(o.v)})};
const verdict=f=>f<30?['Injouable',0]:f<60?['Jouable',1]:f<100?['Fluide',2]:f<144?['Très fluide',2]:['Compétitif 144 Hz+',3];
function parts(){const s=VF.sel||{},lap=VF.mode==='laptop';return{s,lap,cpu:lap?s.lcpu:s.cpu,gpu:lap?s.lgpu:s.gpu,ram:lap?s.lram:s.ram}}
function calc(g,P){
 const sc=P.gpu?P.gpu.g:12,rf=(g.rt?RFRT:RF)[res];
 const gf=g.g*Math.pow(sc/100,1.6)*rf,cf=g.c*Math.pow(P.cpu.g/100,1.3);
 let th=1;
 if(P.lap){const ch=P.s.lchassis,h=P.cpu.w+(P.gpu?P.gpu.w:0);if(ch&&h&&ch.cap/h<.85)th=.88}
 else if(P.s.cooler&&P.s.cooler.cap<P.cpu.w)th=.9;
 if(P.ram&&P.ram.gb<=16&&!g.e)th*=.94;
 let f=Math.min(gf,cf)*th,lim=cf<gf?'CPU':'GPU';
 if(g.cap&&f>g.cap){f=g.cap;lim='CAP'}
 return{fps:Math.max(1,Math.round(f)),lim,th}}
function update(){
 const P=parts(),rows=$$('.vf_fr',sec),note=$('.vf_fps_n',sec),gauge=$('.va',sec),gc=$('.vf_fps_gc',sec);
 if(!P.cpu){
  rows.forEach(r=>{$('i',r).style.width='0%';ctr($('.vf_fr_v b',r),0);$('.vf_fr_t em',r).textContent='—';$('.vf_fr_t u',r).textContent='';r.querySelector('.vf_fr_t').removeAttribute('data-c')});
  gauge.style.strokeDashoffset=377;ctr($('b',gc),0);$('em',gc).textContent='—';
  note.textContent='Installe un processeur dans le configurateur pour lancer l’estimation.';return}
 let sum=0;
 GAMES.forEach((g,i)=>{const r=rows[i],o=calc(g,P),[v,c]=verdict(o.fps);sum+=o.fps;
  const bar=$('i',r);bar.dataset.c=c;bar.style.width=Math.min(100,o.fps/300*100)+'%';
  ctr($('.vf_fr_v b',r),o.fps);
  const t=$('.vf_fr_t',r);t.dataset.c=c;$('em',t).textContent=v;
  const u=$('u',t);u.className=o.lim==='CPU'?'w':'';u.textContent=o.lim==='CAP'?'Plafond du jeu':o.lim==='CPU'?'Limité par le CPU':'Limité par le GPU'});
 const avg=Math.round(sum/GAMES.length);
 gauge.style.strokeDashoffset=377*(1-Math.min(1,avg/200));
 ctr($('b',gc),avg);$('em',gc).textContent=verdict(avg)[0];
 const bad=VF.analyse&&VF.analyse(P.s).status==='err';
 note.textContent=!P.gpu?'Sans carte graphique : estimation sur le circuit graphique intégré, très limité.':bad?'Configuration en conflit : estimations théoriques, corrige les erreurs pour un résultat fiable.':'Estimations indicatives à réglages élevés, sans upscaling. Traits sur les barres : 60 et 144 FPS.'}
sec.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(!b)return;res=+b.dataset.r;$$('.vf_fps_res button',sec).forEach(x=>x.classList.toggle('is-on',x===b));update()});
window.addEventListener('vf:change',update);
update();
/* ---- apparition au scroll ---- */
if(window.ScrollTrigger){
 gsap.from(sec,{y:60,opacity:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:sec,start:'top 92%'}});
 gsap.from($$('.vf_fr',sec),{x:-24,opacity:0,duration:.8,stagger:.06,ease:'power3.out',scrollTrigger:{trigger:sec,start:'top 80%'}});
 ScrollTrigger.refresh()}
})();
