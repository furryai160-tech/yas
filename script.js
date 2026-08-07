function init() {
  const loader = document.getElementById('loader');
  const loaderProgress = document.getElementById('loader-progress');
  const enterBtn = document.getElementById('enter-btn');
  const loaderBar = document.querySelector('.loader-fill');

  if (!loader) return;

  let p = 0;
  const interval = setInterval(() => {
    p += Math.random() * 15;
    if(p >= 100) {
      p = 100;
      clearInterval(interval);
      if(loaderProgress) loaderProgress.innerText = "THE TEAM IS READY.";
      if(enterBtn) enterBtn.style.display = "block";
      if(loaderBar) loaderBar.style.width = "100%";
    } else {
      if(loaderProgress) loaderProgress.innerText = `0${Math.floor(p/20) + 1} / 05`;
      if(loaderBar) loaderBar.style.width = `${p}%`;
    }
  }, 100);

  if(enterBtn) {
    enterBtn.addEventListener('click', () => {
      gsap.to(loader, { opacity: 0, duration: 1, onComplete: () => loader.remove() });
      initExperience();
    });
  }
}

if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}

function initExperience() {
  // Smooth Scroll Initialization
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // GSAP Camera Z-Depth Animation
  const totalZDepth = 30000;
  gsap.to('#camera', {
    z: totalZDepth,
    ease: 'none',
    scrollTrigger: {
      trigger: '.scroll-proxy',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5
    }
  });

  // Parallax / Mouse interaction
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 15;
    const y = (e.clientY / window.innerHeight - 0.5) * 15;
    gsap.to('#world', {
      rotateX: -y,
      rotateY: x,
      duration: 1,
      ease: 'power2.out'
    });
  });

  // Z-Depth rendering loop
  const layers = document.querySelectorAll('.layer');
  function renderZDepth() {
    const cameraZ = gsap.getProperty('#camera', 'z') || 0;
    
    layers.forEach(layer => {
      const z = parseFloat(layer.getAttribute('data-z'));
      const distance = -(cameraZ + z); 
      
      // Calculate opacity based on distance to camera
      if (distance < -1000 || distance > 6000) {
        layer.style.opacity = 0;
        layer.style.pointerEvents = 'none';
      } else {
        layer.style.pointerEvents = 'auto';
        let opacity = 1;
        
        // Fade in from distance
        if (distance > 4000) {
          opacity = 1 - ((distance - 4000) / 2000);
        }
        
        // Fade out as it passes through camera
        if (distance < 500 && distance > 0) {
          opacity = distance / 500;
        }
        
        // Fade out completely when behind
        if (distance <= 0) {
          opacity = Math.max(0, (1000 + distance) / 1000);
        }
        
        layer.style.opacity = Math.max(0, opacity);
      }
    });
    requestAnimationFrame(renderZDepth);
  }
  requestAnimationFrame(renderZDepth);

  // Background Particles (Moving Network Effect)
  const canvas = document.getElementById('particles-bg');
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const particles = [];
  for (let i = 0; i < 200; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 2000,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    });
  }

  function renderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    
    const camZ = gsap.getProperty('#camera', 'z') || 0;
    
    particles.forEach(p => {
      // Loop particles in Z space
      let relZ = p.z - (camZ % 2000); 
      if (relZ < 0) relZ += 2000;
      
      // Perspective projection
      const scale = 800 / (800 + relZ);
      const projX = (p.x - canvas.width/2) * scale + canvas.width/2;
      const projY = (p.y - canvas.height/2) * scale + canvas.height/2;
      
      // Idle movement
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap screen boundaries
      if(p.x < 0) p.x = canvas.width;
      if(p.x > canvas.width) p.x = 0;
      if(p.y < 0) p.y = canvas.height;
      if(p.y > canvas.height) p.y = 0;

      // Draw particle
      const size = Math.max(0.1, 2 * scale * (1 - relZ/2000));
      ctx.beginPath();
      ctx.arc(projX, projY, size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    requestAnimationFrame(renderParticles);
  }
  requestAnimationFrame(renderParticles);
}
