(function(){
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t;
const $=s=>document.querySelector(s);
const {BR}=VF;
const cv=document.createElement('canvas');cv.id='vf-gl';document.body.prepend(cv);
let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'high-performance'})}catch(e){cv.remove();VF.gl=false;return}
R.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer:coarse)').matches?1.5:2));
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.2;R.setClearColor(0x000000,0);
const scene=new THREE.Scene();
/* environnement procédural (reflets métal / verre) */
const envS=new THREE.Scene();envS.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.MeshBasicMaterial({color:0x06070c,side:THREE.BackSide})));
[[30,10,0xffffff,3,0,25,10],[10,30,0x00e5ff,4,-30,5,10],[10,30,0xff2e93,4,30,0,-5],[20,20,0x7c4dff,2,0,-5,30]].forEach(([w,h,c,i,x,y,z])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);envS.add(m)});
const pm=new THREE.PMREMGenerator(R);scene.environment=pm.fromScene(envS,.04).texture;pm.dispose();
R.autoClear=false;
const dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(5,8,7);scene.add(dl);scene.add(new THREE.AmbientLight(0x8899bb,.25));
/* utilitaires */
const gc=document.createElement('canvas');gc.width=gc.height=128;{const x=gc.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128)}
const GT=new THREE.CanvasTexture(gc);GT.encoding=THREE.sRGBEncoding;
const glowSprite=(c,s,o)=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:GT,color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:o}));m.scale.set(s,s,1);m.userData.o=o;return m};
const MT=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,metalness:.65,roughness:.35},o));
const bx=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x||0,y||0,z||0);if(p)p.add(o);return o};
const cy=(r,h,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),m);o.rotation.x=Math.PI/2;o.position.set(x||0,y||0,z||0);if(p)p.add(o);return o};
const tor=(r,t,m,z,p,seg)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,seg||48),m);o.position.z=z||0;if(p)p.add(o);return o};
function label(t,w,h,col){const c=document.createElement('canvas');c.width=512;c.height=Math.max(32,Math.round(512*h/w));const x=c.getContext('2d');x.font='700 '+Math.round(c.height*.62)+'px "Space Grotesk",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle=col;x.fillText(t,256,c.height/2+2);const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}))}
function mkPart(){const g=new THREE.Group();g.userData={leds:[],glows:[],fans:[]};
 g.led=(c,i)=>{const m=new THREE.MeshStandardMaterial({color:0,emissive:c,emissiveIntensity:i||1,roughness:.5});m.userData.base=i||1;g.userData.leds.push(m);return m};
 g.rb=(i,off)=>{const m=g.led(0xffffff,i);m.userData.rb=off||0;return m};
 g.glow=(c,s,o,pr)=>{const sp=glowSprite(c,s,o);g.userData.glows.push(sp);(pr||g).add(sp);return sp};
 return g}
function fan(g,s,mode,col,off){const f=new THREE.Group(),dk=MT(0x0b0d13,{metalness:.3,roughness:.55});
 bx(s,s,.04,dk,0,0,-.05,f);tor(s*.47,s*.035,dk,0,f);
 if(mode){tor(s*.42,s*.012,mode===2?g.rb(2.4,off):g.led(col,2.4),.012,f,64);const gl=g.glow(col,s*2.3,.38,f);if(mode===2)gl.userData.rb=off}
 const b=new THREE.Group(),bm=MT(0x232733,{metalness:.2,roughness:.5});
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2,bl=bx(s*.3,s*.11,.014,bm,Math.cos(a)*s*.23,Math.sin(a)*s*.23,0,b);bl.rotation.z=a;bl.rotateX(.65)}
 cy(s*.09,.07,dk,0,0,.01,b);f.add(b);g.userData.fans.push(b);return f}
/* ---------- composants 3D ---------- */
const B={};
B.case=o=>{const g=mkPart(),m=MT(o.col,{metalness:.75,roughness:.38}),dk=MT(new THREE.Color(o.col).multiplyScalar(.45).getHex(),{metalness:.5,roughness:.6}),tl=g.led(o.trim,1.8);
 bx(4,.14,2,m,0,-2.33,0,g);
 [[-1.95,-.95],[1.95,-.95],[-1.95,.95],[1.95,.95]].forEach(([x,z])=>{bx(.1,4.8,.1,m,x,0,z,g);bx(.25,.12,.25,dk,x*.82,-2.46,z*.74,g)});
 bx(4,.1,.1,m,0,2.35,-.95,g);bx(4,.1,.1,m,0,2.35,.95,g);bx(.1,.1,2,m,-1.95,2.35,0,g);bx(.1,.1,2,m,1.95,2.35,0,g);
 bx(4,4.8,.05,dk,0,0,-.975,g);bx(.05,4.8,2,m,-1.975,0,0,g);
 for(let i=0;i<9;i++)bx(.04,4.7,.07,m,2,0,-.8+i*.2,g);
 bx(.04,4.8,.04,tl,2.04,0,.97,g);bx(.04,4.8,.04,tl,2.04,0,-.97,g);bx(3.7,.04,.04,tl,0,-2.4,.97,g);
 if(o.id==='cyb')for(let i=0;i<3;i++){bx(.05,2.8,.02,tl,-1.2+i*.9,.2,-.94,g).rotation.z=.5}
 const gl=new THREE.Mesh(new THREE.BoxGeometry(3.9,4.7,.04),new THREE.MeshPhysicalMaterial({color:0x9fc4e8,metalness:0,roughness:.05,transparent:true,opacity:.1,envMapIntensity:2.2,clearcoat:1,depthWrite:false}));
 gl.position.z=1;gl.renderOrder=20;g.add(gl);g.userData.glass=gl;
 g.glow(o.trim,8,.25).position.set(0,-2.4,.3);return g};
B.mobo=o=>{const g=mkPart(),hs=MT(0x2a2f3b,{metalness:.9,roughness:.3}),ac=g.led(o.acc,1.7),sl=MT(0x07080c,{metalness:.3,roughness:.7});
 bx(3,3,.08,MT(o.col,{metalness:.35,roughness:.55}),0,0,0,g);
 bx(.62,1,.34,hs,-1.15,1,.2,g);bx(.5,.03,.03,ac,-1.15,.55,.38,g);
 bx(1.9,.26,.24,hs,.2,1.38,.14,g);bx(1.7,.02,.02,ac,.2,1.52,.27,g);
 for(let i=0;i<4;i++)bx(.07,1.45,.1,sl,.55+i*.15,.45,.09,g);
 bx(2.3,.1,.1,sl,-.2,-.7,.08,g);bx(.9,.28,.1,hs,.5,-1.33,.1,g);bx(.7,.02,.02,ac,.5,-1.2,.17,g);bx(3,.03,.03,ac,0,-1.48,.06,g);
 const lb=label(o.b,.5,.12,'#cfd6e6');lb.position.set(-1.15,1.25,.375);g.add(lb);
 let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<46;i++)bx(.05+rnd()*.12,.05+rnd()*.12,.04+rnd()*.06,MT(rnd()>.5?0x3a3f4b:0x8a7a3a,{metalness:.8,roughness:.4}),-1.4+rnd()*2.8,-1.4+rnd()*2.8,.07,g);
 return g};
B.cpu=o=>{const g=mkPart(),bc=BR[o.b]||0x00e5ff;
 bx(.72,.72,.02,MT(0x8c93a2,{metalness:.9,roughness:.4}),0,0,-.02,g);bx(.6,.6,.03,MT(0x1c3a2c,{metalness:.2,roughness:.6}),0,0,0,g);
 bx(.46,.46,.035,MT(0xd5dae4,{metalness:1,roughness:.22}),0,0,.035,g);
 const lb=label(o.b==='AMD'?'RYZEN':'CORE',.34,.1,'#2a2f3a');lb.position.set(0,.06,.056);g.add(lb);
 bx(.3,.012,.004,g.led(bc,2.2),0,-.12,.054,g);return g};
B.cooler=o=>{const g=mkPart(),al=MT(0xc4cad6,{metalness:1,roughness:.3}),dk=MT(0x0d0f15,{metalness:.5,roughness:.5});
 if(o.type==='air'){bx(.8,.8,.05,dk,0,0,.02,g);for(let i=-2;i<=2;i++)cy(.03,.3,al,i*.14,0,.18,g);
  for(let i=0;i<12;i++)bx(1,1.3,.015,al,0,0,.3+i*.045,g);bx(1.02,1.32,.03,dk,0,0,.83,g);const f=fan(g,1.15,0,0,0);f.position.z=.88;g.add(f)}
 else{const rad=o.rad,Lr=1.2*rad+.1,xl=.7-Lr/2;
  cy(.3,.16,dk,0,0,.12,g);tor(.22,.018,rad===3?g.rb(2.2,0):g.led(0x00e5ff,2.2),.22,g);
  const gs=g.glow(rad===3?0xffffff:0x00e5ff,1.8,.5);gs.position.z=.3;if(rad===3)gs.userData.rb=0;
  bx(Lr,.27,1.2,MT(0x15181f,{metalness:.8,roughness:.4}),.7,1.3,.62,g);bx(Lr*.95,.02,.02,g.led(0x00e5ff,1.5),.7,1.3,1.23,g);
  [.4,.85].forEach((z,i)=>{const c=new THREE.CatmullRomCurve3([new THREE.Vector3(i?.12:-.12,.2,.2),new THREE.Vector3((i?0:-.2)+xl*.3,.6,(.2+z)/2),new THREE.Vector3(xl+.1,1,z),new THREE.Vector3(xl-.02,1.3,z)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(c,28,.045,8),MT(0x0b0c10,{metalness:.2,roughness:.7})))});
  for(let i=0;i<rad;i++){const f=fan(g,1.18,rad===3?2:1,0x00e5ff,i*.33);f.rotation.x=-Math.PI/2;f.position.set(.7+(i-(rad-1)/2)*1.2,1.48,.62);g.add(f)}}
 return g};
B.ram=o=>{const g=mkPart(),idx=o.k===2?[1,3]:[0,1,2,3],sp=MT(0x2d323e,{metalness:.9,roughness:.3}),pc=MT(0x14181f,{metalness:.3,roughness:.6});
 idx.forEach(i=>{const x=i*.15;bx(.06,1.3,.34,pc,x,0,0,g);bx(.085,1.22,.3,sp,x,-.02,0,g);
  bx(.095,.07,.3,o.rb?g.rb(2,i*.2):g.led(o.acc,2),x,.62,0,g);
  const s=g.glow(o.rb?0xffffff:o.acc,.8,.3);if(o.rb)s.userData.rb=i*.2;s.position.set(x,.66,.12)});return g};
B.gpu=o=>{const g=mkPart(),L=o.L,H=.9,ac=g.led(o.acc,2),mode=o.id==='5090'?2:1;
 bx(L,H,.46,MT(0x11141b,{metalness:.7,roughness:.35}),0,0,0,g);bx(L*.97,H*.95,.02,MT(0x07080c,{metalness:.4,roughness:.6}),0,0,.235,g);
 bx(L*.96,.03,.05,ac,0,H/2-.015,.24,g);bx(L*.96,.03,.05,ac,0,-H/2+.015,.24,g);
 bx(.06,H*1.08,.46,MT(0xcfd5df,{metalness:1,roughness:.3}),-L/2-.03,0,0,g);
 bx(.45,.14,.25,MT(0x050608),L/2-.55,H/2+.07,0,g);bx(.25,.02,.02,ac,L/2-.55,H/2+.15,.1,g);
 const n=o.f,s=Math.min(H*.84,L/n*.92);
 for(let i=0;i<n;i++){const f=fan(g,s,mode,o.acc,i*.3);f.position.set((i-(n-1)/2)*L/n,0,.26);g.add(f)}
 g.glow(o.acc,L*1.1,.32).position.set(0,0,.5);return g};
B.storage=o=>{const g=mkPart(),ac=g.led(o.acc,2);
 bx(.7,1,.07,MT(0x151820,{metalness:.8,roughness:.35}),0,0,0,g);bx(.54,.64,.01,MT(0x0a0b10),0,-.05,.04,g);
 bx(.46,.04,.012,ac,0,.18,.05,g);bx(.3,.03,.012,ac,0,.08,.05,g);bx(.05,.05,.02,ac,.25,.42,.045,g);g.glow(o.acc,.9,.3).position.z=.1;
 if(o.hdd){bx(.72,1.4,.3,MT(0x9aa1ad,{metalness:.9,roughness:.35}),0,-1.45,.12,g);bx(.6,.03,.02,g.led(0xffb020,1.5),0,-1.05,.275,g)}
 return g};
B.psu=o=>{const g=mkPart(),dk=MT(0x0e1017,{metalness:.7,roughness:.4}),ac=g.led(o.acc,1.8);
 bx(3.4,.8,1.75,dk,0,0,0,g);bx(3.9,.06,1.95,MT(0x090a0f,{metalness:.6,roughness:.45}),0,.43,0,g);bx(3.3,.04,.02,ac,0,.3,.9,g);
 for(let i=0;i<20;i++)bx(.06,.3,.01,MT(0),-1.48+i*.156,-.1,.885,g);
 for(let i=0;i<o.seg;i++)bx(.14,.06,.02,ac,1.4-i*.22,-.32,.9,g);
 const lb=label('VOLTFORGE',1.2,.2,'#8a93a8');lb.position.set(-1.1,.15,.9);g.add(lb);
 [.5,.75].forEach(x=>{const c=new THREE.CatmullRomCurve3([new THREE.Vector3(x,.45,-.3),new THREE.Vector3(x+.1,.65,-.2),new THREE.Vector3(x-.05,.9,-.3)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(c,16,.04,6),g.led(o.acc,.35)))});
 return g};
B.fans=o=>{const g=mkPart(),fr=new THREE.Group(),rr=new THREE.Group(),c=o.acc||0x00e5ff;g.add(fr,rr);g.userData.front=fr;g.userData.rear=rr;
 (o.front===2?[.7,-.5]:[1.3,.1,-1.1]).forEach((y,i)=>{const f=fan(g,1.2,o.rgb,c,i*.3);f.rotation.y=Math.PI/2;f.position.set(1.8,y,0);fr.add(f)});
 const f=fan(g,1.2,o.rgb,c,.9);f.rotation.y=-Math.PI/2;f.position.set(-1.82,1,0);rr.add(f);return g};
/* ancres et vue éclatée */
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const AN={case:V3(0,0,0),mobo:V3(-.35,.15,-.82),cpu:V3(-.7,.6,-.74),cooler:V3(-.7,.6,-.66),ram:V3(.2,.6,-.61),gpu:V3(-.35,-.55,-.4),storage:V3(1.5,.95,-.88),psu:V3(-.15,-1.9,-.05),fans:V3(0,0,0)};
const EX={case:V3(0,0,0),mobo:V3(0,0,-.5),cpu:V3(0,.3,1.8),cooler:V3(-.3,.4,3),ram:V3(.9,.2,2),gpu:V3(0,-.3,2.4),storage:V3(1.3,0,1.4),psu:V3(0,-1.3,.4),fans:V3(0,0,0)};
const TG=Object.assign({},AN,{fans:V3(1.8,.1,0)});
const ob=t=>{const c1=1.4,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
function prep(p,slot){const s=new Set();p.traverse(m=>{if(m.isMesh)[].concat(m.material).forEach(x=>s.add(x))});
 p.userData.mats=[...s].map(x=>{x.userData.o=x.opacity;x.userData.t=x.transparent;return x});
 Object.assign(p.userData,{slot,fly:new THREE.Vector3(),spawn:V3((Math.random()-.5)*6,4+Math.random()*2,5),v:1,fv:1})}
function fade(p,v){if(p.userData.fv===v)return;p.userData.fv=v;const on=v<.999;p.userData.mats.forEach(m=>{m.transparent=on||m.userData.t;m.opacity=m.userData.o*v})}
function rv(p,t){const e=1-Math.pow(1-t,3);p.userData.fly.copy(p.userData.spawn).multiplyScalar(1-e);p.scale.setScalar(Math.max(.001,lerp(.15,1,ob(t))));p.rotation.set((1-e)*.6,(1-e)*2.2,0);p.userData.v=t;fade(p,t);p.visible=t>.002}
function dispose(p){p.traverse(m=>{if(m.isSprite){m.material.dispose();return}if(m.geometry)m.geometry.dispose();if(m.material)[].concat(m.material).forEach(x=>{if(x.map&&x.map!==GT)x.map.dispose();x.dispose()})})}
/* ---------- plateau + logique d'un "rig" (une tour complète) ---------- */
function Rig(ox){
 const g=new THREE.Group();g.position.x=ox;scene.add(g);
 const pivot=new THREE.Group();g.add(pivot);
 const parts={},gone=new Set(),o={g,pivot,parts,pw:0,ex:0,exp:false,yaw:-.5,yawT:-.5,pitch:.08,pitchT:.08,on:false,spin:true,hold:false};
 const pl=new THREE.Group();pl.position.y=-2.62;g.add(pl);
 const bm=(c,op)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false});
 const ring=(r,t,c,op,arc)=>{const m=new THREE.Mesh(new THREE.RingGeometry(r-t,r,160,1,0,arc||Math.PI*2),bm(c,op));m.rotation.x=-Math.PI/2;pl.add(m);return m};
 ring(3.4,.03,0x00e5ff,.8);ring(4.3,.015,0xff2e93,.35);ring(5.4,.01,0x7c4dff,.3);
 const arc=ring(4.8,.05,0x00e5ff,.7,Math.PI*1.4);
 const tp=[];for(let i=0;i<90;i++){const a=i/90*Math.PI*2,r2=i%5?3.9:4.05;tp.push(Math.cos(a)*3.8,0,Math.sin(a)*3.8,Math.cos(a)*r2,0,Math.sin(a)*r2)}
 const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(tp,3));
 const ticks=new THREE.LineSegments(tg,new THREE.LineBasicMaterial({color:0x00e5ff,transparent:true,opacity:.45,blending:THREE.AdditiveBlending}));pl.add(ticks);
 const disc=new THREE.Mesh(new THREE.PlaneGeometry(11,11),new THREE.MeshBasicMaterial({map:GT,color:0x00e5ff,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false}));disc.rotation.x=-Math.PI/2;disc.position.y=.01;pl.add(disc);
 const N=260,pp=new Float32Array(N*3);for(let i=0;i<N;i++){const r=4+Math.random()*5,a=Math.random()*6.283;pp[i*3]=Math.cos(a)*r;pp[i*3+1]=(Math.random()-.5)*8;pp[i*3+2]=Math.sin(a)*r}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
 const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:.05,color:0x66f0ff,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));g.add(pts);
 const scan=new THREE.Mesh(new THREE.RingGeometry(3.3,3.42,128),bm(0x7ee8ff,.9));scan.rotation.x=-Math.PI/2;scan.visible=false;g.add(scan);
 function pulse(slot){const flat=slot==='case'||slot==='psu'||slot==='fans',a=flat?V3(0,-2.4,0):TG[slot].clone(),S=slot==='case'?6:3.5;
  const r=new THREE.Mesh(new THREE.TorusGeometry(.6,.025,8,64),bm(0x00e5ff,1));r.position.copy(a);if(flat)r.rotation.x=Math.PI/2;pivot.add(r);
  gsap.to(r.scale,{x:S,y:S,z:S,duration:.9,ease:'power2.out'});
  gsap.to(r.material,{opacity:0,duration:.9,onComplete:()=>{pivot.remove(r);r.geometry.dispose();r.material.dispose()}});
  const f=glowSprite(0x9ff4ff,2.4,1);f.position.copy(a);pivot.add(f);
  gsap.to(f.scale,{x:7,y:7,duration:.7,ease:'power2.out'});
  gsap.to(f.material,{opacity:0,duration:.7,onComplete:()=>{pivot.remove(f);f.material.dispose()}})}
 o.set=(slot,opt,anim,done)=>{
  if(parts[slot])o.remove(slot,anim!==false);
  const p=B[slot](opt);prep(p,slot);pivot.add(p);parts[slot]=p;
  if(anim===false){rv(p,1);return p}
  const s={v:0};rv(p,0);
  gsap.to(s,{v:1,duration:1.25,ease:'none',onUpdate:()=>rv(p,s.v),onComplete:()=>{rv(p,1);pulse(slot);done&&done()}});
  return p};
 o.remove=(slot,anim)=>{const p=parts[slot];if(!p)return;delete parts[slot];
  if(anim===false){pivot.remove(p);dispose(p);return}
  gone.add(p);const s={v:1};
  gsap.to(s,{v:0,duration:.6,ease:'power2.in',onUpdate:()=>rv(p,s.v),onComplete:()=>{gone.delete(p);pivot.remove(p);dispose(p)}})};
 o.reveal=(slot,t)=>{const p=parts[slot];if(p)rv(p,t)};
 o.power=on=>{o.on=on;gsap.killTweensOf(o,'pw');gsap.to(o,{pw:on?1:0,duration:on?1.8:.5,ease:on?'power2.in':'power2.out'});
  if(on){scan.visible=true;scan.position.y=-2.5;gsap.killTweensOf(scan.position);gsap.to(scan.position,{y:2.6,duration:1.7,ease:'power1.inOut',onComplete:()=>{scan.visible=false}})}};
 o.explode=on=>{o.exp=on;gsap.to(o,{ex:on?1:0,duration:1.2,ease:'power3.inOut'})};
 o.update=(t,dt)=>{
  pivot.position.y=Math.sin(t*.9)*.05;pivot.rotation.set(o.pitch,o.yaw,0);
  arc.rotation.z=t*.4;ticks.rotation.y=-t*.1;pts.rotation.y=t*.03;
  const spd=(.3+o.pw*16)*dt;
  if(parts.case)parts.case.userData.glass.visible=o.ex<.3;
  [...Object.values(parts),...gone].forEach(p=>{
   const u=p.userData,s=u.slot;
   p.position.copy(AN[s]).addScaledVector(EX[s],o.ex).add(u.fly);
   if(s==='fans'){u.front.position.x=o.ex*1.4;u.rear.position.x=-o.ex*1.4}
   u.leds.forEach(m=>{m.emissiveIntensity=m.userData.base*(.1+.9*o.pw);if(m.userData.rb!==undefined)m.emissive.setHSL((t*.15+m.userData.rb)%1,1,.5)});
   u.glows.forEach(q=>{q.material.opacity=q.userData.o*(.15+.85*o.pw)*u.v;if(q.userData.rb!==undefined)q.material.color.setHSL((t*.15+q.userData.rb)%1,1,.6)});
   u.fans.forEach(b=>{b.rotation.z+=spd})})};
 return o}
/* ---------- deux tours : hero (x=200) et configurateur (x=-200) ---------- */
const hr=Rig(200),cr=Rig(-200);
const ORD=['case','mobo','psu','cpu','cooler','ram','gpu','storage','fans'];
const H={p:0,scrub(p){H.p=p;ORD.forEach((s,i)=>hr.reveal(s,clamp((p-(.03+i*.095))/.13)));const on=p>.965;if(on!==hr.on)hr.power(on)}};
VF.hero=H;VF.rigs={hero:hr,cfg:cr};
function buildHero(){const t=VF.P[3].sel;ORD.forEach(s=>hr.set(s,VF.find(s,t[s]),false));H.scrub(H.p)}
(document.fonts&&document.fonts.load?document.fonts.load('700 40px "Space Grotesk"'):Promise.resolve()).catch(()=>{}).then(buildHero);
/* ---------- vues (scissor) + boucle de rendu ---------- */
const V=[{el:$('.vf_hero_stage'),rig:hr,hero:true},{el:$('.vf_cfg_stage'),rig:cr}].filter(v=>v.el).map(v=>(v.cam=new THREE.PerspectiveCamera(30,1,.1,200),v));
const mouse={x:0,y:0,sx:0,sy:0};
addEventListener('pointermove',e=>{mouse.x=e.clientX/innerWidth-.5;mouse.y=e.clientY/innerHeight-.5},{passive:true});
const size=()=>R.setSize(innerWidth,innerHeight,false);size();addEventListener('resize',size);
gsap.ticker.add((time,dtms)=>{
 const dt=Math.min(.05,dtms/1000);
 if(VF.pre)VF.pre(time);
 mouse.sx=lerp(mouse.sx,mouse.x,.05);mouse.sy=lerp(mouse.sy,mouse.y,.05);
 R.setScissorTest(false);R.clear();R.setScissorTest(true);
 V.forEach(v=>{
  const r=v.el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.width<8||r.height<8)return;
  const a=r.width/r.height,cam=v.cam,ox=v.rig.g.position.x,k=Math.max(1,.9/a);
  if(cam.aspect!==a){cam.aspect=a;cam.updateProjectionMatrix()}
  if(v.hero){const q=clamp(H.p*1.3);
   v.rig.yaw=-.5-(1-clamp(H.p*1.15))*Math.PI*1.4+mouse.sx*.5;v.rig.pitch=.08-mouse.sy*.2;
   cam.position.set(ox,lerp(2.4,.9,q),13.5*k*lerp(1.15,1,q));cam.lookAt(ox,0,0);
   const w=a>1.1;cam.setViewOffset(r.width,r.height,w?-r.width*.15:0,w?0:-r.height*.2,r.width,r.height);
  }else{
   const rg=v.rig,f=1-Math.pow(.001,dt);
   if(rg.spin&&!rg.hold)rg.yawT+=dt*.3;
   rg.yaw=lerp(rg.yaw,rg.yawT,f);rg.pitch=lerp(rg.pitch,rg.pitchT,f);
   cam.position.set(ox,1.2,13*k);cam.lookAt(ox,0,0)}
  v.rig.update(time,dt);
  const y=innerHeight-r.bottom;R.setViewport(r.left,y,r.width,r.height);R.setScissor(r.left,y,r.width,r.height);R.render(scene,cam)})
});
/* position écran d'un emplacement (pour le réticle) */
VF.slotScreen=slot=>{const v=V.find(x=>!x.hero);if(!v)return null;const r=v.el.getBoundingClientRect(),a=TG[slot].clone();v.rig.pivot.localToWorld(a);a.project(v.cam);return{x:r.left+(a.x*.5+.5)*r.width,y:r.top+(-a.y*.5+.5)*r.height}};
/* exposé pour le fichier 04 (portable) */
VF.eng={scene,Rig,B,AN,EX,TG,mkPart,MT,bx,label,fan,V3,V};
})();
