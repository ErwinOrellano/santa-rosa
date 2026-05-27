/* I.E. Santa Rosa de Santo Domingo - Frontend demo con localStorage.
   Luego se puede migrar a Firebase Auth + Firestore. */
(function(){
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
  const LS='srsd_voto_digital_v1';
  const defaultData={
    session:false,
    config:{habilitada:true,nombre:'Elecciones del Municipio Escolar 2026',fecha:'2026-06-15',maxCandidatos:5,mensajeCerrado:'La votación escolar se encuentra cerrada temporalmente.'},
    docentes:[
      {id:uid(),nombre:'Director(a) de la I.E. Santa Rosa',cargo:'Dirección',area:'Gestión institucional'},
      {id:uid(),nombre:'Coordinador(a) de Tutoría',cargo:'Responsable de convivencia',area:'Tutoría y orientación'},
      {id:uid(),nombre:'Docente asesor del Municipio Escolar',cargo:'Asesor de elecciones',area:'Participación estudiantil'}
    ],
    candidatos:[
      {id:uid(),lista:'Lista 1',nombre:'Ana Lucía Ramos Pérez',grado:'6°',seccion:'A',propuesta:'Mejorar la limpieza, orden y participación estudiantil.',activo:true},
      {id:uid(),lista:'Lista 2',nombre:'Carlos Miguel Soto León',grado:'6°',seccion:'B',propuesta:'Impulsar actividades deportivas, culturales y ambientales.',activo:true},
      {id:uid(),lista:'Lista 3',nombre:'María Fernanda Díaz Rojas',grado:'5°',seccion:'A',propuesta:'Promover campañas de respeto y cuidado de las aulas.',activo:true}
    ],
    votantes:[
      {id:uid(),codigo:'SRSD-2026-001',dni:'70000001',nombres:'Luis Alberto Ramos Pérez',grado:'5°',seccion:'A',yaVoto:false},
      {id:uid(),codigo:'SRSD-2026-002',dni:'70000002',nombres:'María Fernanda López Rojas',grado:'5°',seccion:'A',yaVoto:false},
      {id:uid(),codigo:'SRSD-2026-003',dni:'70000003',nombres:'José Miguel Huamán Torres',grado:'6°',seccion:'B',yaVoto:false},
      {id:uid(),codigo:'SRSD-2026-004',dni:'70000004',nombres:'Rosa Milagros Salazar León',grado:'6°',seccion:'A',yaVoto:false}
    ],
    votos:[]
  };
  function uid(){return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4)}
  function load(){try{return JSON.parse(localStorage.getItem(LS))||structuredClone(defaultData)}catch(e){return structuredClone(defaultData)}}
  function save(d){localStorage.setItem(LS,JSON.stringify(d));}
  function toast(m){const o=$('.toast'); if(o)o.remove(); const t=document.createElement('div'); t.className='toast'; t.textContent=m; document.body.appendChild(t); setTimeout(()=>t.remove(),2800)}
  function escapeHTML(str=''){return String(str).replace(/[&<>'\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));}
  function normalizeKey(k=''){return String(k).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');}
  function makeStudentCode(dni, index){const n=String(dni||'').replace(/\D/g,''); if(n.length>=6) return 'SRSD-2026-'+n.slice(-6); return 'SRSD-2026-'+String(index+1).padStart(4,'0');}
  function csvToRows(text){
    const rows=[]; let row=[], value='', quote=false;
    for(let i=0;i<text.length;i++){const ch=text[i], nx=text[i+1];
      if(ch==='"'&&quote&&nx==='"'){value+='"'; i++; continue}
      if(ch==='"'){quote=!quote; continue}
      if(ch===','&&!quote){row.push(value); value=''; continue}
      if((ch==='\n'||ch==='\r')&&!quote){if(ch==='\r'&&nx==='\n')i++; row.push(value); if(row.some(x=>String(x).trim()))rows.push(row); row=[]; value=''; continue}
      value+=ch;
    }
    row.push(value); if(row.some(x=>String(x).trim()))rows.push(row); return rows;
  }
  function setupMenu(){const b=$('.menu-toggle'),m=$('.menu'); if(!b||!m)return; b.onclick=()=>m.classList.toggle('open'); m.onclick=e=>{if(e.target.matches('a'))m.classList.remove('open')}}
  function activeNav(){const p=location.pathname.split('/').pop()||'index.html'; $$('.menu a').forEach(a=>{if(a.getAttribute('href')===p)a.classList.add('active')})}
  function setupFilters(){
    $$('.filters').forEach(g=>g.addEventListener('click',e=>{const btn=e.target.closest('.filter'); if(!btn)return; $$('.filter',g).forEach(x=>x.classList.remove('active')); btn.classList.add('active'); const q=btn.dataset.filter||btn.textContent.trim().toLowerCase(); const root=g.closest('main')||document; $$('.filterable',root).forEach(card=>{const hay=(card.dataset.filter+' '+card.textContent).toLowerCase(); card.classList.toggle('hidden',q!=='todos'&&!hay.includes(q.toLowerCase()))})}));
    $$('.search-box input').forEach(i=>i.addEventListener('input',()=>{const q=i.value.toLowerCase().trim(); const root=i.closest('main')||document; $$('.filterable',root).forEach(card=>card.classList.toggle('hidden',q&&!card.textContent.toLowerCase().includes(q)))}));
  }
  function renderPublic(){
    const d=load();
    const staff=$('#staffList'); if(staff) staff.innerHTML=d.docentes.map(x=>`<article class="card mini-card center"><div class="candidate-photo" style="margin:auto">${escapeHTML(x.nombre[0]||'D')}</div><h3>${escapeHTML(x.nombre)}</h3><p><b>${escapeHTML(x.cargo)}</b><br><span class="muted">${escapeHTML(x.area||'')}</span></p></article>`).join('');
    const status=$('#publicVoteStatus'); if(status){status.innerHTML=d.config.habilitada?`<span class="badge">✅ Votación habilitada</span><h2>${escapeHTML(d.config.nombre)}</h2><p>Escanea el QR institucional del estudiante para ingresar a la cédula de votación.</p>`:`<span class="badge">⛔ Votación cerrada</span><h2>Proceso no disponible</h2><p>${escapeHTML(d.config.mensajeCerrado)}</p>`}
    const cand=$('#publicCandidates'); if(cand) cand.innerHTML=d.candidatos.filter(x=>x.activo).slice(0,d.config.maxCandidatos).map((x,i)=>`<article class="program-card card filterable" data-filter="${escapeHTML(x.lista)}"><div class="program-img" data-label="${escapeHTML(x.lista)}"></div><div class="program-body"><h3>${escapeHTML(x.nombre)}</h3><p><b>${escapeHTML(x.grado)} ${escapeHTML(x.seccion)}</b></p><p>${escapeHTML(x.propuesta)}</p></div></article>`).join('');
  }
  function setupLogin(){const f=$('#loginForm'); if(!f)return; f.onsubmit=e=>{e.preventDefault(); const u=$('#loginUser').value.trim().toUpperCase(),p=$('#loginPass').value.trim(); if(u==='SANTAROSA'&&p==='VOTO2026'){const d=load(); d.session=true; save(d); location.href='admin.html'}else toast('Usuario o contraseña incorrectos')}}
  function guardAdmin(){if(!document.body.classList.contains('admin-body'))return; const d=load(); if(!d.session){location.href='admin-login.html';return}}
  function setupAdmin(){
    if(!document.body.classList.contains('admin-body'))return; guardAdmin(); let d=load();
    const refresh=()=>{d=load(); renderAdmin(d)}; refresh();
    $('#logoutBtn')?.addEventListener('click',e=>{e.preventDefault(); const x=load(); x.session=false; save(x); location.href='admin-login.html'});
    $('#electionForm')?.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(e.target); d.config.nombre=fd.get('nombre'); d.config.fecha=fd.get('fecha'); d.config.maxCandidatos=Number(fd.get('maxCandidatos')||5); d.config.habilitada=$('#voteToggle').checked; save(d); refresh(); toast('Configuración guardada')});
    $('#teacherForm')?.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(e.target), id=fd.get('id')||uid(); const obj={id,nombre:fd.get('nombre'),cargo:fd.get('cargo'),area:fd.get('area')}; const i=d.docentes.findIndex(x=>x.id===id); i>=0?d.docentes[i]=obj:d.docentes.push(obj); save(d); e.target.reset(); refresh(); toast('Docente guardado')});
    $('#candidateForm')?.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(e.target), id=fd.get('id')||uid(); if(d.candidatos.length>=d.config.maxCandidatos&&!fd.get('id')){toast('Ya alcanzaste el máximo de candidatos');return} const obj={id,lista:fd.get('lista'),nombre:fd.get('nombre'),grado:fd.get('grado'),seccion:fd.get('seccion'),propuesta:fd.get('propuesta'),activo:true}; const i=d.candidatos.findIndex(x=>x.id===id); i>=0?d.candidatos[i]=obj:d.candidatos.push(obj); save(d); e.target.reset(); refresh(); toast('Candidato guardado')});
    $('#voterForm')?.addEventListener('submit',e=>{e.preventDefault(); const fd=new FormData(e.target), id=fd.get('id')||uid(); const obj={id,codigo:(fd.get('codigo')||makeStudentCode(fd.get('dni'),d.votantes.length)).trim().toUpperCase(),dni:fd.get('dni'),nombres:fd.get('nombres'),grado:fd.get('grado'),seccion:fd.get('seccion'),yaVoto:false}; if(d.votantes.some(x=>x.codigo===obj.codigo&&x.id!==id)){toast('Ese código QR ya existe');return} const i=d.votantes.findIndex(x=>x.id===id); i>=0?d.votantes[i]={...d.votantes[i],...obj,yaVoto:d.votantes[i].yaVoto}:d.votantes.push(obj); save(d); e.target.reset(); refresh(); toast('Votante guardado')});
    document.addEventListener('click',e=>{const btn=e.target.closest('[data-action]'); if(!btn)return; const [act,type,id]=btn.dataset.action.split(':'); if(act==='edit') editItem(type,id); if(act==='del') delItem(type,id); if(act==='resetVotes') resetVotes(); if(act==='downloadCSV') downloadCSV(); if(act==='downloadTemplate') downloadTemplate(); if(act==='importStudents') importStudents(); if(act==='printQR') printQR(); if(act==='clearForm') $('#'+type)?.reset();});
  }
  function renderAdmin(d){
    $('#teacherCount')&&( $('#teacherCount').textContent=d.docentes.length ); $('#candidateCount')&&( $('#candidateCount').textContent=d.candidatos.length ); $('#voterCount')&&( $('#voterCount').textContent=d.votantes.length ); $('#votesCount')&&( $('#votesCount').textContent=d.votos.length );
    $('#matriculaStatusText')&&( $('#matriculaStatusText').textContent=d.config.habilitada?'Activa':'Cerrada' );
    if($('#electionForm')){ $('#electionForm [name=nombre]').value=d.config.nombre; $('#electionForm [name=fecha]').value=d.config.fecha; $('#electionForm [name=maxCandidatos]').value=d.config.maxCandidatos; $('#voteToggle').checked=d.config.habilitada; }
    const t=$('#adminTeachers'); if(t)t.innerHTML=d.docentes.map(x=>`<div class="mini-card"><b>${escapeHTML(x.nombre)}</b><p class="muted">${escapeHTML(x.cargo)} · ${escapeHTML(x.area)}</p><button class="btn btn-outline" data-action="edit:docente:${x.id}">Editar</button> <button class="btn btn-danger" data-action="del:docente:${x.id}">Eliminar</button></div>`).join('');
    const c=$('#adminCandidates'); if(c)c.innerHTML=d.candidatos.map(x=>`<div class="mini-card"><b>${escapeHTML(x.lista)} - ${escapeHTML(x.nombre)}</b><p>${escapeHTML(x.grado)} ${escapeHTML(x.seccion)} · ${escapeHTML(x.propuesta)}</p><button class="btn btn-outline" data-action="edit:candidato:${x.id}">Editar</button> <button class="btn btn-danger" data-action="del:candidato:${x.id}">Eliminar</button></div>`).join('');
    const v=$('#adminVoters'); if(v)v.innerHTML=d.votantes.map(x=>`<div class="mini-card qr-card"><div id="qr-${x.id}"></div><div><b>${escapeHTML(x.nombres)}</b><p class="muted">${escapeHTML(x.grado)} ${escapeHTML(x.seccion)} · DNI ${escapeHTML(x.dni)}<br>Código: <b>${escapeHTML(x.codigo)}</b><br>Estado: ${x.yaVoto?'✅ Votó':'⏳ No votó'}</p></div><div><button class="btn btn-outline" data-action="edit:votante:${x.id}">Editar</button><br><br><button class="btn btn-danger" data-action="del:votante:${x.id}">Eliminar</button></div></div>`).join('');
    if(window.QRCode){d.votantes.forEach(x=>{const el=$('#qr-'+x.id); if(el&&!el.dataset.done){new QRCode(el,{text:x.codigo,width:142,height:142,correctLevel:QRCode.CorrectLevel.H}); el.dataset.done='1'}})}
    renderResults(d);
  }
  function editItem(type,id){const d=load(); const map={docente:['docentes','teacherForm'],candidato:['candidatos','candidateForm'],votante:['votantes','voterForm']}; const [arr,formId]=map[type]; const x=d[arr].find(i=>i.id===id), f=$('#'+formId); if(!x||!f)return; Object.keys(x).forEach(k=>{const input=f.querySelector(`[name=${k}]`); if(input)input.value=x[k]}); location.hash=formId; toast('Datos cargados para editar')}
  function delItem(type,id){if(!confirm('¿Eliminar este registro?'))return; const d=load(); const map={docente:'docentes',candidato:'candidatos',votante:'votantes'}; d[map[type]]=d[map[type]].filter(x=>x.id!==id); save(d); location.reload()}
  function resetVotes(){if(!confirm('¿Reiniciar votos y marcar a todos como no votaron?'))return; const d=load(); d.votos=[]; d.votantes=d.votantes.map(x=>({...x,yaVoto:false})); save(d); location.reload()}
  function downloadCSV(){const d=load(); const rows=[['codigo','dni','nombres','grado','seccion','estado'],...d.votantes.map(x=>[x.codigo,x.dni,x.nombres,x.grado,x.seccion,x.yaVoto?'VOTO':'NO VOTO'])]; const csv=rows.map(r=>r.map(c=>`"${String(c).replaceAll('"','""')}"`).join(',')).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='padron_santa_rosa.csv'; a.click();}
  function downloadTemplate(){
    const rows=[['DNI','APELLIDOS Y NOMBRES','GRADO','SECCION'],['70000001','RAMOS PEREZ LUIS ALBERTO','5','A'],['70000002','LOPEZ ROJAS MARIA FERNANDA','5','A']];
    const csv=rows.map(r=>r.map(c=>`"${String(c).replaceAll('"','""')}"`).join(',')).join('\n');
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); a.download='plantilla_padron_santa_rosa.csv'; a.click();
  }
  async function importStudents(){
    const input=$('#importStudentsFile'), preview=$('#importPreview');
    const file=input?.files?.[0]; if(!file){toast('Selecciona un archivo Excel o CSV');return}
    try{
      let rows=[];
      if(/\.csv$/i.test(file.name)){
        rows=csvToRows(await file.text());
      }else{
        if(!window.XLSX){toast('No cargó la librería para Excel. Guarda el archivo como CSV.');return}
        const data=await file.arrayBuffer();
        const wb=XLSX.read(data,{type:'array'}); const ws=wb.Sheets[wb.SheetNames[0]];
        rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
      }
      if(rows.length<2){toast('El archivo no tiene alumnos');return}
      const headers=rows[0].map(normalizeKey);
      const find=(names)=>names.map(normalizeKey).map(n=>headers.indexOf(n)).find(i=>i>=0);
      const idxDni=find(['dni','documento','documentoidentidad']);
      const idxNom=find(['apellidosynombres','nombresyapellidos','nombres','estudiante','alumno','apellidosnombres']);
      const idxGra=find(['grado','gradoseccion']);
      const idxSec=find(['seccion','sección']);
      const idxCod=find(['codigo','codigoqr','qr','codigovotacion']);
      if(idxNom===undefined||idxGra===undefined||idxSec===undefined){toast('Faltan columnas: APELLIDOS Y NOMBRES, GRADO y SECCION');return}
      const d=load(); const mode=$('#importMode')?.value||'append';
      let nuevos=[], actualizados=0, omitidos=0;
      rows.slice(1).forEach((r,i)=>{
        const nombres=String(r[idxNom]||'').trim(); const grado=String(r[idxGra]||'').trim(); const seccion=String(r[idxSec]||'').trim();
        if(!nombres||!grado||!seccion){omitidos++; return}
        const dni=idxDni!==undefined?String(r[idxDni]||'').replace(/\.0$/,'').trim():'';
        const codigo=(idxCod!==undefined&&String(r[idxCod]||'').trim())?String(r[idxCod]).trim().toUpperCase():makeStudentCode(dni,d.votantes.length+nuevos.length+i);
        const obj={id:uid(),codigo,dni,nombres,grado,seccion,yaVoto:false};
        const exists=d.votantes.findIndex(x=>(dni&&x.dni===dni)||x.codigo===codigo);
        if(mode==='append'&&exists>=0){d.votantes[exists]={...d.votantes[exists],...obj,id:d.votantes[exists].id,yaVoto:d.votantes[exists].yaVoto}; actualizados++;}
        else nuevos.push(obj);
      });
      if(mode==='replace'){d.votantes=nuevos; d.votos=[];} else d.votantes.push(...nuevos);
      save(d); if(preview) preview.textContent=`Carga terminada: ${nuevos.length} nuevos, ${actualizados} actualizados, ${omitidos} omitidos.`;
      toast('Padrón cargado correctamente'); setTimeout(()=>location.reload(),900);
    }catch(err){console.error(err); toast('No se pudo leer el archivo. Revisa las columnas.');}
  }
  function printQR(){
    const d=load();
    const win=window.open('','_blank'); if(!win){toast('Permite ventanas emergentes para imprimir QR');return}
    const cards=d.votantes.map(v=>`<div class="card"><div id="qr-${v.id}"></div><h3>${escapeHTML(v.nombres)}</h3><p>${escapeHTML(v.grado)} ${escapeHTML(v.seccion)} · DNI ${escapeHTML(v.dni||'')}</p><b>${escapeHTML(v.codigo)}</b></div>`).join('');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>QR Votantes</title><script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script><style>body{font-family:Arial;margin:20px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{border:1px solid #111;border-radius:12px;padding:12px;text-align:center;page-break-inside:avoid}h3{font-size:14px;margin:8px 0 3px}p{font-size:12px;margin:0 0 6px}@media print{button{display:none}.grid{grid-template-columns:repeat(3,1fr)}}</style></head><body><button onclick="window.print()">Imprimir</button><h2>I.E. Santa Rosa de Santo Domingo - Carnets QR de votación</h2><div class="grid">${cards}</div><script>const data=${JSON.stringify(d.votantes.map(v=>({id:v.id,codigo:v.codigo})))}; window.onload=()=>data.forEach(v=>new QRCode(document.getElementById('qr-'+v.id),{text:v.codigo,width:155,height:155,correctLevel:QRCode.CorrectLevel.H}));<\/script></body></html>`);
    win.document.close();
  }
  function setupVoting(){
    const root=$('#votingApp'); if(!root)return;
    let d=load(), current=null, selected=null, scanner=null, currentStream=null, scanTimer=null;
    let scanPaused=false, cameraActive=false, usingFallback=false, detector=null, busy=false;
    const show=(id)=>$$('[data-step]',root).forEach(s=>s.classList.toggle('hidden',s.dataset.step!==id));

    function setReaderIdle(){
      const reader=$('#reader');
      if(reader && !cameraActive) reader.innerHTML='<div class="center"><strong>📷 Lector QR</strong><br><span>Presiona activar cámara una sola vez</span></div>';
    }

    function pauseScan(){ scanPaused=true; }
    function resumeScan(){ scanPaused=false; }

    function resetForNextVoter(){
      d=load(); current=null; selected=null;
      $('#manualCode')&&($('#manualCode').value='');
      $$('.candidate-choice').forEach(x=>x.classList.remove('selected'));
      show('scan');
      resumeScan();
      if(cameraActive){ toast('Listo para el siguiente estudiante. No necesitas volver a permitir la cámara.'); }
    }

    function identify(code){
      if(scanPaused) return;
      d=load();
      code=String(code||'').trim().toUpperCase();
      if(!code) return;
      if(!d.config.habilitada){toast('La votación está cerrada');return}
      const v=d.votantes.find(x=>x.codigo===code || x.dni===code);
      if(!v){toast('QR o código no registrado');return}
      if(v.yaVoto){toast('Este estudiante ya registró su voto');return}
      current=v;
      pauseScan();
      $('#identifiedStudent').innerHTML=`<b>${escapeHTML(v.nombres)}</b><br>Grado y sección: ${escapeHTML(v.grado)} ${escapeHTML(v.seccion)}<br>Código: ${escapeHTML(v.codigo)}`;
      show('confirm');
    }

    function renderBallot(){
      selected=null;
      const list=$('#ballotList');
      list.innerHTML=d.candidatos.filter(x=>x.activo).slice(0,d.config.maxCandidatos).map(x=>`<label class="candidate-choice"><div class="candidate-photo">${escapeHTML(x.lista.replace(/\D/g,'')||x.nombre[0])}</div><div><b>${escapeHTML(x.lista)} - ${escapeHTML(x.nombre)}</b><br><span class="muted">${escapeHTML(x.propuesta)}</span></div><input type="radio" name="candidate" value="${x.id}"></label>`).join('');
      show('ballot');
    }

    function stopScanner(){
      if(scanTimer){clearInterval(scanTimer); scanTimer=null}
      if(currentStream){currentStream.getTracks().forEach(t=>t.stop()); currentStream=null}
      if(scanner){scanner.stop().catch(()=>{}); scanner=null}
      cameraActive=false; usingFallback=false; detector=null; busy=false; scanPaused=false;
      setReaderIdle();
    }

    function ensureNativeLoop(video){
      if(scanTimer) return;
      scanTimer=setInterval(async()=>{
        if(scanPaused || busy || !cameraActive || !detector || video.readyState<2) return;
        busy=true;
        try{
          const codes=await detector.detect(video);
          if(codes?.length) identify(codes[0].rawValue);
        }catch(e){}
        busy=false;
      },300);
    }

    async function startNativeScanner(){
      if(cameraActive && currentStream){
        resumeScan(); show('scan'); toast('La cámara ya está activa. Acerca el QR del siguiente alumno.'); return;
      }
      if(!navigator.mediaDevices?.getUserMedia){throw new Error('Tu navegador no permite cámara')}
      const reader=$('#reader');
      reader.innerHTML='<video id="qrVideo" autoplay playsinline muted></video><div class="scan-line"></div><p class="scanner-help">Cámara activa. Coloca el QR grande, derecho y bien iluminado dentro del cuadro.</p>';
      const video=$('#qrVideo');
      try{
        currentStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
      }catch(e){
        currentStream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
      }
      video.srcObject=currentStream;
      await video.play();
      cameraActive=true; usingFallback=false; resumeScan(); show('scan');
      if(!('BarcodeDetector' in window)){throw new Error('BarcodeDetector no disponible')}
      detector=new BarcodeDetector({formats:['qr_code']});
      ensureNativeLoop(video);
      toast('Cámara activada. Ahora queda encendida para todos los alumnos.');
    }

    async function startHtml5QrFallback(){
      if(cameraActive && scanner){resumeScan(); show('scan'); toast('El lector QR ya está activo.'); return;}
      if(!window.Html5Qrcode){toast('No cargó la librería QR. Usa el código manual.');return}
      const reader=$('#reader'); reader.innerHTML='';
      scanner=new Html5Qrcode('reader'); usingFallback=true; cameraActive=true; resumeScan(); show('scan');
      await scanner.start({facingMode:'environment'},{fps:12,qrbox:{width:300,height:300},aspectRatio:1.777,disableFlip:false},decoded=>{ if(!scanPaused) identify(decoded); });
      toast('Lector QR activado. Queda encendido para todos los alumnos.');
    }

    $('#manualCodeBtn')?.addEventListener('click',()=>identify($('#manualCode').value));
    $('#manualCode')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault(); identify($('#manualCode').value)}});
    $('#continueVote')?.addEventListener('click',renderBallot);
    $('#cancelVote')?.addEventListener('click',()=>resetForNextVoter());
    $('#ballotList')?.addEventListener('change',e=>{$$('.candidate-choice').forEach(x=>x.classList.remove('selected')); e.target.closest('.candidate-choice')?.classList.add('selected'); selected=e.target.value});
    $('#sendVote')?.addEventListener('click',()=>{if(!selected){toast('Selecciona un candidato');return} const cand=d.candidatos.find(x=>x.id===selected); $('#voteSummary').textContent=`${cand.lista} - ${cand.nombre}`; show('final')});
    $('#backBallot')?.addEventListener('click',()=>show('ballot'));
    $('#confirmVote')?.addEventListener('click',()=>{
      d=load();
      const vi=d.votantes.findIndex(x=>x.id===current.id);
      if(vi<0||d.votantes[vi].yaVoto){toast('El voto ya fue registrado o el votante no existe'); resetForNextVoter(); return}
      d.votos.push({id:uid(),candidatoId:selected,eleccion:d.config.nombre,fecha:new Date().toISOString()});
      d.votantes[vi].yaVoto=true;
      save(d);
      show('thanks');
      setTimeout(resetForNextVoter,2200);
    });
    $('#startScanner')?.addEventListener('click',async()=>{
      try{await startNativeScanner()}
      catch(err){
        console.warn(err);
        try{await startHtml5QrFallback()}catch(e){console.error(e); toast('No se pudo iniciar el lector. Usa el código manual o abre el proyecto con Live Server.')}
      }
    });
    window.addEventListener('beforeunload',stopScanner);
    setReaderIdle();
  }

  function renderResults(d=load()){
    const box=$('#resultsBox'); if(!box)return; const total=d.votos.length||0; box.innerHTML=d.candidatos.map(c=>{const n=d.votos.filter(v=>v.candidatoId===c.id).length; const pct=total?Math.round(n*100/total):0; return `<div class="mini-card"><div class="flex between"><b>${escapeHTML(c.lista)} - ${escapeHTML(c.nombre)}</b><strong>${n} votos</strong></div><div class="result-bar"><div class="result-fill" style="width:${pct}%"></div></div><small>${pct}% del total</small></div>`}).join('')||'<p class="muted">Aún no hay candidatos.</p>';
  }
  document.addEventListener('DOMContentLoaded',()=>{setupMenu();activeNav();setupFilters();renderPublic();setupLogin();setupAdmin();setupVoting();renderResults();});
})();
