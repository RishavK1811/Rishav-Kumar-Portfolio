/* ============================
   MAIN.JS — Portfolio Interactions (Optimized)
   ============================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Global perf helpers ---- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileViewport = () => window.innerWidth < 768;

  // Throttle helper using rAF (smoother than setTimeout)
  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          fn(...args);
          ticking = false;
        });
      }
    };
  };

  /* ----- Mobile Nav Toggle ----- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
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
  }

  /* ============================
     HERO HUD: System clock + uptime
     ============================ */
  const sysClock  = document.getElementById('sysClock');
  const sysUptime = document.getElementById('sysUptime');
  const heroSectionEl = document.getElementById('hero');
  if (sysClock || sysUptime) {
    const startTs = Date.now();
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const d = new Date();
      if (sysClock) sysClock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      if (sysUptime) {
        const sec = Math.floor((Date.now() - startTs) / 1000);
        sysUptime.textContent = `${pad(Math.floor(sec/60))}:${pad(sec%60)}`;
      }
    };
    tick();
    // Run only when hero is visible — saves CPU
    let clockInterval = setInterval(tick, 1000);
    if ('IntersectionObserver' in window && heroSectionEl) {
      const heroVisObs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          if (!clockInterval) clockInterval = setInterval(tick, 1000);
        } else {
          clearInterval(clockInterval);
          clockInterval = null;
        }
      }, { threshold: 0.05 });
      heroVisObs.observe(heroSectionEl);
    }
  }

  /* ============================
     HERO: Multi-Role Typewriter
     ============================ */
  const roleEl = document.getElementById('roleText');
  if (roleEl && !prefersReducedMotion) {
    const roles = [
      'Aspiring Cybersecurity Analyst',
      'Ethical Hacker in Training',
      'Network Security Enthusiast',
      'CTF Player & Bug Hunter',
      'SOC Analyst Aspirant'
    ];
    let rIdx = 0, cIdx = 0, deleting = false;
    const TYPE_SPEED = 70, DEL_SPEED = 35, HOLD = 1700;

    const typeRole = () => {
      const txt = roles[rIdx];
      if (!deleting) {
        roleEl.textContent = txt.slice(0, ++cIdx);
        if (cIdx === txt.length) {
          deleting = true;
          setTimeout(typeRole, HOLD);
          return;
        }
        setTimeout(typeRole, TYPE_SPEED);
      } else {
        roleEl.textContent = txt.slice(0, --cIdx);
        if (cIdx === 0) {
          deleting = false;
          rIdx = (rIdx + 1) % roles.length;
        }
        setTimeout(typeRole, DEL_SPEED);
      }
    };
    // Start after hero entrance animation finishes (~1.4s)
    setTimeout(typeRole, 1500);
  }

  /* ============================
     HERO: Random Glitch Flicker on H1 (subtle)
     ============================ */
  const glitchH1 = document.querySelector('.hero-content h1.glitch');
  if (glitchH1 && !prefersReducedMotion) {
    let glitchTimer;
    const scheduleGlitch = () => {
      const wait = 4000 + Math.random() * 6000; // 4–10s random
      glitchTimer = setTimeout(() => {
        glitchH1.classList.add('auto-flicker');
        setTimeout(() => glitchH1.classList.remove('auto-flicker'), 220);
        scheduleGlitch();
      }, wait);
    };
    // Pause flicker if hero out of view
    if ('IntersectionObserver' in window && heroSectionEl) {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) scheduleGlitch();
        else clearTimeout(glitchTimer);
      }, { threshold: 0.1 });
      obs.observe(heroSectionEl);
    } else {
      scheduleGlitch();
    }
  }

  /* ----- Dynamic Terminal Typing Effect (about section) ----- */
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

    commands.sort(() => Math.random() - 0.5);

    let currentCmdIndex = 0;
    let autoTypingActive = true;
    let typeInterval;
    let nextCmdTimeout;
    let resumeAutoTimeout;
    let isWaitingForNewCommand = false;

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

    hiddenInput.addEventListener('input', () => {
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

    setTimeout(runTerminal, 1000);
  }

  /* ----- Navbar scroll effect (rAF throttled) ----- */
  const navbar = document.getElementById('navbar');
  const onScroll = rafThrottle(() => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Active nav link on scroll (rAF throttled + cached offsets) ----- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  // Cache offsets and re-cache on resize for perf
  let sectionCache = [];
  const cacheSections = () => {
    sectionCache = Array.from(sections).map(s => ({
      id: s.id,
      top: s.offsetTop,
      height: s.offsetHeight
    }));
  };
  cacheSections();
  window.addEventListener('resize', rafThrottle(cacheSections), { passive: true });
  // Recache after fonts/images load
  window.addEventListener('load', cacheSections);

  const updateActiveLink = rafThrottle(() => {
    const scrollY = window.scrollY + 120;
    for (const sec of sectionCache) {
      if (scrollY >= sec.top && scrollY < sec.top + sec.height) {
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === '#' + sec.id;
          link.classList.toggle('active', isActive);
        });
        break;
      }
    }
  });
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* ----- Scroll reveal ----- */
  const revealElements = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.skills-grid, .projects-grid, .certs-grid, .contact-grid').forEach(grid => {
      grid.querySelectorAll('[data-reveal]').forEach((el, i) => {
        el.dataset.revealDelay = i * 80;
      });
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  /* ----- Stat counter animation ----- */
  const statNumbers = document.querySelectorAll('.stat-number');
  if ('IntersectionObserver' in window && statNumbers.length) {
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
  }

  /* ============================================================
     Hero Canvas — DUAL HACKER PARTICLE EFFECT + PC HACK CINEMATIC
     (Optimized: capped DPR, mobile-aware density, paused offscreen)
     ============================================================ */
  const canvas = document.getElementById('heroCanvas');
  const image  = document.getElementById('hackerImage');
  const heroSection = document.getElementById('hero');

  /* ===== Build Hack Cinematic Overlay ===== */
  let hackOverlay = null;
  if (heroSection) {
    hackOverlay = document.createElement('div');
    hackOverlay.className = 'hack-overlay';
    hackOverlay.innerHTML = `
      <div class="hack-scanline"></div>
      <div class="hack-vignette"></div>
      <div class="hack-noise"></div>
      <div class="hack-bars">
        <div class="hack-bar"></div>
        <div class="hack-bar"></div>
        <div class="hack-bar"></div>
        <div class="hack-bar"></div>
        <div class="hack-bar"></div>
      </div>
      <div class="hack-binary" id="hackBinary"></div>
      <div class="hack-terminal" id="hackTerminal">
        <div class="hack-term-header">
          <span class="hack-term-dot red"></span>
          <span class="hack-term-dot yellow"></span>
          <span class="hack-term-dot green"></span>
          <span class="hack-term-title">root@kali: ~/exploit</span>
        </div>
        <div class="hack-term-body" id="hackTermBody"></div>
      </div>
      <div class="hack-alert" id="hackAlert">
        <div class="hack-alert-icon">⚠</div>
        <div class="hack-alert-text">
          <div class="hack-alert-title" id="hackAlertTitle">SYSTEM BREACH DETECTED</div>
          <div class="hack-alert-sub" id="hackAlertSub">Unauthorized access in progress...</div>
        </div>
      </div>
      <div class="hack-radar" id="hackRadar">
        <div class="radar-grid"></div>
        <div class="radar-ring r1"></div>
        <div class="radar-ring r2"></div>
        <div class="radar-ring r3"></div>
        <div class="radar-cross-h"></div>
        <div class="radar-cross-v"></div>
        <div class="radar-sweep"></div>
        <div class="radar-blip b1"></div>
        <div class="radar-blip b2"></div>
        <div class="radar-blip b3"></div>
        <div class="radar-label tl">LAT 28.6139°N</div>
        <div class="radar-label tr">LON 77.2090°E</div>
        <div class="radar-label bl">TARGET: ACQUIRED</div>
        <div class="radar-label br">SIG: -42 dBm</div>
      </div>

      <div class="hack-progress" id="hackProgress">
        <div class="hp-row">
          <span class="hp-label">DECRYPTING AES-256</span>
          <div class="hp-bar"><div class="hp-fill p1"></div></div>
          <span class="hp-pct p1-pct">0%</span>
        </div>
        <div class="hp-row">
          <span class="hp-label">BYPASSING FIREWALL</span>
          <div class="hp-bar"><div class="hp-fill p2"></div></div>
          <span class="hp-pct p2-pct">0%</span>
        </div>
        <div class="hp-row">
          <span class="hp-label">EXTRACTING DATA</span>
          <div class="hp-bar"><div class="hp-fill p3"></div></div>
          <span class="hp-pct p3-pct">0%</span>
        </div>
      </div>

      <div class="hack-iptrace" id="hackIptrace">
        <div class="ipt-header">● REMOTE TRACE</div>
        <div class="ipt-line"><span class="ipt-k">IP:</span>     <span class="ipt-v" id="iptIp">192.168.1.1</span></div>
        <div class="ipt-line"><span class="ipt-k">MAC:</span>    <span class="ipt-v" id="iptMac">00:1A:2B:3C:4D:5E</span></div>
        <div class="ipt-line"><span class="ipt-k">OS:</span>     <span class="ipt-v">Windows 11 (x64)</span></div>
        <div class="ipt-line"><span class="ipt-k">PORTS:</span>  <span class="ipt-v">22, 80, 443, 3389</span></div>
        <div class="ipt-line"><span class="ipt-k">ISP:</span>    <span class="ipt-v">Unknown / Spoofed</span></div>
        <div class="ipt-line ipt-status"><span class="ipt-blink">●</span> CONNECTION ESTABLISHED</div>
      </div>

      <div class="hack-skull" id="hackSkull">
        <pre class="skull-art">    ___________
   /           \
  |   .-"""-.   |
  |  /  X X  \  |
  |  \   ^   /  |
  |   '.≡≡≡.'   |
   \___________/
    || || || ||</pre>
        <div class="skull-text">PWNED</div>
      </div>

      <div class="hack-flash" id="hackFlash"></div>
    `;
    heroSection.appendChild(hackOverlay);
  }

  if (canvas && image) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: true });

    // Cap DPR to 2 for perf — retina screens don't need 3x for particle blobs
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    // --- Load second image (hack.png) ---
    const image2 = new Image();
    image2.src = 'assets/hack.png';

    const images       = [image, image2];
    let   currentImgIdx = 0;
    let   particlesArray = [];
    let   animFrame;
    let   frameCount   = 0;

    const mouse        = { x: null, y: null, radius: 110 };

    let isGlitching    = false;
    let glitchFrames   = 0;
    let switchPending  = false;
    let isHeroVisible  = true;

    let autoGlitchTimer   = 0;
    let nextAutoGlitch    = 300;

    let autoSwitchTimer   = 0;
    const AUTO_SWITCH_INTERVAL = 900;

    const matrixChars = '01アイウエオカキクケコ><{}[]#$%&';
    let   rainDrops   = [];

    /* ---- resize (with DPR cap) ---- */
    const resize = () => {
      const w = canvas.parentElement.offsetWidth;
      const h = canvas.parentElement.offsetHeight;
      canvas.width  = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    // CSS pixel sizes for logic (independent of DPR)
    const cssW = () => canvas.width / DPR;
    const cssH = () => canvas.height / DPR;

    /* ======== PARTICLE CLASS ======== */
    class Particle {
      constructor(x, y, brightness) {
        this.baseX    = x;
        this.baseY    = y;
        this.x        = x;
        this.y        = y;
        this.density  = (Math.random() * 25) + 5;
        this.size     = Math.random() * 1.0 + (brightness / 255) * 0.8;
        this.brightness = brightness;
        const alpha   = 0.4 + (brightness / 255) * 0.6;
        this.baseAlpha = alpha;
        this.glowSize  = this.size * 2 + (brightness / 255) * 3;
        this.vx = 0; this.vy = 0;
        this.scattered = false;
      }

      draw() {
        const breathe = 0.82 + 0.18 * Math.sin(frameCount * 0.022 + this.baseX * 0.014);
        let   alpha   = this.baseAlpha * breathe;

        if (isGlitching && Math.random() < 0.12) {
          alpha = Math.min(1, alpha * 1.8);
        }

        ctx.shadowColor = 'rgba(0, 255, 80, 0.6)';
        ctx.shadowBlur  = this.glowSize * (isGlitching ? 2.5 : 1);
        ctx.fillStyle   = `rgba(0, 255, 80, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      update() {
        if (this.scattered) {
          this.x += this.vx;
          this.y += this.vy;
          this.vx *= 0.91;
          this.vy *= 0.91;
          this.x += (this.baseX - this.x) * 0.035;
          this.y += (this.baseY - this.y) * 0.035;
          if (Math.abs(this.x - this.baseX) < 1.5 && Math.abs(this.y - this.baseY) < 1.5) {
            this.scattered = false;
          }
          return;
        }

        if (isGlitching && Math.random() < 0.1) {
          this.x += (Math.random() - 0.5) * 10;
          this.y += (Math.random() - 0.5) * 5;
        }

        if (mouse.x !== null) {
          const dx   = mouse.x - this.x;
          const dy   = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * this.density;
            this.y -= (dy / dist) * force * this.density;
          }
        }

        this.x += (this.baseX - this.x) * 0.07;
        this.y += (this.baseY - this.y) * 0.07;
      }

      scatter() {
        this.scattered = true;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 14 + 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      }
    }

    /* ======== MATRIX RAIN (mobile-aware density) ======== */
    const initRain = () => {
      rainDrops = [];
      const colWidth = isMobileViewport() ? 18 : 14;
      const cols = Math.floor(cssW() / colWidth);
      for (let i = 0; i < cols; i++) {
        rainDrops.push({
          x: i * colWidth,
          y: Math.random() * -cssH(),
          speed: Math.random() * 1.1 + 0.3,
          char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
          alpha: Math.random() * 0.10 + 0.02,
          timer: 0,
          every: Math.floor(Math.random() * 25) + 10,
        });
      }
    };

    const drawRain = () => {
      ctx.font = '11px "JetBrains Mono", monospace';
      for (const d of rainDrops) {
        d.timer++;
        if (d.timer >= d.every) {
          d.char  = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          d.timer = 0;
        }
        const a = isGlitching ? Math.min(0.35, d.alpha * 4) : d.alpha;
        ctx.fillStyle = `rgba(0, 255, 80, ${a})`;
        ctx.fillText(d.char, d.x, d.y);
        d.y += d.speed * (isGlitching ? 3 : 1);
        if (d.y > cssH()) {
          d.y = Math.random() * -60;
        }
      }
    };

    /* ======== GLITCH OVERLAY ======== */
    const drawGlitchOverlay = () => {
      if (!isGlitching) return;

      ctx.fillStyle = 'rgba(0, 255, 80, 0.04)';
      for (let y = 0; y < cssH(); y += 3) {
        ctx.fillRect(0, y, cssW(), 1);
      }

      // Reduce expensive getImageData ops on mobile
      const splits = isMobileViewport() ? 2 : 4;
      for (let s = 0; s < splits; s++) {
        const y  = Math.random() * cssH();
        const h  = Math.random() * 8 + 2;
        const dx = (Math.random() - 0.5) * 40;
        try {
          const data = ctx.getImageData(0, y * DPR, canvas.width, h * DPR);
          ctx.putImageData(data, dx * DPR, y * DPR);
        } catch (e) {}
      }

      if (Math.random() < 0.3) {
        const msgs = ['> BYPASSING FIREWALL...', '> INJECTING PAYLOAD', '> ROOT ACCESS GRANTED', '> ENCRYPTING TRAFFIC...', '> SCANNING PORTS...'];
        ctx.font      = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(0, 255, 80, ${Math.random() * 0.6 + 0.2})`;
        ctx.fillText(msgs[Math.floor(Math.random() * msgs.length)],
          Math.random() * (cssW() * 0.4),
          Math.random() * cssH());
      }
    };

    /* ======== INIT PARTICLES ======== */
    const initParticles = (img) => {
      particlesArray = [];
      const w = cssW(), h = cssH();
      const isMobile    = w < 768;
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let imgWidth, imgHeight;

      if (isMobile) {
        imgWidth  = w * 0.55;
        imgHeight = imgWidth / aspectRatio;
        if (imgHeight > h * 0.6) {
          imgHeight = h * 0.6;
          imgWidth  = imgHeight * aspectRatio;
        }
      } else {
        imgHeight = h * 0.92;
        imgWidth  = imgHeight * aspectRatio;
        if (imgWidth > w * 0.45) {
          imgWidth  = w * 0.45;
          imgHeight = imgWidth / aspectRatio;
        }
      }

      const posX = isMobile ? w - imgWidth : w - imgWidth - 40;
      const posY = isMobile ? h - imgHeight + 20 : (h - imgHeight) / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, posX, posY, imgWidth, imgHeight);
      // Read image data in DEVICE pixels
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, w, h);

      // Larger gap on mobile for fewer particles → smoother
      const gap = isMobile ? 8 : 6;
      const stride = canvas.width;
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const px = Math.floor(x * DPR);
          const py = Math.floor(y * DPR);
          const idx = (py * stride + px) * 4;
          const r = pixels.data[idx];
          const g = pixels.data[idx + 1];
          const b = pixels.data[idx + 2];
          const alpha = pixels.data[idx + 3];
          const brightness = (r + g + b) / 3;
          if (alpha > 60 && brightness > 50) {
            particlesArray.push(new Particle(x, y, Math.max(g, brightness)));
          }
        }
      }
    };

    /* ======== HACK CINEMATIC SEQUENCES ======== */
    const HACK_SEQUENCES = [
      [
        { t: 0,    cmd: '$ nmap -sS -A 192.168.1.1', cls: 'cmd' },
        { t: 180,  cmd: '> Scanning target...', cls: 'info' },
        { t: 380,  cmd: '> Port 22 OPEN  | SSH', cls: 'ok' },
        { t: 520,  cmd: '> Port 80 OPEN  | HTTP', cls: 'ok' },
        { t: 660,  cmd: '> Port 443 OPEN | HTTPS', cls: 'ok' },
        { t: 850,  cmd: '$ exploit/multi/handler', cls: 'cmd' },
        { t: 1050, cmd: '> [+] Reverse shell opened', cls: 'success' },
        { t: 1250, cmd: '> [+] Privilege escalation...', cls: 'warn' },
        { t: 1450, cmd: '> ROOT ACCESS GRANTED', cls: 'success big' },
      ],
      [
        { t: 0,    cmd: '$ ssh root@target.sys', cls: 'cmd' },
        { t: 200,  cmd: '> Bypassing firewall...', cls: 'warn' },
        { t: 420,  cmd: '> Cracking SHA-256: ████████░░', cls: 'info' },
        { t: 640,  cmd: '> Hash cracked: 0xDEADBEEF', cls: 'ok' },
        { t: 850,  cmd: '$ inject payload.exe', cls: 'cmd' },
        { t: 1050, cmd: '> [+] Payload deployed', cls: 'success' },
        { t: 1250, cmd: '> [+] Encrypting channel AES-256', cls: 'ok' },
        { t: 1450, cmd: '> SYSTEM COMPROMISED', cls: 'success big' },
      ],
      [
        { t: 0,    cmd: '$ msfconsole', cls: 'cmd' },
        { t: 180,  cmd: '> Loading exploit modules...', cls: 'info' },
        { t: 380,  cmd: '> CVE-2024-XXXX detected', cls: 'warn' },
        { t: 580,  cmd: '$ set RHOSTS 10.0.0.1', cls: 'cmd' },
        { t: 750,  cmd: '$ run', cls: 'cmd' },
        { t: 950,  cmd: '> [*] Sending stage (200kb)', cls: 'info' },
        { t: 1150, cmd: '> [+] Meterpreter session 1 opened', cls: 'success' },
        { t: 1350, cmd: '> [+] Disabling Windows Defender', cls: 'warn' },
        { t: 1500, cmd: '> ACCESS GRANTED', cls: 'success big' },
      ],
    ];

    const ALERT_TITLES = [
      { title: 'SYSTEM BREACH DETECTED', sub: 'Unauthorized access in progress...' },
      { title: 'FIREWALL BYPASSED',      sub: 'Encrypted tunnel established' },
      { title: 'ROOT ACCESS GRANTED',    sub: 'Full system control acquired' },
      { title: 'PAYLOAD INJECTED',       sub: 'Remote shell active on target' },
    ];

    let hackTimeouts = [];
    const clearHackTimers = () => {
      hackTimeouts.forEach(t => {
        if (typeof t === 'number') clearTimeout(t);
        else if (t && typeof t.clear === 'function') t.clear();
      });
      hackTimeouts = [];
    };

    const runHackCinematic = () => {
      if (!hackOverlay || !isHeroVisible) return;

      clearHackTimers();
      hackOverlay.classList.add('active');

      const flash = document.getElementById('hackFlash');
      if (flash) {
        flash.classList.remove('fire');
        void flash.offsetWidth;
        flash.classList.add('fire');
      }

      const alertEl   = document.getElementById('hackAlert');
      const alertT    = document.getElementById('hackAlertTitle');
      const alertS    = document.getElementById('hackAlertSub');
      const pick      = ALERT_TITLES[Math.floor(Math.random() * ALERT_TITLES.length)];
      if (alertT) alertT.textContent = pick.title;
      if (alertS) alertS.textContent = pick.sub;
      if (alertEl) {
        alertEl.classList.remove('show');
        void alertEl.offsetWidth;
        alertEl.classList.add('show');
      }

      const radar = document.getElementById('hackRadar');
      if (radar) {
        radar.classList.remove('active');
        void radar.offsetWidth;
        radar.classList.add('active');
      }

      const prog = document.getElementById('hackProgress');
      if (prog) {
        prog.classList.remove('show');
        void prog.offsetWidth;
        prog.classList.add('show');
        const pcts = ['p1-pct', 'p2-pct', 'p3-pct'];
        const finals = [97, 84, 100];
        const delays = [0, 250, 500];
        pcts.forEach((cls, idx) => {
          const el = prog.querySelector('.' + cls);
          if (!el) return;
          el.textContent = '0%';
          let cur = 0;
          const target = finals[idx];
          const stepId = setTimeout(() => {
            const interval = setInterval(() => {
              cur += Math.max(2, Math.floor((target - cur) / 4));
              if (cur >= target) { cur = target; clearInterval(interval); }
              el.textContent = cur + '%';
            }, 35);
            hackTimeouts.push({ clear: () => clearInterval(interval) });
          }, delays[idx]);
          hackTimeouts.push(stepId);
        });
      }

      const iptIp  = document.getElementById('iptIp');
      const iptMac = document.getElementById('iptMac');
      const iptrace = document.getElementById('hackIptrace');
      if (iptIp)  iptIp.textContent  = `${10+Math.floor(Math.random()*240)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
      if (iptMac) {
        const hex = '0123456789ABCDEF';
        let m = '';
        for (let i = 0; i < 6; i++) {
          m += hex[Math.floor(Math.random()*16)] + hex[Math.floor(Math.random()*16)];
          if (i < 5) m += ':';
        }
        iptMac.textContent = m;
      }
      if (iptrace) {
        iptrace.classList.remove('show');
        void iptrace.offsetWidth;
        iptrace.classList.add('show');
      }

      const skull = document.getElementById('hackSkull');
      if (skull && Math.random() < 0.5) {
        skull.classList.remove('show');
        void skull.offsetWidth;
        const skullId = setTimeout(() => skull.classList.add('show'), 1100);
        hackTimeouts.push(skullId);
      }

      const bin = document.getElementById('hackBinary');
      if (bin) {
        bin.innerHTML = '';
        // Reduce columns on mobile for perf
        const maxCols = isMobileViewport() ? 14 : 28;
        const cols = Math.min(maxCols, Math.floor(window.innerWidth / 60));
        for (let i = 0; i < cols; i++) {
          const col = document.createElement('span');
          col.className = 'hack-bin-col';
          col.style.left = (i / cols * 100) + '%';
          col.style.animationDelay = (Math.random() * 0.4) + 's';
          col.style.animationDuration = (0.8 + Math.random() * 0.7) + 's';
          let txt = '';
          for (let j = 0; j < 22; j++) {
            txt += (Math.random() > 0.5 ? '1' : '0') + '\n';
          }
          col.textContent = txt;
          bin.appendChild(col);
        }
      }

      const termBody = document.getElementById('hackTermBody');
      const seq = HACK_SEQUENCES[Math.floor(Math.random() * HACK_SEQUENCES.length)];
      if (termBody) {
        termBody.innerHTML = '';
        seq.forEach(line => {
          const id = setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'hack-term-line ' + (line.cls || '');
            el.textContent = line.cmd;
            termBody.appendChild(el);
            termBody.scrollTop = termBody.scrollHeight;
          }, line.t);
          hackTimeouts.push(id);
        });
      }

      const hideId = setTimeout(() => {
        if (hackOverlay) hackOverlay.classList.remove('active');
        if (alertEl)     alertEl.classList.remove('show');
        if (radar)       radar.classList.remove('active');
        if (prog)        prog.classList.remove('show');
        if (iptrace)     iptrace.classList.remove('show');
        if (skull)       skull.classList.remove('show');
      }, 2200);
      hackTimeouts.push(hideId);
    };

    /* ======== TRIGGER GLITCH ======== */
    const triggerSwitch = () => {
      if (isGlitching) return;
      if (!isHeroVisible) return;
      isGlitching   = true;
      glitchFrames  = 0;
      switchPending = true;
      autoSwitchTimer = 0;
      runHackCinematic();
    };

    /* ======== MAIN ANIMATE LOOP ======== */
    const animate = () => {
      frameCount++;
      ctx.clearRect(0, 0, cssW(), cssH());

      drawRain();

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
      }

      drawGlitchOverlay();

      if (isGlitching) {
        glitchFrames++;
        if (switchPending && glitchFrames === 20) {
          for (let i = 0; i < particlesArray.length; i++) particlesArray[i].scatter();
        }
        if (switchPending && glitchFrames === 50) {
          currentImgIdx  = currentImgIdx === 0 ? 1 : 0;
          initParticles(images[currentImgIdx]);
        }
        const glitchLen = switchPending ? 110 : 40;
        if (glitchFrames > glitchLen) {
          isGlitching = false;
          glitchFrames = 0;
          switchPending = false;
        }
      }

      autoSwitchTimer++;
      if (autoSwitchTimer >= AUTO_SWITCH_INTERVAL) {
        triggerSwitch();
      }

      autoGlitchTimer++;
      if (!isGlitching && autoGlitchTimer >= nextAutoGlitch) {
        isGlitching     = true;
        glitchFrames    = 0;
        switchPending   = false;
        autoGlitchTimer = 0;
        nextAutoGlitch  = Math.floor(Math.random() * 420) + 300;
        setTimeout(() => {
          if (!switchPending) { isGlitching = false; glitchFrames = 0; }
        }, 350);
      }

      animFrame = requestAnimationFrame(animate);
    };

    /* ======== SETUP ======== */
    const setupCanvas = () => {
      resize();
      initParticles(images[currentImgIdx]);
      initRain();
      if (!animFrame) animate();
    };

    const waitForBothImages = () => {
      let loaded = 0;
      const onLoad = () => { loaded++; if (loaded === 2) setupCanvas(); };
      const onErr  = () => { loaded++; if (loaded === 2) setupCanvas(); }; // fallback if image missing
      if (image.complete  && image.naturalWidth  > 0) onLoad();
      else { image.addEventListener('load', onLoad); image.addEventListener('error', onErr); }
      if (image2.complete && image2.naturalWidth > 0) onLoad();
      else { image2.addEventListener('load', onLoad); image2.addEventListener('error', onErr); }
    };
    waitForBothImages();

    // Pause when out of view
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(entries => {
        const visible = entries[0].isIntersecting;
        isHeroVisible = visible;
        if (visible) {
          if (!animFrame) animate();
        } else {
          cancelAnimationFrame(animFrame);
          animFrame = null;
          if (hackOverlay) hackOverlay.classList.remove('active');
          clearHackTimers();
          autoSwitchTimer = 0;
        }
      }, { threshold: 0.15 });
      heroObserver.observe(heroSection || canvas.parentElement);
    }

    // Pause on tab hidden — saves battery on mobile
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrame);
        animFrame = null;
      } else if (isHeroVisible && !animFrame) {
        animate();
      }
    });

    // Mouse / Touch
    canvas.parentElement.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = null; mouse.y = null;
    });

    canvas.parentElement.addEventListener('click', () => {
      triggerSwitch();
    });

    canvas.parentElement.addEventListener('touchmove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: true });
    canvas.parentElement.addEventListener('touchend', () => {
      mouse.x = null; mouse.y = null;
    });

    // Rebuild on resize (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(animFrame);
        animFrame = null;
        setupCanvas();
      }, 220);
    });
  }

  /* ----- Global background particles (#bgCanvas) — optimized ----- */
  const bgCanvas = document.getElementById('bgCanvas');
  if (bgCanvas) {
    const bgCtx = bgCanvas.getContext('2d', { alpha: true });
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
        this.r  = Math.random() * 1.2 + 0.4;
        this.vx = (Math.random() - 0.5) * 0.18;
        this.vy = (Math.random() - 0.5) * 0.18;
        this.a  = Math.random() * 0.07 + 0.03;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
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
      // Mobile: fewer particles for perf | Desktop: capped at 60
      const maxCap = isMobileViewport() ? 25 : 60;
      const count = Math.min(maxCap, Math.floor((bgCanvas.width * bgCanvas.height) / 22000));
      bgParticles = Array.from({ length: count }, () => new BgParticle());
    };

    const bgAnimate = () => {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      for (let i = 0; i < bgParticles.length; i++) {
        bgParticles[i].update();
        bgParticles[i].draw();
      }
      bgFrame = requestAnimationFrame(bgAnimate);
    };

    let bgResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(bgResizeTimer);
      bgResizeTimer = setTimeout(() => { bgResize(); bgInit(); }, 200);
    }, { passive: true });

    bgResize();
    bgInit();
    if (!prefersReducedMotion) bgAnimate();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(bgFrame);
        bgFrame = null;
      } else if (!bgFrame && !prefersReducedMotion) {
        bgAnimate();
      }
    });
  }

  /* ============================================================
     PROJECTS SECTION — NETWORK TOPOLOGY SCANNER
     ============================================================ */
  const netCanvas = document.getElementById('networkCanvas');
  const projSection = document.getElementById('projects');

  if (netCanvas && projSection) {
    const ctx = netCanvas.getContext('2d', { alpha: true });
    
    let nodes = [];
    let packets = [];
    let scanLineY = 0;
    let netFrame;
    let isNetVisible = false;

    const resizeNetwork = () => {
      const parent = netCanvas.parentElement;
      netCanvas.width = parent.clientWidth;
      netCanvas.height = parent.clientHeight;
      initNetwork();
    };

    // Initialize random nodes (servers/targets)
    const initNetwork = () => {
      nodes = [];
      packets = [];
      scanLineY = 0;
      
      const numNodes = window.innerWidth < 768 ? 40 : 80;
      
      for (let i = 0; i < numNodes; i++) {
        nodes.push({
          x: Math.random() * netCanvas.width,
          y: Math.random() * netCanvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
          glow: 0, // Glow level when scanned or active
          connections: []
        });
      }

      // Establish connections between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120 && nodes[i].connections.length < 4) {
            nodes[i].connections.push(nodes[j]);
            nodes[j].connections.push(nodes[i]);
          }
        }
      }

      const countEl = document.getElementById('nodeCount');
      if (countEl) countEl.textContent = nodes.length;
    };

    // Class for data packets moving along lines
    class DataPacket {
      constructor(startNode, endNode) {
        this.start = startNode;
        this.end = endNode;
        this.progress = 0;
        this.speed = 0.01 + Math.random() * 0.02;
        this.active = true;
      }
      update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
          this.active = false;
          this.end.glow = 1; // Destination lights up upon packet arrival
        }
      }
      draw() {
        if (!this.active) return;
        const currentX = this.start.x + (this.end.x - this.start.x) * this.progress;
        const currentY = this.start.y + (this.end.y - this.start.y) * this.progress;
        
        ctx.beginPath();
        ctx.arc(currentX, currentY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff88';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    const animateNetwork = () => {
      if (!isNetVisible) return;
      
      ctx.clearRect(0, 0, netCanvas.width, netCanvas.height);
      
      // Update nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x <= 0 || node.x >= netCanvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= netCanvas.height) node.vy *= -1;

        // Decay glow
        if (node.glow > 0) node.glow -= 0.02;
        if (node.glow < 0) node.glow = 0;
      });

      // Draw Connection Lines
      ctx.lineWidth = 0.5;
      nodes.forEach(node => {
        node.connections.forEach(target => {
          const dx = node.x - target.x;
          const dy = node.y - target.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            // Line becomes brighter if either connected node is glowing
            const lineAlpha = 0.05 + (node.glow + target.glow) * 0.2;
            ctx.strokeStyle = `rgba(0, 255, 136, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        });
      });

      // Spawn Data Packets randomly
      if (Math.random() < 0.08) {
        const startNode = nodes[Math.floor(Math.random() * nodes.length)];
        if (startNode.connections.length > 0) {
          const endNode = startNode.connections[Math.floor(Math.random() * startNode.connections.length)];
          packets.push(new DataPacket(startNode, endNode));
        }
      }

      // Draw Packets
      for (let i = packets.length - 1; i >= 0; i--) {
        packets[i].update();
        packets[i].draw();
        if (!packets[i].active) packets.splice(i, 1);
      }

      // Draw Nodes
      nodes.forEach(node => {
        ctx.beginPath();
        const currentRadius = node.radius + node.glow * 2;
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        
        if (node.glow > 0) {
          ctx.fillStyle = `rgba(0, 255, 136, ${0.4 + node.glow * 0.6})`;
          ctx.shadowBlur = 15 * node.glow;
          ctx.shadowColor = '#00ff88';
        } else {
          ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
          ctx.shadowBlur = 0;
        }
        ctx.fill();

        // Draw tactical square around glowing nodes
        if (node.glow > 0.5) {
          ctx.strokeStyle = `rgba(0, 255, 136, ${node.glow})`;
          ctx.lineWidth = 1;
          const s = currentRadius + 4;
          ctx.strokeRect(node.x - s, node.y - s, s * 2, s * 2);
        }
      });

      // Update and Draw Horizontal Radar Scanline
      scanLineY += 2;
      if (scanLineY > netCanvas.height + 100) scanLineY = -50; // loop back

      // Light up nodes hit by the scanline
      nodes.forEach(node => {
        if (Math.abs(node.y - scanLineY) < 5) {
          node.glow = 1.0;
        }
      });

      // Draw scanline glow
      const scanGrad = ctx.createLinearGradient(0, scanLineY - 20, 0, scanLineY);
      scanGrad.addColorStop(0, 'rgba(0, 255, 136, 0)');
      scanGrad.addColorStop(1, 'rgba(0, 255, 136, 0.4)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanLineY - 20, netCanvas.width, 20);

      ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanLineY);
      ctx.lineTo(netCanvas.width, scanLineY);
      ctx.stroke();

      netFrame = requestAnimationFrame(animateNetwork);
    };

    // Setup and Listeners
    resizeNetwork();

    let netResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(netResizeTimer);
      netResizeTimer = setTimeout(() => {
        if (isNetVisible) resizeNetwork();
      }, 250);
    });

    if ('IntersectionObserver' in window) {
      const netObserver = new IntersectionObserver(([entry]) => {
        isNetVisible = entry.isIntersecting;
        if (isNetVisible) {
          if (!netFrame) animateNetwork();
        } else {
          cancelAnimationFrame(netFrame);
          netFrame = null;
        }
      }, { threshold: 0.1 });
      netObserver.observe(projSection);
    }
  }
});
