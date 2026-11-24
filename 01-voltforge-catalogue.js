window.VF=(function(){
const SLOTS=[['case','Boîtier'],['mobo','Carte mère'],['cpu','Processeur'],['cooler','Refroidissement'],['ram','Mémoire'],['gpu','Carte graphique'],['storage','Stockage'],['psu','Alimentation'],['fans','Ventilation']];
const REQ=['case','mobo','cpu','cooler','ram','storage','psu'];
const BR={AMD:0xff6a00,Intel:0x1aa7ff};
const C={
case:[
{id:'obs',n:'Obsidian Mesh',b:'VOLTFORGE',p:149,w:0,s:'ATX · Verre trempé · Noir',col:0x0c0e15,trim:0x00e5ff},
{id:'frs',n:'Frost Panorama',b:'VOLTFORGE',p:179,w:0,s:'ATX · Verre panoramique · Blanc',col:0xdde4ee,trim:0xff2e93},
{id:'cyb',n:'Cyber Rift',b:'VOLTFORGE',p:229,w:0,s:'ATX · Édition limitée · Néon',col:0x16102a,trim:0x7c4dff}],
mobo:[
{id:'b650',n:'B650 Tomahawk',b:'MSI',p:219,w:40,s:'AM5 · DDR5 · PCIe 4.0',sock:'AM5',col:0x1b2030,acc:0x00e5ff},
{id:'x870',n:'X870E Aorus Master',b:'GIGABYTE',p:499,w:60,s:'AM5 · DDR5 · PCIe 5.0 · Wi-Fi 7',sock:'AM5',col:0x15171f,acc:0xff2e93},
{id:'z790',n:'Z790 ROG Strix',b:'ASUS',p:329,w:50,s:'LGA1700 · DDR5 · PCIe 5.0',sock:'LGA1700',col:0x1a1c25,acc:0xff7a1a},
{id:'z890',n:'Z890 ROG Maximus',b:'ASUS',p:629,w:60,s:'LGA1851 · DDR5 · Thunderbolt 4',sock:'LGA1851',col:0x11131b,acc:0x7c4dff}],
cpu:[
{id:'r5',n:'Ryzen 5 7600X',b:'AMD',p:229,w:105,s:'6 cœurs · 5,3 GHz',sock:'AM5',g:68,c:52},
{id:'r7',n:'Ryzen 7 9800X3D',b:'AMD',p:499,w:120,s:'8 cœurs · 3D V-Cache',sock:'AM5',g:98,c:72},
{id:'r9',n:'Ryzen 9 9950X',b:'AMD',p:649,w:170,s:'16 cœurs · 5,7 GHz',sock:'AM5',g:88,c:98},
{id:'i5',n:'Core i5-14600K',b:'Intel',p:319,w:181,s:'14 cœurs · 5,3 GHz',sock:'LGA1700',g:75,c:68},
{id:'i7',n:'Core i7-14700K',b:'Intel',p:409,w:253,s:'20 cœurs · 5,6 GHz',sock:'LGA1700',g:82,c:84},
{id:'u7',n:'Core Ultra 7 265K',b:'Intel',p:399,w:250,s:'20 cœurs · 5,5 GHz',sock:'LGA1851',g:80,c:88},
{id:'u9',n:'Core Ultra 9 285K',b:'Intel',p:629,w:250,s:'24 cœurs · 5,7 GHz',sock:'LGA1851',g:86,c:97}],
cooler:[
{id:'air',n:'NH-D15 Chromax',b:'Noctua',p:109,w:5,s:'Air · Double tour · 220 W',cap:220,type:'air'},
{id:'a240',n:'LF III 240',b:'Arctic',p:119,w:12,s:'AIO 240 mm · 260 W',cap:260,type:'aio',rad:2},
{id:'a360',n:'iCUE H150i Elite',b:'Corsair',p:219,w:15,s:'AIO 360 mm · ARGB · 380 W',cap:380,type:'aio',rad:3}],
ram:[
{id:'16',n:'Vengeance 16 Go',b:'Corsair',p:69,w:5,s:'DDR5-6000 · 2×8 Go',k:2,gb:16,acc:0x00e5ff},
{id:'32',n:'Trident Z5 32 Go',b:'G.Skill',p:119,w:8,s:'DDR5-6400 · 2×16 Go',k:2,gb:32,acc:0xff2e93},
{id:'64',n:'Dominator 64 Go',b:'Corsair',p:219,w:12,s:'DDR5-6400 · 4×16 Go · RGB',k:4,gb:64,rb:1},
{id:'128',n:'Dominator Titanium 128 Go',b:'Corsair',p:449,w:20,s:'DDR5-6000 · 4×32 Go · RGB',k:4,gb:128,rb:1}],
gpu:[
{id:'4060',n:'GeForce RTX 4060',b:'NVIDIA',p:299,w:115,s:'8 Go GDDR6 · 1080p',g:52,c:42,L:2.3,f:2,acc:0x76b900},
{id:'5070',n:'GeForce RTX 5070',b:'NVIDIA',p:599,w:250,s:'12 Go GDDR7 · 1440p',g:72,c:62,L:2.7,f:3,acc:0x00e5ff},
{id:'9070',n:'Radeon RX 9070 XT',b:'AMD',p:649,w:304,s:'16 Go GDDR6 · 4K',g:78,c:60,L:2.8,f:3,acc:0xff3030},
{id:'5080',n:'GeForce RTX 5080',b:'NVIDIA',p:1199,w:360,s:'16 Go GDDR7 · 4K',g:90,c:80,L:2.95,f:3,acc:0x7c4dff},
{id:'5090',n:'GeForce RTX 5090',b:'NVIDIA',p:2199,w:575,s:'32 Go GDDR7 · 8K',g:100,c:100,L:3,f:3,acc:0xff2e93}],
storage:[
{id:'1',n:'980 Pro 1 To',b:'Samsung',p:89,w:6,s:'NVMe Gen4 · 7 000 Mo/s',acc:0x00e5ff,hdd:0},
{id:'2',n:'990 Pro 2 To',b:'Samsung',p:169,w:7,s:'NVMe Gen4 · 7 450 Mo/s',acc:0xff2e93,hdd:0},
{id:'4',n:'T705 4 To',b:'Crucial',p:429,w:10,s:'NVMe Gen5 · 14 500 Mo/s',acc:0x7c4dff,hdd:0},
{id:'dual',n:'990 Pro 2 To + HDD 8 To',b:'Samsung · Seagate',p:269,w:16,s:'NVMe 2 To + stockage 8 To',acc:0xffb020,hdd:1}],
psu:[
{id:'650',n:'RM650e',b:'Corsair',p:99,w:0,cap:650,s:'650 W · 80+ Gold',acc:0x00e5ff,seg:1},
{id:'850',n:'RM850x',b:'Corsair',p:149,w:0,cap:850,s:'850 W · 80+ Gold',acc:0x00e5ff,seg:2},
{id:'1000',n:'HX1000i',b:'Corsair',p:229,w:0,cap:1000,s:'1000 W · 80+ Platinum',acc:0xff2e93,seg:3},
{id:'1600',n:'AX1600i',b:'Corsair',p:449,w:0,cap:1600,s:'1600 W · 80+ Titanium',acc:0x7c4dff,seg:4}],
fans:[
{id:'st',n:'Stock PWM',b:'VOLTFORGE',p:29,w:6,s:'2×120 + 1×120 · Silence',front:2,rgb:0},
{id:'ar',n:'Aero ARGB',b:'VOLTFORGE',p:79,w:12,s:'3×120 + 1×120 · ARGB',front:3,rgb:1,acc:0x00e5ff},
{id:'ul',n:'Hyperion Rainbow',b:'VOLTFORGE',p:149,w:18,s:'3×120 + 1×120 · Rainbow',front:3,rgb:2}]
};
const P=[
{id:'spark',n:'Spark',tag:'Entrée de gamme',use:'1080p · Esport',sel:{case:'obs',mobo:'b650',cpu:'r5',cooler:'air',ram:'16',gpu:'4060',storage:'1',psu:'650',fans:'st'}},
{id:'phantom',n:'Phantom',tag:'Le plus vendu',hot:1,use:'1440p · Gaming',sel:{case:'obs',mobo:'b650',cpu:'r7',cooler:'a240',ram:'32',gpu:'5070',storage:'2',psu:'850',fans:'ar'}},
{id:'atlas',n:'Atlas',tag:'Création & Stream',use:'4K · Montage · 3D',sel:{case:'frs',mobo:'x870',cpu:'r9',cooler:'a360',ram:'64',gpu:'5080',storage:'dual',psu:'1000',fans:'ar'}},
{id:'titan',n:'Titan',tag:'Sans compromis',use:'8K · IA · Workstation',sel:{case:'cyb',mobo:'z890',cpu:'u9',cooler:'a360',ram:'128',gpu:'5090',storage:'4',psu:'1600',fans:'ul'}}];
const EUR=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
const hex=n=>'#'+n.toString(16).padStart(6,'0');
const find=(s,id)=>C[s].find(o=>o.id===id);
const price=sel=>Object.values(sel).reduce((a,o)=>a+o.p,0);
const pSel=p=>Object.fromEntries(Object.entries(p.sel).map(([s,id])=>[s,find(s,id)]));
function incompat(sel,slot,o){
 if(slot==='cpu'&&sel.mobo&&sel.mobo.sock!==o.sock)return 'Socket '+o.sock+' ≠ '+sel.mobo.sock;
 if(slot==='mobo'&&sel.cpu&&sel.cpu.sock!==o.sock)return 'Socket '+o.sock+' ≠ '+sel.cpu.sock;
 return ''}
function analyse(sel){
 const {cpu,mobo,psu,cooler,gpu}=sel,parts=Object.values(sel),m=[];
 const draw=parts.length?parts.reduce((a,o)=>a+(o.w||0),0)+50:0;
 if(cpu&&mobo)m.push(cpu.sock===mobo.sock?['ok','Socket '+cpu.sock+' compatible']:['err','Socket incompatible : CPU '+cpu.sock+' / carte mère '+mobo.sock]);
 if(psu&&draw){const r=psu.cap/draw;m.push(r<1.1?['err','Alimentation insuffisante ('+psu.cap+' W pour ~'+draw+' W)']:r<1.35?['warn','Marge électrique faible ('+Math.round(r*100-100)+' %)']:['ok','Alimentation confortable']);}
 if(cpu&&cooler)m.push(cooler.cap<cpu.w?['warn','Refroidissement limite ('+cooler.cap+' W pour un CPU de '+cpu.w+' W)']:['ok','Refroidissement adapté au CPU']);
 if(cpu&&!gpu)m.push(['warn','Pas de carte graphique : rendu limité']);
 const miss=REQ.filter(s=>!sel[s]),err=m.some(x=>x[0]==='err'),status=err?'err':miss.length?'inc':'ok';
 if(status==='ok')m.push(['ok','Configuration prête à démarrer']);
 if(miss.length)m.push(['info','Manque : '+miss.map(s=>SLOTS.find(x=>x[0]===s)[1].toLowerCase()).join(', ')]);
 return {msgs:m,draw,miss,status,rec:Math.ceil(draw*1.3/50)*50}}
function perf(sel){
 const {cpu,gpu,ram,cooler}=sel;
 const g=(gpu?gpu.g*.7:0)+(cpu?cpu.g*.3:0),c=(cpu?cpu.c*.55:0)+(gpu?gpu.c*.3:0)+(ram?Math.min(15,ram.gb/128*15+3):0);
 const t=cpu&&cooler?Math.min(100,cooler.cap/cpu.w*55):cpu?20:0;
 return {g:Math.round(g),c:Math.round(Math.min(100,c)),t:Math.round(t)}}
return {SLOTS,REQ,BR,C,P,EUR,hex,find,price,pSel,incompat,analyse,perf,gl:true}
})();
