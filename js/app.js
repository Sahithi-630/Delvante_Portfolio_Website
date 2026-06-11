/* ==========================================================================
   Bhumireddy Sahithi Portfolio Core Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. Dynamic Theme Switcher
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const bodyElement = document.body;

    // Check localStorage or system theme preferences
    const storedTheme = localStorage.getItem('portfolio-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'light' || (!storedTheme && !prefersDark)) {
        bodyElement.classList.add('light-theme');
    }

    themeToggleBtn.addEventListener('click', () => {
        bodyElement.classList.toggle('light-theme');
        const theme = bodyElement.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('portfolio-theme', theme);
    });

    // ==========================================================================
    // 2. Interactive Mobile Navigation
    // ==========================================================================
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMobileMenu = () => {
        mobileToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    };

    mobileToggle.addEventListener('click', toggleMobileMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('open')) {
            toggleMobileMenu();
        }
    });

    // ==========================================================================
    // 3. Auto-Typing Hero Effect
    // ==========================================================================
    const typewriterText = document.getElementById('typewriter-text');
    const roles = ["2nd Year CSE Student", "Full-Stack Web Developer", "Software Engineering Enthusiast"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const handleTypewriter = () => {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typewriterText.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Delete faster
        } else {
            typewriterText.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Normal typing speed
        }

        if (!isDeleting && charIndex === currentRole.length) {
            // Full role typed. Wait before deleting.
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            // Deleted all characters. Next role.
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // Brief pause before starting next role
        }

        setTimeout(handleTypewriter, typingSpeed);
    };

    if (typewriterText) {
        handleTypewriter();
    }

    // ==========================================================================
    // 4. Interactive Canvas Particle Background
    // ==========================================================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas?.getContext('2d');
    let animationFrameId;
    let isCanvasActive = true;
    let particles = [];
    const maxParticles = 60;
    
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    if (canvas && ctx) {
        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Track cursor coordinates
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Particle class definition
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Boundary collision check
                if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
                if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

                // Mouse proximity interactive pull
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const distance = Math.hypot(dx, dy);
                    
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x += (dx / distance) * force * 1.2;
                        this.y += (dy / distance) * force * 1.2;
                    }
                }
            }

            draw() {
                const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
                ctx.fillStyle = primaryColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles
        const initParticles = () => {
            particles = [];
            for (let i = 0; i < maxParticles; i++) {
                particles.push(new Particle());
            }
        };

        // Connect particles within proximity using lines
        const drawConnections = () => {
            const primaryColorRGB = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-rgb').trim() || '99, 102, 241';
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < 100) {
                        const alpha = (100 - distance) / 100 * 0.15;
                        ctx.strokeStyle = `rgba(${primaryColorRGB}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Render animation loop
        const animate = () => {
            if (!isCanvasActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawConnections();
            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        // IntersectionObserver optimization: Pause canvas updates when hero is out of screen
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isCanvasActive = entry.isIntersecting;
                if (isCanvasActive) {
                    animate();
                } else {
                    cancelAnimationFrame(animationFrameId);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(document.getElementById('home'));
    }

    // ==========================================================================
    // 5. About Skills Tabs Selection
    // ==========================================================================
    const tabButtons = document.querySelectorAll('.skills-tab-btn');
    const skillPanes = document.querySelectorAll('.skills-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPaneId = `${btn.dataset.tab}-pane`;

            tabButtons.forEach(b => b.classList.remove('active'));
            skillPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(targetPaneId);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // ==========================================================================
    // 6. Project Details Modal / Slide Drawer Manager & Project Database
    // ==========================================================================
    const projectsDatabase = {
        nexthire: {
            title: "NextHire",
            tags: ["Next.js", "Recruitment", "React"],
            image: "assets/nexthire.png",
            desc: "NextHire is a modern hiring and job application platform. It enables companies to post vacancies, manage candidate applications, and streamline the recruitment process. The interface provides a clean, responsive layout for easy navigation.",
            features: [
                "Dynamic job search and listing directory",
                "Responsive candidate application form structure",
                "Dashboard overview for recruitment pipelines",
                "Built-in data state management utilizing React hooks"
            ],
            client: "GitHub Open Source Showcase",
            role: "Lead Developer",
            timeline: "2 Months (2025)",
            tech: ["React", "Next.js", "Tailwind CSS", "JavaScript", "Git"],
            liveLink: "https://github.com/Sahithi-630/NextHire.git",
            codeLink: "https://github.com/Sahithi-630/NextHire.git"
        },
        mayookha_saree_rolling: {
            title: "Mayookha Saree Rolling Center",
            tags: ["HTML/CSS", "Service Booking", "Vanilla JS"],
            image: "assets/mayookha_saree_rolling.png",
            desc: "Mayookha Saree Rolling Center is a custom booking and service showcase catalog application. Built for a local boutique, it lists multiple saree care procedures (rolling, starching, coloring) and provides users with a clean scheduling contact layout.",
            features: [
                "Interactive services price list and catalog descriptions",
                "Appointment scheduling request form with local verification",
                "Highly optimized responsive layout displaying beautifully on mobile screens",
                "Modern glassmorphism elements with clean custom CSS variables"
            ],
            client: "Local Enterprise Collaboration",
            role: "Frontend Developer",
            timeline: "1 Month (2025)",
            tech: ["HTML5", "CSS3", "JavaScript", "Git"],
            liveLink: "https://github.com/Sahithi-630/mayookha_saree_rolling_center.git",
            codeLink: "https://github.com/Sahithi-630/mayookha_saree_rolling_center.git"
        },
        the_cashew_house: {
            title: "The Cashew House",
            tags: ["E-Commerce", "Vanilla JS", "Web App"],
            image: "assets/the_cashew_house.png",
            desc: "The Cashew House is an e-commerce catalog store showcase. It presents information about organic cashews, nut sizing/grades, pricing metrics, and allows visitors to place pre-order queries.",
            features: [
                "Grade sorting selection showcasing cashew qualities (W180 to W400)",
                "Pre-order query form submitting bulk requests",
                "Custom image gallery with smooth transition effects",
                "Interactive product cards featuring details modals"
            ],
            client: "Organic Products Distributor",
            role: "Full-Stack Web Dev",
            timeline: "2 Months (2025)",
            tech: ["HTML5", "CSS3", "JavaScript", "Node.js", "Git"],
            liveLink: "https://github.com/Sahithi-630/The_Cashew_House.git",
            codeLink: "https://github.com/Sahithi-630/The_Cashew_House.git"
        }
    };

    const modalOverlay = document.getElementById('project-details-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalTagsContainer = document.getElementById('modal-tags');
    const modalImage = document.getElementById('modal-image');
    const modalDescFull = document.getElementById('modal-desc-full');
    const modalFeaturesList = document.getElementById('modal-features');
    const modalMetaClient = document.getElementById('modal-meta-client');
    const modalMetaRole = document.getElementById('modal-meta-role');
    const modalMetaTimeline = document.getElementById('modal-meta-timeline');
    const modalMetaTech = document.getElementById('modal-meta-tech');
    const modalLiveLink = document.getElementById('modal-live-link');
    const modalCodeLink = document.getElementById('modal-code-link');

    const openModal = (projectId) => {
        const data = projectsDatabase[projectId];
        if (!data) return;

        // Populate text content
        modalTitle.textContent = data.title;
        modalDescFull.textContent = data.desc;
        modalImage.src = data.image;
        modalImage.alt = `${data.title} Visual Preview`;

        modalMetaClient.textContent = data.client;
        modalMetaRole.textContent = data.role;
        modalMetaTimeline.textContent = data.timeline;

        // Links settings
        modalLiveLink.href = data.liveLink;
        modalCodeLink.href = data.codeLink;

        // Populate Tags (top of modal)
        modalTagsContainer.innerHTML = '';
        data.tags.forEach(t => {
            const span = document.createElement('span');
            span.className = 'project-tag';
            span.textContent = t;
            modalTagsContainer.appendChild(span);
        });

        // Populate Features checklist
        modalFeaturesList.innerHTML = '';
        data.features.forEach(f => {
            const li = document.createElement('li');
            li.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>${f}</span>
            `;
            modalFeaturesList.appendChild(li);
        });

        // Populate Tech Badges
        modalMetaTech.innerHTML = '';
        data.tech.forEach(tech => {
            const badge = document.createElement('span');
            badge.className = 'modal-meta-tech-badge';
            badge.textContent = tech;
            modalMetaTech.appendChild(badge);
        });

        // Reveal modal
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop page scroll
    };

    const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Resume scroll
    };

    // Attach click events to modal triggers
    document.querySelectorAll('.trigger-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = btn.dataset.project;
            if (projectId) openModal(projectId);
        });
    });

    modalCloseBtn?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // ==========================================================================
    // 7. Contact Form Validation & Simulated Submission
    // ==========================================================================
    const contactForm = document.getElementById('portfolio-contact-form');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const successCard = document.getElementById('form-success-card');
    const resetFormBtn = document.getElementById('reset-form-btn');
    
    const fields = {
        name: {
            input: document.getElementById('contact-name'),
            error: document.getElementById('name-error'),
            validate: (val) => val.trim().length > 0
        },
        email: {
            input: document.getElementById('contact-email'),
            error: document.getElementById('email-error'),
            validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        },
        subject: {
            input: document.getElementById('contact-subject'),
            error: document.getElementById('subject-error'),
            validate: (val) => val.trim().length > 0
        },
        message: {
            input: document.getElementById('contact-message'),
            error: document.getElementById('message-error'),
            validate: (val) => val.trim().length >= 10
        }
    };

    const validateField = (fieldName) => {
        const field = fields[fieldName];
        if (!field) return true;

        const isValid = field.validate(field.input.value);
        const parent = field.input.parentElement;

        if (isValid) {
            parent.classList.remove('error');
        } else {
            parent.classList.add('error');
        }

        return isValid;
    };

    // Real-time input hooks
    Object.keys(fields).forEach(key => {
        const field = fields[key];
        
        field.input.addEventListener('input', () => {
            // Validate immediately if it has been flagged as an error before
            if (field.input.parentElement.classList.contains('error')) {
                validateField(key);
            }
        });

        field.input.addEventListener('blur', () => {
            validateField(key);
        });
    });

    // Submit handler
    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        // Perform validation across all inputs
        let isFormValid = true;
        Object.keys(fields).forEach(key => {
            const isFieldValid = validateField(key);
            if (!isFieldValid) isFormValid = false;
        });

        if (isFormValid) {
            // Update submit button to loading state
            const originalText = formSubmitBtn.innerHTML;
            formSubmitBtn.disabled = true;
            formSubmitBtn.innerHTML = '<div class="spinner"></div>';

            // Simulate server network latency
            setTimeout(() => {
                // Reveal success screen overlay
                successCard.classList.add('active');
                
                // Revert submit button
                formSubmitBtn.disabled = false;
                formSubmitBtn.innerHTML = originalText;
                
                // Reset form values
                contactForm.reset();
                Object.values(fields).forEach(field => {
                    field.input.parentElement.classList.remove('error');
                });
            }, 1500);
        }
    });

    // Reset button
    resetFormBtn?.addEventListener('click', () => {
        successCard.classList.remove('active');
    });

    // ==========================================================================
    // 8. Scroll Spy Navigation Highlight
    // ==========================================================================
    const sections = document.querySelectorAll('section');
    const headerElement = document.getElementById('header');

    const highlightNavigation = () => {
        const scrollPosition = window.scrollY + 120; // offset

        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');

            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNavigation);

    // ==========================================================================
    // 9. Back-To-Top Button & Dynamic Footer Date
    // ==========================================================================
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const currentYearSpan = document.getElementById('current-year');

    // Update footer year dynamically
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const toggleScrollTopBtn = () => {
        if (window.scrollY > 500) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.pointerEvents = 'auto';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.pointerEvents = 'none';
        }
    };

    // Initialize display states
    if (scrollTopBtn) {
        scrollTopBtn.style.opacity = '0';
        scrollTopBtn.style.pointerEvents = 'none';
        scrollTopBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        window.addEventListener('scroll', toggleScrollTopBtn);

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
