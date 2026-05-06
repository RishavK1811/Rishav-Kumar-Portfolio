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
  const aboutTerminal = document.getElementById('aboutTerminal');
  
  if (termCommand && termOutput && aboutTerminal) {
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
    let autoTypingActive = true;
    let typeInterval;
    let nextCmdTimeout;
    let resumeAutoTimeout;
    let isWaitingForNewCommand = false;

    // Create a hidden input to capture keystrokes
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'text';
    hiddenInput.style.position = 'absolute';
    hiddenInput.style.opacity = '0';
    hiddenInput.style.left = '-9999px';
    hiddenInput.setAttribute('autocomplete', 'off');
    hiddenInput.setAttribute('autocorrect', 'off');
    hiddenInput.setAttribute('autocapitalize', 'off');
    hiddenInput.setAttribute('spellcheck', 'false');
    aboutTerminal.appendChild(hiddenInput);

    aboutTerminal.style.cursor = 'text';
    aboutTerminal.addEventListener('click', () => {
      hiddenInput.focus();
    });

    const clearAutoTyping = () => {
      if (autoTypingActive) {
        autoTypingActive = false;
        clearInterval(typeInterval);
        clearTimeout(nextCmdTimeout);
      }
    };

    const resumeAutoTyping = () => {
      autoTypingActive = true;
      hiddenInput.value = '';
      isWaitingForNewCommand = false;
      currentCmdIndex = (currentCmdIndex + 1) % commands.length;
      runTerminal();
    };

    const resetUserIdle = () => {
      clearTimeout(resumeAutoTimeout);
      resumeAutoTimeout = setTimeout(() => {
        resumeAutoTyping();
      }, 10000);
    };

    hiddenInput.addEventListener('keydown', (e) => {
      if (autoTypingActive) {
        clearAutoTyping();
        termCommand.textContent = '';
        termOutput.textContent = '';
        hiddenInput.value = '';
      }
      resetUserIdle();
      
      if (isWaitingForNewCommand && e.key !== 'Enter') {
        termCommand.textContent = '';
        termOutput.textContent = '';
        isWaitingForNewCommand = false;
      }

      if (e.key === 'Enter') {
        const val = hiddenInput.value.trim();
        if (val) {
          const found = commands.find(c => c.cmd.toLowerCase() === val.toLowerCase());
          if (found) {
            termOutput.textContent = found.out;
          } else if (val.toLowerCase() === 'clear') {
            termCommand.textContent = '';
            termOutput.textContent = '';
          } else if (val.toLowerCase() === 'help') {
            termOutput.textContent = 'Available commands: ' + commands.map(c => c.cmd).join(', ') + ', clear, help';
          } else {
            termOutput.textContent = `bash: ${val}: command not found`;
          }
        } else {
          termCommand.textContent = '';
          termOutput.textContent = '';
        }
        
        hiddenInput.value = '';
        isWaitingForNewCommand = true;
      }
    });

    hiddenInput.addEventListener('input', (e) => {
      if (autoTypingActive) {
        clearAutoTyping();
        termCommand.textContent = '';
        termOutput.textContent = '';
      }
      resetUserIdle();
      
      if (isWaitingForNewCommand) {
        termOutput.textContent = '';
        isWaitingForNewCommand = false;
      }
      
      termCommand.textContent = hiddenInput.value;
    });

    const typeCommand = (text, output, callback) => {
      if (!autoTypingActive) return;
      let charIndex = 0;
      termCommand.textContent = '';
      termOutput.textContent = '';
      isWaitingForNewCommand = false;
      
      typeInterval = setInterval(() => {
        if (!autoTypingActive) {
          clearInterval(typeInterval);
          return;
        }
        termCommand.textContent += text.charAt(charIndex);
        charIndex++;
        if (charIndex >= text.length) {
          clearInterval(typeInterval);
          nextCmdTimeout = setTimeout(() => {
            if (!autoTypingActive) return;
            termOutput.textContent = output;
            if (callback) {
              nextCmdTimeout = setTimeout(() => {
                if (!autoTypingActive) return;
                callback();
              }, 4000);
            }
          }, 300);
        }
      }, 60);
    };

    const runTerminal = () => {
      if (!autoTypingActive) return;
      const current = commands[currentCmdIndex];
      typeCommand(current.cmd, current.out, () => {
        if (!autoTypingActive) return;
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

  /* ----- Hero Canvas - GREEN PARTICLE HACKER EFFECT ----- */
  const canvas = document.getElementById('heroCanvas');
  const image = document.getElementById('hackerImage');

  if (canvas && image) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let particlesArray = [];
    let animFrame;

    let mouse = { x: null, y: null, radius: 100 };

    const resize = () => {
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    class Particle {
      constructor(x, y, brightness) {
        this.baseX   = x;
        this.baseY   = y;
        // Start directly at base position — no assembly animation
        this.x       = x;
        this.y       = y;
        this.density = (Math.random() * 25) + 5;
        // Size based on brightness — making dots slightly smaller for a cleaner look
        this.size    = Math.random() * 1.0 + (brightness / 255) * 0.8;
        // Keep the neon-green palette, vary opacity slightly for depth
        const alpha  = 0.4 + (brightness / 255) * 0.6;
        this.color   = `rgba(0, 255, 100, ${alpha.toFixed(2)})`;
        // Glow intensity based on brightness
        this.glowSize = this.size * 2 + (brightness / 255) * 3;
        this.glowAlpha = alpha * 0.35;
      }
      draw() {
        // Outer glow
        ctx.shadowColor = 'rgba(0, 255, 100, 0.6)';
        ctx.shadowBlur = this.glowSize;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      update() {
        // Mouse repulsion
        if (mouse.x !== null) {
          const dx   = mouse.x - this.x;
          const dy   = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const fx    = (dx / dist) * force * this.density;
            const fy    = (dy / dist) * force * this.density;
            this.x -= fx;
            this.y -= fy;
          }
        }
        // Ease back to base position
        this.x += (this.baseX - this.x) * 0.07;
        this.y += (this.baseY - this.y) * 0.07;
      }
    }

    const initParticles = () => {
      particlesArray = [];

      // Image sizing: fit height to canvas, position right-side on desktop
      const isMobile  = canvas.width < 768;
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      
      let imgHeight, imgWidth;

      if (isMobile) {
        // Constrain width so it stays strictly on the right side, just like desktop
        imgWidth = canvas.width * 0.55;
        imgHeight = imgWidth / aspectRatio;
        
        // Also constrain height if the screen is very short
        if (imgHeight > canvas.height * 0.6) {
          imgHeight = canvas.height * 0.6;
          imgWidth = imgHeight * aspectRatio;
        }
      } else {
        imgHeight = canvas.height * 0.92;
        imgWidth = imgHeight * aspectRatio;
        
        // Constrain width on portrait/square desktop screens or tablet
        if (imgWidth > canvas.width * 0.45) {
          imgWidth = canvas.width * 0.45;
          imgHeight = imgWidth / aspectRatio;
        }
      }

      // Position on the right side for both
      const posX = isMobile
        ? canvas.width - imgWidth // Right aligned on mobile
        : canvas.width - imgWidth - 40; // Right aligned with padding on desktop

      const posY = isMobile
        ? canvas.height - imgHeight + 20 // Bottom aligned on mobile
        : (canvas.height - imgHeight) / 2; // Center aligned vertically on desktop

      // Draw image to canvas to sample pixels
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, posX, posY, imgWidth, imgHeight);

      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // gap=7 → very high gap for minimalist, clean dot-art effect
      const gap = isMobile ? 7 : 6;

      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const idx   = (y * canvas.width + x) * 4;
          const r     = pixels.data[idx];
          const g     = pixels.data[idx + 1];
          const b     = pixels.data[idx + 2];
          const alpha = pixels.data[idx + 3];

          // Image is green on pure black — any non-black pixel is part of the figure
          const brightness = (r + g + b) / 3;
          // Increased thresholds to show only the most prominent/brightest dots
          if (alpha > 60 && brightness > 50) {
            particlesArray.push(new Particle(x, y, Math.max(g, brightness)));
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
      }
      animFrame = requestAnimationFrame(animate);
    };

    const setupCanvas = () => {
      resize();
      initParticles();
      if (!animFrame) animate();
    };

    // Wait for image to load
    if (image.complete && image.naturalWidth > 0) {
      setupCanvas();
    } else {
      image.addEventListener('load', setupCanvas);
    }

    // Pause when hero is out of view (CPU saving)
    const heroObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!animFrame) animate();
      } else {
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }
    }, { threshold: 0 });
    heroObserver.observe(canvas.parentElement);

    // Mouse interaction
    canvas.parentElement.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Touch interaction
    canvas.parentElement.addEventListener('touchmove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: true });
    canvas.parentElement.addEventListener('touchend', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Rebuild on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(animFrame);
        animFrame = null;
        setupCanvas();
      }, 200);
    });
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
