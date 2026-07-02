document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".scroll-container");
    const pages = document.querySelectorAll(".page");
    const musicBtn = document.getElementById("musicBtn");
    const audio = document.getElementById("bgMusic");
    const westie = document.getElementById("westieDog");
    const bubble = document.getElementById("bubble");
    
    // 密码层验证
    const overlay = document.getElementById("passwordOverlay");
    const pwdInput = document.getElementById("pwdInput");
    const pwdBtn = document.getElementById("pwdBtn");

    if (pwdBtn) pwdBtn.addEventListener("click", checkPassword);
    if (pwdInput) {
        pwdInput.addEventListener("keypress", (e) => { if(e.key === "Enter") checkPassword(); });
    }

    function checkPassword() {
        if (pwdInput.value === "0719") {
            overlay.style.opacity = "0";
            setTimeout(() => overlay.remove(), 500);
            // 尝试自动播放音乐
            audio.play().catch(() => {});
        } else {
            alert("密码错误，这是专属空间哦~");
            pwdInput.value = "";
        }
    }

    // 页面滚动导航
    window.scrollToNext = function() {
        if (pages[1]) {
            pages[1].scrollIntoView({ behavior: "smooth" });
        }
    };

    // 极其平滑的动态淡入核心：逐行有序浮现
    const observerOptions = {
        root: null,
        threshold: 0.2, // 哪怕长页面只露出一部分，也能提前准备好动画
        rootMargin: "0px 0px -10% 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const content = entry.target.querySelector(".content");
                if (content && !content.classList.contains("visible")) {
                    content.classList.add("visible");
                    
                    // 内部元素流式延迟出场
                    const children = content.querySelectorAll('.chapter, .date, .subtitle, .main-title, .quote, .story-text p, .chat-img-wrapper, .dual-photo-container, .triple-photo-container, .jiugongge-container, .quad-photo-container, .mosaic-grid-container, .bullet-list-text p, .echo-box, .final-sentence, .cake-candle-area, .final-confession');
                    children.forEach((child, index) => {
                        child.style.setProperty('--delay-index', index);
                        child.classList.add('fade-in-up');
                    });
                }
            }
        });
    }, observerOptions);

    pages.forEach(page => observer.observe(page));

    // 西高地小狗彩蛋
    if (westie) {
        westie.addEventListener("click", (e) => {
            e.stopPropagation();
            bubble.classList.add("show");
            setTimeout(() => bubble.classList.remove("show"), 2500);
        });
    }

    // ==========================================
    // 升级版：全屏浪漫粒子爆裂喷泉特效
    // ==========================================
    document.addEventListener("click", (e) => {
        // 过滤掉音乐按钮和密码框
        if (e.target.closest("#musicBtn") || e.target.closest(".password-box")) return;

        // 每次点击，一口气爆发出 6 颗不同方向、不同大小的微光爱心/樱花
        const particles = ["❤️", "🌸", "✨"];
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement("div");
            particle.className = "romantic-particle";
            
            // 随机选择样式
            particle.innerHTML = particles[Math.floor(Math.random() * particles.length)];
            
            // 初始核心位置
            particle.style.left = e.clientX + "px";
            particle.style.top = e.clientY + "px";
            
            // 利用 CSS 变量随机分发每颗粒子的飞散方向和距离
            const angle = Math.random() * Math.PI * 2;
            const velocity = 40 + Math.random() * 60; // 爆炸开的速度
            const x = Math.cos(angle) * velocity;
            const y = Math.sin(angle) * velocity - 30; // 顺便带有一点往上漂的感觉
            
            particle.style.setProperty('--x', `${x}px`);
            particle.style.setProperty('--y', `${y}px`);
            particle.style.setProperty('--rot', `${Math.random() * 360}deg`);
            particle.style.fontSize = 12 + Math.random() * 14 + "px"; // 错落有致的大小

            document.body.appendChild(particle);
            
            // 动画播完自动销毁，极省内存
            setTimeout(() => particle.remove(), 1400);
        }
    });

    // 音乐播放控制
    let manuallyPaused = false;
    function toggleMusic() {
        if (audio.paused) {
            manuallyPaused = false;
            audio.play().catch(() => {});
            musicBtn.innerText = "🎵";
            musicBtn.classList.remove("paused");
        } else {
            audio.pause();
            manuallyPaused = true;
            musicBtn.innerText = "🔇";
            musicBtn.classList.add("paused");
        }
    }

    if (musicBtn) {
        musicBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMusic();
        });
    }

    // 适配移动端首次触摸屏幕触发音频
    document.addEventListener("touchstart", () => {
        if (audio && audio.paused && !manuallyPaused && (!overlay || overlay.parentNode === null)) {
            audio.play().catch(() => {});
        }
    }, { once: true });

    // ==========================================
    // 终极彩蛋：高端流星垂柳烟花引擎（16 Pro Max 专属丝滑版）
    // ==========================================
    const wishButton = document.getElementById('wishButton');
    const finalConfession = document.getElementById('finalConfession');
    const canvas = document.getElementById('fireworksCanvas');

    if (wishButton && canvas) {
        const ctx = canvas.getContext('2d');
        let fireworkParticles = [];
        let fireworksAnimationId = null;
        let fireworkLoopTimer = null;

        // 自适应高刷屏分辨率，保持超清抗锯齿
        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.parentElement.offsetWidth * dpr;
            canvas.height = canvas.parentElement.offsetHeight * dpr;
            ctx.scale(dpr, dpr);
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 高级流星垂柳粒子类定义
        class LuxuryParticle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                
                // 圆周辐射速度
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 3.5; // 扩大爆炸初始张力
                
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                
                this.alpha = 1;
                this.decay = Math.random() * 0.008 + 0.006; // 完美延长生命周期，让绽放变长
                this.friction = 0.96; // 空气阻力（产生从快到慢的拟真感）
                this.gravity = 0.11;  // 注入灵魂的垂柳下坠重力
                
                this.radius = Math.random() * 2.5 + 1;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                
                // 原生 Canvas 霓虹微发光滤镜
                ctx.shadowBlur = 10;
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

        // 释放一发绚丽莫兰迪烟花
        function launchLuxuryFirework(x, y) {
            // 选用极具高级感的专属浪漫配色：白金、玫瑰粉、极光紫、香槟金、心动红
            const luxuryColors = ['#ffffff', '#ffb6c1', '#dda0dd', '#ffd700', '#ff4d4d', '#ff69b4'];
            const count = 85; // 密度翻倍，视觉更加立体丰满

            for (let i = 0; i < count; i++) {
                // 核心前 15 颗粒子强制为白金光芒，模拟现实火药炸开瞬间的核心极亮
                const color = i < 15 ? '#ffffff' : luxuryColors[Math.floor(Math.random() * luxuryColors.length)];
                fireworkParticles.push(new LuxuryParticle(x, y, color));
            }
        }

        // 核心渲染循环（流星拖尾残影的核心）
        function renderFireworks() {
            // 通过覆盖半透明黑色层，让上一帧的粒子轨迹化为梦幻拖尾
            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

            fireworkParticles = fireworkParticles.filter(p => p.alpha > 0);
            fireworkParticles.forEach(p => {
                p.update();
                p.draw();
            });

            fireworksAnimationId = requestAnimationFrame(renderFireworks);
        }

        // 点击许愿按钮触发终极浪漫
        wishButton.addEventListener('click', () => {
            wishButton.classList.add('activated');
            
            // 1. 让锁定的终极表白和烟花交织在一起缓缓浮现
            setTimeout(() => {
                if (finalConfession) {
                    finalConfession.classList.remove('hidden-confession');
                    finalConfession.classList.add('show-confession');
                }
            }, 600);

            // 2. 启动 Canvas 主引擎
            renderFireworks();

            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);

            // 3. 【连环花火交力秀】开始运转
            // 第一波：屏幕正中央主花火盛大绽放
            launchLuxuryFirework(w / 2, h / 2 - 20);

            // 第二波：左上角、右上角高空错落接力绽放
            setTimeout(() => launchLuxuryFirework(w * 0.25, h * 0.35), 400);
            setTimeout(() => launchLuxuryFirework(w * 0.75, h * 0.4), 800);

            // 第三波：夜空随机接力大秀，持续 8 秒，每 1.2 秒自动诞生一发浪漫
            let loopCount = 0;
            fireworkLoopTimer = setInterval(() => {
                if (loopCount > 5) {
                    clearInterval(fireworkLoopTimer);
                    return;
                }
                const randomX = w * 0.2 + Math.random() * (w * 0.6);
                const randomY = h * 0.22 + Math.random() * (h * 0.28);
                launchLuxuryFirework(randomX, randomY);
                loopCount++;
            }, 1200);
            
            // 12 秒后花火完全熄灭平稳静止，不吃后台内存与电量
            setTimeout(() => {
                cancelAnimationFrame(fireworksAnimationId);
                clearInterval(fireworkLoopTimer);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }, 12000);
        });
    }
});
