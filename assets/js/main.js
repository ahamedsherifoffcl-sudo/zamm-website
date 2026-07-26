(() => {
  'use strict';

  const body = document.body;
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shells = [...document.querySelectorAll('.desktop-site-shell, .mobile-site-shell')];

  const closeAllMenus = () => {
    document.querySelectorAll('.nav.open').forEach((nav) => nav.classList.remove('open'));
    document.querySelectorAll('.menu-toggle[aria-expanded="true"]').forEach((toggle) => toggle.setAttribute('aria-expanded', 'false'));
    body.classList.remove('menu-open');
  };

  shells.forEach((shell) => {
    const toggle = shell.querySelector('.menu-toggle');
    const nav = shell.querySelector('.nav');
    if (toggle && nav) {
      const closeMenu = () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        if (!document.querySelector('.nav.open')) body.classList.remove('menu-open');
      };
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        body.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
      nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
      document.addEventListener('click', (event) => {
        if (nav.classList.contains('open') && !nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
      });
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllMenus();
  });
  window.addEventListener('resize', closeAllMenus, { passive: true });

  document.querySelectorAll('.theme-toggle').forEach((themeToggle) => {
    const syncThemeLabel = () => {
      const dark = root.dataset.theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    };
    syncThemeLabel();
    themeToggle.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('zamm-theme', root.dataset.theme); } catch (error) {}
      document.querySelectorAll('.theme-toggle').forEach((button) => {
        const dark = root.dataset.theme === 'dark';
        button.setAttribute('aria-pressed', String(dark));
        button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      });
    });
  });

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  const headers = [...document.querySelectorAll('.site-header')];
  const updateHeaders = () => headers.forEach((header) => header.classList.toggle('scrolled', window.scrollY > 18));
  updateHeaders();
  window.addEventListener('scroll', updateHeaders, { passive: true });

  const reveals = [...document.querySelectorAll('.reveal')];
  reveals.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  });
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -35px' });
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || '';
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      if (reducedMotion) { el.textContent = `${target}${suffix}`; return; }
      const start = performance.now();
      const duration = 1200;
      const tick = (time) => {
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) { run(); observer.disconnect(); }
      }, { threshold: 0.4 });
      observer.observe(el);
    } else run();
  });

  if (!reducedMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const strength = card.dataset.tilt === 'hero' ? 7 : 3.5;
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1100px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
    document.querySelectorAll('[data-parallax-stage]').forEach((stage) => {
      const projectCard = stage.querySelector('.hero-project-card');
      const scoreCard = stage.querySelector('.hero-score-card');
      stage.addEventListener('mousemove', (event) => {
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        if (projectCard) projectCard.style.translate = `${x * 7}px ${y * 5}px`;
        if (scoreCard) scoreCard.style.translate = `${x * -9}px ${y * -7}px`;
      });
      stage.addEventListener('mouseleave', () => {
        if (projectCard) projectCard.style.translate = '';
        if (scoreCard) scoreCard.style.translate = '';
      });
    });
  }

  document.querySelectorAll('img.remote-image').forEach((img) => {
    img.addEventListener('error', () => {
      const fallback = img.dataset.fallback || 'assets/images/zamm-social-preview.webp';
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = 'true';
        img.src = fallback;
      }
      img.closest('.service-image, .showcase-media, .service-detail-image, .about-photo-wrap, .deliverable-media')?.classList.add('image-fallback');
    }, { once: true });
  });


  const backgroundFallback = 'assets/images/zamm-social-preview.webp';

  const verifyRemoteBackground = (element, propertyName = 'backgroundImage') => {
    const value = propertyName.startsWith('--')
      ? getComputedStyle(element).getPropertyValue(propertyName)
      : getComputedStyle(element)[propertyName];

    const urls = [...String(value).matchAll(/url\(["']?(https?:\/\/[^"')]+)["']?\)/g)]
      .map((match) => match[1]);

    urls.forEach((url) => {
      const testImage = new Image();
      testImage.onerror = () => {
        if (propertyName.startsWith('--')) {
          element.style.setProperty(propertyName, `url("${backgroundFallback}")`);
        } else {
          const current = getComputedStyle(element)[propertyName];
          element.style[propertyName] = current.replaceAll(url, backgroundFallback);
        }
      };
      testImage.src = url;
    });
  };

  document.querySelectorAll('[style*="--thumb-image"]').forEach((element) => {
    verifyRemoteBackground(element, '--thumb-image');
  });

  document.querySelectorAll(
    '.service-detail-hero, .service-image, .showcase-media, .blog-thumb, ' +
    '.project-feature-visual, .industry-card-image, .value-card-image, .deliverable-media'
  ).forEach((element) => verifyRemoteBackground(element));


  const scrollToApplicationForm = () => {
    const hash = window.location.hash;
    if (!['#application-form', '#mobile-application-form'].includes(hash)) {
      return;
    }

    const target = document.querySelector(hash);
    if (!target) {
      return;
    }

    window.setTimeout(() => {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      target.focus({ preventScroll: true });
    }, 140);
  };

  scrollToApplicationForm();
  window.addEventListener('hashchange', scrollToApplicationForm);

  document.querySelectorAll('[data-whatsapp-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const lines = [
        'Hello Zamm Devolopers,', '',
        `Name: ${data.get('name') || ''}`,
        `Phone: ${data.get('phone') || ''}`,
        `Email: ${data.get('email') || ''}`,
        `Service: ${data.get('service') || ''}`,
        `Business: ${data.get('business') || ''}`,
        `Message: ${data.get('message') || ''}`
      ];
      window.open(`https://wa.me/918668016504?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
      form.querySelector('.status-message')?.classList.add('show');
    });
  });

  document.querySelectorAll('[data-card-href]').forEach((card) => {
    const openCard = () => {
      const href = card.dataset.cardHref;
      if (!href) return;
      if (card.dataset.cardTarget === '_blank') window.open(href, '_blank', 'noopener,noreferrer');
      else window.location.href = href;
    };
    card.addEventListener('click', (event) => {
      if (!event.target.closest('a, button, input, select, textarea, summary, label')) openCard();
    });
    card.addEventListener('keydown', (event) => {
      if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        openCard();
      }
    });
  });
})();
