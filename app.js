// MF FRAME V07 — interaction, progressive enhancement, motion & secret.
(()=>{
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu=document.querySelector('[data-menu-toggle]');
  if(menu){
    const close=()=>{document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu')};
    menu.addEventListener('click',()=>{const opened=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(opened));menu.setAttribute('aria-label',opened?'Fechar menu':'Abrir menu')});
    document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',close));
    window.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    window.addEventListener('resize',()=>{if(window.innerWidth>920)close()});
  }

  // Entry reveals are implemented by the mass-spring system in spring-glass.js.


  // Scroll progress now follows the physical spring system in spring-glass.js.


  if(!reduced.matches){
    const cover=document.querySelector('[data-parallax]');
    if(cover){
      let frame=false;
      const move=()=>{
        if(frame)return;
        frame=true;
        requestAnimationFrame(()=>{
          const rect=cover.parentElement.getBoundingClientRect();
          const normalized=(rect.top+rect.height/2-innerHeight/2)/Math.max(1,innerHeight);
          cover.style.transform=`translate3d(0,${(-normalized*14).toFixed(1)}px,0) scale(1.025)`;
          frame=false;
        });
      };
      move();
      window.addEventListener('scroll',move,{passive:true});
      window.addEventListener('resize',move);
    }
    for(const stage of document.querySelectorAll('[data-glass-stage]')){
      const glass=stage.querySelector('[data-glass-card]');
      if(!glass)continue;
      stage.addEventListener('pointermove',e=>{
        if(e.pointerType==='touch')return;
        const rect=glass.getBoundingClientRect();
        const x=Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100));
        const y=Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100));
        glass.style.setProperty('--mx',x.toFixed(1)+'%');
        glass.style.setProperty('--my',y.toFixed(1)+'%');
      },{passive:true});
    }
  }

  // Discord: copiado para a área de transferência, sem prometer abrir um perfil por nome.
  const discordHandle='mf_frame';
  const copyLegacy=text=>{
    const input=document.createElement('textarea');
    input.value=text;
    input.setAttribute('readonly','');
    input.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(input);
    input.select();
    let copied=false;
    try{copied=document.execCommand('copy')}catch(e){copied=false}
    input.remove();
    return copied;
  };
  document.querySelectorAll('[data-copy-discord]').forEach(button=>{
    let resetTimer;
    button.addEventListener('click',async()=>{
      let copied=false;
      try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(discordHandle);copied=true}}
      catch(e){}
      if(!copied)copied=copyLegacy(discordHandle);
      const label=button.querySelector('.discord-copy-label');
      const icon=button.querySelector('.discord-copy-icon');
      if(label)label.textContent=copied?'Usuário copiado!':'Discord: '+discordHandle;
      if(icon)icon.textContent=copied?'✓':'⧉';
      button.setAttribute('aria-label',copied?'Usuário do Discord mf_frame copiado':'Discord: mf_frame — selecione para copiar');
      clearTimeout(resetTimer);
      resetTimer=setTimeout(()=>{
        if(label)label.innerHTML='Discord <span class="discord-handle">mf_frame</span>';
        if(icon)icon.textContent='⧉';
        button.setAttribute('aria-label','Copiar usuário Discord mf_frame');
      },2600);
    });
  });

  // A little secret for the curious: type FRAME or tap the featured-project chip five times.
  let toast,timer;
  function revealSecret(){
    document.body.classList.toggle('easter-on');
    if(!toast){
      toast=document.createElement('div');toast.className='secret-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
      const strong=document.createElement('strong'),sub=document.createElement('span');toast.append(strong,sub);document.body.appendChild(toast);
    }
    toast.querySelector('strong').textContent="DIRECTOR'S CUT · MF FRAME";
    toast.querySelector('span').textContent='Você encontrou o corte secreto. Até os detalhes escondidos têm intenção.';
    toast.classList.add('show');
    clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),4400);
  }
  let typed='';
  window.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.altKey||e.metaKey||e.target.closest('input,textarea,[contenteditable="true"]'))return;
    if(e.key.length!==1)return;
    typed=(typed+e.key.toLowerCase()).slice(-5);
    if(typed==='frame'){typed='';revealSecret()}
  });
  const heroBadge=document.querySelector('.showcase-tag');
  if(heroBadge){
    let taps=[];
    heroBadge.addEventListener('click',()=>{
      const t=Date.now();taps=taps.filter(x=>t-x<2200);taps.push(t);
      if(taps.length>=5){taps=[];revealSecret()}
    });
  }
})();
