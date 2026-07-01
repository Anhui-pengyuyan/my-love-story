// 放在 script.js 的最开头
const password = prompt("请输入今天的小寿星的生日（4位数字例如1212）：");
if (password !== "0719") { // 比如我的生日日期 0701
    alert("密码错误，这是属于宝宝的专属秘密基地哦~");
    document.body.innerHTML = "<h1 style='color:white;text-align:center;margin-top:40dvh;'>未授权访问</h1>";
}
document.addEventListener("DOMContentLoaded", () => {
    
    const container = document.querySelector('.scroll-container');
    const pages = document.querySelectorAll('.page');
    const musicBtn = document.getElementById('musicBtn');
    const audio = document.getElementById('bgMusic');
    const westie = document.getElementById('westieDog');
    const bubble = document.getElementById('bubble');

    let manuallyPaused = false;

    // 1. 按钮点击平滑滚动到指定页
    window.scrollToPage = function(index) {
        if(pages[index]) {
            pages[index].scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 2. 利用 IntersectionObserver 监听页面进入视口，触发淡入动画
    const observerOptions = {
        root: container,
        threshold: 0.5 // 当页面露出一半以上时激活
    };

    const pageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    pages.forEach(page => pageObserver.observe(page));

    // 3. 西高地点击彩蛋
    if (westie) {
        westie.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止触发全局点击落心
            bubble.classList.add('show');
            setTimeout(() => {
                bubble.classList.remove('show');
            }, 2500);
        });
    }

    // 4. 全屏点击生成漂浮红心
    document.addEventListener('click', (e) => {
        // 如果点到的是音乐按钮则不生成心
        if (e.target.id === 'musicBtn') return;

        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤️';
        // 居中校准
        heart.style.left = `${e.clientX - 11}px`;
        heart.style.top = `${e.clientY - 11}px`;
        
        document.body.appendChild(heart);

        // 动画结束后销毁
        setTimeout(() => {
            heart.remove();
        }, 1200);
    });

    // 5. 音乐控制逻辑（兼顾 iOS 隐私安全限制）
    function playAudio() {
        audio.play().then(() => {
            musicBtn.innerText = '🎵';
        }).catch(err => {
            console.log("等待用户交互以播放音频");
        });
    }

    function toggleMusic() {
        if (audio.paused) {
            manuallyPaused = false;
            playAudio();
        } else {
            audio.pause();
            manuallyPaused = true;
            musicBtn.innerText = '🔇';
        }
    }

    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
    });

    // 突破 iOS Safari 限制：用户第一次触摸屏幕任意地方时，悄悄唤醒音乐
    document.addEventListener('touchstart', () => {
        if (audio.paused && !manuallyPaused) {
            playAudio();
        }
    }, { once: true });

    // 默认触发第一页激活
    if(pages[0]) pages[0].classList.add('active');
});