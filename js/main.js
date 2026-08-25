// RILOC — shared interactivity (Glassmorphism Enhanced)
document.addEventListener('DOMContentLoaded', () => {

  /* AOS init */
  if (window.AOS) AOS.init({ duration: 700, once: true, offset: 60, easing: 'ease-out-cubic' });

  /* Navbar solid on scroll */
  const nav = document.querySelector('.riloc-nav');
  const toggleNavSolid = () => {
    if (!nav) return;
    if (window.scrollY > 40 || !nav.classList.contains('nav-transparent-allowed')) {
      nav.classList.add('solid');
    } else {
      nav.classList.remove('solid');
    }
  };
  toggleNavSolid();
  window.addEventListener('scroll', toggleNavSolid);

  /* Mobile menu toggle */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  /* ============================================================
     DROPDOWN TOGGLES — Works on BOTH desktop AND mobile
     ============================================================ */
  const dropdownItems = document.querySelectorAll('.nav-links > li');

  dropdownItems.forEach(li => {
    const trigger = li.querySelector('.nav-link-text');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      // On mobile (<=1140px), the menu is a sidebar — always toggle
      // On desktop (>1140px), hover already shows the menu, but we also
      // allow click to keep it open (and toggle) for accessibility

      const isMobile = window.innerWidth <= 1140;

      if (isMobile) {
        e.preventDefault(); // Prevent any default span behavior
        e.stopPropagation(); // Stop bubbling
      }

      // Close all other dropdowns first
      dropdownItems.forEach(otherLi => {
        if (otherLi !== li) otherLi.classList.remove('dropdown-open');
      });

      // Toggle this one
      li.classList.toggle('dropdown-open');
    });
  });

  // Close dropdowns when clicking outside the nav
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.riloc-nav')) {
      dropdownItems.forEach(li => li.classList.remove('dropdown-open'));
    }
  });

  // Close dropdowns when clicking a dropdown link (navigate away)
  document.querySelectorAll('.dropdown-menu a').forEach(link => {
    link.addEventListener('click', () => {
      dropdownItems.forEach(li => li.classList.remove('dropdown-open'));
    });
  });

  /* Back to top */
  const backTop = document.querySelector('.back-to-top');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('show', window.scrollY > 600);
    });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* Animated counters */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const runCounter = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + suffix;
      };
      requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
  }

  /* FAQ accordions */
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* Tab filters (Programs / Gallery / News) */
  document.querySelectorAll('.filter-row').forEach(row => {
    const targetGroup = row.dataset.target;
    row.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        row.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll(`[data-group="${targetGroup}"]`).forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  });

  /* Lightbox gallery */
  const lightbox = document.querySelector('.lightbox-overlay');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const items = Array.from(document.querySelectorAll('.masonry-item img'));
    let idx = 0;
    const openAt = (i) => {
      idx = (i + items.length) % items.length;
      lightboxImg.src = items[idx].src;
      lightboxImg.alt = items[idx].alt;
      lightbox.classList.add('open');
    };
    items.forEach((img, i) => img.closest('.masonry-item').addEventListener('click', () => openAt(i)));
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.querySelector('.lightbox-nav.next').addEventListener('click', () => openAt(idx + 1));
    lightbox.querySelector('.lightbox-nav.prev').addEventListener('click', () => openAt(idx - 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') lightbox.classList.remove('open');
      if (e.key === 'ArrowRight') openAt(idx + 1);
      if (e.key === 'ArrowLeft') openAt(idx - 1);
    });
  }

  /* Program detail modal */
  const programModal = document.getElementById('programModal');
  if (programModal) {
    document.querySelectorAll('[data-program-trigger]').forEach(card => {
      card.addEventListener('click', () => {
        programModal.querySelector('.pm-title').textContent = card.dataset.title;
        programModal.querySelector('.pm-img').src = card.dataset.img;
        programModal.querySelector('.pm-desc').textContent = card.dataset.desc;
        programModal.querySelector('.pm-obj').textContent = card.dataset.objectives;
        programModal.querySelector('.pm-out').textContent = card.dataset.outcomes;
        programModal.querySelector('.pm-tag').textContent = card.dataset.category;
        programModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    programModal.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeProgramModal));
    programModal.addEventListener('click', (e) => { if (e.target === programModal) closeProgramModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProgramModal(); });
  }
  function closeProgramModal() {
    if (programModal) {
      programModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /* Forms — client-side confirmation */
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('.form-success');
      if (note) {
        note.style.display = 'flex';
        form.reset();
        note.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* Donation amount buttons */
  const donateBtns = document.querySelectorAll('.donate-amount-btn');
  donateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      donateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const customInput = document.getElementById('custom-amount');
      if (customInput) {
        if (btn.dataset.amount) {
          customInput.value = btn.dataset.amount;
        } else {
          customInput.value = '';
          customInput.focus();
        }
      }
    });
  });

  /* Swiper sliders */
  if (window.Swiper) {
    document.querySelectorAll('.stories-swiper').forEach(el => {
      new Swiper(el, {
        loop: true,
        spaceBetween: 28,
        slidesPerView: 1,
        autoHeight: false,
        pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
        navigation: {
          nextEl: el.querySelector('.swiper-button-next'),
          prevEl: el.querySelector('.swiper-button-prev'),
        },
        breakpoints: { 900: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } }
      });
    });
    document.querySelectorAll('.partners-swiper').forEach(el => {
      new Swiper(el, {
        loop: true,
        spaceBetween: 50,
        slidesPerView: 2,
        autoplay: { delay: 2000, disableOnInteraction: false },
        breakpoints: { 700: { slidesPerView: 3 }, 1000: { slidesPerView: 5 } }
      });
    });
  }

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});