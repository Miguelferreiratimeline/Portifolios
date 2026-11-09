/* MF FRAME — Vídeos abertos sob demanda. Sem iframe até o clique. */
(()=>{
  'use strict';
  const config=window.MF_FRAME_VIDEOS||{};
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const validID=id=>/^[\w-]{11}$/.test(id);

  function parseLink(raw){
    if(typeof raw!=='string'||!raw.trim())return null;
    let u;
    try{u=new URL(raw.trim(),window.location.href)}catch{return null}
    if(!['https:','http:','file:'].includes(u.protocol))return null;
    const host=u.hostname.toLowerCase().replace(/^www\./,'').replace(/^m\./,'');
    if(host==='youtube.com'||host==='youtube-nocookie.com'||host==='music.youtube.com'){
      let id=u.searchParams.get('v')||'';
      if(!id){const bits=u.pathname.split('/').filter(Boolean); if(['shorts','embed','live'].includes(bits[0]))id=bits[1]||'';}
      if(validID(id))return {type:'iframe',src:'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0'};
    }
    if(host==='youtu.be'){
      const id=u.pathname.slice(1).split('/')[0];
      if(validID(id))return {type:'iframe',src:'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0'};
    }
    if(host==='vimeo.com'||host==='player.vimeo.com'){
      const id=u.pathname.split('/').find(x=>/^\d+$/.test(x));
      if(id)return {type:'iframe',src:'https://player.vimeo.com/video/'+id+'?autoplay=1'};
    }
    if(/\.(mp4|webm|ogv)$/i.test(u.pathname))return {type:'video',src:u.href};
    if(u.protocol==='https:'||u.protocol==='http:')return {type:'external',src:u.href};
    return null;
  }

  const modal=document.createElement('div');
  modal.className='mf-video-modal';
  modal.hidden=true;
  modal.innerHTML='<div class="mf-video-backdrop" data-video-close></div><div class="mf-video-dialog" role="dialog" aria-modal="true" aria-labelledby="mf-video-title"><div class="mf-video-bar"><strong id="mf-video-title">Assistir projeto</strong><button class="mf-video-close" type="button" data-video-close aria-label="Fechar vídeo">Fechar ×</button></div><div class="mf-video-stage"></div><div class="mf-video-modal-bottom"><span class="mf-video-footnote">Reprodução iniciada por você. Feche para interromper.</span><a class="mf-video-external" target="_blank" rel="noopener noreferrer" href="#">Abrir no YouTube ↗</a></div></div>';
  document.body.appendChild(modal);
  const stage=modal.querySelector('.mf-video-stage');
  const externalLink=modal.querySelector('.mf-video-external');
  const title=modal.querySelector('#mf-video-title');
  const close=modal.querySelector('.mf-video-close');
  let priorFocus=null;
  function hide(){
    if(modal.hidden)return;
    modal.hidden=true;
    stage.replaceChildren();
    stage.classList.remove('is-vertical');
    document.body.classList.remove('mf-video-open');
    if(priorFocus&&priorFocus.isConnected)priorFocus.focus({preventScroll:true});
  }
  function show(media,label,vertical=false,originalUrl=""){
    priorFocus=document.activeElement;
    title.textContent=label;
    stage.replaceChildren();
    stage.classList.toggle('is-vertical',vertical);
    externalLink.href=originalUrl || media.src;
    let el;
    if(media.type==='video'){
      el=document.createElement('video');
      el.src=media.src;
      el.controls=true;
      el.autoplay=true;
      el.playsInline=true;
      el.preload='metadata';
      el.setAttribute('aria-label',label);
    }else{
      el=document.createElement('iframe');
      el.src=media.src;
      el.title=label;
      el.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      el.referrerPolicy='strict-origin-when-cross-origin';
      el.allowFullscreen=true;
    }
    stage.append(el);
    modal.hidden=false;
    document.body.classList.add('mf-video-open');
    close.focus({preventScroll:true});
  }
  modal.querySelectorAll('[data-video-close]').forEach(x=>x.addEventListener('click',hide));
  document.addEventListener('keydown',e=>{
    if(modal.hidden)return;
    if(e.key==='Escape'){e.preventDefault();hide();}
    if(e.key==='Tab'){
      // Only the close button is tabbable while the modal opens; media controls remain usable.
      const focusable=[close, ...stage.querySelectorAll('video,iframe')];
      const idx=focusable.indexOf(document.activeElement);
      if(e.shiftKey&&idx<=0){e.preventDefault();focusable.at(-1).focus();}
      if(!e.shiftKey&&idx===focusable.length-1){e.preventDefault();close.focus();}
    }
  });

  function addPlayer(parent,raw,label,vertical=false){
    const media=parseLink(raw);
    if(!media)return;
    if(media.type==='external'){
      const a=document.createElement('a');
      a.href=media.src;
      a.className='mf-play-overlay';
      a.target='_blank';a.rel='noopener noreferrer';
      a.setAttribute('aria-label','Abrir '+label+' em outra plataforma (nova aba)');
      a.innerHTML='<span class="mf-play-icon" aria-hidden="true">↗</span><span class="mf-play-caption">Abrir vídeo</span>';
      parent.append(a);return;
    }
    const button=document.createElement('button');
    button.type='button';
    button.className='mf-play-overlay';
    button.setAttribute('aria-label','Assistir: '+label);
    button.innerHTML='<span class="mf-play-icon" aria-hidden="true">▶</span><span class="mf-play-caption">Assistir vídeo</span>';
    button.addEventListener('click',()=>show(media,label,vertical,raw));
    parent.append(button);
  }

  document.querySelectorAll('article[data-video-id]').forEach(article=>{
    const id=article.dataset.videoId;
    const raw=config[id];
    if(!raw)return;
    const label=article.querySelector('h3')?.textContent?.trim()||'Vídeo MF FRAME';
    const image=article.querySelector('.project-visual');
    if(image)addPlayer(image,raw,label,article.dataset.videoOrientation==='vertical');
  });
  const featured=document.querySelector('[data-featured-video]');
  if(featured&&config[featured.dataset.featuredVideo]){
    const label='Projeto em destaque — Minecraft Gameplay';
    addPlayer(featured,config[featured.dataset.featuredVideo],label);
  }
})();
