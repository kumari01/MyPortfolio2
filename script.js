/* ============ ORIGINAL SCRIPT LOGIC ============ */

/* ---- role typewriter ---- */
const roles = ["AI/ML Engineer", "UI/UX Designer", "Python Full-Stack Developer"];
const roleEl = document.getElementById('roleText');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  roleEl.textContent = roles.join("  ·  ");
  document.querySelector('.cursor-blink').style.display = 'none';
} else {
  let roleIdx = 0, charIdx = 0, deleting = false;
  function tickRole() {
    const current = roles[roleIdx];
    if (!deleting) {
      charIdx++;
      roleEl.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) { deleting = true; setTimeout(tickRole, 1400); return; }
    } else {
      charIdx--;
      roleEl.textContent = current.slice(0, charIdx);
      if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
    }
    setTimeout(tickRole, deleting ? 35 : 65);
  }
  setTimeout(tickRole, 900);
}

/* ---- origin buttons: fill expands from cursor entry point ---- */
document.querySelectorAll('[data-origin]').forEach(btn => {
  const fill = btn.querySelector('.origin-fill');
  function place(e) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.6;
    fill.style.width = size + 'px';
    fill.style.height = size + 'px';
    fill.style.left = (e.clientX - rect.left) + 'px';
    fill.style.top = (e.clientY - rect.top) + 'px';
  }
  btn.addEventListener('mouseenter', e => { place(e); btn.classList.add('is-hover'); });
  btn.addEventListener('mouseleave', e => { place(e); btn.classList.remove('is-hover'); });
});

/* ---- dock magnify on proximity ---- */
if (!reduceMotion) {
  const dock = document.getElementById('dock');
  if (dock) {
    const icons = dock.querySelectorAll('.dock-icon');
    dock.addEventListener('mousemove', e => {
      icons.forEach(icon => {
        const r = icon.getBoundingClientRect();
        const center = r.left + r.width / 2;
        const dist = Math.abs(e.clientX - center);
        const maxDist = 90;
        const scale = dist < maxDist ? 1 + 0.5 * (1 - dist / maxDist) : 1;
        icon.style.transform = `scale(${scale}) translateY(${-(scale - 1) * 16}px)`;
      });
    });
    dock.addEventListener('mouseleave', () => icons.forEach(i => i.style.transform = ''));
  }
}

/* ---- directional custom cursor (desktop, fine pointer only) ---- */
const finePointer = window.matchMedia('(pointer: fine)').matches;
if (finePointer && !reduceMotion) {
  document.body.classList.add('custom-cursor-active');
  const cursorEl = document.getElementById('customCursor');
  let lastX = window.innerWidth / 2, lastY = window.innerHeight / 2, lastT = Date.now();
  window.addEventListener('mousemove', e => {
    const now = Date.now();
    const dt = Math.max(now - lastT, 1);
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY; lastT = now;
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top = e.clientY + 'px';
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;
    if (speed > 0.05) {
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      cursorEl.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
    }
  });
}

/* ============ RAG BOT LOGIC ============ */
const knowledgeBase = [
  {
    keywords: ["skill", "technolog", "react", "fastapi", "python", "stack", "frontend", "backend", "code", "programming", "api", "rag"],
    answer: "I build intelligent digital products from end to end—from training **machine learning models** and developing scalable **backend APIs** to crafting modern, intuitive **user interfaces**. I also build AI-powered applications using **Retrieval-Augmented Generation (RAG)**."
  },
  {
    keywords: ["ai", "machine learning", "ml", "intelligence", "model", "neural", "train"],
    answer: "My work brings together artificial intelligence, backend engineering, and frontend development. Whether building **AI-powered applications using RAG**, designing REST APIs, or developing responsive web experiences, I focus on solving real problems with clean, scalable engineering."
  },
  {
    keywords: ["philosoph", "approach", "idea", "product", "who are you", "who i am", "profile", "bio", "about"],
    answer: "Driven by curiosity and continuous learning, I strive to build products where **intelligent systems and thoughtful design** come together to create meaningful user experiences."
  },
  {
    keywords: ["contact", "hire", "email", "job", "work"],
    answer: "I'm always open to talking about exciting full-stack, AI/ML, or design opportunities! You can use the contact form below or email me directly at hello@prebuiltui.com."
  }
];

const defaultAnswer = "I'm Kumari, an AI/ML and Full-Stack Engineer. I build products where intelligent systems and thoughtful design come together. Ask me about my skills, AI background, or philosophy!";

const messagesContainer = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('chatSendBtn');

function appendMessage(text, sender) {
  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble', sender);
  bubble.innerHTML = text;
  messagesContainer.appendChild(bubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return bubble;
}

function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.classList.add('chat-bubble', 'bot', 'typing-indicator-container');
  indicator.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  messagesContainer.appendChild(indicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return indicator;
}

function generateResponse(userText) {
  const cleaned = userText.toLowerCase().trim();
  for (const entry of knowledgeBase) {
    if (entry.keywords.some(keyword => cleaned.includes(keyword))) {
      return entry.answer;
    }
  }
  return defaultAnswer;
}

function streamMessage(text, bubbleElement) {
  bubbleElement.innerHTML = '';
  let index = 0;
  
  // Clean markdown bold syntax simple parser
  const parts = text.split(/(\*\*.*?\*\*)/g);
  let currentPart = 0;
  let currentText = '';

  function typeChar() {
    if (index < text.length) {
      currentText += text[index];
      // Format simple markdown bold on the fly for premium feel
      bubbleElement.innerHTML = currentText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      index++;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      setTimeout(typeChar, 12);
    }
  }
  typeChar();
}

function handleUserMessage(text) {
  if (!text.trim()) return;
  
  appendMessage(text, 'user');
  chatInput.value = '';

  const typingIndicator = showTypingIndicator();

  setTimeout(() => {
    // Remove typing indicator
    typingIndicator.remove();

    // Generate answer
    const answer = generateResponse(text);
    const botBubble = appendMessage('', 'bot');
    streamMessage(answer, botBubble);
  }, 1000);
}

// Add event listeners for Chatbot
if (sendBtn && chatInput) {
  sendBtn.addEventListener('click', () => {
    handleUserMessage(chatInput.value);
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserMessage(chatInput.value);
    }
  });
}

// Handle quick prompts click
document.querySelectorAll('.prompt-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    handleUserMessage(chip.textContent);
  });
});

/* ============ PROJECTS TAB SWITCHING LOGIC ============ */
const projectsData = [
  {
    name: "Sky Garden Restaurant",
    subtitle: "Rooftop Dining & Web Experience",
    description: "A modern, responsive web application for Sky Garden Family Restaurant in Tadepalligudem. Features interactive menu browsing, rooftop dining showcase, table reservation, and full mobile optimization.",
    tags: ["HTML5", "CSS3", "JavaScript", "Netlify"],
    live: "https://skygardenrestaurant.netlify.app",
    code: "https://github.com/kumari01/restaurant1-ttd"
  },
  {
    name: "RAG Chatbot Engine",
    subtitle: "GenAI & Knowledge Retriever",
    description: "A custom Retrieval-Augmented Generation chatbot that parses enterprise documentation and handles contextual, domain-specific queries in real-time. Built with Python and vector embeddings.",
    tags: ["GenAI", "ML", "Python", "Vector DB"],
    live: "#",
    code: "#"
  },
  {
    name: "FastAPI API Gateway",
    subtitle: "High-Performance Backend System",
    description: "A scalable, asynchronous REST API gateway designed using FastAPI to route requests and manage rate-limiting for microservices. Features OAuth2 auth and high-concurrency Redis caching.",
    tags: ["FastAPI", "Python", "Redis", "OAuth2"],
    live: "#",
    code: "#"
  },
  {
    name: "React Analytics Hub",
    subtitle: "Data Visualization Interface",
    description: "An intuitive web interface for tracking model training metrics and system performance. Built with React and charts libraries, utilizing server-sent events for live data streaming.",
    tags: ["React", "CSS", "UI/UX", "Charts"],
    live: "#",
    code: "#"
  },
  {
    name: "PyTorch DL Pipeline",
    subtitle: "Computer Vision Model Training",
    description: "A PyTorch-based image classification pipeline trained on custom datasets. Features automated hyperparameters tuning and deployment packaging using Docker containers.",
    tags: ["ML", "PyTorch", "Docker", "Python"],
    live: "#",
    code: "#"
  }
];

const projectDetailsEl = document.getElementById('projectDetails');
const pNameEl = document.getElementById('pName');
const pSubtitleEl = document.getElementById('pSubtitle');
const pDescriptionEl = document.getElementById('pDescription');
const pTagsEl = document.getElementById('pTags');
const pLiveLinkEl = document.getElementById('pLiveLink');
const pCodeLinkEl = document.getElementById('pCodeLink');
const projectTabs = document.querySelectorAll('.project-tab');

function switchProject(idx) {
  if (!projectDetailsEl || !projectsData[idx]) return;

  // Add fade-out class
  projectDetailsEl.classList.add('fade-out');

  // After fade out transition (250ms), change content and fade in
  setTimeout(() => {
    const data = projectsData[idx];
    pNameEl.textContent = data.name;
    pSubtitleEl.textContent = data.subtitle;
    pDescriptionEl.textContent = data.description;
    pLiveLinkEl.href = data.live;
    pCodeLinkEl.href = data.code;

    // Rebuild tags
    pTagsEl.innerHTML = '';
    data.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.classList.add('project-tag');
      tagSpan.textContent = tag;
      pTagsEl.appendChild(tagSpan);
    });

    // Remove fade-out class (trigger fade in)
    projectDetailsEl.classList.remove('fade-out');
  }, 250);
}

if (projectTabs.length > 0) {
  projectTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      projectTabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Switch project details
      const idx = parseInt(tab.getAttribute('data-project-idx'), 10);
      switchProject(idx);
    });
  });
}

/* ============ WAVY TICKER LOGIC ============ */

const customIcons = {
  vercel: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M24 22.525H0L12 1.475L24 22.525Z"/></svg>`,
  framer: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 0h12v8H12zm0 8h12l-12 12V8H0v8h12z"/></svg>`,
  openai: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21.3 10.6c-.2-.7-.6-1.3-1.1-1.8.1-.3.1-.7.1-1 0-2-1.1-3.8-2.9-4.8-1.3-.7-2.8-.9-4.2-.4-.2-.2-.5-.4-.8-.6-1.8-1-4-1-5.8.1-1.8 1-2.9 2.9-2.9 5 0 .3 0 .7.1 1l-1.3.8C.5 10.7-.5 12.8-.5 15c0 1.4.5 2.7 1.4 3.7.2.2.4.5.6.8 1.3 1.3 3.1 2 4.9 2.1.3 0 .7 0 1-.1l1.3.8c.8.5 1.7.7 2.6.7 1.3 0 2.6-.5 3.7-1.4.2-.2.5-.4.8-.6 1.3-1.3 2-3.1 2-4.9 0-.3 0-.7-.1-1l1.3-.8c1.8-1 2.9-2.9 2.9-5 0-1.6-.8-3.1-2.1-4.1zm-8.4 9.1l-1.7-1c-.3-.2-.4-.6-.2-.9.2-.3.6-.4.9-.2l1.7 1c.3.2.4.6.2.9-.2.3-.6.4-.9.2zm3-1.8l-1.7-1c-.3-.2-.4-.6-.2-.9.2-.3.6-.4.9-.2l1.7 1c.3.2.4.6.2.9-.2.3-.6.4-.9.2zm-9-5.1c.1-.4.5-.6.9-.5l2 .3c.4.1.6.5.5.9-.1.4-.5.6-.9.5l-2-.3c-.4-.1-.6-.5-.5-.9zm4.7-.6l-1.1-1.8c-.2-.3-.1-.7.2-.9.3-.2.7-.1.9.2l1.1 1.8c.2.3.1.7-.2.9-.3.2-.7.1-.9-.2zm.8-3.5c0-.4.3-.7.7-.7h2c.4 0 .7.3.7.7s-.3.7-.7.7h-2c-.4 0-.7-.3-.7-.7zm6.7 6.1l-2-.3c-.4-.1-.6-.5-.5-.9.1-.4.5-.6.9-.5l2 .3c.4.1.6.5.5.9-.1.4-.5.6-.9.5zm-2.7.2c-.3.2-.7.1-.9-.2l-1.1-1.8c-.2-.3-.1-.7.2-.9.3-.2.7-.1.9.2l1.1 1.8c.2.3.1.7-.2.9zm-4.3.4l-1.7-1c-.3-.2-.4-.6-.2-.9.2-.3.6-.4.9-.2l1.7 1c.3.2.4.6.2.9-.2.3-.6.4-.9.2z"/></svg>`,
  langchain: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4" fill="#FFD8CE"/></svg>`,
  rag: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/><circle cx="12" cy="12" r="3" fill="#FFF8F4" stroke="#B7001A" stroke-width="2"/><line x1="14.5" y1="14.5" x2="19" y2="19" stroke="#B7001A" stroke-width="2.5"/></svg>`,
  restapi: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/><path d="M20 6h.01M20 18h.01"/></svg>`,
  development: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  render: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`
};

const topRowSkills = [
  { name: "Python", devicon: "python/python-original.svg" },
  { name: "React", devicon: "react/react-original.svg" },
  { name: "FastAPI", devicon: "fastapi/fastapi-original.svg" },
  { name: "MongoDB", devicon: "mongodb/mongodb-original.svg" },
  { name: "Tailwind CSS", devicon: "tailwindcss/tailwindcss-original.svg" },
  { name: "JavaScript", devicon: "javascript/javascript-original.svg" },
  { name: "HTML5", devicon: "html5/html5-original.svg" },
  { name: "CSS3", devicon: "css3/css3-original.svg" },
  { name: "REST API", customIcon: "restapi" },
  { name: "Flask", devicon: "flask/flask-original.svg" },
  { name: "Git", devicon: "git/git-original.svg" },
  { name: "GitHub", devicon: "github/github-original.svg" },
  { name: "Scikit-learn", devicon: "scikitlearn/scikitlearn-original.svg" },
  { name: "Vercel", customIcon: "vercel" }
];

const bottomRowSkills = [
  { name: "Pandas", devicon: "pandas/pandas-original.svg" },
  { name: "NumPy", devicon: "numpy/numpy-original.svg" },
  { name: "Jupyter Notebook", devicon: "jupyter/jupyter-original.svg" },
  { name: "OpenAI API", customIcon: "openai" },
  { name: "LangChain", customIcon: "langchain" },
  { name: "RAG", customIcon: "rag" },
  { name: "Figma", devicon: "figma/figma-original.svg" },
  { name: "Framer", customIcon: "framer" },
  { name: "Postman", devicon: "postman/postman-original.svg" },
  { name: "VS Code", devicon: "vscode/vscode-original.svg" },
  { name: "Render", customIcon: "render" },
  { name: "Netlify", devicon: "netlify/netlify-original.svg" },
  { name: "Development", customIcon: "development" }
];

function createSkillCard(skill) {
  const card = document.createElement('div');
  card.className = 'skill-card';
  card.title = skill.name;
  card.setAttribute('aria-label', skill.name);
  
  const iconSpan = document.createElement('span');
  iconSpan.className = 'skill-icon';
  
  if (skill.customIcon && customIcons[skill.customIcon]) {
    iconSpan.innerHTML = customIcons[skill.customIcon];
  } else if (skill.devicon) {
    const img = document.createElement('img');
    img.src = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${skill.devicon}`;
    img.alt = skill.name;
    img.onerror = () => {
      iconSpan.innerHTML = customIcons['development'];
    };
    iconSpan.appendChild(img);
  } else {
    iconSpan.innerHTML = customIcons['development'];
  }
  
  const label = document.createElement('span');
  label.textContent = skill.name;
  
  card.appendChild(iconSpan);
  card.appendChild(label);
  return card;
}

const activeTracks = [];
let animFrameId = null;

function initWavyTrack(containerId, skillsList, scrollDirection = 'left', phaseOffset = 0) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  // Double the list initially to guarantee a seamless wrap-around loop on wide screens
  const doubledSkills = [...skillsList, ...skillsList];
  
  // Create original cards
  const cards = doubledSkills.map(skill => createSkillCard(skill));
  cards.forEach(card => container.appendChild(card));
  
  // Measure elements
  const cardGap = 28; // pixel spacing between cards
  let currentX = 0;
  
  let cardsData = Array.from(container.children).map(el => {
    const width = el.offsetWidth || 160;
    const startX = currentX;
    currentX += width + cardGap;
    return { el, width, startX };
  });
  
  let loopWidth = currentX;
  
  // Clone cards further to cover viewport width with double safety margin
  const viewportWidth = window.innerWidth;
  while (loopWidth < viewportWidth + 1200) {
    skillsList.forEach(skill => {
      const clone = createSkillCard(skill);
      container.appendChild(clone);
    });
    
    // Recalculate
    currentX = 0;
    cardsData = Array.from(container.children).map(el => {
      const width = el.offsetWidth || 160;
      const startX = currentX;
      currentX += width + cardGap;
      return { el, width, startX };
    });
    loopWidth = currentX;
  }
  
  // Set wave properties
  const amplitude = 22; // wave amplitude in pixels
  const targetWavelength = 480; // pixels for one full sine wave cycle
  const wavesCount = Math.max(1, Math.round(loopWidth / targetWavelength));
  const wavelength = loopWidth / wavesCount;
  const frequency = (2 * Math.PI) / wavelength;
  
  const trackState = {
    container,
    cards: cardsData,
    loopWidth,
    wavelength,
    frequency,
    amplitude,
    scrollOffset: 0,
    speed: 0.45, // base pixels per frame
    directionFactor: scrollDirection === 'left' ? 1 : -1,
    currentSpeed: 1.0, // multiplier
    targetSpeed: 1.0,
    phaseOffset
  };
  
  activeTracks.push(trackState);
}

function updateWavyTickers() {
  activeTracks.forEach(track => {
    // Smooth speed change (lerp)
    track.currentSpeed += (track.targetSpeed - track.currentSpeed) * 0.08;
    
    if (track.currentSpeed > 0.002) {
      track.scrollOffset += track.speed * track.currentSpeed * track.directionFactor;
    }
    
    // Wrap scrollOffset
    track.scrollOffset = (track.scrollOffset % track.loopWidth + track.loopWidth) % track.loopWidth;
    
    // Position cards
    track.cards.forEach(card => {
      // Wrap X coordinate within [-card.width, track.loopWidth - card.width]
      let x = card.startX - track.scrollOffset;
      x = ((x + card.width) % track.loopWidth + track.loopWidth) % track.loopWidth - card.width;
      
      // Calculate Y coordinate based on screen horizontal position
      const centerPos = x + card.width / 2;
      const y = track.amplitude * Math.sin(centerPos * track.frequency + track.phaseOffset);
      
      card.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  });
  
  animFrameId = requestAnimationFrame(updateWavyTickers);
}

function startWavyTickers() {
  activeTracks.length = 0;
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
  }
  
  // Top row moves left, bottom row moves right
  // We offset phase by Math.PI to make waves move in mirror paths
  initWavyTrack('wavyTrackTop', topRowSkills, 'left', 0);
  initWavyTrack('wavyTrackBottom', bottomRowSkills, 'right', Math.PI);
  
  // Bind hover listeners on the section to pause/resume
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    skillsSection.addEventListener('mouseenter', () => {
      activeTracks.forEach(t => t.targetSpeed = 0.0);
    });
    skillsSection.addEventListener('mouseleave', () => {
      activeTracks.forEach(t => t.targetSpeed = 1.0);
    });
  }
  
  updateWavyTickers();
}

// Start on DOMContentLoaded for fast visual display
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startWavyTickers);
} else {
  startWavyTickers();
}
// Re-run on load to adjust for any changes in font rendering or image dimensions
window.addEventListener('load', startWavyTickers);

// Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    startWavyTickers();
  }, 250);
});

/* ============ FOCUS SLICE CAROUSEL LOGIC ============ */
function initSliceCarousel() {
  const sliceItems = document.querySelectorAll('.slice-item');
  if (sliceItems.length === 0) return;

  sliceItems.forEach(item => {
    // Hover event for desktop (fluid expansion)
    item.addEventListener('mouseenter', () => {
      sliceItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });

    // Touch support / Click fallback for mobile and accessibility
    item.addEventListener('click', () => {
      sliceItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// Run it on load/DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSliceCarousel);
} else {
  initSliceCarousel();
}

/* ============ CONTACT FORM & NAVIGATION LOGIC ============ */
function initContactLogic() {
  const contactSection = document.getElementById('contact');
  const navContactBtn = document.getElementById('navContactBtn');
  const heroContactBtn = document.getElementById('heroContactBtn');
  const heroWorkBtn = document.getElementById('heroWorkBtn');
  
  // Smooth scroll helper
  function scrollToContact(e) {
    if (e) e.preventDefault();
    if (contactSection) {
      if (window.lenis) {
        window.lenis.scrollTo(contactSection, { offset: -20, duration: 1.2 });
      } else {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  if (navContactBtn && !navContactBtn.dataset.bound) {
    navContactBtn.addEventListener('click', scrollToContact);
    navContactBtn.dataset.bound = "true";
  }
  if (heroContactBtn && !heroContactBtn.dataset.bound) {
    heroContactBtn.addEventListener('click', scrollToContact);
    heroContactBtn.dataset.bound = "true";
  }
  if (heroWorkBtn && !heroWorkBtn.dataset.bound) {
    heroWorkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('projects');
      if (target) {
        if (window.lenis) {
          window.lenis.scrollTo(target, { offset: -20, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
    heroWorkBtn.dataset.bound = "true";
  }
  
  // Bind form handlers
  bindContactForm();
}

function bindContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formContainer = contactForm.closest('.form-container');
    if (!formContainer) return;
    
    const nameVal = document.getElementById('name') ? document.getElementById('name').value : '';
    
    // Maintain container height during transition to prevent page jumps
    formContainer.style.minHeight = formContainer.offsetHeight + 'px';
    
    formContainer.innerHTML = `
      <div class="form-success-card">
        <div class="success-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3>Message Sent!</h3>
        <p>Thank you, <strong>${nameVal}</strong>. Your message has been received successfully. I'll get back to you shortly.</p>
        <button class="origin-btn cert-verify-btn" data-origin id="resetFormBtn">
          <span class="origin-fill"></span>
          <span class="origin-label">Send Another Message</span>
        </button>
      </div>
    `;
    
    // Bind reset button logic
    const resetBtn = document.getElementById('resetFormBtn');
    if (resetBtn) {
      bindOriginBtnHover(resetBtn);
      
      resetBtn.addEventListener('click', () => {
        formContainer.style.minHeight = '';
        formContainer.innerHTML = `
          <form id="contactForm" class="contact-form">
            <div class="form-group">
              <label for="name" class="form-label">Full Name</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.311 16.406a9.64 9.64 0 0 0-4.748-4.158 5.938 5.938 0 1 0-7.125 0 9.64 9.64 0 0 0-4.749 4.158.937.937 0 1 0 1.623.938c1.416-2.447 3.916-3.906 6.688-3.906 2.773 0 5.273 1.46 6.689 3.906a.938.938 0 0 0 1.622-.938M5.938 7.5a4.063 4.063 0 1 1 8.125 0 4.063 4.063 0 0 1-8.125 0" fill="currentColor"/>
                </svg>
                <input type="text" id="name" name="name" class="form-input" placeholder="Enter your full name" required />
              </div>
            </div>
            
            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 3.438h-15a.937.937 0 0 0-.937.937V15a1.563 1.563 0 0 0 1.562 1.563h13.75A1.563 1.563 0 0 0 18.438 15V4.375a.94.94 0 0 0-.938-.937m-2.41 1.874L10 9.979 4.91 5.313zM3.438 14.688v-8.18l5.928 5.434a.937.937 0 0 0 1.268 0l5.929-5.435v8.182z" fill="currentColor"/>
                </svg>
                <input type="email" id="email" name="email" class="form-input" placeholder="Enter your email address" required />
              </div>
            </div>
            
            <div class="form-group">
              <label for="message" class="form-label">Message</label>
              <textarea id="message" name="message" rows="4" class="form-textarea" placeholder="Enter your message" required></textarea>
            </div>
            
            <button type="submit" class="origin-btn form-submit-btn" data-origin>
              <span class="origin-fill"></span>
              <span class="origin-label">
                Submit Form
                <svg class="btn-arrow" width="16" height="16" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m18.038 10.663-5.625 5.625a.94.94 0 0 1-1.328-1.328l4.024-4.023H3.625a.938.938 0 0 1 0-1.875h11.484l-4.022-4.025a.94.94 0 0 1 1.328-1.328l5.625 5.625a.935.935 0 0 1-.002 1.33" fill="currentColor"/>
                </svg>
              </span>
            </button>
          </form>
        `;
        
        // Re-bind form submission handlers
        bindContactForm();
        
        // Re-bind origin hover for new submit button
        const newSubmitBtn = formContainer.querySelector('.form-submit-btn');
        if (newSubmitBtn) {
          bindOriginBtnHover(newSubmitBtn);
        }
      });
    }
  });
}

function bindOriginBtnHover(btn) {
  const fill = btn.querySelector('.origin-fill');
  if (!fill) return;
  
  function place(e) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.6;
    fill.style.width = size + 'px';
    fill.style.height = size + 'px';
    fill.style.left = (e.clientX - rect.left) + 'px';
    fill.style.top = (e.clientY - rect.top) + 'px';
  }
  btn.addEventListener('mouseenter', e => { place(e); btn.classList.add('is-hover'); });
  btn.addEventListener('mouseleave', e => { place(e); btn.classList.remove('is-hover'); });
}

// Start contact logic on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactLogic);
} else {
  initContactLogic();
}

/* ============ SCROLL VELOCITY TEXT MARQUEE LOGIC ============ */
function initScrollVelocityMarquee() {
  const track1 = document.getElementById('velocityTrack1');
  const track2 = document.getElementById('velocityTrack2');
  if (!track1 || !track2) return;

  const wrap1 = track1.querySelector('.marquee-flex-wrap');
  const wrap2 = track2.querySelector('.marquee-flex-wrap');
  if (!wrap1 || !wrap2) return;

  const firstContent1 = wrap1.querySelector('.marquee-scroll-content');
  const firstContent2 = wrap2.querySelector('.marquee-scroll-content');
  if (!firstContent1 || !firstContent2) return;

  // Track widths of first content block
  let width1 = firstContent1.offsetWidth;
  let width2 = firstContent2.offsetWidth;

  // Update widths on resize
  window.addEventListener('resize', () => {
    width1 = firstContent1.offsetWidth;
    width2 = firstContent2.offsetWidth;
  });

  // Animation values
  let scrollOffset1 = 0;
  let scrollOffset2 = 0;

  const baseVelocity1 = -2.5; // Left scrolling
  const baseVelocity2 = 2.5;  // Right scrolling

  let currentVelocity = 0;
  let targetVelocity = 0;
  let lastScrollY = window.scrollY;
  let scrollTimeout = null;

  // Track scroll speed
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Set target velocity based on scroll direction and speed
    targetVelocity = diff * 0.12;

    // Reset timeout to decay velocity when scroll stops
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      targetVelocity = 0;
    }, 100);
  });

  function animateMarquees() {
    // Smooth out scroll velocity (lerp)
    currentVelocity += (targetVelocity - currentVelocity) * 0.08;

    // Calculate current frame movement
    let speed1 = baseVelocity1 + currentVelocity;
    let speed2 = baseVelocity2 + currentVelocity;

    // Update offsets
    scrollOffset1 += speed1;
    scrollOffset2 += speed2;

    // Wrap around offset 1 (negative movement)
    if (scrollOffset1 <= -width1) {
      scrollOffset1 += width1;
    } else if (scrollOffset1 >= 0) {
      scrollOffset1 -= width1;
    }

    // Wrap around offset 2 (positive movement)
    if (scrollOffset2 >= 0) {
      scrollOffset2 -= width2;
    } else if (scrollOffset2 <= -width2) {
      scrollOffset2 += width2;
    }

    // Apply transforms
    wrap1.style.transform = `translate3d(${scrollOffset1}px, 0, 0)`;
    wrap2.style.transform = `translate3d(${scrollOffset2}px, 0, 0)`;

    // Keep decay going
    targetVelocity *= 0.95;

    requestAnimationFrame(animateMarquees);
  }

  // Start the animation loop
  requestAnimationFrame(animateMarquees);
}

// Start scroll velocity marquee logic
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollVelocityMarquee);
} else {
  initScrollVelocityMarquee();
}

/* ============ FOOTER QUOTES LOGIC ============ */
const footerQuotes = [
  "Intelligent systems, thoughtful design.",
  "Simplicity is the ultimate sophistication. — Leonardo da Vinci",
  "The best way to predict the future is to design it. — Alan Kay",
  "Make it simple, but significant. — Don Draper",
  "Design is not just what it looks like and feels like. Design is how it works. — Steve Jobs"
];

function initFooterQuotes() {
  const quoteEl = document.getElementById('footerQuote');
  if (!quoteEl) return;

  let index = 0;
  
  // Set initial quote randomly
  index = Math.floor(Math.random() * footerQuotes.length);
  quoteEl.textContent = footerQuotes[index];

  // Rotate quotes every 8 seconds
  setInterval(() => {
    quoteEl.classList.add('fade-out');

    setTimeout(() => {
      index = (index + 1) % footerQuotes.length;
      quoteEl.textContent = footerQuotes[index];
      quoteEl.classList.remove('fade-out');
    }, 500); // matches transition speed in CSS
  }, 8000);
}

// Start footer quotes logic
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFooterQuotes);
} else {
  initFooterQuotes();
}

/* ============ SMOOTH SCROLLING & SCROLL REVEAL INITIALIZATION ============ */
function initSmoothScrollAndReveal() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Initialize Lenis Smooth Scroll
  if (!reduceMotion && typeof Lenis !== 'undefined') {
    window.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      window.lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate with page anchors (smooth scrolling for internal links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          window.lenis.scrollTo(targetEl, {
            offset: -20,
            duration: 1.2
          });
        }
      });
    });
  }

  // 2. Initialize Scroll Reveal using Intersection Observer
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if (revealElements.length > 0) {
    if (reduceMotion) {
      // Instantly reveal all elements if reduced motion is enabled
      revealElements.forEach(el => el.classList.add('revealed'));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Stop observing once revealed to prevent performance overhead
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08, // trigger when 8% of the element is visible
        rootMargin: '0px 0px -40px 0px' // slightly inset trigger line for better visual flow
      });

      revealElements.forEach(el => revealObserver.observe(el));
    }
  }
}

// Start on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSmoothScrollAndReveal);
} else {
  initSmoothScrollAndReveal();
}



