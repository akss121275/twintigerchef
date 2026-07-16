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

  /* ---- home guided picker: two-level progressive reveal ---- */
  var picker=document.getElementById('picker');
  if(!picker || !window.TT) return;
  var data=window.TT;
  var q1=document.getElementById('q1');
  var q2=document.getElementById('q2');
  var q2grid=document.getElementById('q2grid');
  var q2lead=document.getElementById('q2lead');
  var result=document.getElementById('result');
  var curSit=null;

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  /* build Q1 tiles */
  data.situations.forEach(function(sit,si){
    var b=document.createElement('button');
    b.type='button';b.className='tile';b.textContent=sit.label;
    b.addEventListener('click',function(){selectSituation(si,b);});
    q1.appendChild(b);
  });

  function selectSituation(si,btn){
    curSit=si;
    [].slice.call(q1.querySelectorAll('.tile')).forEach(function(t){t.classList.remove('selected');});
    btn.classList.add('selected');
    var sit=data.situations[si];
    q2lead.textContent='I want to...';
    q2grid.innerHTML='';
    sit.goals.forEach(function(goal,gi){
      var b=document.createElement('button');
      b.type='button';b.className='tile';b.textContent=goal.label;
      b.addEventListener('click',function(){selectGoal(gi,b);});
      q2grid.appendChild(b);
    });
    q2.hidden=false;
    result.hidden=true;result.innerHTML='';
    q2.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function selectGoal(gi,btn){
    [].slice.call(q2grid.querySelectorAll('.tile')).forEach(function(t){t.classList.remove('selected');});
    btn.classList.add('selected');
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
          '<h4>Call for a free consultation</h4>'+
          '<p class="hours">'+esc(c.hours)+'</p>'+
          '<div class="lines">'+
            '<a href="tel:'+c.tel+'">Call '+esc(c.tel)+'</a>'+
            '<a href="https://wa.me/'+c.wa.replace(/[^0-9]/g,'')+'">WhatsApp us</a>'+
            '<a href="mailto:'+c.email+'">'+esc(c.email)+'</a>'+
          '</div>'+
          '<p class="aside">Or send us a message on WhatsApp or Email and we will call you back.</p>'+
        '</div>'+
      '</div>';
    result.hidden=false;
    result.scrollIntoView({behavior:'smooth',block:'center'});
  }
})();
