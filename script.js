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
    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.querySelector('.lightbox-close');
        
        // Add click event to all detail images
        const images = document.querySelectorAll('.detail-image');
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
});
