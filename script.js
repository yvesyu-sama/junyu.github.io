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
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.querySelector('.lightbox-close');
        
        // Add click event to all detail images and content images
        const images = document.querySelectorAll('.detail-image, .content-img');
        images.forEach(img => {
            img.addEventListener('click', () => {
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
                lightboxImg.src = ''; // Clear source after animation
            }, 300);
        };

        closeBtn.addEventListener('click', closeLightbox);

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

    // Tab Switching Logic for Merchant Limit Project
    const tabContainer = document.querySelector('.tab-image-container');
    if (tabContainer) {
        const displayImg = tabContainer.querySelector('.image-display img');
        const tabItems = tabContainer.querySelectorAll('.tab-item');

        tabItems.forEach(tab => {
            tab.addEventListener('mouseenter', () => { // Change on hover
                // Update active state
                tabItems.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update image
                const newSrc = tab.getAttribute('data-img');
                if (newSrc && displayImg) {
                    displayImg.src = newSrc;
                    displayImg.alt = tab.textContent; // Update alt text for accessibility
                }
            });
            
            // Also support click for mobile/touch devices where hover isn't reliable
            tab.addEventListener('click', () => {
                tabItems.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const newSrc = tab.getAttribute('data-img');
                if (newSrc && displayImg) {
                    displayImg.src = newSrc;
                    displayImg.alt = tab.textContent;
                }
            });
        });
    }

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
