const $=s=>document.querySelector(s);
const brl=n=>(+n||0).toLocaleString('pt-BR',{style:'currency',currency:'EUR'});
const num=v=>parseFloat(String(v).replace(/\./g,'').replace(',','.'))||0;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=(a,b)=>b>0?Math.min(100,Math.round(a/b*100)):0;
const dat=d=>typeof d.data==='function'?(d.data()||{}):(d.data||{});
const today=()=>new Date().toISOString().slice(0,10);
const p2=n=>String(n).padStart(2,'0');
const FAB={1:'shP',3:'shS',4:'shF'};
let db=null,user=null,assets=null,uid=null,names={},cur=0;
const S={cfg:{dest:'',date:'2027-05-01',total:2699},pay:[],goals:{},stays:[],photos:[]};

const TH=[['dublin','Dublin','#0b6e4f','#f5b73b'],['branco','Branco','#ffffff','#3b82f6'],['escuro','Escuro','#0c0f14','#7c5cff'],['roxo','Roxo','#5b21b6','#f0abfc'],['sol','Pôr do sol','#f97316','#fbbf24'],['mar','Oceano','#155e75','#a5f3fc']];
function setTheme(k,save){document.documentElement.dataset.t=k;if(save!==false)try{localStorage.setItem('th',k)}catch(e){}document.querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',b.dataset.k===k))}
function nextTheme(){const i=TH.findIndex(t=>t[0]===document.documentElement.dataset.t),t=TH[(i+1)%TH.length];setTheme(t[0]);toast('Tema: '+t[1])}
const TIPS=[['Could I have the bill, please?','Pode trazer a conta, por favor?'],['Where is the nearest bus stop?','Onde fica o ponto de ônibus mais próximo?'],['How much is this?','Quanto custa isso?'],['Could you speak more slowly, please?','Você poderia falar mais devagar, por favor?'],['I’m here to study English.','Estou aqui para estudar inglês.'],['What’s the craic?','E aí, como vão as coisas? (gíria irlandesa)'],['Sláinte!','Saúde! (brinde em irlandês)'],['Is this seat taken?','Este lugar está ocupado?'],['That’s grand, thanks!','Tudo bem, obrigado(a)! (grand = ótimo, ok)'],['Do you take card?','Vocês aceitam cartão?']];
let ti=Math.floor(Date.now()/864e5)%TIPS.length;
function tip(){$('#tipEn').textContent=TIPS[ti][0];$('#tipPt').textContent=TIPS[ti][1]}
function nextTip(){ti=(ti+1)%TIPS.length;tip()}
function myName(){let c='';try{c=localStorage.getItem('nm')||''}catch(e){}if(c)return c;return((names[uid]||'').trim().split(/\s+/)[0])||'viajante'}
function hiText(){const h=new Date().getHours();return(h<5?'Boa madrugada':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite')+', '+myName()+' 👋'}
function confetti(){const s=getComputedStyle(document.documentElement),cs=['--a2','--a3','--a4','--pri'];for(let i=0;i<50;i++){const e=document.createElement('i');e.className='cf';e.style.cssText=`left:${Math.random()*100}vw;background:${s.getPropertyValue(cs[i%4]).trim()};--x:${(Math.random()-.5)*180}px;--r:${Math.random()*720}deg;animation-delay:${Math.random()*.45}s;width:${6+Math.random()*6}px;height:${10+Math.random()*8}px`;document.body.appendChild(e);setTimeout(()=>e.remove(),3400)}}
function greet(){if(greet.d)return;greet.d=1;const n=myName();$('#hello').innerHTML=[...('Olá, '+n)].map((c,i)=>`<span style="--i:${i}">${c===' '?'&nbsp;':esc(c)}</span>`).join('')+'<i>👋</i>';
  const d=Math.max(0,Math.floor((new Date((S.cfg.date||'')+'T00:00:00')-new Date())/864e5))||0,el=$('#iDays'),t0=performance.now();
  (function f(t){const k=Math.min(1,(t-t0-1400)/1500);if(k>0)el.textContent=Math.round(d*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0);draw()}
function startApp(){const i=$('#intro');if(!i||i.classList.contains('out'))return;greet();
  $('#ringArc').style.strokeDashoffset=326.7;$('#hBar').style.width='0%';['#hPaid','#hLeft'].forEach(q=>{$(q)._v=0;$(q).textContent='€ 0,00'});
  document.body.classList.add('entered');i.classList.add('out');confetti();try{navigator.vibrate&&navigator.vibrate(25)}catch(e){}
  setTimeout(draw,800);setTimeout(()=>i.remove(),1100)}
function toast(t){const m=$('#msg');m.textContent=t;m.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>m.style.display='none',2600)}
function openSheet(id){document.querySelectorAll('.sheet').forEach(s=>s.classList.toggle('on',s.id===id));$('#ov').classList.add('on')}
function closeSheet(){$('#ov').classList.remove('on')}
function fabGo(){if(FAB[cur])openSheet(FAB[cur])}
function tab(n){if(n===cur)return;$('main').dataset.dir=n>cur?'r':'l';cur=n;document.querySelectorAll('.view').forEach((v,i)=>v.classList.toggle('on',i===n));document.querySelectorAll('nav button').forEach((b,i)=>b.classList.toggle('on',i===n));$('#fab').style.display=FAB[n]?'grid':'none';window.scrollTo({top:0,behavior:'smooth'});bars()}
function nm(id){return id===uid?'Você':(names[id]||'Amiga(o)')}
function setVal(sel,v){const e=$(sel);if(e&&document.activeElement!==e)e.value=v}
function paidBy(id){return S.pay.filter(p=>p.who===id).reduce((a,p)=>a+(+p.val||0),0)}
function tween(el,to){if(el._v===to)return;const from=el._v||0;el._v=to;const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/800),e=1-Math.pow(1-k,3);el.textContent=brl(from+(to-from)*e);if(k<1)requestAnimationFrame(f)})(t0)}
function bars(){requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelectorAll('[data-w]').forEach(e=>e.style.width=e.dataset.w+'%')))}

function cd(){
  const ms=new Date((S.cfg.date||'')+'T00:00:00')-new Date();
  if(isNaN(ms)){$('#days').textContent='–';$('#daysL').textContent='defina a data da viagem';return}
  if(ms<=0){$('#days').textContent='🎉';$('#daysL').textContent='a viagem começou!';$('#cH').textContent=$('#cM').textContent=$('#cS').textContent='00';return}
  const d=Math.floor(ms/864e5);
  $('#days').textContent=d;$('#daysL').textContent=(d===1?'dia':'dias')+' para embarcar · '+Math.floor(d/7)+' semanas e '+d%7+' dias';
  $('#cH').textContent=p2(Math.floor(ms/36e5)%24);$('#cM').textContent=p2(Math.floor(ms/6e4)%60);$('#cS').textContent=p2(Math.floor(ms/1e3)%60);
  if($('#iH')){$('#iH').textContent=$('#cH').textContent;$('#iM').textContent=$('#cM').textContent;$('#iS').textContent=$('#cS').textContent}
}
function goalHtml(paid,goal){return `<div class="row"><span class="mut">Pago: <b>${brl(paid)}</b></span><span class="mut">Meta: <b>${brl(goal)}</b></span></div><div class="bar"><i data-w="${pct(paid,goal)}"></i></div><div class="row"><b>${pct(paid,goal)}%</b><span class="mut">Falta ${brl(Math.max(goal-paid,0))}</span></div>`}

function draw(){
  const c=S.cfg,paid=S.pay.reduce((a,p)=>a+(+p.val||0),0),total=+c.total||0,pc=pct(paid,total);
  $('#dest').textContent='☘️ '+(c.dest||'Dublin, Irlanda');cd();$('#hi').textContent=hiText();
  tween($('#hPaid'),paid);tween($('#hLeft'),Math.max(total-paid,0));
  $('#hBar').dataset.w=pc;$('#hPct').textContent=pc+'% do total pago';
  $('#ringArc').style.strokeDashoffset=326.7*(1-pc/100);$('#ringTxt').textContent=pc+'%';
  setVal('#cDest',c.dest||'');setVal('#cDate',c.date||'');setVal('#cTotal',total?String(total).replace('.',','):'');

  const pl=[...S.pay].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.ts||0)-(a.ts||0));
  $('#payList').innerHTML=pl.length?pl.map(p=>`<div class="item"><div class="row"><b>${esc(p.desc||'Pagamento')}</b><b>${brl(p.val)}</b></div><div class="row"><span class="mut">${esc(nm(p.who))} · ${esc((p.date||'').split('-').reverse().join('/'))}</span><span>${p.proof?`<a href="/_blob/${esc(p.proof)}" target="_blank" rel="noopener">📎 comprovante</a>`:'<span class="tag">sem comprovante</span>'}${p.who===uid?` <button class="g" onclick="delPay('${esc(p.id)}')">🗑</button>`:''}</span></div></div>`).join(''):'<div class="mut">Nenhum pagamento ainda. Toque no ＋ para registrar.</div>';

  const g=S.goals[uid],gv=g?+g.goal||0:0;
  setVal('#goalIn',gv?String(gv).replace('.',','):'');
  $('#myGoal').innerHTML=gv?goalHtml(paidBy(uid),gv):'<div class="mut">Defina sua meta para acompanhar o progresso.</div>';
  const ids=[...new Set([...Object.keys(S.goals),...S.pay.map(p=>p.who)])].filter(i=>i&&i!==uid);
  $('#others').innerHTML=ids.map(i=>{const gg=+(S.goals[i]||{}).goal||0;return `<div class="card"><h2>${esc(nm(i))}</h2>${gg?goalHtml(paidBy(i),gg):`<div class="mut">Pagou ${brl(paidBy(i))} · meta ainda não definida</div>`}</div>`}).join('');

  const sl=[...S.stays].sort((a,b)=>(b.votes||[]).length-(a.votes||[]).length||(b.ts||0)-(a.ts||0));
  $('#stayList').innerHTML=sl.length?sl.map(s=>{const v=s.votes||[],me=v.includes(uid);return `<div class="card"><div class="row"><b>${esc(s.name)}</b><b>${s.price?brl(s.price):''}</b></div>${s.link?`<div><a href="${esc(s.link)}" target="_blank" rel="noopener">Abrir anúncio ↗</a></div>`:''}${s.notes?`<div class="mut">${esc(s.notes)}</div>`:''}<div class="row"><span class="mut">Sugerido por ${esc(nm(s.by))}</span><span><button class="g" onclick="vote('${esc(s.id)}')">${me?'❤️':'🤍'} ${v.length}</button>${s.by===uid?`<button class="g" onclick="delStay('${esc(s.id)}')">🗑</button>`:''}</span></div></div>`}).join(''):'<div class="card mut">Nenhuma acomodação ainda. Toque no ＋ para adicionar.</div>';

  const pp=[...S.photos].sort((a,b)=>(b.ts||0)-(a.ts||0));
  $('#photoList').innerHTML=pp.length?`<div class="ph">${pp.map(f=>`<figure><a href="/_blob/${esc(f.img)}" target="_blank" rel="noopener"><img loading="lazy" alt="${esc(f.cap||'Foto')}" src="/_blob/${esc(f.img)}"></a>${f.cap?`<figcaption>${esc(f.cap)}</figcaption>`:''}${f.by===uid?`<button class="g x" onclick="delPhoto('${esc(f.id)}')">🗑</button>`:''}</figure>`).join('')}</div>`:`<div class="card mut">${assets?'Ainda sem fotos. Toque no ＋ para enviar a primeira!':'O envio de fotos não está disponível para o seu perfil.'}</div>`;
  bars();
}
async function resolveNames(){
  if(!user)return;
  const ids=[...new Set([uid,...Object.keys(S.goals),...S.pay.map(p=>p.who),...S.stays.map(s=>s.by)])].filter(Boolean);
  try{const ps=await user.profiles(ids);let ch=false;ids.forEach(i=>{const n=ps[i]&&ps[i].name;if(n&&names[i]!==n){names[i]=n;ch=true}});if(ch)draw()}catch(e){}
}
function refresh(){draw();resolveNames()}

async function saveCfg(){
  try{localStorage.setItem('nm',$('#cName').value.trim())}catch(e){}draw();
  if(!db)return toast('Sem conexão com o banco');
  try{await db.doc('trip/config').set({dest:$('#cDest').value.trim(),date:$('#cDate').value||S.cfg.date,total:num($('#cTotal').value)});closeSheet();toast('Salvo!')}catch(e){toast('Não foi possível salvar')}
}
async function saveGoal(){
  if(!db||!uid)return toast('Entre com sua conta para ter perfil próprio');
  try{await db.doc('goals/'+uid).set({goal:num($('#goalIn').value)});toast('Meta salva!')}catch(e){toast('Não foi possível salvar')}
}
async function addPay(){
  if(!db||!uid)return toast('Entre com sua conta para registrar');
  const val=num($('#pVal').value);if(val<=0)return toast('Informe o valor');
  let proof=null;const f=$('#pFile').files[0];
  if(f){if(!assets)toast('Envio de comprovante indisponível para seu perfil');else{try{proof=(await assets.upload(f)).id}catch(e){return toast('Falha ao enviar comprovante')}}}
  try{await db.collection('payments').add({who:uid,desc:$('#pDesc').value.trim(),val,date:$('#pDate').value||today(),proof,ts:Date.now()});
    $('#pDesc').value='';$('#pVal').value='';$('#pFile').value='';closeSheet();toast('Pagamento registrado! 🎉');confetti()}catch(e){toast('Não foi possível salvar')}
}
async function delPay(id){if(confirm('Excluir este pagamento?'))try{await db.doc('payments/'+id).delete()}catch(e){toast('Erro ao excluir')}}
async function addStay(){
  if(!db||!uid)return toast('Entre com sua conta para sugerir');
  const name=$('#sName').value.trim();if(!name)return toast('Informe o nome');
  let link=$('#sLink').value.trim();if(link&&!/^https?:\/\//i.test(link))link='https://'+link;
  try{await db.collection('stays').add({by:uid,name,link,price:num($('#sPrice').value),notes:$('#sNotes').value.trim(),votes:[],ts:Date.now()});
    ['#sName','#sLink','#sPrice','#sNotes'].forEach(s=>$(s).value='');closeSheet();toast('Adicionada!')}catch(e){toast('Não foi possível salvar')}
}
async function vote(id){
  const s=S.stays.find(x=>x.id===id);if(!s||!uid)return;
  const v=new Set(s.votes||[]);v.has(uid)?v.delete(uid):v.add(uid);
  try{await db.doc('stays/'+id).update({votes:[...v]})}catch(e){toast('Não foi possível votar')}
}
async function delStay(id){if(confirm('Excluir esta acomodação?'))try{await db.doc('stays/'+id).delete()}catch(e){toast('Erro ao excluir')}}
async function addPhoto(){
  if(!db||!uid)return toast('Entre com sua conta para enviar');
  if(!assets)return toast('Envio de fotos indisponível para seu perfil');
  const f=$('#fFile').files[0];if(!f)return toast('Escolha uma foto');
  toast('Enviando…');
  try{const r=await assets.upload(f);await db.collection('photos').add({by:uid,img:r.id,cap:$('#fCap').value.trim(),ts:Date.now()});
    $('#fFile').value='';$('#fCap').value='';closeSheet();toast('Foto adicionada!')}catch(e){toast('Falha ao enviar a foto')}
}
async function delPhoto(id){if(confirm('Excluir esta foto?'))try{await db.doc('photos/'+id).delete()}catch(e){toast('Erro ao excluir')}}

(async function init(){
  $('#sws').innerHTML=TH.map(t=>`<button class="sw" data-k="${t[0]}" onclick="setTheme('${t[0]}')"><i style="background:linear-gradient(135deg,${t[2]},${t[3]});border:1px solid #0002"></i>${t[1]}</button>`).join('');
  let k='dublin';try{k=localStorage.getItem('th')||k}catch(e){}setTheme(k,false);
  $('#pDate').value=today();draw();setInterval(cd,1000);
  const mk=c=>{const k=$('.hero svg.sk').cloneNode(true);k.querySelector('circle').remove();k.classList.add(c);$('#intro').appendChild(k)};mk('isk2');mk('isk');
  for(let q=0;q<22;q++){const e=document.createElement('i');e.className='st';e.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*68}%;--d:${(Math.random()*3).toFixed(2)}s;--z:${(.5+Math.random()*1.2).toFixed(2)}`;$('#intro').appendChild(e)}
  {const I=$('#intro'),mv=(x,y)=>{I.style.setProperty('--px',x);I.style.setProperty('--py',y)},cl=v=>Math.max(-1,Math.min(1,v));
   I.addEventListener('pointermove',e=>mv((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2));
   addEventListener('deviceorientation',e=>{if(e.gamma!=null)mv(cl(e.gamma/30),cl(((e.beta||0)-45)/30))})}
  setTimeout(greet,2500);tip();try{$('#cName').value=localStorage.getItem('nm')||''}catch(e){}

  const t=setTimeout(()=>{if(!db)$('#warn').style.display='block'},10000);
  
  try {
    // Inicialização direta do Supabase com suas credenciais
    const SUPABASE_URL = 'https://lcwobzszmytkscljaiii.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_nk5oqUgYADD_BzMaQm2R_g_ar4isv7s';
    
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Adaptador compatível com os métodos que o seu app usa (db, user, assets)
    db = {
      collection: (name) => ({
        onSnapshot: (cb) => {
          client.from(name).select('*').then(({data, error}) => {
            if(!error) cb({docs: (data||[]).map(item => ({id: item.id, data: () => item}))});
          });
          // Configura tempo real se suportado
          client.channel('public:' + name)
            .on('postgres_changes', { event: '*', schema: 'public', table: name }, () => {
              client.from(name).select('*').then(({data}) => {
                cb({docs: (data||[]).map(item => ({id: item.id, data: () => item}))});
              });
            }).subscribe();
        },
        add: (obj) => client.from(name).insert([obj])
      }),
      doc: (path) => {
        const [col, id] = path.split('/');
        return {
          set: (obj) => id ? client.from(col).upsert([{id, ...obj}]) : client.from(col).insert([obj]),
          update: (obj) => client.from(col).update(obj).eq('id', id),
          delete: () => client.from(col).delete().eq('id', id),
          onSnapshot: (cb) => {
            client.from(col).select('*').eq('id', id).then(({data}) => {
              if(data && data.length > 0) cb({exists: true, data: () => data[0]});
              else cb({exists: false});
            });
          }
        }
      }
    };
    
    user = { id: async () => 'usuario-local' };
    uid = 'usuario-local';
    assets = null; // Sem storage configurado por enquanto, mas o app roda liso
  } catch(e) {
    console.error("Erro ao conectar no Supabase:", e);
  }

  clearTimeout(t);
  if(!db){$('#warn').style.display='block';return}
  $('#warn').style.display='none';
  
  greet();
  const list=(q,k)=>db.collection(q).onSnapshot(s=>{S[k]=s.docs.map(d=>Object.assign({id:d.id},dat(d)));refresh()},()=>{});
  db.doc('trip/config').onSnapshot(s=>{if(s.exists)Object.assign(S.cfg,dat(s));if(!S.cfg.total)S.cfg.total=2699;refresh()},()=>{});
  list('payments','pay');list('stays','stays');list('photos','photos');
  db.collection('goals').onSnapshot(s=>{S.goals={};s.docs.forEach(d=>S.goals[d.id]=dat(d));refresh()},()=>{});
db.collection('goals').onSnapshot(s=>{S.goals={};s.docs.forEach(d=>S.goals[d.id]=dat(d));refresh()},()=>{});
})();
