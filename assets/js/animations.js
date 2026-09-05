/* FLAMIORA — elegant, lightweight motion controller */
(function(){
  'use strict';
  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markReveals(){
    var selectors=[
      'main > .section','main > section','main > .container > section',
      '.category-card','.product-card','.insta-card','.cart-line','.cart-reassurance',
      '.editorial-copy','.editorial-media','.confirm-box','.empty-state',
      '.adm-kpi-grid .adm-card','.adm-grid-2 > .adm-card','.adm-card-head'
    ];
    var nodes=[];
    selectors.forEach(function(sel){ document.querySelectorAll(sel).forEach(function(el){ if(nodes.indexOf(el)<0) nodes.push(el); }); });
    nodes.forEach(function(el,i){
      if(el.closest('.bottom-nav,.site-header,.site-footer,.checkout-modal,.backdrop')) return;
      el.setAttribute('data-motion-reveal','');
      el.style.setProperty('--motion-delay', Math.min((i%5)*55,220)+'ms');
    });
    if(reduce){ nodes.forEach(function(el){el.classList.add('is-visible')}); return; }
    if(!('IntersectionObserver' in window)){nodes.forEach(function(el){el.classList.add('is-visible')});return;}
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}});
    },{threshold:.10,rootMargin:'0px 0px -7% 0px'});
    nodes.forEach(function(el){io.observe(el)});
  }

  function headerScroll(){
    var ticking=false;
    function update(){document.body.classList.toggle('is-scrolled',window.scrollY>18);ticking=false;}
    update();
    window.addEventListener('scroll',function(){if(!ticking){requestAnimationFrame(update);ticking=true;}},{passive:true});
  }

  function ripples(){
    if(reduce) return;
    document.addEventListener('click',function(e){
      var btn=e.target.closest && e.target.closest('.btn,.adm-btn');
      if(!btn) return;
      var rect=btn.getBoundingClientRect(), size=Math.max(rect.width,rect.height)*1.25;
      var r=document.createElement('span');
      r.className='motion-ripple';r.style.width=size+'px';r.style.height=size+'px';
      r.style.left=(e.clientX-rect.left-size/2)+'px';r.style.top=(e.clientY-rect.top-size/2)+'px';
      btn.appendChild(r);setTimeout(function(){r.remove()},700);
    });
  }

  function watchCart(){
    var last='';
    function bump(){
      var els=document.querySelectorAll('.cart-count,.count.cart-count');
      var value=Array.from(els).map(function(x){return x.textContent.trim()}).join('|');
      if(last && value!==last && !reduce){
        document.querySelectorAll('.bottom-cart,.cart-count').forEach(function(el){el.classList.remove('motion-bump','motion-pop');void el.offsetWidth;el.classList.add(el.classList.contains('cart-count')?'motion-pop':'motion-bump');setTimeout(function(){el.classList.remove('motion-bump','motion-pop')},700);});
      }
      last=value;
    }
    bump();
    var target=document.body;
    new MutationObserver(bump).observe(target,{subtree:true,childList:true,characterData:true});
  }

  document.addEventListener('DOMContentLoaded',function(){
    markReveals();headerScroll();ripples();watchCart();
    document.documentElement.classList.add('flamiora-motion-ready');
  });
})();
