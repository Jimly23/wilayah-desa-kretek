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
});