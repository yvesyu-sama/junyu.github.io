document.addEventListener('DOMContentLoaded', () => {
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 滚动显现动画 (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 增加一个小延迟，避免所有元素同时出现过于生硬
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 100); 
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 选择所有带有 .fade-in-up 类的元素
    const animatedElements = document.querySelectorAll('.fade-in-up');
    
    animatedElements.forEach((el, index) => {
        // 如果是网格中的元素（如技能卡片），可以增加交错延迟
        if (el.classList.contains('skill-card') || el.classList.contains('project-card')) {
           // 这里简单处理，依赖 CSS transition
        }
        observer.observe(el);
    });

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('#lightbox-img') || lightbox.querySelector('.lightbox-img');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        
        // Add click event to all detail images and content images
        const images = document.querySelectorAll('.detail-image, .content-img, .ux-item-placeholder');
        images.forEach(img => {
            img.addEventListener('click', () => {
                if (!lightboxImg) return;
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });

        // Close functions
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            setTimeout(() => {
                if (lightboxImg) lightboxImg.src = ''; // Clear source after animation
            }, 300);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

        // Close on clicking outside
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    const escapeXml = (value) => {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&apos;');
    };

    const makeLabelSvgDataUri = (label) => {
        const safeLabel = escapeXml((label || '').trim());
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="56" fill="#111827">${safeLabel}</text></svg>`;
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    };

    const initTabImageContainer = (tabContainer) => {
        const displayImg = tabContainer.querySelector('.image-display img');
        const tabItems = Array.from(tabContainer.querySelectorAll('.tab-item'));
        if (!displayImg || !tabItems.length) return;

        const getTabSrc = (tab) => {
            const explicit = tab.getAttribute('data-img');
            if (explicit) return explicit;
            const label = tab.getAttribute('data-label') || tab.textContent || '';
            return makeLabelSvgDataUri(label);
        };

        const setActiveTab = (tab) => {
            tabItems.forEach(t => t.classList.toggle('active', t === tab));
            const newSrc = getTabSrc(tab);
            if (newSrc) {
                displayImg.src = newSrc;
                displayImg.alt = (tab.textContent || '').trim();
            }
        };

        tabItems.forEach(tab => {
            tab.addEventListener('mouseenter', () => setActiveTab(tab));
            tab.addEventListener('click', () => setActiveTab(tab));
        });

        const defaultTab = tabItems.find(t => t.classList.contains('active')) || tabItems[0];
        if (defaultTab) setActiveTab(defaultTab);
    };

    document.querySelectorAll('.tab-image-container').forEach(initTabImageContainer);

    const uxCollectionSection = document.querySelector('.ux-collection-section');
    if (uxCollectionSection) {
        const filterButtons = Array.from(document.querySelectorAll('[data-ux-filter]'));
        const items = Array.from(document.querySelectorAll('.ux-item'));
        const navLinks = Array.from(document.querySelectorAll('.ux-collection-link'));

        const parseTags = (raw) => {
            if (!raw) return [];
            return raw
                .split(/[\s,，]+/g)
                .map(t => t.trim())
                .filter(Boolean);
        };

        const isVisible = (el) => !el.classList.contains('is-hidden');

        const setActiveSection = (id) => {
            navLinks.forEach(link => {
                const targetId = (link.getAttribute('href') || '').replace('#', '');
                const active = targetId === id;
                link.classList.toggle('active', active);
                if (active) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };

        const applyFilter = (filterValue) => {
            const normalized = (filterValue || '').trim();
            items.forEach(item => {
                const tags = parseTags(item.dataset.tags);
                const shouldShow = normalized === 'all' || tags.includes(normalized);
                item.classList.toggle('is-hidden', !shouldShow);
            });

            navLinks.forEach(link => {
                const targetId = (link.getAttribute('href') || '').replace('#', '');
                const section = document.getElementById(targetId);
                const shouldShow = section ? isVisible(section) : true;
                link.classList.toggle('is-hidden', !shouldShow);
            });

            const firstVisible = items.find(isVisible);
            if (firstVisible) setActiveSection(firstVisible.id);
        };

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                applyFilter(btn.getAttribute('data-ux-filter') || 'all');
            });
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetId = (link.getAttribute('href') || '').replace('#', '');
                if (targetId) setActiveSection(targetId);
            });
        });

        const observer = new IntersectionObserver((entries) => {
            const visibleEntries = entries.filter(e => e.isIntersecting && isVisible(e.target));
            if (!visibleEntries.length) return;
            visibleEntries.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
            setActiveSection(visibleEntries[0].target.id);
        }, {
            root: null,
            threshold: [0.2, 0.35, 0.5],
            rootMargin: '-120px 0px -55% 0px'
        });

        items.forEach(item => observer.observe(item));

        const defaultBtn = filterButtons.find(b => b.classList.contains('active')) || filterButtons[0];
        if (defaultBtn) {
            applyFilter(defaultBtn.getAttribute('data-ux-filter') || 'all');
        }
    }
});
