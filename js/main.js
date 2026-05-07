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

  /* ============================================================
     Hero Canvas — DUAL HACKER PARTICLE EFFECT + PC HACK CINEMATIC
     - 2 images: hacker.png (standing) + hack.png (with laptop)
     - Auto-switches every 10 sec with FULL HACK ANIMATION
     - Click also triggers switch
     - Section-locked: hack overlay ONLY visible inside hero
     - Mouse repulsion stays PURE GREEN
     - Matrix rain in background
     ============================================================ */
  const canvas = document.getElementById('heroCanvas');
  const image  = document.getElementById('hackerImage'); // hacker.png (already in HTML)
  const heroSection = document.getElementById('hero');

  /* ===== Build Hack Cinematic Overlay (lives INSIDE .hero only) ===== */
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
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // --- Load second image (hack.png) ---
    const image2 = new Image();
    image2.src = 'assets/hack.png';

    const images       = [image, image2];
    let   currentImgIdx = 0;        // which image is showing
    let   particlesArray = [];
    let   animFrame;
    let   frameCount   = 0;

    // --- State ---
    const mouse        = { x: null, y: null, radius: 110 };

    // Glitch transition state
    let isGlitching    = false;
    let glitchFrames   = 0;
    let switchPending  = false;     // after glitch ends → switch image
    let isHeroVisible  = true;      // section-bound flag

    // Periodic auto-glitch (random, not tied to switch)
    let autoGlitchTimer   = 0;
    let nextAutoGlitch    = 300;    // ~5s at 60fps

    // Auto-switch every 10 seconds
    let autoSwitchTimer   = 0;
    const AUTO_SWITCH_INTERVAL = 900; // 15s @ 60fps

    // --- Matrix rain ---
    const matrixChars = '01アイウエオカキクケコ><{}[]#$%&';
    let   rainDrops   = [];

    /* ---- resize ---- */
    const resize = () => {
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

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
        // Breathing pulse — gentle sine on opacity
        const breathe = 0.82 + 0.18 * Math.sin(frameCount * 0.022 + this.baseX * 0.014);
        let   alpha   = this.baseAlpha * breathe;

        // During glitch: random particles flash brighter
        if (isGlitching && Math.random() < 0.12) {
          alpha = Math.min(1, alpha * 1.8);
        }

        // ALWAYS pure green — no blue, no cyan
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

        // Glitch jitter — particles shake during glitch
        if (isGlitching && Math.random() < 0.1) {
          this.x += (Math.random() - 0.5) * 10;
          this.y += (Math.random() - 0.5) * 5;
        }

        // Mouse repulsion — PURE GREEN, no color change
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

        // Ease back to base
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

    /* ======== MATRIX RAIN ======== */
    const initRain = () => {
      rainDrops = [];
      const cols = Math.floor(canvas.width / 14);
      for (let i = 0; i < cols; i++) {
        rainDrops.push({
          x: i * 14,
          y: Math.random() * -canvas.height,
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
        // Rain gets brighter during glitch
        const a = isGlitching ? Math.min(0.35, d.alpha * 4) : d.alpha;
        ctx.fillStyle = `rgba(0, 255, 80, ${a})`;
        ctx.fillText(d.char, d.x, d.y);
        d.y += d.speed * (isGlitching ? 3 : 1);
        if (d.y > canvas.height) {
          d.y = Math.random() * -60;
          d.x = Math.floor(Math.random() * (canvas.width / 14)) * 14;
        }
      }
    };

    /* ======== GLITCH OVERLAY ======== */
    const drawGlitchOverlay = () => {
      if (!isGlitching) return;

      // Horizontal scanlines flash
      ctx.fillStyle = 'rgba(0, 255, 80, 0.04)';
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      // Random RGB-split bars
      for (let s = 0; s < 4; s++) {
        const y  = Math.random() * canvas.height;
        const h  = Math.random() * 8 + 2;
        const dx = (Math.random() - 0.5) * 40;
        try {
          const data = ctx.getImageData(0, y, canvas.width, h);
          ctx.putImageData(data, dx, y);
        } catch (e) { /* ignore cross-origin */ }
      }

      // Corner "ACCESS DENIED / BYPASSING..." text flash
      if (Math.random() < 0.3) {
        const msgs = ['> BYPASSING FIREWALL...', '> INJECTING PAYLOAD', '> ROOT ACCESS GRANTED', '> ENCRYPTING TRAFFIC...', '> SCANNING PORTS...'];
        ctx.font      = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(0, 255, 80, ${Math.random() * 0.6 + 0.2})`;
        ctx.fillText(msgs[Math.floor(Math.random() * msgs.length)],
          Math.random() * (canvas.width * 0.4),
          Math.random() * canvas.height);
      }
    };

    /* ======== INIT PARTICLES from current image ======== */
    const initParticles = (img) => {
      particlesArray = [];
      const isMobile    = canvas.width < 768;
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let imgWidth, imgHeight;

      if (isMobile) {
        imgWidth  = canvas.width * 0.55;
        imgHeight = imgWidth / aspectRatio;
        if (imgHeight > canvas.height * 0.6) {
          imgHeight = canvas.height * 0.6;
          imgWidth  = imgHeight * aspectRatio;
        }
      } else {
        imgHeight = canvas.height * 0.92;
        imgWidth  = imgHeight * aspectRatio;
        if (imgWidth > canvas.width * 0.45) {
          imgWidth  = canvas.width * 0.45;
          imgHeight = imgWidth / aspectRatio;
        }
      }

      const posX = isMobile ? canvas.width - imgWidth : canvas.width - imgWidth - 40;
      const posY = isMobile ? canvas.height - imgHeight + 20 : (canvas.height - imgHeight) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, posX, posY, imgWidth, imgHeight);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gap = isMobile ? 7 : 6;
      for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
          const idx        = (y * canvas.width + x) * 4;
          const r          = pixels.data[idx];
          const g          = pixels.data[idx + 1];
          const b          = pixels.data[idx + 2];
          const alpha      = pixels.data[idx + 3];
          const brightness = (r + g + b) / 3;
          if (alpha > 60 && brightness > 50) {
            particlesArray.push(new Particle(x, y, Math.max(g, brightness)));
          }
        }
      }
    };

    /* ======== HACK CINEMATIC SEQUENCE ======== */
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

      // Red breach flash
      const flash = document.getElementById('hackFlash');
      if (flash) {
        flash.classList.remove('fire');
        // Force reflow to restart animation
        void flash.offsetWidth;
        flash.classList.add('fire');
      }

      // Alert text random
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

      // Radar scanner activate
      const radar = document.getElementById('hackRadar');
      if (radar) {
        radar.classList.remove('active');
        void radar.offsetWidth;
        radar.classList.add('active');
      }

      // Progress bars
      const prog = document.getElementById('hackProgress');
      if (prog) {
        prog.classList.remove('show');
        void prog.offsetWidth;
        prog.classList.add('show');
        // Animated percentage counters
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

      // IP Trace populate with random-ish data
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

      // Skull (only on "big" success moments — 50% chance)
      const skull = document.getElementById('hackSkull');
      if (skull && Math.random() < 0.5) {
        skull.classList.remove('show');
        void skull.offsetWidth;
        const skullId = setTimeout(() => skull.classList.add('show'), 1100);
        hackTimeouts.push(skullId);
      }

      // Binary code burst
      const bin = document.getElementById('hackBinary');
      if (bin) {
        bin.innerHTML = '';
        const cols = Math.min(28, Math.floor(window.innerWidth / 60));
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

      // Fast-typing terminal
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
            // Auto-scroll
            termBody.scrollTop = termBody.scrollHeight;
          }, line.t);
          hackTimeouts.push(id);
        });
      }

      // Hide overlay after sequence finishes (~2.2s total)
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

    /* ======== TRIGGER GLITCH → THEN SWITCH IMAGE + HACK CINEMATIC ======== */
    const triggerSwitch = () => {
      if (isGlitching) return; // already switching
      if (!isHeroVisible) return; // SECTION LOCK: only inside home
      isGlitching   = true;
      glitchFrames  = 0;
      switchPending = true;
      autoSwitchTimer = 0; // reset auto-switch timer
      runHackCinematic(); // 🎬 launch the full hack movie
    };

    /* ======== MAIN ANIMATE LOOP ======== */
    const animate = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Matrix rain (behind particles)
      drawRain();

      // Draw particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
      }

      // Glitch overlay
      drawGlitchOverlay();

      // Manage glitch duration — longer for the hack cinematic (~85 frames ≈ 1.4s)
      if (isGlitching) {
        glitchFrames++;
        // Mid-glitch: scatter all particles violently for dramatic effect
        if (switchPending && glitchFrames === 20) {
          for (let i = 0; i < particlesArray.length; i++) particlesArray[i].scatter();
        }
        // Swap the image at frame 50 (mid-cinematic) so re-formation is visible
        if (switchPending && glitchFrames === 50) {
          currentImgIdx  = currentImgIdx === 0 ? 1 : 0;
          initParticles(images[currentImgIdx]);
        }
        // End glitch
        const glitchLen = switchPending ? 110 : 40;
        if (glitchFrames > glitchLen) {
          isGlitching = false;
          glitchFrames = 0;
          switchPending = false;
        }
      }

      // Auto-switch every 10 seconds
      autoSwitchTimer++;
      if (autoSwitchTimer >= AUTO_SWITCH_INTERVAL) {
        triggerSwitch();
      }

      // Random ambient glitch (not switching image) every ~8–15s
      autoGlitchTimer++;
      if (!isGlitching && autoGlitchTimer >= nextAutoGlitch) {
        isGlitching     = true;
        glitchFrames    = 0;
        switchPending   = false; // just visual glitch, no switch
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
      if (image.complete  && image.naturalWidth  > 0) onLoad(); else image.addEventListener('load', onLoad);
      if (image2.complete && image2.naturalWidth > 0) onLoad(); else image2.addEventListener('load', onLoad);
    };
    waitForBothImages();

    // Pause when out of view + SECTION LOCK for hack cinematic
    const heroObserver = new IntersectionObserver(entries => {
      const visible = entries[0].isIntersecting;
      isHeroVisible = visible;
      if (visible) {
        if (!animFrame) animate();
      } else {
        cancelAnimationFrame(animFrame);
        animFrame = null;
        // Force-hide hack overlay if user scrolled away mid-animation
        if (hackOverlay) hackOverlay.classList.remove('active');
        clearHackTimers();
        autoSwitchTimer = 0; // reset so timer doesn't accumulate while away
      }
    }, { threshold: 0.15 });
    heroObserver.observe(heroSection || canvas.parentElement);

    // Mouse move — pure repulsion, no color change
    canvas.parentElement.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = null; mouse.y = null;
    });

    // Click → trigger glitch + switch
    canvas.parentElement.addEventListener('click', () => {
      triggerSwitch();
    });

    // Touch
    canvas.parentElement.addEventListener('touchmove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: true });
    canvas.parentElement.addEventListener('touchend', () => {
      mouse.x = null; mouse.y = null;
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
