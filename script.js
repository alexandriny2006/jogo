const TERMS=[
{n:'CPU',g:0,c:'Cérebro do computador: busca, decodifica e executa as instruções dos programas.'},
{n:'ULA',g:0,c:'Parte da CPU que faz as contas e as operações lógicas.'},
{n:'UC',g:0,c:'Parte da CPU que comanda e coordena o que os outros componentes fazem.'},
{n:'Registradores',g:0,c:'Minúsculas e ultrarrápidas, ficam dentro da CPU guardando o que ela usa agora.'},
{n:'RAM',g:1,c:'Memória volátil e rápida que guarda programas e dados em uso; apaga sem energia.'},
{n:'ROM',g:1,c:'Memória só de leitura, guarda dados fixos e os mantém mesmo sem energia.'},
{n:'EEPROM',g:1,c:'Memória não volátil que se apaga e regrava eletricamente, sem tirar o chip.'},
{n:'Flash',g:1,c:'Memória não volátil apagada em blocos, comum em pen drives e cartões SD.'},
{n:'Cache',g:1,c:'Memória pequena e veloz entre CPU e RAM, guarda o que é muito acessado.'},
{n:'Memória de massa',g:1,c:'Guarda arquivos e programas em grande quantidade, mesmo com o computador desligado.'},
{n:'DMA',g:2,c:'Deixa periféricos trocarem dados com a memória sem ocupar a CPU na transferência.'},
{n:'Address bus',g:2,c:'Caminho por onde a CPU informa qual posição da memória quer acessar.'},
{n:'Data bus',g:2,c:'Via que transporta o conteúdo lido ou escrito entre CPU, memória e periféricos.'},
{n:'Microcontrolador',g:3,c:'Chip único com processador, memória e periféricos, usado em sistemas embarcados.'},
{n:'Dual core',g:3,c:'Processador com dois núcleos que executam tarefas em paralelo.'},
{n:'Quad core',g:3,c:'Processador com quatro núcleos de execução.'}
];
const C=document.getElementById('c'),x=C.getContext('2d');
const W=800,H=450,F=500,EY=1.6,GR=9.8,N=TERMS.length,DPR=Math.min(2,window.devicePixelRatio||1),ZEND=1.1;
C.width=W*DPR;C.height=H*DPR;
const $=id=>document.getElementById(id);
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
let S=null,playing=false,M={x:400,y:225},charging=false,charge=0,cd=0,last=0,yaw=0,pit=0,TT=0,FOG=0;
const R=(a,b,c,d,col)=>{x.fillStyle=col;x.fillRect(a,b,c,d)};
const FONT='"VT323","Courier New",monospace';
function T(s,px,py,sz,col,al){x.font=sz+'px '+FONT;x.textAlign=al||'left';x.fillStyle='rgba(0,0,0,.65)';x.fillText(s,px+1.5,py+1.5);x.fillStyle=col;x.fillText(s,px,py)}
function plate(a,b,w,h){x.fillStyle='rgba(12,14,18,.58)';x.fillRect(a,b,w,h);x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=1;x.strokeRect(a+.5,b+.5,w-1,h-1)}

/* ---- cor e textura ---- */
const _c={};
const rgb=h=>_c[h]||(_c[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
function mix(a,b,t){const A=rgb(a),B=rgb(b);return 'rgb('+(A[0]+(B[0]-A[0])*t|0)+','+(A[1]+(B[1]-A[1])*t|0)+','+(A[2]+(B[2]-A[2])*t|0)+')'}
function hs(i,j,s){const v=Math.sin(i*127.1+j*311.7+s*74.7)*43758.5453;return v-Math.floor(v)}
function tex(x0,y0,w,h,base,s,c){
  c=c||3;R(x0,y0,w,h,base);
  for(let j=0;j<h;j+=c)for(let i=0;i<w;i+=c){
    const r=hs(i/c,j/c,s);
    if(r<.3)R(x0+i,y0+j,Math.min(c,w-i),Math.min(c,h-j),'rgba(0,0,0,.15)');
    else if(r>.78)R(x0+i,y0+j,Math.min(c,w-i),Math.min(c,h-j),'rgba(255,255,255,.13)');
  }
  const e=Math.min(c,w);R(x0,y0,e,h,'rgba(255,255,255,.12)');R(x0+w-e,y0,e,h,'rgba(0,0,0,.22)');R(x0,y0+h-Math.min(c,h),w,Math.min(c,h),'rgba(0,0,0,.2)');
  if(FOG>0)R(x0,y0,w,h,'rgba(207,227,242,'+FOG+')');
}

/* ---- projeção ---- */
function pr(X,Y,Z){
  const dy=Y-EY,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pit),sp=Math.sin(pit);
  const x1=X*cy-Z*sy,z1=X*sy+Z*cy,y2=dy*cp-z1*sp,z2=dy*sp+z1*cp;
  return z2<.2?null:{x:W/2+F*x1/z2,y:H/2-F*y2/z2,s:F/z2,z:z2};
}
const fwd=()=>[Math.sin(yaw)*Math.cos(pit),Math.sin(pit),Math.cos(yaw)*Math.cos(pit)];

/* ---- jogo ---- */
function pick(t){const same=shuf(TERMS.filter(o=>o!==t&&o.g===t.g)),rest=shuf(TERMS.filter(o=>o!==t&&o.g!==t.g));return shuf([t,...same.concat(rest).slice(0,2)])}
function newGame(){S={idx:0,lives:5,hits:0,mobs:[],arrows:[],parts:[],order:shuf(TERMS),msg:'',mt:0,pause:0,shake:0,done:false};playing=true;$('craft').hidden=true;$('wrap').hidden=false;$('ov').style.display='none';startRound()}
function startRound(){
  const t=S.order[S.idx],slots=shuf([-4.2,0,4.2]);S.target=t;S.done=false;
  const sp=Math.min(1.2+S.idx*.06,2.4);
  S.mobs=pick(t).map((o,i)=>{const x0=slots[i]+(Math.random()-.5),z0=slots[i]===0?13+Math.random()*3:9+Math.random()*2.5;
    return{x:x0,x0,xe:x0*.2,z:z0,z0,type:Math.random()*3|0,term:o,sp:sp*(.9+Math.random()*.2)}});
  $('rn').textContent='PISTA '+(S.idx+1)+' DE '+N;$('ct').textContent=t.c;
}
function burst(p,col){if(!p)return;for(let i=0;i<16;i++)S.parts.push({x:p.x,y:p.y,vx:(Math.random()-.5)*280,vy:-Math.random()*280,l:.7,c:col||(i%2?'#ddd':'#999'),z:3+Math.random()*3})}
const say=s=>{S.msg=s;S.mt=2.2};
function endRound(ok){S.idx++;if(ok)S.hits++;S.done=true;S.pause=1.6;S.mobs.forEach(m=>burst(pr(m.x,.95,m.z)));S.mobs=[]}
function hit(m){
  const p=pr(m.x,.95,m.z);
  if(m.term===S.target){burst(p,'#7f7');say('Acertou! '+m.term.n);endRound(true)}
  else{burst(p,'#f66');S.mobs=S.mobs.filter(o=>o!==m);S.lives--;S.shake=.3;say('Esse monstro não é a resposta!');
    if(S.lives<=0){S.done=true;S.pause=1.4;S.mobs.forEach(o=>burst(pr(o.x,.95,o.z)));S.mobs=[]}}
}
function finish(){
  playing=false;
  $('bx').innerHTML='<h2>Fim de jogo</h2><p>'+S.hits+' de '+N+' termos acertados.</p><p>Acabaram os corações. Releia as pistas e tente de novo.</p><button id="go">Jogar de novo</button>';
  $('go').onclick=newGame;$('ov').style.display='flex';
}
function fire(){
  if(cd>0)return;const pw=Math.max(.2,Math.min(1,charge/.9)),sp=25+35*pw,f=fwd();
  S.arrows.push({x:f[0]*.6,y:EY+f[1]*.6,z:f[2]*.6,vx:f[0]*sp,vy:f[1]*sp,vz:f[2]*sp,stuck:0});cd=.4;
}

function update(dt){
  if(cd>0)cd-=dt;if(S.mt>0)S.mt-=dt;if(S.shake>0)S.shake-=dt;
  if(charging)charge=Math.min(.9,charge+dt);
  for(const p of S.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=600*dt;p.l-=dt}
  S.parts=S.parts.filter(p=>p.l>0);
  for(const a of S.arrows){
    if(a.stuck){a.stuck+=dt;continue}
    const n=12,h=dt/n;
    for(let k=0;k<n&&!a.stuck&&!a.dead;k++){
      a.vy-=GR*h;a.x+=a.vx*h;a.y+=a.vy*h;a.z+=a.vz*h;
      if(a.y<=0){a.y=0;a.stuck=.01;break}
      if(a.z>70){a.dead=1;break}
      if(!S.done&&playing)for(const m of S.mobs){
        if(Math.abs(a.x-m.x)<.5&&a.y<2&&Math.abs(a.z-m.z)<.5){a.dead=1;hit(m);break}
      }
    }
  }
  S.arrows=S.arrows.filter(a=>!a.dead&&a.stuck<2);
  if(!S.done)for(const m of S.mobs){
    m.z-=m.sp*dt;const p=Math.max(0,(m.z-ZEND)/(m.z0-ZEND));m.x=m.xe+(m.x0-m.xe)*p;
    if(m.z<ZEND){
      if(m.term===S.target){S.lives--;S.shake=.3;say('Ele chegou! Era: '+m.term.n);endRound(false);break}
      burst(pr(m.x,.95,m.z));m.gone=1;
    }
  }
  S.mobs=S.mobs.filter(m=>!m.gone);
  if(S.done){S.pause-=dt;if(S.pause<=0){S.done=false;if(S.lives<=0)finish();else if(S.idx>=N)startCraft();else startRound()}}
}

/* ---- desenho ---- */
function mob(m,p){
  const k=p.s*1.9/60;FOG=Math.min(.35,Math.max(0,(m.z-10)/40));
  x.save();x.translate(p.x,p.y);x.scale(k,k);
  x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.ellipse(0,0,24,6,0,0,6.3);x.fill();
  if(m.type===0){
    tex(-12,-18,12,18,'#3a3f9a',1);tex(0,-18,12,18,'#2e3280',2);
    tex(-12,-36,24,18,'#2a8fa6',3);tex(-18,-36,6,12,'#2a8fa6',4);tex(12,-36,6,12,'#2a8fa6',5);tex(-18,-24,6,9,'#5f9e48',6);tex(12,-24,6,9,'#5f9e48',7);
    tex(-12,-60,24,24,'#5f9e48',8);R(-9,-50,6,4,'#1b1b34');R(3,-50,6,4,'#1b1b34');R(-6,-42,12,3,'#2d4a22');
  }else if(m.type===1){
    tex(-12,-9,9,9,'#3d8a2c',9);tex(3,-9,9,9,'#3d8a2c',10);
    tex(-12,-36,24,27,'#4fb23a',11);tex(-12,-60,24,24,'#5ec846',12);
    R(-9,-54,6,6,'#101810');R(3,-54,6,6,'#101810');R(-6,-45,12,9,'#101810');R(-3,-39,6,6,'#5ec846');
  }else{
    tex(-6,-18,5,18,'#d9d9d9',13);tex(1,-18,5,18,'#bbbbbb',14);
    tex(-9,-36,18,18,'#d9d9d9',15);R(-9,-31,18,3,'#555');R(-9,-25,18,3,'#555');
    tex(-14,-36,4,18,'#d9d9d9',16);tex(10,-36,4,18,'#d9d9d9',17);tex(-12,-60,24,24,'#e6e6e6',18);
    R(-9,-51,6,6,'#111');R(3,-51,6,6,'#111');R(-6,-41,12,3,'#555');
  }
  x.restore();FOG=0;
  const s=m.term.n;x.font='20px '+FONT;const w=x.measureText(s).width+14,ty=Math.max(34,p.y-k*60-10);
  plate(p.x-w/2,ty-20,w,24);T(s,p.x,ty-2,20,'#fff','center');
}
function tree(tx,tz){
  const p=pr(tx,0,tz);if(!p)return;
  FOG=Math.min(.8,Math.max(0,(tz-8)/52));
  x.save();x.translate(p.x,p.y);x.scale(p.s/10,p.s/10);
  x.fillStyle='rgba(0,0,0,.22)';x.beginPath();x.ellipse(0,0,24,5,0,0,6.3);x.fill();
  tex(-4,-32,8,32,'#6b4423',21,2);tex(-17,-58,34,28,'#2f7d2a',22,2);tex(-11,-72,22,14,'#3d9a35',23,2);
  x.restore();FOG=0;
}
function arrow(a){
  const h=Math.hypot(a.vx,a.vy,a.vz)||1,d=[a.vx/h,a.vy/h,a.vz/h];
  const t=pr(a.x-d[0]*.9,a.y-d[1]*.9,a.z-d[2]*.9),q=pr(a.x+d[0]*.25,a.y+d[1]*.25,a.z+d[2]*.25),w=pr(a.x,a.y,a.z);
  if(!t||!q||!w)return;
  x.lineCap='butt';x.lineWidth=Math.max(1.5,.05*w.s);
  x.strokeStyle='#c9a26b';x.beginPath();x.moveTo(t.x,t.y);x.lineTo(w.x,w.y);x.stroke();
  x.strokeStyle='#aab2bb';x.beginPath();x.moveTo(w.x,w.y);x.lineTo(q.x,q.y);x.stroke();
  x.strokeStyle='#fff';x.lineWidth*=1.8;x.beginPath();x.moveTo(t.x,t.y);x.lineTo(t.x+(w.x-t.x)*.18,t.y+(w.y-t.y)*.18);x.stroke();
}
function bow(){
  const pw=charging?Math.min(1,charge/.9):0,bx=620-yaw*40,by=H-40-12*pw,nx=bx-8+46*pw,ny=by+32*pw;
  x.lineCap='round';x.lineJoin='round';
  if(charging){ // antebraço direito
    x.strokeStyle='#1c8f94';x.lineWidth=46;x.lineCap='butt';x.beginPath();x.moveTo(nx+6,ny+16);x.lineTo(nx+70,H+70);x.stroke();x.lineCap='round';
  }
  x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=1.6;x.beginPath();x.moveTo(bx-8,by-150);x.lineTo(nx,ny);x.lineTo(bx-8,by+150);x.stroke();
  const gr=x.createLinearGradient(bx-10,0,bx+32,0);gr.addColorStop(0,'#4f3114');gr.addColorStop(.5,'#b58650');gr.addColorStop(1,'#5b3a17');
  const path=()=>{x.beginPath();x.moveTo(bx-8,by-150);x.lineTo(bx+14,by-100);x.lineTo(bx+22,by-40);x.lineTo(bx+22,by+40);x.lineTo(bx+14,by+100);x.lineTo(bx-8,by+150)};
  x.strokeStyle='#2f1c09';x.lineWidth=17;path();x.stroke();
  x.strokeStyle=gr;x.lineWidth=11;path();x.stroke();
  x.strokeStyle='rgba(255,230,180,.45)';x.lineWidth=2;x.beginPath();x.moveTo(bx+2,by-120);x.lineTo(bx+17,by-60);x.stroke();
  R(bx+14,by-30,16,64,'#3a2616');R(bx+14,by-30,16,4,'#5a3d22');R(bx+14,by-10,16,3,'#5a3d22');R(bx+14,by+12,16,3,'#5a3d22');
  if(charging){
    const dx=W/2-nx,dy=H/2-ny,l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l,tx=nx+ux*230,ty=ny+uy*230;
    x.lineCap='butt';x.strokeStyle='#c9a26b';x.lineWidth=5;x.beginPath();x.moveTo(nx,ny);x.lineTo(tx,ty);x.stroke();
    x.strokeStyle='#e9eef2';x.lineWidth=9;x.beginPath();x.moveTo(nx+ux*8,ny+uy*8);x.lineTo(nx+ux*34,ny+uy*34);x.stroke();
    x.strokeStyle='#aab2bb';x.lineWidth=8;x.beginPath();x.moveTo(tx,ty);x.lineTo(tx+ux*22,ty+uy*22);x.stroke();
    R(nx-14,ny-10,28,26,'#c58c64');R(nx-14,ny-10,28,5,'#d9a07a');R(nx-14,ny+11,28,5,'#a9704c');
  }
  R(bx+6,by-26,36,44,'#c58c64');R(bx+6,by-26,36,6,'#d9a07a');R(bx+6,by+12,36,6,'#a9704c');
  x.fillStyle='#1c8f94';x.fillRect(bx+4,by+18,40,H-by);
  x.fillStyle='rgba(0,0,0,.18)';x.fillRect(bx+34,by+18,10,H-by);
}
const FL=Array.from({length:30},(_,k)=>({x:(hs(k,1,3)-.5)*26,z:3+hs(k,2,3)*24,c:['#ff5d73','#ffd93d','#f4f4ff'][k%3]}));
function gcol(i,j,z){
  const A=((i+j)&1)?[94,168,58]:[104,184,67],n=hs(i,j,9)*.14,f=Math.min(.88,Math.max(0,(z-8)/52));
  const r=A[0]*(1-n),g=A[1]*(1-n),b=A[2]*(1-n);
  return 'rgb('+(r+(207-r)*f|0)+','+(g+(227-g)*f|0)+','+(b+(242-b)*f|0)+')';
}
function hills(hy){
  for(const l of [{f:.25,c:'#a9c6de',h:70,s:1},{f:.45,c:'#8fb3c4',h:46,s:2}]){
    x.fillStyle=l.c;const off=-yaw*F*l.f;
    for(let gx=Math.floor((-40-off)/20);gx*20+off<W+40;gx++){
      const hg=l.h*(.45+.35*Math.sin(gx*.21+l.s)+.2*Math.sin(gx*.63+l.s*3)),q=Math.max(6,Math.round(hg/8)*8);
      x.fillRect(gx*20+off,hy-q,21,q+14);
    }
  }
}
function draw(){
  x.setTransform(DPR,0,0,DPR,0,0);x.save();
  if(S.shake>0)x.translate((Math.random()-.5)*8,(Math.random()-.5)*8);
  const hy=H/2+F*Math.tan(pit),pw=charging?Math.min(1,charge/.9):0;
  R(-10,-10,W+20,H+20,'#5ea83a');
  if(hy>0){const g=x.createLinearGradient(0,0,0,hy);g.addColorStop(0,'#3d78d6');g.addColorStop(.55,'#8cc4f4');g.addColorStop(1,'#f3e4c0');x.fillStyle=g;x.fillRect(-10,-10,W+20,hy+10)}
  const sx=W/2+(.3-yaw)*F,sy=hy-170,sg=x.createRadialGradient(sx,sy,10,sx,sy,200);sg.addColorStop(0,'rgba(255,235,170,.8)');sg.addColorStop(1,'rgba(255,235,170,0)');
  x.fillStyle=sg;x.fillRect(sx-200,sy-200,400,400);R(sx-22,sy-22,44,44,'#fff7c4');
  x.globalAlpha=.92;
  for(let i=0;i<6;i++){const cx=(((i*270-yaw*F*.9+TT*7)%1620)+1620)%1620-420,cy=hy-190+(i*57%90);
    R(cx,cy,110,22,'#fff');R(cx+24,cy-12,56,14,'#fff');R(cx+90,cy+4,34,16,'#fff');R(cx,cy+16,110,8,'#dbe7f5')}
  x.globalAlpha=1;
  hills(hy);
  const fg=x.createLinearGradient(0,hy-6,0,hy+70);fg.addColorStop(0,'rgba(207,227,242,1)');fg.addColorStop(1,'rgba(207,227,242,0)');x.fillStyle=fg;x.fillRect(-10,hy-6,W+20,76);
  for(let j=0;j<36;j++){const z0=1+j*2;for(let i=-16;i<16;i++){
    const x0=i*2,a=pr(x0,0,z0),b=pr(x0+2,0,z0),c=pr(x0+2,0,z0+2),d=pr(x0,0,z0+2);if(!a||!b||!c||!d)continue;
    x.fillStyle=gcol(i,j,z0);x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.lineTo(c.x,c.y);x.lineTo(d.x,d.y);x.closePath();x.fill();
  }}
  for(const f of FL){const p=pr(f.x,0,f.z);if(!p)continue;const s=p.s;R(p.x-.02*s,p.y-.2*s,.04*s,.2*s,'#2f7d2a');R(p.x-.07*s,p.y-.28*s,.14*s,.1*s,f.c)}
  const items=[[-14,24],[-9,34],[11,28],[17,36],[-21,40],[24,24],[-6,48],[6,44],[-27,30],[30,40]].map(t=>({z:t[1],f:()=>tree(t[0],t[1])}));
  for(const m of S.mobs){const p=pr(m.x,0,m.z);if(p)items.push({z:m.z,f:()=>mob(m,p)})}
  items.sort((a,b)=>b.z-a.z).forEach(o=>o.f());
  for(const a of S.arrows)arrow(a);
  if(charging&&playing){
    const p0=Math.max(.2,pw),sp=25+35*p0,f=fwd();
    let px=f[0]*.6,py=EY+f[1]*.6,pz=f[2]*.6,vx=f[0]*sp,vy=f[1]*sp,vz=f[2]*sp;
    for(let i=0;i<40;i++){vy-=GR*.05;px+=vx*.05;py+=vy*.05;pz+=vz*.05;if(py<0)break;const p=pr(px,py,pz);if(p){x.fillStyle='rgba(255,255,255,'+(.8-i*.017)+')';x.fillRect(p.x-1.5,p.y-1.5,3,3)}}
  }
  for(const p of S.parts){x.globalAlpha=Math.max(0,p.l/.7);R(p.x,p.y,p.z,p.z,p.c)}
  x.globalAlpha=1;
  bow();
  // mira (fica âmbar quando está sobre um monstro)
  let over=false;for(const m of S.mobs){const p=pr(m.x,.95,m.z);if(p&&Math.abs(p.x-W/2)<.45*p.s&&Math.abs(p.y-H/2)<.95*p.s)over=true}
  const cc=charging&&charge>=.9?'#ff6b6b':over?'#ffd36b':'#fff',cx=W/2,cy=H/2;
  R(cx-1.5,cy-13,3,9,'#000');R(cx-1.5,cy+4,3,9,'#000');R(cx-13,cy-1.5,9,3,'#000');R(cx+4,cy-1.5,9,3,'#000');
  R(cx-.5,cy-12,1.5,7,cc);R(cx-.5,cy+5,1.5,7,cc);R(cx-12,cy-.5,7,1.5,cc);R(cx+5,cy-.5,7,1.5,cc);
  if(charging){R(cx-32,cy+26,64,8,'rgba(0,0,0,.6)');R(cx-30,cy+28,60*Math.min(1,charge/.9),4,charge>=.9?'#ff6b6b':'#8fe58f')}
  const vg=x.createRadialGradient(W/2,H/2,H*.38,W/2,H/2,H*.98);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,'+(.34+.24*pw)+')');x.fillStyle=vg;x.fillRect(-10,-10,W+20,H+20);
  if(S.shake>0){const dg=x.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H);dg.addColorStop(0,'rgba(220,0,0,0)');dg.addColorStop(1,'rgba(220,0,0,'+(.6*S.shake/.3)+')');x.fillStyle=dg;x.fillRect(-10,-10,W+20,H+20)}
  // HUD
  plate(10,10,148,32);
  const HT=[' ## ## ','#h#####','#######',' ##### ','  ###  ','   #   '];
  for(let i=0;i<5;i++)HT.forEach((r,j)=>{for(let k=0;k<7;k++){const ch=r[k];if(ch===' ')continue;const on=i<S.lives;R(18+i*27+k*3+1.5,17+j*3+1.5,3,3,'rgba(0,0,0,.45)');R(18+i*27+k*3,17+j*3,3,3,on?(ch==='h'?'#ff9aa6':'#e8334a'):'#3b2a2e')}});
  const st=S.hits+' de '+N+' termos';x.font='24px '+FONT;const sw=x.measureText(st).width+22;plate(W-sw-10,10,sw,32);T(st,W-21,34,24,'#fff','right');
  if(S.mt>0){x.font='26px '+FONT;const mw=x.measureText(S.msg).width+30;x.globalAlpha=Math.min(1,S.mt*2);plate(W/2-mw/2,56,mw,34);T(S.msg,W/2,82,26,'#fff','center');x.globalAlpha=1}
  x.restore();
}

function loop(ts){
  const dt=Math.min(.05,(ts-last)/1000||0);last=ts;TT+=dt;
  const k=Math.min(1,dt*10);yaw+=((M.x/W-.5)*1.6-yaw)*k;pit+=((.5-M.y/H)*.5-pit)*k;
  if(S){if(playing||S.done)update(dt);draw()}
  requestAnimationFrame(loop);
}
function pos(e){const r=C.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
C.addEventListener('pointerdown',e=>{if(!playing)return;M=pos(e);charging=true;charge=0;C.setPointerCapture(e.pointerId)});
C.addEventListener('pointermove',e=>{M=pos(e)});
C.addEventListener('pointerup',e=>{if(charging&&playing)fire();charging=false});
C.addEventListener('pointercancel',()=>{charging=false});

S={idx:0,lives:5,hits:0,mobs:[],arrows:[],parts:[],order:TERMS,msg:'',mt:0,pause:0,shake:0,done:false};
$('bx').innerHTML='<h2>Arqueiro da Arquitetura</h2><p>Leia a pista e acerte a flecha no monstro que carrega o termo certo, antes que ele chegue. Errar o alvo ou deixar o certo chegar custa um coração. No fim, monte o computador na mesa de trabalho.</p><button id="go">Jogar</button>';
$('go').onclick=newGame;
if(document.fonts)document.fonts.load('20px VT323');
requestAnimationFrame(loop);

/* ===== Desafio final: mesa de trabalho ===== */
const SLOTS=['UC','ULA','Registradores','Address bus','Data bus','DMA','Cache','RAM','Memória de massa'];
const ROWS=['Dentro da CPU','Barramentos','Memórias'];
let pal=[],placed=[],mark=[],sel=null;
const clueOf=n=>TERMS.find(t=>t.n===n).c;
function startCraft(){
  playing=false;sel=null;placed=Array(9).fill(null);mark=Array(9).fill(0);
  pal=shuf([...SLOTS,'ROM','EEPROM','Flash','Microcontrolador']);
  $('wrap').hidden=true;$('craft').hidden=false;
  $('rn').textContent='DESAFIO FINAL';
  $('ct').textContent='Monte o computador na mesa de trabalho: escolha um item e clique no espaço certo, guiado pelas pistas numeradas.';
  $('cmsg').textContent='';$('res').textContent='';renderCraft();
}
function renderCraft(){
  $('cg').innerHTML=ROWS.map((r,ri)=>'<div class="row"><em>'+r+'</em>'+[0,1,2].map(k=>{const i=ri*3+k;
    return '<button class="slot'+(mark[i]===1?' ok':mark[i]===2?' bad':'')+'" data-s="'+i+'"><i>'+(i+1)+'</i>'+(placed[i]?'<b class="it">'+placed[i]+'</b>':'')+'</button>'}).join('')+'</div>').join('');
  $('cl').innerHTML=SLOTS.map((s,i)=>'<li><b>'+(i+1)+'</b> '+clueOf(s)+'</li>').join('');
  $('inv').innerHTML=pal.map(n=>'<button class="tile'+(sel===n?' sel':'')+(placed.includes(n)?' used':'')+'" data-n="'+n+'">'+n+'</button>').join('');
}
$('craft').addEventListener('click',e=>{
  const s=e.target.closest('.slot[data-s]'),t=e.target.closest('.tile');
  if(t){sel=sel===t.dataset.n?null:t.dataset.n;renderCraft();return}
  if(s){const i=+s.dataset.s;
    if(sel){const j=placed.indexOf(sel);if(j>-1)placed[j]=null;placed[i]=sel;sel=null}else placed[i]=null;
    mark=Array(9).fill(0);$('cmsg').textContent='';renderCraft();}
});
$('cb').onclick=()=>{
  let ok=0;mark=SLOTS.map((s,i)=>placed[i]===s?(ok++,1):placed[i]?2:0);renderCraft();
  if(ok===9){$('res').textContent='💻';$('cmsg').textContent='Computador montado!';setTimeout(winCraft,1400)}
  else $('cmsg').textContent=ok+' de 9 encaixados. '+(placed.includes(null)?'Preencha todos os espaços.':'Troque os itens vermelhos.');
};
$('cc').onclick=()=>{placed=Array(9).fill(null);mark=Array(9).fill(0);sel=null;$('cmsg').textContent='';renderCraft()};
function winCraft(){
  $('craft').hidden=true;$('wrap').hidden=false;
  $('rn').textContent='FIM';$('ct').textContent='Você montou o sistema completo.';
  $('bx').innerHTML='<h2>Computador montado!</h2><p>'+S.hits+' de '+N+' termos acertados na caçada, e o sistema completo foi montado na mesa.</p><button id="go">Jogar de novo</button>';
  $('go').onclick=newGame;$('ov').style.display='flex';
}