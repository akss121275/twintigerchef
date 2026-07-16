/* Twin Tiger Chefs - V2 shared behaviour */
(function(){
  /* ---- mobile nav toggle ---- */
  var nav=document.querySelector('.nav');
  var toggle=nav && nav.querySelector('.nav-toggle');
  if(toggle){
    toggle.addEventListener('click',function(){
      var open=nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded',open?'true':'false');
    });
  }

  /* ---- plating slideshow (profile) ---- */
  (function(){
    var slides=[].slice.call(document.querySelectorAll('.plating .pslide'));
    if(slides.length<2) return;
    var i=0;
    slides[0].classList.add('on');
    setInterval(function(){
      slides[i].classList.remove('on');
      i=(i+1)%slides.length;
      slides[i].classList.add('on');
    },4200);
  })();

  /* ---- contact form -> Web3Forms via fetch ---- */
  [].slice.call(document.querySelectorAll('form.form')).forEach(function(form){
    var status=form.parentNode.querySelector('.form-status');
    var btn=form.querySelector('.submit');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(status){status.className='form-status';status.textContent='';}
      var original=btn?btn.textContent:'';
      if(btn){btn.disabled=true;btn.textContent='Sending';}
      fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}})
        .then(function(res){
          return res.json().catch(function(){return {};}).then(function(data){
            if(res.ok && data.success){
              form.reset();form.style.display='none';
              if(status){status.className='form-status ok';
                status.textContent='Thank you. Your message is on its way and we will be in touch shortly.';}
              return;
            }
            throw new Error((data && data.message) || 'Sorry, something went wrong. Please try again, or email us directly.');
          });
        })
        .catch(function(err){
          if(status){status.className='form-status err';
            status.textContent=(err && err.message) || 'Sorry, something went wrong. Please check your connection and try again.';}
          if(btn){btn.disabled=false;btn.textContent=original;}
        });
    });
  });

  /* ---- home guided picker: fill-in-the-blank sentence + custom popover, two steps ---- */
  var picker=document.getElementById('picker');
  if(!picker || !window.TT) return;
  var data=window.TT;

  var sitBlank=document.getElementById('sitBlank');
  var sitMenu=document.getElementById('sitMenu');
  var goalSentence=document.getElementById('goalSentence');
  var goalBlank=document.getElementById('goalBlank');
  var goalMenu=document.getElementById('goalMenu');
  var result=document.getElementById('result');
  var curSit=null;

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function stripLead(s){return String(s).replace(/^\s*I\s*am\s+/i,'');}

  /* a small popover controller for one blank + one menu */
  function makePopover(blank,menu,onSelect){
    var blankText=blank.querySelector('.ps-blank-text');
    function opts(){return [].slice.call(menu.querySelectorAll('li[role="option"]'));}
    function clearFocused(){opts().forEach(function(o){o.classList.remove('focused');});}
    function setFocused(li){clearFocused();if(li){li.classList.add('focused');}}
    function open(){
      if(!menu.hidden) return;
      menu.hidden=false;
      blank.setAttribute('aria-expanded','true');
      setFocused(menu.querySelector('li[aria-selected="true"]')||opts()[0]);
    }
    function close(){
      if(menu.hidden) return;
      menu.hidden=true;
      blank.setAttribute('aria-expanded','false');
      clearFocused();
    }
    function choose(li){
      if(!li) return;
      blankText.textContent=li.textContent;
      blank.classList.add('filled');
      opts().forEach(function(o){o.setAttribute('aria-selected',o===li?'true':'false');});
      close();
      onSelect(parseInt(li.getAttribute('data-idx'),10),li);
    }
    blank.addEventListener('click',function(e){
      e.stopPropagation();
      if(menu.hidden){open();}else{close();}
    });
    menu.addEventListener('click',function(e){
      var li=e.target.closest('li[role="option"]');
      if(!li) return;
      e.stopPropagation();
      choose(li);
      blank.focus();
    });
    menu.addEventListener('mousemove',function(e){
      var li=e.target.closest('li[role="option"]');
      if(li){setFocused(li);}
    });
    document.addEventListener('click',function(e){
      if(!menu.hidden && !blank.contains(e.target) && !menu.contains(e.target)){close();}
    });
    blank.addEventListener('keydown',function(e){
      var list=opts();
      if(e.key==='ArrowDown'||e.key==='Enter'||e.key===' '){
        e.preventDefault();
        if(menu.hidden){open();}
        else{
          var cur=menu.querySelector('li.focused');
          if(e.key==='ArrowDown'){var ni=cur?list.indexOf(cur)+1:0;if(ni>=list.length){ni=0;}setFocused(list[ni]);}
          else if(cur){choose(cur);}
        }
      }else if(e.key==='ArrowUp'){
        e.preventDefault();
        if(menu.hidden){open();}
        else{var cur=menu.querySelector('li.focused');var pi=cur?list.indexOf(cur)-1:list.length-1;if(pi<0){pi=list.length-1;}setFocused(list[pi]);}
      }else if(e.key==='Escape'){close();}
    });
    return {open:open,close:close,
      reset:function(){blankText.innerHTML='&nbsp;';blank.classList.remove('filled');}};
  }

  function fillMenu(menu,items,labelFn){
    menu.innerHTML='';
    items.forEach(function(it,idx){
      var li=document.createElement('li');
      li.setAttribute('role','option');
      li.setAttribute('aria-selected','false');
      li.setAttribute('data-idx',String(idx));
      li.textContent=labelFn(it);
      menu.appendChild(li);
    });
  }

  function renderResult(goal){
    var linksHtml=(goal.links||[]).map(function(l){
      return '<a class="r-link" href="'+l.href+'">'+esc(l.t)+'</a>';
    }).join('');
    var c=data.contact;
    result.innerHTML=
      '<div class="result-card">'+
        '<div class="r-eyebrow">Where we would start</div>'+
        '<h3>'+esc(goal.h)+'</h3>'+
        '<p class="r-body">'+esc(goal.p)+'</p>'+
        (linksHtml?'<div class="r-links">'+linksHtml+'</div>':'')+
        '<div class="cta-block">'+
          '<h4><a class="cta-call-head" href="tel:'+c.tel+'">Call for a free consultation</a></h4>'+
          '<p class="hours">'+esc(c.hours)+'</p>'+
          '<div class="cta-actions">'+
            '<a class="cta-btn amber" href="tel:'+c.tel+'">Call</a>'+
            '<a class="cta-btn" href="https://wa.me/'+c.wa.replace(/[^0-9]/g,'')+'">WhatsApp</a>'+
            '<a class="cta-btn" href="mailto:'+c.email+'">Email</a>'+
          '</div>'+
          '<p class="aside">Or send us a message on WhatsApp or Email and we will call you back.</p>'+
        '</div>'+
      '</div>';
    result.hidden=false;
    result.scrollIntoView({behavior:'smooth',block:'center'});
  }

  var goalPop=makePopover(goalBlank,goalMenu,function(gi){
    if(curSit===null || isNaN(gi)) return;
    renderResult(data.situations[curSit].goals[gi]);
  });

  var sitPop=makePopover(sitBlank,sitMenu,function(si){
    if(isNaN(si)) return;
    curSit=si;
    fillMenu(goalMenu,data.situations[si].goals,function(g){return g.label;});
    goalPop.reset();
    goalSentence.hidden=false;
    result.hidden=true;result.innerHTML='';
    goalSentence.scrollIntoView({behavior:'smooth',block:'center'});
  });

  /* build the situation menu (strip the leading "I am" so the sentence reads naturally) */
  fillMenu(sitMenu,data.situations,function(s){return stripLead(s.label);});
})();
