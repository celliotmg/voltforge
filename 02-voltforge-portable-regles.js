(function(){
const V=window.VF,C=V.C,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
V.mode='tower';
V.LSLOTS=[['lchassis','Châssis'],['lscreen','Écran'],['lcpu','Processeur'],['lgpu','Carte graphique'],['lram','Mémoire'],['lssd','Stockage'],['lbat','Batterie']];
V.LREQ=['lchassis','lscreen','lcpu','lram','lssd','lbat'];
Object.assign(C,{
lchassis:[
{id:'slim',n:'Aero 15 Slim',b:'VOLTFORGE',p:449,w:0,s:'15" · Alu 1,6 kg · Argent',sz:15,cap:120,col:0x9aa1ad,trim:0x00e5ff},
{id:'blk',n:'Stealth 16 Noir',b:'VOLTFORGE',p:599,w:0,s:'16" · Magnésium · Noir',sz:16,cap:230,col:0x0c0e15,trim:0x00e5ff},
{id:'wht',n:'Frost 16 Blanc',b:'VOLTFORGE',p:649,w:0,s:'16" · Magnésium · Blanc',sz:16,cap:230,col:0xdde4ee,trim:0xff2e93},
{id:'rift',n:'Rift 18 Vapor',b:'VOLTFORGE',p:899,w:0,s:'18" · Chambre à vapeur · Néon',sz:18,cap:330,col:0x16102a,trim:0x7c4dff}],
lscreen:[
{id:'fhd',n:'IPS 144 Hz',b:'AUO',p:129,w:10,s:'15,6" · Full HD · 144 Hz',sz:15,hue:190,acc:0x00e5ff},
{id:'qhd',n:'QHD+ 240 Hz',b:'BOE',p:249,w:12,s:'16" · 2560×1600 · 240 Hz',sz:16,hue:320,acc:0xff2e93},
{id:'oled',n:'OLED 4K',b:'Samsung',p:449,w:14,s:'16" · 3840×2400 · 120 Hz',sz:16,hue:265,acc:0x7c4dff},
{id:'mini',n:'Mini-LED 2,5K',b:'LG',p:599,w:16,s:'18" · 2560×1600 · 240 Hz',sz:18,hue:35,acc:0xffb020}],
lcpu:[
{id:'u5',n:'Core Ultra 5 235H',b:'Intel',p:229,w:45,s:'14 cœurs · 4,9 GHz',g:55,c:55},
{id:'r7',n:'Ryzen 7 8845HS',b:'AMD',p:329,w:54,s:'8 cœurs · 5,1 GHz',g:66,c:64},
{id:'u7',n:'Core Ultra 7 255H',b:'Intel',p:399,w:65,s:'16 cœurs · 5,1 GHz',g:72,c:76},
{id:'r9',n:'Ryzen 9 9955HX3D',b:'AMD',p:649,w:120,s:'16 cœurs · 3D V-Cache',g:96,c:92},
{id:'u9',n:'Core Ultra 9 275HX',b:'Intel',p:699,w:115,s:'24 cœurs · 5,4 GHz',g:84,c:97}],
lgpu:[
{id:'4050',n:'RTX 4050 Laptop',b:'NVIDIA',p:299,w:75,s:'6 Go · 1080p',g:45,c:38,acc:0x76b900},
{id:'5060',n:'RTX 5060 Laptop',b:'NVIDIA',p:449,w:100,s:'8 Go GDDR7 · 1080p',g:58,c:50,acc:0x00e5ff},
{id:'5070',n:'RTX 5070 Ti Laptop',b:'NVIDIA',p:749,w:115,s:'12 Go GDDR7 · 1440p',g:70,c:62,acc:0x00e5ff},
{id:'5080',n:'RTX 5080 Laptop',b:'NVIDIA',p:1199,w:150,s:'16 Go GDDR7 · 4K',g:82,c:78,acc:0x7c4dff},
{id:'5090',n:'RTX 5090 Laptop',b:'NVIDIA',p:1899,w:175,s:'24 Go GDDR7 · 4K+',g:92,c:92,acc:0xff2e93}],
lram:[
{id:'16',n:'SO-DIMM 16 Go',b:'Crucial',p:79,w:4,s:'DDR5-5600 · 2×8 Go',gb:16,acc:0x00e5ff},
{id:'32',n:'SO-DIMM 32 Go',b:'Crucial',p:139,w:4,s:'DDR5-5600 · 2×16 Go',gb:32,acc:0xff2e93},
{id:'64',n:'SO-DIMM 64 Go',b:'Crucial',p:259,w:5,s:'DDR5-5600 · 2×32 Go',gb:64,acc:0x7c4dff}],
lssd:[
{id:'1',n:'SN850X 1 To',b:'WD',p:99,w:6,s:'NVMe Gen4 · 7 300 Mo/s',acc:0x00e5ff},
{id:'2',n:'990 Pro 2 To',b:'Samsung',p:179,w:6,s:'NVMe Gen4 · 7 450 Mo/s',acc:0xff2e93},
{id:'4',n:'T500 4 To',b:'Crucial',p:399,w:7,s:'NVMe Gen4 · 7 400 Mo/s',acc:0x7c4dff}],
lbat:[
{id:'60',n:'60 Wh + chargeur 180 W',b:'VOLTFORGE',p:59,w:0,s:'60 Wh · USB-C 180 W',cap:180,wh:60,fill:.45,acc:0x00e5ff},
{id:'80',n:'80 Wh + chargeur 280 W',b:'VOLTFORGE',p:89,w:0,s:'80 Wh · GaN 280 W',cap:280,wh:80,fill:.7,acc:0xff2e93},
{id:'99',n:'99 Wh + chargeur 400 W',b:'VOLTFORGE',p:129,w:0,s:'99 Wh · GaN double 400 W',cap:400,wh:99,fill:1,acc:0x7c4dff}]});
V.PL=[
{id:'nomad',n:'Nomad',tag:'Ultraportable',use:'Études · Bureautique',sel:{lchassis:'slim',lscreen:'fhd',lcpu:'u5',lgpu:'4050',lram:'16',lssd:'1',lbat:'60'}},
{id:'volt',n:'Volt',tag:'Le plus vendu',hot:1,use:'1440p · Gaming nomade',sel:{lchassis:'blk',lscreen:'qhd',lcpu:'u7',lgpu:'5070',lram:'32',lssd:'2',lbat:'80'}},
{id:'apex',n:'Apex',tag:'Sans compromis',use:'4K · IA · Création',sel:{lchassis:'rift',lscreen:'mini',lcpu:'u9',lgpu:'5090',lram:'64',lssd:'4',lbat:'99'}}];
/* équilibre CPU/GPU : r = puissance CPU / puissance GPU */
V.balance=sel=>{const lap=V.mode==='laptop',cpu=lap?sel.lcpu:sel.cpu,gpu=lap?sel.lgpu:sel.gpu;
 if(!cpu||!gpu)return null;
 const r=cpu.g/gpu.g,pos=50+clamp(Math.log(r/1.15)/Math.log(2.2),-1,1)*50,loss=r<.82?Math.round(Math.min(70,(.82-r)/.82*220)):0;
 return{r,pos,loss,kind:loss>=30?'err':loss>=10?'warn':r>1.65?'cpu+':'ok'}};
V.hint=(sel,slot,o)=>{const lap=V.mode==='laptop';if(slot!==(lap?'lcpu':'cpu')&&slot!==(lap?'lgpu':'gpu'))return null;
 const b=V.balance(Object.assign({},sel,{[slot]:o}));return b&&(b.loss>=10||b.kind==='cpu+')?{loss:b.loss,kind:b.kind}:null};
function fin(sel,m,draw,lap,rec){
 const REQ=lap?V.LREQ:V.REQ,SS=lap?V.LSLOTS:V.SLOTS,cpu=lap?sel.lcpu:sel.cpu,gpu=lap?sel.lgpu:sel.gpu,ram=lap?sel.lram:sel.ram,b=V.balance(sel);
 if(b){if(b.kind==='err')m.push(['err','Goulot CPU : '+gpu.n+' bridée de '+b.loss+' % par '+cpu.n]);
  else if(b.kind==='warn')m.push(['warn','Léger goulot CPU : −'+b.loss+' % de perf GPU']);
  else if(b.kind==='cpu+')m.push(['warn','GPU limitant : un GPU plus puissant exploiterait mieux ce CPU']);
  else m.push(['ok','CPU et GPU bien équilibrés'])}
 if(ram&&gpu&&ram.gb<32&&gpu.g>=70)m.push(['warn',ram.gb+' Go de RAM : juste pour ce GPU']);
 const miss=REQ.filter(s=>!sel[s]),err=m.some(x=>x[0]==='err'),status=err?'err':miss.length?'inc':'ok';
 if(status==='ok')m.push(['ok','Configuration prête à démarrer']);
 if(miss.length)m.push(['info','Manque : '+miss.map(s=>SS.find(x=>x[0]===s)[1].toLowerCase()).join(', ')]);
 return{msgs:m,draw,miss,status,rec}}
function analyseT(sel){
 const {cpu,mobo,psu,cooler,gpu}=sel,m=[],draw=Object.keys(sel).length?Object.values(sel).reduce((a,o)=>a+(o.w||0),0)+50:0;
 if(cpu&&mobo)m.push(cpu.sock===mobo.sock?['ok','Socket '+cpu.sock+' compatible']:['err','Socket incompatible : CPU '+cpu.sock+' / carte mère '+mobo.sock]);
 if(psu&&draw){const r=psu.cap/draw;m.push(r<1.1?['err','Alimentation insuffisante ('+psu.cap+' W pour ~'+draw+' W)']:r<1.35?['warn','Marge électrique faible ('+Math.round(r*100-100)+' %)']:['ok','Alimentation confortable'])}
 if(cpu&&cooler)m.push(cooler.cap<cpu.w?['warn','Refroidissement limite ('+cooler.cap+' W pour un CPU de '+cpu.w+' W)']:['ok','Refroidissement adapté au CPU']);
 if(cpu&&!gpu)m.push(['warn','Pas de carte graphique : rendu limité']);
 return fin(sel,m,draw,false,Math.ceil(draw*1.3/50)*50)}
function analyseL(sel){
 const {lchassis:ch,lscreen:sc,lcpu:cpu,lgpu:gpu,lbat:bat}=sel,m=[],draw=Object.keys(sel).length?Object.values(sel).reduce((a,o)=>a+(o.w||0),0)+20:0;
 if(ch&&sc)m.push(ch.sz===sc.sz?['ok','Écran '+sc.sz+'" compatible avec le châssis']:['err','Écran '+sc.sz+'" ≠ châssis '+ch.sz+'"']);
 if(bat&&draw){const r=bat.cap/draw;m.push(r<1?['err','Chargeur insuffisant ('+bat.cap+' W pour ~'+draw+' W)']:r<1.1?['warn','Marge chargeur faible']:['ok','Alimentation confortable'])}
 if(ch&&cpu){const h=cpu.w+(gpu?gpu.w:0),r=ch.cap/h;m.push(r<.75?['err','Surchauffe : châssis '+ch.cap+' W pour '+h+' W de composants']:r<.85?['warn','Refroidissement limite : throttling possible']:['ok','Refroidissement adapté'])}
 return fin(sel,m,draw,true,Math.ceil(draw*1.15/10)*10)}
V.analyse=sel=>V.mode==='laptop'?analyseL(sel):analyseT(sel);
const oldI=V.incompat,oldP=V.perf;
V.incompat=(sel,slot,o)=>{
 if(slot==='lscreen'&&sel.lchassis&&sel.lchassis.sz!==o.sz)return o.sz+'" ≠ châssis '+sel.lchassis.sz+'"';
 if(slot==='lchassis'&&sel.lscreen&&sel.lscreen.sz!==o.sz)return o.sz+'" ≠ écran '+sel.lscreen.sz+'"';
 return oldI(sel,slot,o)};
function perfL(sel){const {lcpu:cpu,lgpu:gpu,lram:ram,lchassis:ch}=sel;
 const g=(gpu?gpu.g*.7:0)+(cpu?cpu.g*.3:0),c=(cpu?cpu.c*.55:0)+(gpu?gpu.c*.3:0)+(ram?Math.min(15,ram.gb/64*12+3):0),
 t=ch&&cpu?Math.min(100,ch.cap/(cpu.w+(gpu?gpu.w:0))*55):cpu?20:0;
 return{g:Math.round(g),c:Math.round(Math.min(100,c)),t:Math.round(t)}}
V.perf=sel=>{const p=V.mode==='laptop'?perfL(sel):oldP(sel),b=V.balance(sel);if(b&&b.loss)p.g=Math.round(p.g*(1-b.loss*.006));return p};
})();
