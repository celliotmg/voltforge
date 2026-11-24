(function(){
gsap.registerPlugin(ScrollTrigger);
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const SL=Object.fromEntries(VF.SLOTS);
/* split mots */
function split(el){const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),ns=[];while(w.nextNode())ns.push(w.currentNode);
 ns.forEach(n=>{if(!n.textContent.trim())return;const f=document.createDocumentFragment();
  n.textContent.split(/(\s+)/).forEach(t=>{if(!t||/^\s+$/.test(t)){f.append(t);return}const a=document.createElement('span');a.className='vf_w';const b=document.createElement('span');b.textContent=t;a.append(b);f.append(a)});n.replaceWith(f)});
 return $$('.vf_w>span',el)}
$$('.vf_split').forEach(el=>{const w=split(el);if(!el.closest('.vf_hero'))gsap.from(w,{yPercent:115,duration:1.1,stagger:.05,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 88%'}})});
$$('.vf_reveal').forEach(el=>gsap.from(el,{y:50,opacity:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 90%'}}));
/* scroll fluide Lenis (synchronisé avec le rendu 3D) */
let lenis=null;
if(window.Lenis&&!matchMedia('(prefers-reduced-motion:reduce)').matches){lenis=new Lenis({lerp:.09});lenis.on('scroll',ScrollTrigger.update);VF.pre=t=>lenis.raf(t*1000);gsap.ticker.lagSmoothing(0)}
VF.go=t=>{const el=typeof t==='string'?$(t):t;if(!el)return;lenis?lenis.scrollTo(el,{duration:1.8,easing:x=>1-Math.pow(1-x,4)}):el.scrollIntoView({behavior:'smooth'})};
$$('a[href^="#"]').forEach(a=>{const h=a.getAttribute('href');if(h.length>1)a.addEventListener('click',e=>{e.preventDefault();VF.go(h)})});
/* nav + barre de progression */
const nav=$('.vf_nav'),pg=document.createElement('div');pg.className='vf_prog';document.body.appendChild(pg);
ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{pg.style.transform='scaleX('+s.progress+')';if(nav){nav.classList.toggle('is-scrolled',s.scroll()>40);nav.classList.toggle('is-hidden',s.direction===1&&s.scroll()>600)}}});
/* curseur + boutons magnétiques */
if(matchMedia('(pointer:fine)').matches){const c=document.createElement('div');c.className='vf_cur';document.body.appendChild(c);
 const qx=gsap.quickTo(c,'x',{duration:.35,ease:'power3'}),qy=gsap.quickTo(c,'y',{duration:.35,ease:'power3'});
 addEventListener('pointermove',e=>{qx(e.clientX);qy(e.clientY)});
 document.addEventListener('pointerover',e=>c.classList.toggle('is-h',!!(e.target.closest&&e.target.closest('a,button,.vf_part,.vf_build,.vf_chip,.vf_tool'))));
 $$('.vf_btn').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.4})});b.addEventListener('pointerleave',()=>gsap.to(b,{x:0,y:0,duration:.8,ease:'elastic.out(1,.4)'}))})}
/* tilt 3D des cartes (réutilisé par le fichier 06) */
VF.tilt=sel=>$$(sel).forEach(el=>{
 el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.style.setProperty('--mx',x*100+'%');el.style.setProperty('--my',y*100+'%');gsap.to(el,{rotateY:(x-.5)*8,rotateX:(.5-y)*8,transformPerspective:900,duration:.4,ease:'power2.out'})});
 el.addEventListener('pointerleave',()=>gsap.to(el,{rotateX:0,rotateY:0,duration:.8,ease:'power3.out'}))});
VF.tilt('.vf_card');
/* compteurs + marquee */
$$('.vf_count').forEach(el=>{const n=parseFloat(el.textContent.replace(/\s/g,'')),o={v:0};ScrollTrigger.create({trigger:el,start:'top 92%',once:true,onEnter:()=>gsap.to(o,{v:n,duration:2.2,ease:'power3.out',onUpdate:()=>el.textContent=Math.round(o.v).toLocaleString('fr-FR')})})});
const tr=$('.vf_marquee_track');if(tr)tr.innerHTML+=tr.innerHTML;
/* hero : étapes + pourcentage + scrub de l'assemblage */
const hs=$('.vf_hero_steps'),hst=$('.vf_hero_sticky');let pct=null;
if(hs)hs.innerHTML=['case','mobo','psu','cpu','cooler','ram','gpu','storage','fans'].map((s,i)=>`<div class="vf_step"><i>0${i+1}</i>${SL[s]}</div>`).join('');
if(hst){pct=document.createElement('div');pct.className='vf_pct';pct.textContent='00%';hst.appendChild(pct)}
function heroUI(p){if(VF.hero)VF.hero.scrub(p);
 if(hs)$$('.vf_step',hs).forEach((el,i)=>{const a=.03+i*.095;el.classList.toggle('is-done',p>=a+.13);el.classList.toggle('is-active',p>=a&&p<a+.13)});
 if(pct)pct.textContent=String(Math.round(clamp(p/.96)*100)).padStart(2,'0')+'%'}
if($('.vf_hero')){
 ScrollTrigger.create({trigger:'.vf_hero',start:'top top',end:'bottom bottom',scrub:true,onUpdate:s=>heroUI(s.progress)});
 gsap.to('.vf_hero_ui',{opacity:0,y:-60,ease:'none',scrollTrigger:{trigger:'.vf_hero',start:'top top',end:()=>'+='+innerHeight*1.2,scrub:true,invalidateOnRefresh:true}})}
/* loader + intro */
const ld=document.createElement('div');ld.className='vf_loader';
ld.innerHTML='<div class="vf_loader_in"><b>VOLTFORGE</b><div class="vf_loader_bar"><i></i></div><small>Initialisation du forge 3D…</small></div>';document.body.appendChild(ld);
const lb=$('i',ld),lp={v:0};gsap.to(lp,{v:90,duration:2.4,ease:'power2.out',onUpdate:()=>lb.style.width=lp.v+'%'});
function intro(){const tl=gsap.timeline({defaults:{ease:'expo.out'}});
 tl.from('.vf_nav',{yPercent:-100,duration:1.1}).from('.vf_hero_tag',{y:20,opacity:0,duration:.9},'-=.8');
 const w=$$('.vf_hero_title .vf_w>span');if(w.length)tl.from(w,{yPercent:115,duration:1.3,stagger:.07},'-=.7');
 tl.from('.vf_hero_sub,.vf_hero_cta,.vf_hero_steps',{y:30,opacity:0,duration:1,stagger:.12},'-=.9')}
let done=false;
function ready(){if(done)return;done=true;gsap.killTweensOf(lp);
 gsap.to(lp,{v:100,duration:.4,onUpdate:()=>lb.style.width=lp.v+'%'});
 gsap.timeline({delay:.45}).to(ld,{yPercent:-100,duration:.9,ease:'expo.inOut'})
  .add(()=>{document.documentElement.classList.remove('vf-load');intro();ScrollTrigger.refresh()},'-=.45')
  .add(()=>ld.remove())}
if(document.readyState==='complete')ready();else addEventListener('load',ready);
setTimeout(ready,6000);
})();
