/* ============================================================
   StopMyCancer.com — Main JavaScript
   Navigation, mobile menu, language switcher, scroll animations
   ============================================================ */

(function () {
  'use strict';

  // --- Header scroll behavior ---
  const header = document.querySelector('.header');
  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    const currentScrollY = window.scrollY;

    if (header) {
      // Add shadow on scroll
      if (currentScrollY > 10) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }

      // Hide/show header on scroll direction
      if (currentScrollY > 300) {
        if (currentScrollY > lastScrollY + 5) {
          header.classList.add('header--hidden');
        } else if (currentScrollY < lastScrollY - 5) {
          header.classList.remove('header--hidden');
        }
      } else {
        header.classList.remove('header--hidden');
      }
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // --- Mobile menu ---
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      const isOpen = mobileToggle.classList.contains('mobile-toggle--open');
      mobileToggle.classList.toggle('mobile-toggle--open');
      mobileNav.classList.toggle('mobile-nav--open');
      document.body.style.overflow = isOpen ? '' : 'hidden';

      // Update ARIA
      mobileToggle.setAttribute('aria-expanded', !isOpen);
    });

    // Close mobile nav on link click
    const mobileLinks = mobileNav.querySelectorAll('.mobile-nav__link');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileToggle.classList.remove('mobile-toggle--open');
        mobileNav.classList.remove('mobile-nav--open');
        document.body.style.overflow = '';
      });
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('mobile-nav--open')) {
        mobileToggle.classList.remove('mobile-toggle--open');
        mobileNav.classList.remove('mobile-nav--open');
        document.body.style.overflow = '';
        mobileToggle.focus();
      }
    });
  }

  // --- Language switcher ---
  const langBtn = document.querySelector('.lang-switcher__btn');
  const langDropdown = document.querySelector('.lang-switcher__dropdown');

  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      langDropdown.classList.toggle('lang-switcher__dropdown--open');
    });

    document.addEventListener('click', function () {
      langDropdown.classList.remove('lang-switcher__dropdown--open');
    });

    langDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  // --- Scroll-triggered animations ---
  function initScrollAnimations() {
    var animElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

    if (!animElements.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              entry.target.classList.contains('fade-in') ? 'fade-in--visible' :
              entry.target.classList.contains('fade-in-left') ? 'fade-in-left--visible' :
              'fade-in-right--visible'
            );
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      animElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show everything
      animElements.forEach(function (el) {
        el.classList.add('fade-in--visible', 'fade-in-left--visible', 'fade-in-right--visible');
      });
    }
  }

  // --- Smooth scroll for anchor links ---
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (link) {
      var targetId = link.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerHeight = header ? header.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }
  });

  // --- Active nav link highlighting ---
  function updateActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.header__nav-link');
    var headerHeight = header ? header.offsetHeight : 0;

    if (!sections.length || !navLinks.length) return;

    var scrollY = window.scrollY + headerHeight + 100;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('header__nav-link--active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('header__nav-link--active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', function () {
    window.requestAnimationFrame(updateActiveNav);
  }, { passive: true });

  // --- Init on DOM ready ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initScrollAnimations();
      updateActiveNav();
    });
  } else {
    initScrollAnimations();
    updateActiveNav();
  }

})();
