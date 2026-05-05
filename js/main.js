/* ============================
   MAIN.JS — Portfolio Interactions
   ============================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----- Mobile Nav Toggle ----- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
  });

  // Close menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
    });
  });

  /* ----- Dynamic Terminal Typing Effect ----- */
  const termCommand = document.getElementById('termCommand');
  const termOutput = document.getElementById('termOutput');
  
  if (termCommand && termOutput) {
    const commands = [
      { cmd: 'whoami', out: 'Rishav - Cybersecurity Student' },
      { cmd: 'pwd', out: '/home/rishav/cybersecurity' },
      { cmd: 'ls skills', out: 'Nmap  Burp Suite  Wireshark  Linux' },
      { cmd: 'cat about.txt', out: 'Passionate about cybersecurity, CTFs, and vulnerability analysis.' },
      { cmd: 'uname -a', out: 'Aspiring SOC Analyst | Ethical Hacking Enthusiast' }
    ];

    // Shuffle once on load
    commands.sort(() => Math.random() - 0.5);

    let currentCmdIndex = 0;
    
    const typeCommand = (text, output, callback) => {
      let charIndex = 0;
      termCommand.textContent = '';
      termOutput.textContent = '';
      
      const typeInterval = setInterval(() => {
        termCommand.textContent += text.charAt(charIndex);
        charIndex++;
        if (charIndex >= text.length) {
          clearInterval(typeInterval);
          setTimeout(() => {
            termOutput.textContent = output;
            if (callback) setTimeout(callback, 4000); // Wait 4 seconds before next
          }, 300); // slight delay before output appears
        }
      }, 60); // typing speed
    };

    const runTerminal = () => {
      const current = commands[currentCmdIndex];
      typeCommand(current.cmd, current.out, () => {
        currentCmdIndex = (currentCmdIndex + 1) % commands.length;
        runTerminal();
      });
    };

    // Start slightly after page load
    setTimeout(runTerminal, 1000);
  }

  /* ----- Navbar scroll effect ----- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Active nav link on scroll ----- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const updateActiveLink = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* ----- Scroll reveal ----- */
  const revealElements = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger the reveal slightly for cards in grids
        const delay = entry.target.dataset.revealDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Add staggered delays to grid children
  document.querySelectorAll('.skills-grid, .projects-grid, .certs-grid, .contact-grid').forEach(grid => {
    grid.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.dataset.revealDelay = i * 80;
    });
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ----- Stat counter animation ----- */
  const statNumbers = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = Math.max(1, Math.floor(target / 30));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = current;
        }, 40);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statObserver.observe(el));

  /* ----- Hero background particles (canvas) ----- */
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let animFrame;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.x -= dx * 0.01;
          this.y -= dy * 0.01;
          this.opacity = Math.min(0.8, this.opacity + 0.02);
        }

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${this.opacity})`;
        ctx.fill();
      }
    }

    const initParticles = () => {
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
      particles = Array.from({ length: count }, () => new Particle());
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.05 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      animFrame = requestAnimationFrame(animate);
    };

    // Only animate when hero is visible
    const heroObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animate();
      } else {
        cancelAnimationFrame(animFrame);
      }
    }, { threshold: 0 });

    canvas.parentElement.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    window.addEventListener('resize', () => { resize(); initParticles(); });
    resize();
    initParticles();
    heroObserver.observe(canvas.parentElement);
  }

  /* ----- Global background particles (#bgCanvas) ----- */
  const bgCanvas = document.getElementById('bgCanvas');
  if (bgCanvas) {
    const bgCtx = bgCanvas.getContext('2d');
    let bgParticles = [];
    let bgFrame;

    const bgResize = () => {
      bgCanvas.width  = window.innerWidth;
      bgCanvas.height = window.innerHeight;
    };

    class BgParticle {
      constructor() { this.init(); }
      init() {
        this.x  = Math.random() * bgCanvas.width;
        this.y  = Math.random() * bgCanvas.height;
        this.r  = Math.random() * 1.2 + 0.4;          // 0.4–1.6px
        this.vx = (Math.random() - 0.5) * 0.18;       // very slow
        this.vy = (Math.random() - 0.5) * 0.18;
        this.a  = Math.random() * 0.07 + 0.03;        // 0.03–0.10 opacity
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        // Wrap around edges
        if (this.x < -2) this.x = bgCanvas.width  + 2;
        if (this.x > bgCanvas.width  + 2) this.x = -2;
        if (this.y < -2) this.y = bgCanvas.height + 2;
        if (this.y > bgCanvas.height + 2) this.y = -2;
      }
      draw() {
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(0, 255, 136, ${this.a})`;
        bgCtx.fill();
      }
    }

    const bgInit = () => {
      // ~1 particle per 20k px² — capped at 60
      const count = Math.min(60, Math.floor((bgCanvas.width * bgCanvas.height) / 20000));
      bgParticles = Array.from({ length: count }, () => new BgParticle());
    };

    const bgAnimate = () => {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgParticles.forEach(p => { p.update(); p.draw(); });
      bgFrame = requestAnimationFrame(bgAnimate);
    };

    window.addEventListener('resize', () => { bgResize(); bgInit(); }, { passive: true });
    bgResize();
    bgInit();
    bgAnimate();

    // Pause when tab is hidden (battery / CPU saving)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(bgFrame);
      else bgAnimate();
    });
  }

  /* ----- 3D Project Orbit (solar system) ----- */
  const ring = document.getElementById('carouselRing');
  if (ring) {
    const cards = ring.querySelectorAll('.project-card');
    const n = cards.length;
    const angleStep = 360 / n;

    // Radius = distance from center; bigger = more spread
    const cardW = cards[0] ? cards[0].offsetWidth : 280;
    const radius = Math.round(cardW * 1.05);

    // Position each card around the ring
    cards.forEach((card, i) => {
      const angle = i * angleStep;
      card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
    });

    const wrapper = ring.closest('.carousel-wrapper');
    let currentAngle = 0;
    let targetAngle = 0;
    let autoRotateSpeed = 0.2;
    let isDragging = false;
    let startX = 0;
    let lastX = 0;
    let isHovered = false;

    // Hover state
    wrapper.addEventListener('mouseenter', () => isHovered = true);
    wrapper.addEventListener('mouseleave', () => {
      isHovered = false;
      isDragging = false;
    });

    // Mouse Drag
    wrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      lastX = e.clientX;
      wrapper.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastX;
      targetAngle += deltaX * 0.5;
      lastX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      wrapper.style.cursor = 'grab';
    });

    // Touch Swipe
    wrapper.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      lastX = e.touches[0].clientX;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const deltaX = e.touches[0].clientX - lastX;
      targetAngle += deltaX * 0.5;
      lastX = e.touches[0].clientX;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Animation Loop
    const updateRotation = () => {
      if (!isDragging && !isHovered) {
        targetAngle -= autoRotateSpeed; // Continuous spin
      }
      
      // Smoothly interpolate to target angle
      currentAngle += (targetAngle - currentAngle) * 0.1;
      ring.style.transform = `rotateY(${currentAngle}deg)`;
      
      requestAnimationFrame(updateRotation);
    };

    wrapper.style.cursor = 'grab';
    updateRotation();
  }

});
