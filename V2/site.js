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

  /* ---- home guided picker: two dropdowns, progressive reveal ---- */
  var picker=document.getElementById('picker');
  if(!picker || !window.TT) return;
  var data=window.TT;
  var q1=document.getElementById('q1');
  var q2wrap=document.getElementById('q2');
  var q2=document.getElementById('q2select');
  var result=document.getElementById('result');
  var curSit=null;

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  /* build Q1 options */
  data.situations.forEach(function(sit,si){
    var o=document.createElement('option');
    o.value=String(si);o.textContent=sit.label;
    q1.appendChild(o);
  });

  q1.addEventListener('change',function(){
    var si=parseInt(q1.value,10);
    if(isNaN(si)) return;
    curSit=si;
    var sit=data.situations[si];
    q2.innerHTML='';
    var ph=document.createElement('option');
    ph.value='';ph.selected=true;ph.disabled=true;ph.hidden=true;ph.textContent='I want to...';
    q2.appendChild(ph);
    sit.goals.forEach(function(goal,gi){
      var o=document.createElement('option');
      o.value=String(gi);o.textContent=goal.label;
      q2.appendChild(o);
    });
    q2.value='';
    q2wrap.hidden=false;
    result.hidden=true;result.innerHTML='';
    q2wrap.scrollIntoView({behavior:'smooth',block:'center'});
  });

  q2.addEventListener('change',function(){
    var gi=parseInt(q2.value,10);
    if(isNaN(gi) || curSit===null) return;
    var goal=data.situations[curSit].goals[gi];
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
  });
})();
