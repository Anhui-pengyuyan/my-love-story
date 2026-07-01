const password = prompt("请输入生日密码（4位数字）：");

if (password !== "0719") {
    alert("密码错误，这是专属空间");
    document.body.innerHTML = "<h1 style='color:white;text-align:center;margin-top:40vh;'>未授权访问</h1>";
}

document.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector(".scroll-container");
    const pages = document.querySelectorAll(".page");
    const musicBtn = document.getElementById("musicBtn");
    const audio = document.getElementById("bgMusic");
    const westie = document.getElementById("westieDog");
    const bubble = document.getElementById("bubble");

    let manuallyPaused = false;

    // =========================
    // 页面滚动
    // =========================
    window.scrollToPage = function(index) {
        if (pages[index]) {
            pages[index].scrollIntoView({ behavior: "smooth" });
        }
    };

    // =========================
    // ⭐ 核心：稳定页面动画系统
    // =========================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const page = entry.target;

            if (entry.isIntersecting) {
                activatePage(page);
            } else {
                page.classList.remove("active");
            }
        });
    }, {
        root: container,
        threshold: 0.6
    });

    pages.forEach(page => observer.observe(page));

    function activatePage(page) {
        if (page.dataset.done === "1") return;

        page.classList.add("active");
        runAnimation(page);
        page.dataset.done = "1";
    }

    function runAnimation(page) {
        const items = page.querySelectorAll(`
            .subtitle,
            .main-title,
            .quote,
            .chapter,
            .date,
            .story-text p,
            .highlight
        `);

        items.forEach((el, i) => {
            el.style.opacity = 0;
            el.style.transform = "translateY(10px)";

            setTimeout(() => {
                el.style.transition = "0.6s ease";
                el.style.opacity = 1;
                el.style.transform = "translateY(0)";
            }, i * 160);
        });
    }

    // =========================
    // 西高地彩蛋
    // =========================
    if (westie) {
        westie.addEventListener("click", (e) => {
            e.stopPropagation();
            bubble.classList.add("show");
            setTimeout(() => bubble.classList.remove("show"), 2000);
        });
    }

    // =========================
    // 点击心
    // =========================
    document.addEventListener("click", (e) => {
        if (e.target.id === "musicBtn") return;

        const heart = document.createElement("div");
        heart.className = "heart";
        heart.innerHTML = "❤️";
        heart.style.left = e.clientX + "px";
        heart.style.top = e.clientY + "px";

        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
    });

    // =========================
    // 音乐控制
    // =========================
    function playAudio() {
        audio.play().catch(() => {});
    }

    function toggleMusic() {
        if (audio.paused) {
            manuallyPaused = false;
            playAudio();
            musicBtn.innerText = "🎵";
        } else {
            audio.pause();
            manuallyPaused = true;
            musicBtn.innerText = "🔇";
        }
    }

    musicBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMusic();
    });

    document.addEventListener("touchstart", () => {
        if (audio.paused && !manuallyPaused) {
            playAudio();
        }
    }, { once: true });

    if (pages[0]) pages[0].classList.add("active");
});
