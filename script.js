/**
 * Anniversary Commemorative Website Core Engine
 * Architecture: Modular Framework with Centralized DOM & Event Management
 * Optimization: Fully automated long-page layout adapter (Apple Storytelling Compliant)
 */

// ==========================================
// 1. GLOBAL CONFIGURATION (Magic Numbers)
// ==========================================
const CONFIG = {
    password: "0719",
    passwordFadeOutDuration: 500,
    bubbleHideDelay: 2500,
    
    preloadInitialDelay: 400,
    preloadSubsequentDelay: 150,
    
    observerThreshold: 0.15,
    observerRootMargin: "0px 0px -10% 0px",
    
    // --- 长页面优化与位置校准核心参数 ---
    longPageHeightBuffer: 20,       // 动态判定长页面的像素容错量 (px)
    longPageScrollDuration: 350,     // 智能定位顶部的平滑滚动时间窗 (ms)
    
    particleBurstCount: 6,
    particleFadeDuration: 1400,
    particleVelocityBase: 40,
    particleVelocityRandom: 60,
    particleYDrift: -30,
    particleFontSizeBase: 12,
    particleFontSizeRandom: 14,
    particlePool: ["❤️", "🌸", "✨"],
    
    fireworkColors: ['#ffffff', '#ffb6c1', '#dda0dd', '#ffd700', '#ff4d4d', '#ff69b4'],
    fireworkCoreColorCount: 15,
    fireworkBurstParticleCount: 85,
    fireworkFriction: 0.96,
    fireworkGravity: 0.11,
    fireworkMinDecay: 0.006,
    fireworkDecayRange: 0.008,
    fireworkBaseSpeed: 3.5,
    fireworkSpeedRange: 4,
    fireworkMaxRadius: 2.5,
    fireworkMinRadius: 1,
    fireworkShadowBlur: 10,
    fireworkTrailOpacity: 0.12,
    
    wishConfessionDelay: 600,
    wishSequenceDuration: 12000,
    wishLoopInterval: 1200,
    wishLoopMaxCount: 5
};

// ==========================================
// 2. CENTRALIZED DOM SELECTORS
// ==========================================
const DOM = {
    container: document.querySelector(".scroll-container"),
    pages: Array.from(document.querySelectorAll(".page")),
    musicBtn: document.getElementById("musicBtn"),
    audio: document.getElementById("bgMusic"),
    westie: document.getElementById("westieDog"),
    bubble: document.getElementById("bubble"),
    
    overlay: document.getElementById("passwordOverlay"),
    pwdInput: document.getElementById("pwdInput"),
    pwdBtn: document.getElementById("pwdBtn"),
    
    wishButton: document.getElementById('wishButton'),
    finalConfession: document.getElementById('finalConfession'),
    canvas: document.getElementById('fireworksCanvas')
};

// ==========================================
// 3. APPLICATION MODULES
// ==========================================

/**
 * Password Verification Module
 */
const PasswordModule = (() => {
    function checkPassword() {
        if (!DOM.pwdInput || !DOM.overlay) return;

        if (DOM.pwdInput.value === CONFIG.password) {
            DOM.overlay.style.opacity = "0";
            setTimeout(() => DOM.overlay.remove(), CONFIG.passwordFadeOutDuration);
            AudioModule.playAudioSilently();
        } else {
            alert("密码错误，这是专属空间哦~");
            DOM.pwdInput.value = "";
        }
    }

    function handleKeyPress(e) {
        if (e.key === "Enter") {
            checkPassword();
        }
    }

    function init() {
        if (DOM.pwdBtn) DOM.pwdBtn.addEventListener("click", checkPassword);
        if (DOM.pwdInput) DOM.pwdInput.addEventListener("keypress", handleKeyPress);
    }

    return { init };
})();

/**
 * Audio Control Module
 */
const AudioModule = (() => {
    let manuallyPaused = false;

    function playAudioSilently() {
        if (DOM.audio) {
            DOM.audio.play().catch(() => {});
        }
    }

    function toggleMusic() {
        if (!DOM.audio || !DOM.musicBtn) return;

        if (DOM.audio.paused) {
            manuallyPaused = false;
            DOM.audio.play().catch(() => {});
            DOM.musicBtn.innerText = "🎵";
            DOM.musicBtn.classList.remove("paused");
        } else {
            DOM.audio.pause();
            manuallyPaused = true;
            DOM.musicBtn.innerText = "🔇";
            DOM.musicBtn.classList.add("paused");
        }
    }

    function handleTouchStart() {
        const isOverlayRemoved = !DOM.overlay || DOM.overlay.parentNode === null;
        if (DOM.audio && DOM.audio.paused && !manuallyPaused && isOverlayRemoved) {
            DOM.audio.play().catch(() => {});
        }
    }

    function init() {
        if (DOM.musicBtn) {
            DOM.musicBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleMusic();
            });
        }
        document.addEventListener("touchstart", handleTouchStart, { once: true });
    }

    return { init, playAudioSilently };
})();

/**
 * Page Scroll Navigation Module
 */
const ScrollModule = (() => {
    function scrollToNext() {
        if (DOM.pages[1]) {
            DOM.pages[1].scrollIntoView({ behavior: "smooth" });
        }
    }

    function init() {
        window.scrollToNext = scrollToNext;
    }

    return { init };
})();

/**
 * Image Preloader & Dynamic Layout Detection Module 
 * (Prevents stalling on iOS Safari & Automates long page adaptations)
 */
const ImagePreloaderModule = (() => {
    const preloadedImagesSet = new Set();

    function preloadImage(src) {
        if (!src || preloadedImagesSet.has(src)) return;
        preloadedImagesSet.add(src);

        const imgCache = new Image();
        imgCache.src = src;

        if (typeof imgCache.decode === 'function') {
            imgCache.decode().catch((err) => {
                console.warn(`[Preload Info] Background decoding interrupted: ${src}`, err);
            });
        }
    }

    function preloadPageImages(pageIndex) {
        if (pageIndex < 0 || pageIndex >= DOM.pages.length) return;
        
        const targetPage = DOM.pages[pageIndex];
        const imgs = targetPage.querySelectorAll('img');
        imgs.forEach(img => {
            const src = img.getAttribute('src');
            if (src) preloadImage(src);
        });
    }

    /**
     * 【智能核心机制】动态长页面自动化计算引擎
     * 自动遍历所有页面，实时识别真实高度突破 100vh 的卡片并挂载属性，完全无需手动硬编码 class
     */
    function autoDetectAndLayoutLongPages() {
        const viewportHeight = window.innerHeight;
        
        DOM.pages.forEach(page => {
            const contentNode = page.querySelector('.content') || page;
            // 当页面内部文字或图片的自然渲染高度明显超过当前设备视口高度时
            if (contentNode.scrollHeight > viewportHeight + CONFIG.longPageHeightBuffer) {
                page.setAttribute('data-overflow', 'true'); // 激活特异性 CSS 布局管理
            } else {
                page.removeAttribute('data-overflow');
            }
        });
    }

    function setupInitialLookAhead() {
        if (DOM.pages.length > 2) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    preloadPageImages(2);
                    // 页面及静态资源无损加载后，二次精准校验长页面高度，防止因图未开导致的高度误差
                    autoDetectAndLayoutLongPages();
                }, CONFIG.preloadInitialDelay);
            });
        }
    }

    function init() {
        setupInitialLookAhead();
        // 挂载 resize 监听，完美兼容全面屏虚拟键盘弹出、横竖屏切换及微信头部 UI 缩放
        window.addEventListener('resize', autoDetectAndLayoutLongPages);
        // 初始化时立即执行首次快速判定分类
        autoDetectAndLayoutLongPages();
    }

    return { init, preloadPageImages, autoDetectAndLayoutLongPages };
})();

/**
 * Intersection Observer Module (Triggers entry animations, look-ahead caching & long-page top positioning)
 */
const ObserverModule = (() => {
    const targetSelectors = [
        '.chapter', '.date', '.subtitle', '.main-title', '.quote', '.story-text p', 
        '.chat-img-wrapper', '.dual-photo-container', '.triple-photo-container', 
        '.jiugongge-container', '.quad-photo-container', '.mosaic-grid-container', 
        '.bullet-list-text p', '.echo-box', '.final-sentence', '.cake-candle-area', 
        '.final-confession'
    ].join(', ');

    // 独立控制互斥锁：用于防止自动归位滚动与原生 Scroll Snap 切页手势发生对冲而导致剧类抖动
    let isAutoScrollingLock = false; 

    function triggerStaggeredAnimation(contentBlock) {
        if (contentBlock.classList.contains("visible")) return;
        contentBlock.classList.add("visible");
        
        const children = contentBlock.querySelectorAll(targetSelectors);
        children.forEach((child, index) => {
            child.style.setProperty('--delay-index', index);
            child.classList.add('fade-in-up');
        });
    }

    /**
     * 智能联动流式控制单元
     * 完美整合长页面首帧置顶机制，以及后续图片的预加载缓存
     */
    function handlePageIntersection(currentPage) {
        const currentIndex = DOM.pages.indexOf(currentPage);
        if (currentIndex === -1) return;

        // 当检测到该切入视口的页面属于高度超长的页面时，强制其内部视口一键回顶呈现首句
        if (currentPage.getAttribute('data-overflow') === 'true' && !isAutoScrollingLock) {
            isAutoScrollingLock = true;
            
            // 采用毫秒级极速帧回调函数，贴合 120Hz 高刷新率，杜绝闪烁和白屏
            requestAnimationFrame(() => {
                currentPage.scrollTo({
                    top: 0,
                    behavior: 'smooth' // 硬件加速级的 Apple 式优雅回弹归位
                });
                
                // 完成纠偏，并在 350ms 黄金滚动动画窗口结束后台释放独立互斥锁
                setTimeout(() => {
                    isAutoScrollingLock = false;
                }, CONFIG.longPageScrollDuration);
            });
        }

        requestAnimationFrame(() => {
            ImagePreloaderModule.preloadPageImages(currentIndex + 1);
            setTimeout(() => {
                ImagePreloaderModule.preloadPageImages(currentIndex + 2);
            }, CONFIG.preloadSubsequentDelay);
        });
    }

    function init() {
        const observerOptions = {
            root: null,
            threshold: CONFIG.observerThreshold,
            rootMargin: CONFIG.observerRootMargin
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentPage = entry.target;
                    handlePageIntersection(currentPage);

                    const content = currentPage.querySelector(".content");
                    if (content) triggerStaggeredAnimation(content);
                }
            });
        }, observerOptions);

        DOM.pages.forEach(page => observer.observe(page));
    }

    return { init };
})();

/**
 * Click Particle Burst Module
 */
const ParticleModule = (() => {
    function createParticleElement(clientX, clientY) {
        const particle = document.createElement("div");
        particle.className = "romantic-particle";
        particle.innerHTML = CONFIG.particlePool[Math.floor(Math.random() * CONFIG.particlePool.length)];
        
        particle.style.left = clientX + "px";
        particle.style.top = clientY + "px";
        particle.style.fontSize = CONFIG.particleFontSizeBase + Math.random() * CONFIG.particleFontSizeRandom + "px";
        
        return particle;
    }

    function applyParticleTrajectory(particle) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = CONFIG.particleVelocityBase + Math.random() * CONFIG.particleVelocityRandom;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity + CONFIG.particleYDrift;
        
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        particle.style.setProperty('--rot', `${Math.random() * 360}deg`);
    }

    function spawnBurst(e) {
        if (e.target.closest("#musicBtn") || e.target.closest(".password-box")) return;

        for (let i = 0; i < CONFIG.particleBurstCount; i++) {
            const particle = createParticleElement(e.clientX, e.clientY);
            applyParticleTrajectory(particle);
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), CONFIG.particleFadeDuration);
        }
    }

    function triggerWestieEasterEgg(e) {
        if (!DOM.bubble) return;
        e.stopPropagation();
        DOM.bubble.classList.add("show");
        setTimeout(() => DOM.bubble.classList.remove("show"), CONFIG.bubbleHideDelay);
    }

    function init() {
        document.addEventListener("click", spawnBurst);
        if (DOM.westie) {
            DOM.westie.addEventListener("click", triggerWestieEasterEgg);
        }
    }

    return { init };
})();

/**
 * Fireworks Mechanics Engine (Canvas Operations)
 */
const FireworkModule = (() => {
    let ctx = null;
    let particles = [];
    let animationId = null;

    class FireworkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * CONFIG.fireworkSpeedRange + CONFIG.fireworkBaseSpeed;
            
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.alpha = 1;
            this.decay = Math.random() * CONFIG.fireworkDecayRange + CONFIG.fireworkMinDecay;
            this.friction = CONFIG.fireworkFriction;
            this.gravity = CONFIG.fireworkGravity;
            this.radius = Math.random() * CONFIG.fireworkMaxRadius + CONFIG.fireworkMinRadius;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = CONFIG.fireworkShadowBlur;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.restore();
        }

        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }
    }

    function resizeCanvas() {
        if (!DOM.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        DOM.canvas.width = DOM.canvas.parentElement.offsetWidth * dpr;
        DOM.canvas.height = DOM.canvas.parentElement.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
    }

    function getCanvasDimensions() {
        const dpr = window.devicePixelRatio || 1;
        return {
            w: DOM.canvas.width / dpr,
            h: DOM.canvas.height / dpr
        };
    }

    function spawnFirework(x, y) {
        for (let i = 0; i < CONFIG.fireworkBurstParticleCount; i++) {
            const color = i < CONFIG.fireworkCoreColorCount 
                ? '#ffffff' 
                : CONFIG.fireworkColors[Math.floor(Math.random() * CONFIG.fireworkColors.length)];
            particles.push(new FireworkParticle(x, y, color));
        }
    }

    function renderLoop() {
        const dim = getCanvasDimensions();
        ctx.fillStyle = `rgba(0, 0, 0, ${CONFIG.fireworkTrailOpacity})`;
        ctx.fillRect(0, 0, dim.w, dim.h);

        particles = particles.filter(p => p.alpha > 0);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animationId = requestAnimationFrame(renderLoop);
    }

    function stopEngine() {
        cancelAnimationFrame(animationId);
        const dim = getCanvasDimensions();
        ctx.clearRect(0, 0, dim.w, dim.h);
        particles = [];
    }

    function init() {
        if (!DOM.canvas) return;
        ctx = DOM.canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    return { init, spawnFirework, renderLoop, stopEngine, getCanvasDimensions };
})();

/**
 * Birthday Wish Trigger Module
 */
const WishModule = (() => {
    let sequenceTimer = null;

    function runShow() {
        if (!DOM.wishButton) return;
        DOM.wishButton.classList.add('activated');
        
        setTimeout(() => {
            if (DOM.finalConfession) {
                DOM.finalConfession.classList.remove('hidden-confession');
                DOM.finalConfession.classList.add('show-confession');
            }
        }, CONFIG.wishConfessionDelay);

        FireworkModule.renderLoop();

        const dim = FireworkModule.getCanvasDimensions();
        
        // Initial bursts
        FireworkModule.spawnFirework(dim.w / 2, dim.h / 2 - 20);
        setTimeout(() => FireworkModule.spawnFirework(dim.w * 0.25, dim.h * 0.35), 400);
        setTimeout(() => FireworkModule.spawnFirework(dim.w * 0.75, dim.h * 0.4), 800);

        // Staggered loop
        let loopCount = 0;
        sequenceTimer = setInterval(() => {
            if (loopCount > CONFIG.wishLoopMaxCount) {
                clearInterval(sequenceTimer);
                return;
            }
            const randomX = dim.w * 0.2 + Math.random() * (dim.w * 0.6);
            const randomY = dim.h * 0.22 + Math.random() * (dim.h * 0.28);
            FireworkModule.spawnFirework(randomX, randomY);
            loopCount++;
        }, CONFIG.wishLoopInterval);
        
        // System teardown to save memory & battery
        setTimeout(() => {
            clearInterval(sequenceTimer);
            FireworkModule.stopEngine();
        }, CONFIG.wishSequenceDuration);
    }

    function init() {
        if (DOM.wishButton) {
            DOM.wishButton.addEventListener('click', runShow);
        }
    }

    return { init };
})();

// ==========================================
// 4. MAIN INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    PasswordModule.init();
    AudioModule.init();
    ScrollModule.init();
    ImagePreloaderModule.init(); // 包含动态长页面识别计算核心
    ObserverModule.init();       // 包含动态高刷位置校正与手势解耦核心
    ParticleModule.init();
    FireworkModule.init();
    WishModule.init();
});
