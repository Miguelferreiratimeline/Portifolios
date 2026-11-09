// MF FRAME V08 — real damped-spring physics. No easing duration for movements.
(()=>{
  'use strict';
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMobile=window.matchMedia('(max-width:920px)');
  const active=new Set();
  let raf=0,last=0;
  const near=(a,b,t)=>Math.abs(a-b)<=t;

  // Semi-implicit Euler integration of F=-k(x-target)-c*v; each variable has mass and velocity.
  class Spring {
    constructor(values,render,config={}) {
      this.val={...values};this.to={...values};this.velocity=Object.fromEntries(Object.keys(values).map(k=>[k,0]));
      this.render=render;this.k=config.stiffness||450;this.d=config.damping||28;this.mass=config.mass||1;
      this.render(this.val);
    }
    set(target){Object.assign(this.to,target);if(media.matches){Object.assign(this.val,this.to);for(const k of Object.keys(this.velocity))this.velocity[k]=0;this.render(this.val);return;}active.add(this);schedule();}
    tick(dt){
      const n=Math.max(1,Math.ceil(dt/(1/120))),h=dt/n;
      for(let step=0;step<n;step++)for(const key of Object.keys(this.val)){
        const acc=(-this.k*(this.val[key]-this.to[key])-this.d*this.velocity[key])/this.mass;
        this.velocity[key]+=acc*h;
        this.val[key]+=this.velocity[key]*h;
      }
      let settled=true;
      for(const key of Object.keys(this.val)){
        const epsilon=key==='scale'||key==='alpha'||key==='progress'?.0005:.025;
        if(!near(this.val[key],this.to[key],epsilon)||Math.abs(this.velocity[key])>(epsilon*6))settled=false;
      }
      if(settled){Object.assign(this.val,this.to);for(const key in this.velocity)this.velocity[key]=0;}
      this.render(this.val);return !settled;
    }
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(loop);}
  function loop(timestamp){
    raf=0;
    const elapsed=last?Math.min((timestamp-last)/1000,.034):1/60;last=timestamp;
    for(const s of [...active]) if(!s.tick(elapsed))active.delete(s);
    if(active.size) schedule();else last=0;
  }
  if(media.matches)return;
  document.documentElement.classList.add('spring-physics-ready');

  // Physically animated entry reveal: starts after each block becomes visible.
  const els=[...document.querySelectorAll('.reveal')];
  if('IntersectionObserver' in window){
    const reveals=new Map(els.map(el=>[el,new Spring({y:30,alpha:0},v=>{
      el.style.setProperty('--spring-y',`${v.y.toFixed(2)}px`);
      el.style.setProperty('--spring-alpha',String(Math.max(0,Math.min(1,v.alpha)).toFixed(3)));
    },{stiffness:205,damping:23,mass:1})]));
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){reveals.get(entry.target).set({y:0,alpha:1});observer.unobserve(entry.target);}}},{rootMargin:'0px 0px -24px 0px',threshold:.05});
    reveals.forEach((v,el)=>observer.observe(el));
  }else{els.forEach(el=>{el.style.setProperty('--spring-y','0px');el.style.setProperty('--spring-alpha','1')});}

  // Magnetic buttons: position and scale react to pointer pressure and speed, then overshoot/settle.
  const controls=[...document.querySelectorAll('.btn,.nav-cta,.glass-footer a')];
  for(const control of controls){
    control.classList.add('spring-glass-control');
    let hover=false,press=false;
    const spring=new Spring({x:0,y:0,scale:1},v=>{
      control.style.transform=`translate3d(${v.x.toFixed(2)}px,${v.y.toFixed(2)}px,0) scale(${v.scale.toFixed(4)})`;
    },{stiffness:510,damping:27,mass:.9});
    const reset=()=>spring.set({x:0,y:0,scale:press?.955:1});
    control.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;hover=true;spring.set({scale:1.055,y:-2.5});});
    control.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch')return;
      const r=control.getBoundingClientRect();
      const px=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
      const py=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));
      control.style.setProperty('--gloss-x',`${px}%`);control.style.setProperty('--gloss-y',`${py}%`);
      if(hover && !press){spring.set({x:(px-50)*.095,y:-2.5+(py-50)*.05});}
    },{passive:true});
    control.addEventListener('pointerleave',()=>{hover=false;press=false;reset();});
    control.addEventListener('pointerdown',()=>{press=true;spring.set({scale:.935,y:2,x:0});});
    const release=()=>{press=false;spring.set({scale:hover?1.055:1,y:hover?-2.5:0,x:0})};
    control.addEventListener('pointerup',release);control.addEventListener('pointercancel',release);
    control.addEventListener('focus',()=>spring.set({scale:1.045,y:-1.5}));
    control.addEventListener('blur',()=>{if(!hover)reset()});
    control.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')spring.set({scale:.955,y:1});});
    control.addEventListener('keyup',e=>{if(e.key==='Enter'||e.key===' ')spring.set({scale:1.045,y:-1});});
  }

  // One shared pane travels underneath navbar items, with real spring inertia.
  const nav=document.querySelector('.nav');
  if(nav){
    const indicator=document.createElement('span');indicator.className='nav-spring-indicator';indicator.setAttribute('aria-hidden','true');nav.prepend(indicator);
    const glass=new Spring({x:0,w:1,alpha:0},v=>{
      indicator.style.transform=`translate3d(${v.x.toFixed(2)}px,0,0)`;
      indicator.style.width=`${Math.max(1,v.w).toFixed(2)}px`;
      indicator.style.opacity=String(Math.max(0,Math.min(1,v.alpha)).toFixed(3));
    },{stiffness:410,damping:28,mass:.86});
    const position=link=>{
      if(isMobile.matches)return;
      const outer=nav.getBoundingClientRect(),r=link.getBoundingClientRect();
      glass.set({x:r.left-outer.left,w:r.width,alpha:1});
    };
    const clear=()=>glass.set({alpha:0});
    nav.querySelectorAll('a').forEach(a=>{
      a.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')position(a)});
      a.addEventListener('focus',()=>position(a));
      a.addEventListener('blur',()=>{if(!nav.matches(':hover'))clear()});
    });
    nav.addEventListener('pointerleave',clear);
    window.addEventListener('resize',()=>{if(isMobile.matches){clear();indicator.style.display='none';}else indicator.style.display='';});
    if(isMobile.matches)indicator.style.display='none';
  }

  // Spring-smoothed scroll bar. Unlike the previous linear scale this follows with inertia.
  let line=document.querySelector('.scroll-track span');
  if(!line){const track=document.createElement('div');track.className='scroll-track';track.setAttribute('aria-hidden','true');line=document.createElement('span');track.appendChild(line);document.body.prepend(track);}
  const progress=new Spring({progress:0},v=>{line.style.transform=`scaleX(${Math.max(0,Math.min(1,v.progress)).toFixed(5)})`;},{stiffness:270,damping:28,mass:1});
  let scrollScheduled=false;
  const onScroll=()=>{if(scrollScheduled)return;scrollScheduled=true;requestAnimationFrame(()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    progress.set({progress:Math.max(0,Math.min(1,scrollY/max))});scrollScheduled=false;
  });};
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);
})();
