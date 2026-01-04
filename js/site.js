document.addEventListener('DOMContentLoaded', function(){
  // set active nav item based on current path
  var path = location.pathname.split('/').pop() || 'Beranda.html';
  document.querySelectorAll('#main-nav .nav-item').forEach(function(a){
    var href = a.getAttribute('href');
    if(href === path || (href === 'Beranda.html' && path === '')){
      a.classList.add('active');
    }
    // add ripple effect container
    a.addEventListener('click', function(e){
      var rect = a.getBoundingClientRect();
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      var size = Math.max(rect.width, rect.height) * 1.2;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      a.appendChild(ripple);
      setTimeout(function(){ ripple.style.transform = 'scale(1)'; ripple.style.opacity='0'; }, 10);
      setTimeout(function(){ if(ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 500);
    });
  });

  // keyboard navigation: allow Enter to activate link and show ripple
  document.querySelectorAll('#main-nav .nav-item').forEach(function(a){
    a.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault(); a.click();
      }
    });
  });

  // Map page actions: fullscreen and quick switch
  var btnFull = document.getElementById('btn-full');
  if(btnFull){
    btnFull.addEventListener('click', function(){
      var mapEl = document.getElementById('map');
      if(!document.fullscreenElement){
        if(mapEl.requestFullscreen) mapEl.requestFullscreen();
        else if(mapEl.webkitRequestFullscreen) mapEl.webkitRequestFullscreen();
        else if(mapEl.msRequestFullscreen) mapEl.msRequestFullscreen();
      } else {
        if(document.exitFullscreen) document.exitFullscreen();
        else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if(document.msExitFullscreen) document.msExitFullscreen();
      }
    });
  }

  // Hide header on scroll down (mobile) to free up screen real-estate
  (function(){
    var lastScroll = 0; var header = document.querySelector('.map-page header');
    if(!header) return;
    window.addEventListener('scroll', function(){
      if(window.innerWidth > 600) return; // only on small screens
      var st = window.scrollY || document.documentElement.scrollTop;
      if(Math.abs(st - lastScroll) < 8) return;
      if(st > lastScroll && st > 40){ // scrolling down
        header.classList.add('hidden');
      } else { // scrolling up
        header.classList.remove('hidden');
      }
      lastScroll = st <= 0 ? 0 : st;
    }, {passive:true});
  })();

  // Map search UI: send queries to iframe and render results
  (function(){
    var input = document.getElementById('map-search-input');
    var resultsEl = document.getElementById('map-search-results');
    var iframe = document.getElementById('import-map') || document.getElementById('import-map-kecamatan');
    if(!input || !resultsEl || !iframe) return;

    var debounce = function(fn, wait){ var t; return function(){ var args = arguments; clearTimeout(t); t = setTimeout(function(){ fn.apply(null, args); }, wait); }; };

    input.addEventListener('input', debounce(function(e){
      var q = input.value.trim();
      if(!q){ resultsEl.innerHTML = ''; resultsEl.style.display='none'; return; }
      // ask iframe for matches
      try{ iframe.contentWindow.postMessage({type:'search', query:q}, '*'); }catch(err){ console.warn('Cannot send search to iframe', err); }
    }, 260));

    // handle results from iframe
    window.addEventListener('message', function(e){ if(!e.data) return; if(e.data.type === 'search-results'){
      var r = e.data.results || [];
      resultsEl.innerHTML = '';
      if(r.length === 0){ resultsEl.style.display='none'; return; }

      // If only one exact-ish match, focus it immediately
      if(r.length === 1){
        var it = r[0];
        try{ iframe.contentWindow.postMessage({type:'focus', lat:it.lat, lng:it.lng, id:it.id || ''}, '*'); }catch(err){}
        resultsEl.innerHTML=''; resultsEl.style.display='none';
        return;
      }

      r.forEach(function(item, idx){
        var li = document.createElement('li');
        li.tabIndex = 0;
        li.setAttribute('role','option');
        li.dataset.lat = item.lat; li.dataset.lng = item.lng; li.dataset.id = item.id || '';
        li.innerHTML = '<div><strong>' + (item.name||'') + '</strong><div class="muted">' + (item.layer || '') + '</div></div>';
        li.addEventListener('click', function(){
          try{ iframe.contentWindow.postMessage({type:'focus', lat:parseFloat(this.dataset.lat), lng:parseFloat(this.dataset.lng), id:this.dataset.id}, '*'); }catch(err){}
          resultsEl.innerHTML=''; resultsEl.style.display='none';
        });
        li.addEventListener('keydown', function(ev){ if(ev.key === 'Enter'){ ev.preventDefault(); this.click(); }});
        resultsEl.appendChild(li);
      });
      resultsEl.style.display = 'block';
    } }, false);

    // keyboard: Escape closes results
    input.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){ resultsEl.innerHTML=''; resultsEl.style.display='none'; }
      if(e.key === 'Enter'){
        e.preventDefault();
        var first = resultsEl.querySelector('li');
        if(first){ first.click(); return; }
        // otherwise trigger a fresh search immediately
        try{ iframe.contentWindow.postMessage({type:'search', query:input.value.trim()}, '*'); }catch(err){}
      }
    });
  })();

});