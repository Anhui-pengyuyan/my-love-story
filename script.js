/**
 * ============================================================================
 * HIGH-PERFORMANCE INTERACTIVE ENGINE (ENTERPRISE EDITION)
 * Core Design Architecture: Modular, Object-Pooled, Hardware-Accelerated
 * Target Devices: iOS Safari & High-Refresh Rate Displays (e.g., iPhone 16 Pro Max)
 * ============================================================================
 */

"use strict";

/**
 * 全局业务与性能常量配置空间
 */
const CONFIG = {
    PASSWORD_KEY: "0719",
    TIMING: {
        OVERLAY_REMOVE_MS: 500,
        BUBBLE_SHOW_MS: 2500,
        PARTICLE_DESTROY_MS: 1400,
        CONFESSION_DELAY_MS: 600,
        FIREWORK_DURATION_MS: 12000,
        FIREWORK_LOOP_INTERVAL_MS: 1200,
        FIREWORK_LOOP_MAX: 5
    },
    OBSERVER: {
        THRESHOLD: 0.2,
        ROOT_MARGIN: "0px 0px -10% 0px",
        STAGGER_DELAY_SEC: 0.15
    },
    PARTICLES: {
        CLICK_SPAWN_COUNT: 6,
        POOL_MAX_SIZE: 30,
        EMOJI_SET: ["❤️", "🌸", "✨"]
    },
    FIREWORKS: {
        PARTICLE_COUNT: 85,
        CORE_BRIGHT_COUNT: 15,
        COLORS: ['#ffffff', '#ffb6c1', '#dda0dd', '#ffd700', '#ff4d4d', '#ff69b4'],
        CORE_COLOR: '#ffffff',
        FRICTION: 0.96,
        GRAVITY: 0.11,
        MIN_DECAY: 0.006,
        MAX_DECAY: 0.008
    }
};

/**
 * 核心微循环状态机
 */
const AppState = {
    isManuallyPaused: false,
    isPageVisible: true,
    modules: {}
};

// ==========================================
// MAIN INITIALIZATION ARCHITECTURE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    init();
});

/**
 * 统一主初始化调度器
 */
function init() {
    // 实例化核心基础模块
    AppState.modules.utilities = new UtilitiesModule();
    AppState.modules.music = new MusicModule();
    AppState.modules.password = new PasswordModule(AppState.modules.music);
    AppState.modules.observer = new ObserverModule();
    AppState.modules.particles = new ClickParticlesModule();
    AppState.modules.birthday = new BirthdayModule();
    AppState.modules.fireworks = new FireworkEngine();

    // 建立全局系统级事件
    initSystemEvents();
}

/**
 * 全局系统环境（如切后台、失焦挂起）监听
 */
function initSystemEvents() {
    document.addEventListener("visibilitychange", () => {
        const isVisible = document.visibilityState === "visible";
        AppState.isPageVisible = isVisible;

        if (!isVisible) {
            // 切后台：全面冻结开销，降温省电
            AppState.modules.music.suspend();
            AppState.modules.fireworks.suspend();
        } else {
            // 切回前台：平滑恢复
            AppState.modules.music.resume();
            AppState.modules.fireworks.resume();
        }
    }, { passive: true });
}

// ==========================================
// MODULE 1: PASSWORD AUTHENTICATION
// ==========================================
class PasswordModule {
    constructor(musicModule) {
        this.musicModule = musicModule;
        this.overlay = document.getElementById("passwordOverlay");
        this.pwdInput = document.getElementById("pwdInput");
        this.pwdBtn = document.getElementById("pwdBtn");

        if (this.overlay) {
            this.bindEvents();
        }
    }

    bindEvents() {
        if (this.pwdBtn) {
            this.pwdBtn.addEventListener("click", () => this.validatePassword(), { passive: true });
        }
        if (this.pwdInput) {
            this.pwdInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.validatePassword();
            }, { passive: true });
        }
    }

    validatePassword() {
        if (this.pwdInput.value === CONFIG.PASSWORD_KEY) {
            this.unlockWebsite();
        } else {
            alert("密码错误，这是专属空间哦~");
            this.pwdInput.value = "";
        }
    }

    unlockWebsite() {
        this.hideOverlay();
        // 解锁后尝试立即激活动态音频
        this.musicModule.play();
    }

    hideOverlay() {
        this.overlay.style.opacity = "0";
        setTimeout(() => {
            this.overlay.remove();
        }, CONFIG.TIMING.OVERLAY_REMOVE_MS);
    }
}

// ==========================================
// MODULE 2: REFINED MUSIC CONTROLLER
// ==========================================
class MusicModule {
    constructor() {
        this.musicBtn = document.getElementById("musicBtn");
        this.audio = document.getElementById("bgMusic");

        if (this.audio && this.musicBtn) {
            this.bindEvents();
        }
    }

    bindEvents() {
        this.musicBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggle();
        }, { passive: true });

        // 针对 iOS Safari 优化：首次触摸解锁全局 AudioContext
        document.addEventListener("touchstart", () => {
            const overlay = document.getElementById("passwordOverlay");
            // 只有当密码框不存在（即已验证通过）且未被手动暂停时，才允许自动续播
            if (this.audio.paused && !AppState.isManuallyPaused && !overlay) {
                this.play();
            }
        }, { once: true, passive: true });
    }

    play() {
        if (this.audio && this.audio.paused) {
            this.audio.play()
                .then(() => this.updateButton(false))
                .catch(() => { /* 捕获 Safari 自动播放拦截机制 */ });
        }
    }

    pause() {
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.updateButton(true);
        }
    }

    toggle() {
        if (this.audio.paused) {
            AppState.isManuallyPaused = false;
            this.play();
        } else {
            AppState.isManuallyPaused = true;
            this.pause();
        }
    }

    suspend() {
        // 因切后台导致的系统级挂起（不破坏用户的自主暂停意愿状态）
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.updateButton(true);
        }
    }

    resume() {
        // 从后台切回，若用户没有手动暂停且当前处于激活视窗，则恢复播放
        if (AppState.isPageVisible && !AppState.isManuallyPaused) {
            this.play();
        }
    }

    updateButton(isPaused) {
        if (isPaused) {
            this.musicBtn.innerText = "🔇";
            this.musicBtn.classList.add("paused");
        } else {
            this.musicBtn.innerText = "🎵";
            this.musicBtn.classList.remove("paused");
        }
    }
}

// ==========================================
// MODULE 3: INTERSECTION OBSERVER PIPELINE
// ==========================================
class ObserverModule {
    constructor() {
        this.pages = document.querySelectorAll(".page");
        if (this.pages.length > 0) {
            this.initObserver();
        }
    }

    initObserver() {
        const options = {
            root: null,
            threshold: CONFIG.OBSERVER.THRESHOLD,
            rootMargin: CONFIG.OBSERVER.ROOT_MARGIN
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => this.handleIntersection(entry));
        }, options);

        this.pages.forEach(page => this.observer.observe(page));
    }

    handleIntersection(entry) {
        if (!entry.isIntersecting) return;

        const content = entry.target.querySelector(".content");
        if (content && !content.classList.contains("visible")) {
            content.classList.add("visible");
            this.staggerChildren(content);
        }
    }

    staggerChildren(content) {
        // 精确流式选择子代元素，降低 DOM 查询范围
        const selectors = [
            '.chapter', '.date', '.subtitle', '.main-title', '.quote', '.story-text p', 
            '.chat-img-wrapper', '.dual-photo-container', '.triple-photo-container', 
            '.jiugongge-container', '.quad-photo-container', '.mosaic-grid-container', 
            '.bullet-list-text p', '.echo-box', '.final-sentence', '.cake-candle-area', 
            '.final-confession'
        ].join(', ');

        const children = content.querySelectorAll(selectors);
        children.forEach((child, index) => {
            child.style.setProperty('--delay-index', index);
            child.classList.add('fade-in-up');
        });
    }
}

// ==========================================
// MODULE 4: HIGH-PERFORMANCE CLICK PARTICLES (OBJECT POOL)
// ==========================================
class ParticlePool {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.pool = [];
    }

    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        const element = document.createElement("div");
        element.className = "romantic-particle";
        return element;
    }

    release(element) {
        if (this.pool.length < this.maxSize) {
            element.remove();
            // 清理脏属性，重置状态以便重复复用
            element.style.cssText = "";
            element.innerHTML = "";
            this.pool.push(element);
        } else {
            element.remove();
        }
    }
}

class ClickParticlesModule {
    constructor() {
        this.pool = new ParticlePool(CONFIG.PARTICLES.POOL_MAX_SIZE);
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener("click", (e) => this.handleClick(e), { passive: true });
    }

    handleClick(e) {
        // 过滤高危功能区，防止按钮点击冲突
        if (e.target.closest("#musicBtn") || e.target.closest(".password-box")) return;

        for (let i = 0; i < CONFIG.PARTICLES.CLICK_SPAWN_COUNT; i++) {
            this.spawnParticle(e.clientX, e.clientY);
        }
    }

    spawnParticle(clientX, clientY) {
        const particle = this.pool.get();
        const emojis = CONFIG.PARTICLES.EMOJI_SET;
        
        particle.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.left = `${clientX}px`;
        particle.style.top = `${clientY}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = 40 + Math.random() * 60;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity - 30; // 微弱向上的浮力抗拉运动

        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        particle.style.setProperty('--rot', `${Math.random() * 360}deg`);
        particle.style.fontSize = `${12 + Math.random() * 14}px`;

        document.body.appendChild(particle);

        setTimeout(() => {
            this.pool.release(particle);
        }, CONFIG.TIMING.PARTICLE_DESTROY_MS);
    }
}

// ==========================================
// MODULE 5: EASTER EGGS & BIRTHDAY INTERACTIONS
// ==========================================
class BirthdayModule {
    constructor() {
        this.westie = document.getElementById("westieDog");
        this.bubble = document.getElementById("bubble");
        
        if (this.westie) {
            this.bindEvents();
        }
    }

    bindEvents() {
        this.westie.addEventListener("click", (e) => {
            e.stopPropagation();
            this.triggerBubble();
        }, { passive: true });
    }

    triggerBubble() {
        this.bubble.classList.add("show");
        setTimeout(() => {
            this.bubble.classList.remove("show");
        }, CONFIG.TIMING.BUBBLE_SHOW_MS);
    }
}

// ==========================================
// MODULE 6: COMPREHENSIVE FIREWORK ENGINE (OOP)
// ==========================================
class FireworkParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 3.5;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.alpha = 1;
        // 残留衰减常数计算
        this.decay = Math.random() * (CONFIG.FIREWORKS.MAX_DECAY - CONFIG.FIREWORKS.MIN_DECAY) + CONFIG.FIREWORKS.MIN_DECAY;
        this.friction = CONFIG.FIREWORKS.FRICTION;
        this.gravity = CONFIG.FIREWORKS.GRAVITY;
        this.radius = Math.random() * 2.5 + 1;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

class FireworkEngine {
    constructor() {
        this.wishButton = document.getElementById('wishButton');
        this.finalConfession = document.getElementById('finalConfession');
        this.canvas = document.getElementById('fireworksCanvas');

        if (!this.wishButton || !this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.loopTimer = null;
        this.isActive = false;

        this.initCanvasSize();
        this.bindEvents();
    }

    initCanvasSize() {
        this.dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.parentElement.offsetWidth * this.dpr;
        this.canvas.height = this.canvas.parentElement.offsetHeight * this.dpr;
        
        // 核心修复：每次尺寸重置彻底抹平累加变形，保持精准超清缩放
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.initCanvasSize(), { passive: true });
        this.wishButton.addEventListener('click', () => this.launchSequence(), { passive: true });
    }

    launchSequence() {
        this.isActive = true;
        this.wishButton.classList.add('activated');

        // 1. 字幕浮现
        setTimeout(() => {
            if (this.finalConfession) {
                this.finalConfession.classList.remove('hidden-confession');
                this.finalConfession.classList.add('show-confession');
            }
        }, CONFIG.TIMING.CONFESSION_DELAY_MS);

        // 2. 启动动画引擎核心主帧
        this.startLoop();

        const w = this.canvas.width / this.dpr;
        const h = this.canvas.height / this.dpr;

        // 3. 多重交错连环绽放
        this.spawnFirework(w / 2, h / 2 - 20);
        setTimeout(() => this.spawnFirework(w * 0.25, h * 0.35), 400);
        setTimeout(() => this.spawnFirework(w * 0.75, h * 0.4), 800);

        let loopCount = 0;
        this.loopTimer = setInterval(() => {
            if (loopCount > CONFIG.TIMING.FIREWORK_LOOP_MAX || !this.isActive) {
                clearInterval(this.loopTimer);
                return;
            }
            const randomX = w * 0.2 + Math.random() * (w * 0.6);
            const randomY = h * 0.22 + Math.random() * (h * 0.28);
            this.spawnFirework(randomX, randomY);
            loopCount++;
        }, CONFIG.TIMING.FIREWORK_LOOP_INTERVAL_MS);

        // 12秒生命周期结束自动平稳自我毁灭
        setTimeout(() => this.destroy(), CONFIG.TIMING.FIREWORK_DURATION_MS);
    }

    spawnFirework(x, y) {
        if (!AppState.isPageVisible) return; // 后台静默状态拒绝创建粒子

        const count = CONFIG.FIREWORKS.PARTICLE_COUNT;
        const colors = CONFIG.FIREWORKS.COLORS;

        for (let i = 0; i < count; i++) {
            const color = i < CONFIG.FIREWORKS.CORE_BRIGHT_COUNT ? CONFIG.FIREWORKS.CORE_COLOR : colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new FireworkParticle(x, y, color));
        }
    }

    startLoop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        
        const render = () => {
            if (!this.isActive) return;

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            this.ctx.fillRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

            this.particles = this.particles.filter(p => p.alpha > 0);
            this.particles.forEach(p => {
                p.update();
                p.draw(this.ctx);
            });

            // 如果当前无存活粒子且已过了循环周期，可平滑中止循环
            if (this.particles.length === 0 && !this.loopTimer) {
                this.stopLoop();
                return;
            }

            this.animationId = requestAnimationFrame(render);
        };

        this.animationId = requestAnimationFrame(render);
    }

    stopLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    suspend() {
        // 切后台挂起
        this.stopLoop();
    }

    resume() {
        // 切回前台恢复
        if (this.isActive && AppState.isPageVisible) {
            this.startLoop();
        }
    }

    destroy() {
        this.isActive = false;
        this.stopLoop();
        if (this.loopTimer) {
            clearInterval(this.loopTimer);
            this.loopTimer = null;
        }
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// ==========================================
// MODULE 7: GENERAL UTILITIES LAYER
// ==========================================
class UtilitiesModule {
    constructor() {
        this.initScrollNavigation();
    }

    initScrollNavigation() {
        // 桥接映射原生 HTML 触发的全局全局调用，保持向后兼容性
        window.scrollToNext = function() {
            const pages = document.querySelectorAll(".page");
            if (pages[1]) {
                pages[1].scrollIntoView({ behavior: "smooth" });
            }
        };
    }
}
