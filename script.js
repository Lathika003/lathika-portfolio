document.addEventListener('DOMContentLoaded', () => {

    // --- Switch Toggle Logic ---
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const themeIcon = document.querySelector('.theme-icon'); // Get the icon
    const body = document.body;

    // Function to update icon
    const updateIcon = (isDark) => {
        if (!themeIcon) return; // Guard clause

        themeIcon.style.opacity = '0';
        themeIcon.style.transform = 'rotate(180deg) scale(0.5)';

        setTimeout(() => {
            if (isDark) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            } else {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
            themeIcon.style.opacity = '1';
            themeIcon.style.transform = 'rotate(0deg) scale(1)';
        }, 200);
    };

    // Check saved local storage for Dark Mode
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark-mode') {
        body.classList.add('dark-mode');
        toggleSwitch.checked = true;
        updateIcon(true);
    } else {
        updateIcon(false); // Default Light = Sun
    }

    toggleSwitch.addEventListener('change', function (e) {
        if (e.target.checked) {
            // Switch ON = Dark Mode
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
            updateIcon(true);
        } else {
            // Switch OFF = Light Mode (Default)
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
            updateIcon(false);
        }
        initParticles(); // Refresh particles with new theme colors
    });


    // --- Scroll Animations (Split) ---
    const heroLeft = document.querySelector('.hero-left');
    const heroRight = document.querySelector('.hero-right');
    const bgCanvas = document.getElementById('bg-canvas');

    window.addEventListener('scroll', () => {
        const scrollValue = window.scrollY;
        if (scrollValue < 600) {
            const moveAmt = scrollValue * 0.5;
            const opacity = 1 - (scrollValue / 500);

            if (heroLeft) {
                heroLeft.style.transform = `translateX(-${moveAmt}px)`;
                heroLeft.style.opacity = opacity;
            }
            if (heroRight) {
                heroRight.style.transform = `translateX(${moveAmt}px)`;
                heroRight.style.opacity = opacity;
            }
        }
    });


    // --- Advanced Interactive Particle Background ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    const mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Define Palettes
    // Light Mode: Vivid Multi-color
    const colorsLight = [
        'rgba(255, 0, 85, 0.6)',   // Pink
        'rgba(0, 113, 227, 0.6)',  // Blue
        'rgba(255, 149, 0, 0.6)',  // Orange
        'rgba(175, 82, 222, 0.6)', // Purple
        'rgba(52, 199, 89, 0.6)'   // Green
    ];

    // Dark Mode: Premium Deep Space (Subtle & Elegant) + Luminous Green
    const colorsDark = [
        'rgba(10, 132, 255, 0.4)',   // Apple Blue (Soft)
        'rgba(94, 92, 230, 0.4)',    // Apple Indigo (Soft)
        'rgba(100, 210, 255, 0.4)',  // Apple Cyan (Soft)
        'rgba(255, 255, 255, 0.15)', // Starlight (Very Subtle)
        'rgba(57, 255, 20, 0.5)'     // Luminous Green (Random pop)
    ];

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 1.5; // Faster movement
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 3 + 1;

            this.setColor();
        }

        setColor() {
            const isDark = document.body.classList.contains('dark-mode');
            const palette = isDark ? colorsDark : colorsLight;
            this.color = palette[Math.floor(Math.random() * palette.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse Interaction (Push)
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                const angle = Math.atan2(dy, dx);
                const push = (150 - distance) / 20;
                this.x -= Math.cos(angle) * push;
                this.y -= Math.sin(angle) * push;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    let particles = [];
    const initParticles = () => {
        particles = [];
        // More elements! 120 vs previous 80
        const count = width < 600 ? 50 : 120;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    };
    initParticles();

    const animateParticles = () => {
        ctx.clearRect(0, 0, width, height);

        // Dynamic re-coloring check (performance tradeoff: only do checks if needed, but here simple is robust)
        // Actually, let's trust initParticles is called on toggle.

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 110) {
                    ctx.beginPath();
                    // Gradient Line?? Too expensive. 
                    // Use a subtle mix or just one of the colors?
                    // Let's use the first particle's color but with distance opacity

                    // We need to parse rgba to change alpha... annoying.
                    // Let's us a standard line color based on theme.

                    const isDark = document.body.classList.contains('dark-mode');
                    if (isDark) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 - dist / 1000})`; // Much subtler lines
                    } else {
                        ctx.strokeStyle = `rgba(0, 0, 0, ${0.12 - dist / 1000})`;
                    }

                    ctx.lineWidth = 0.6;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    };
    animateParticles();


    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Observer ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                const progressBar = entry.target.querySelector('.progress-bar-fill');
                if (progressBar) {
                    progressBar.style.width = progressBar.getAttribute('data-width');
                }

                // Skill Percentage Animations
                const skillCounters = entry.target.querySelectorAll('.skill-perc, .percentage');
                skillCounters.forEach(skillCounter => {
                    if (!skillCounter.classList.contains('counted')) {
                        skillCounter.classList.add('counted');
                        const target = +skillCounter.getAttribute('data-target');
                        const duration = 1500; // Synced with CSS transition (1.5s)
                        const start = 0;
                        const startTime = performance.now();

                        const updateSkillCount = (currentTime) => {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            const ease = 1 - Math.pow(1 - progress, 4); // Ease-out quart

                            const currentVal = Math.floor(start + (target - start) * ease);
                            skillCounter.innerText = currentVal + '%';

                            if (progress < 1) {
                                requestAnimationFrame(updateSkillCount);
                            } else {
                                skillCounter.innerText = target + '%';
                            }
                        };
                        requestAnimationFrame(updateSkillCount);
                    }
                });

                const counter = entry.target.querySelector('.exp-count');
                if (counter && !counter.classList.contains('counted')) {
                    counter.classList.add('counted');
                    const target = +counter.getAttribute('data-target');
                    const duration = 800;
                    const start = 0;
                    const startTime = performance.now();

                    const updateCount = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 4);
                        counter.innerText = Math.floor(start + (target - start) * ease);
                        if (progress < 1) requestAnimationFrame(updateCount);
                        else counter.innerText = target;
                    };
                    requestAnimationFrame(updateCount);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .experience-minimal').forEach(el => observer.observe(el));

    // --- Draggable & Auto-scrolling Gallery ---
    const sliderContainer = document.querySelector('.slider-container');
    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');

    if (sliderTrack && sliderContainer) {
        let isDown = false;
        let startX;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationId;
        let isPaused = false;
        
        // 20 images * (300px width + 30px margin) = 6600px
        const slideWidth = 330;
        const totalOriginalSlides = 20;
        const resetTranslate = slideWidth * totalOriginalSlides;
        const scrollSpeed = 1; // pixels per frame

        const autoScroll = () => {
            if (!isDown && !isPaused) {
                currentTranslate -= scrollSpeed;
                if (currentTranslate <= -resetTranslate) {
                    currentTranslate += resetTranslate;
                }
                sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
            }
            animationId = requestAnimationFrame(autoScroll);
        };
        
        autoScroll();

        // Drag logic
        let dragDistance = 0;
        let dragStartX = 0;

        sliderContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            sliderContainer.style.cursor = 'grabbing';
            startX = e.pageX;
            dragStartX = e.pageX;
            dragDistance = 0;
            prevTranslate = currentTranslate;
        });

        sliderContainer.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                sliderContainer.style.cursor = 'grab';
            }
        });

        sliderContainer.addEventListener('mouseup', () => {
            isDown = false;
            sliderContainer.style.cursor = 'grab';
        });

        sliderContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX;
            dragDistance = Math.abs(x - dragStartX);
            const walk = (x - startX);
            currentTranslate = prevTranslate + walk;
            
            // Infinite boundary handling during drag
            if (currentTranslate > 0) {
                currentTranslate -= resetTranslate;
                startX = e.pageX;
                prevTranslate = currentTranslate;
            } else if (currentTranslate <= -resetTranslate) {
                currentTranslate += resetTranslate;
                startX = e.pageX;
                prevTranslate = currentTranslate;
            }

            sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
        });

        // Touch events for mobile
        sliderContainer.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX;
            dragStartX = e.touches[0].pageX;
            dragDistance = 0;
            prevTranslate = currentTranslate;
        });

        sliderContainer.addEventListener('touchend', () => {
            isDown = false;
        });

        sliderContainer.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX;
            dragDistance = Math.abs(x - dragStartX);
            const walk = (x - startX);
            currentTranslate = prevTranslate + walk;
            
            if (currentTranslate > 0) {
                currentTranslate -= resetTranslate;
                startX = e.touches[0].pageX;
                prevTranslate = currentTranslate;
            } else if (currentTranslate <= -resetTranslate) {
                currentTranslate += resetTranslate;
                startX = e.touches[0].pageX;
                prevTranslate = currentTranslate;
            }

            sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
        }, { passive: true });

        // --- Lightbox ---
        if (lightbox) {
            slides.forEach(img => {
                img.addEventListener('click', (e) => {
                    if (dragDistance > 5) {
                        e.preventDefault();
                        return; // Don't open lightbox if dragging
                    }
                    isPaused = true;
                    lightbox.style.display = 'flex';
                    setTimeout(() => lightbox.classList.add('show'), 10);
                    lightboxImg.src = img.src;
                });
            });

            const closeLightbox = () => {
                lightbox.classList.remove('show');
                setTimeout(() => {
                    lightbox.style.display = 'none';
                    isPaused = false;
                }, 300);
            };

            closeBtn.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLightbox();
            });
        }
    }

    // --- Scroll to Top Button ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Mobile Hamburger Menu ---
    const navHamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link');

    if (navHamburger && navLinks) {
        navHamburger.addEventListener('click', () => {
            navHamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        // Close menu when a link is clicked
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                navHamburger.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // --- Theater.js Typing Animation ---
    if (typeof theaterJS !== 'undefined') {
        const theater = theaterJS({
            locale: 'en'
        });

        theater
            .on('type:start, erase:start', function () {
                const actor = theater.getCurrentActor();
                actor.$element.classList.add('actor__content--typing');
            })
            .on('type:end, erase:end', function () {
                const actor = theater.getCurrentActor();
                actor.$element.classList.remove('actor__content--typing');
            });

        theater
            .addActor('tagline', { speed: 0.8, accuracy: 0.8 }, '#theater-tagline')
            .addScene('tagline:Turning Pixels into Perfection.', 2000)
            .addScene('tagline:Graphic Designer & Visual Artist.', 1500)
            .addScene('tagline:UI/UX Enthusiast.', 1500)
            .addScene('tagline:Creative Thinker.', 1500)
            .addScene('tagline:IT Undergraduate.', 1500)
            .addScene(theater.replay.bind(theater));
    }
    // --- Anime.js Professional Headings ---
    function initAnimeHeadings() {
        if (typeof anime === 'undefined') return;

        function wrapTextNodes(element) {
            const childNodes = Array.from(element.childNodes);
            const fragment = document.createDocumentFragment();

            childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    if (!text.trim()) {
                        fragment.appendChild(document.createTextNode(text));
                        return;
                    }
                    
                    const words = text.split(/(\s+)/);
                    words.forEach(word => {
                        if (word === '') return;
                        if (word.trim() === '') {
                            fragment.appendChild(document.createTextNode(word));
                            return;
                        }
                        const wordSpan = document.createElement('span');
                        wordSpan.className = 'anime-word';
                        wordSpan.style.display = 'inline-block';
                        wordSpan.style.overflow = 'hidden';
                        wordSpan.style.padding = '0.15em 0';
                        wordSpan.style.margin = '-0.15em 0';
                        wordSpan.style.verticalAlign = 'bottom';
                        
                        for (let i = 0; i < word.length; i++) {
                            const letterSpan = document.createElement('span');
                            letterSpan.className = 'anime-letter';
                            letterSpan.style.display = 'inline-block';
                            letterSpan.style.transformOrigin = '50% 100%';
                            letterSpan.style.opacity = '0';
                            letterSpan.style.transform = 'translateY(150%) rotateX(-90deg)';
                            letterSpan.textContent = word[i];
                            wordSpan.appendChild(letterSpan);
                        }
                        fragment.appendChild(wordSpan);
                    });
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName !== 'BR') {
                        wrapTextNodes(node); 
                    }
                    fragment.appendChild(node);
                }
            });
            
            element.innerHTML = '';
            element.appendChild(fragment);
        }

        const headings = document.querySelectorAll('h1, h2.subtitle, h2.section-title, h3.subsection-title, .edu-content h4, .skill-header h3');

        const animeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target.querySelectorAll('.anime-letter'),
                        translateY: ['150%', '0%'],
                        rotateX: [-90, 0],
                        opacity: [0, 1],
                        easing: "easeOutExpo",
                        duration: 1200,
                        delay: anime.stagger(30, {start: 50})
                    });
                    animeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        headings.forEach(heading => {
            wrapTextNodes(heading);
            animeObserver.observe(heading);
        });
    }

    initAnimeHeadings();
});
