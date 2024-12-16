// 获取元素
const overlay = document.getElementById('overlay');
const introVideo = document.getElementById('intro-video');
const toplay = document.getElementById('toplay');
const logo = document.querySelector('.logo');

// Blob animation code
function createBlob(options) {
    var points = [];
    var path = options.element;
    var slice = Math.PI * 2 / options.numPoints;
    var startAngle = Math.random() * Math.PI * 2;
    var tl = gsap.timeline({
        onUpdate: update,
    });

    for (var i = 0; i < options.numPoints; i++) {
        var angle = startAngle + i * slice;
        var duration = gsap.utils.random(options.minDuration, options.maxDuration);
        
        // 使用自定义函数计算半径，创造更扁平的形状
        var radius = calculateRadius(angle, options.minRadius, options.maxRadius);
        
        var point = {
            x: options.centerX + Math.cos(angle) * radius,
            y: options.centerY + Math.sin(angle) * radius
        };

        // 动画目标也使用calculateRadius来保持形状一致
        var targetRadius = calculateRadius(angle, options.maxRadius * 0.9, options.maxRadius);
        
        tl.to(point, {
            x: options.centerX + Math.cos(angle) * targetRadius,
            y: options.centerY + Math.sin(angle) * targetRadius,
            duration: duration,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        }, -gsap.utils.random(options.maxDuration));

        points.push(point);
    }

    // 自定义半径计算函数
    function calculateRadius(angle, minRadius, maxRadius) {
        // 可以根据角度添加不同的变化
        // 例如：创建星形
        var frequency = 5; // 控制凸起的数量
        var amplitude = (maxRadius - minRadius) / 2;
        var baseRadius = (maxRadius + minRadius) / 2;
        
        return baseRadius + Math.sin(angle * frequency) * amplitude;
    }
    

    options.tl = tl;
    options.points = points;

    tl.progress(1).progress(0).timeScale(0);
    update();

    function update() {
        path.setAttribute('d', cardinal(points, true, 1));
    }

    return options;
}

function cardinal(data, closed, tension) {
    if (data.length < 1) return 'M0 0';
    if (tension == null) tension = 1;
    var size = data.length - (closed ? 0 : 1);
    var path = 'M' + data[0].x + ' ' + data[0].y + ' C';

    for (var i = 0; i < size; i++) {
        var p0, p1, p2, p3;
        if (closed) {
            p0 = data[(i - 1 + size) % size];
            p1 = data[i % size];
            p2 = data[(i + 1) % size];
            p3 = data[(i + 2) % size];
        } else {
            p0 = i === 0 ? data[0] : data[i - 1];
            p1 = data[i];
            p2 = data[i + 1];
            p3 = i === size - 1 ? p2 : data[i + 2];
        }

        var x1 = p1.x + (p2.x - p0.x) / 6 * tension;
        var y1 = p1.y + (p2.y - p0.y) / 6 * tension;
        var x2 = p2.x - (p3.x - p1.x) / 6 * tension;
        var y2 = p2.y - (p3.y - p1.y) / 6 * tension;
        path += ' ' + x1 + ' ' + y1 + ' ' + x2 + ' ' + y2 + ' ' + p2.x + ' ' + p2.y;
    }

    return closed ? path + 'z' : path;
}

// Initialize blob animation
function initBlob() {
    var blob = createBlob({
        element: document.querySelector('#blob-mask-path'),
        numPoints: 12,
        centerX: 0,
        centerY: 0,
        minRadius: 300,
        maxRadius: 450,
        minDuration: 0.5,
        maxDuration: 1.2
    });

    var pos = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };

    var mouse = {
        x: pos.x,
        y: pos.y
    };

    var speed = 0.1;
    var xSet = gsap.quickSetter('#blob-mask-path', 'x', 'px');
    var ySet = gsap.quickSetter('#blob-mask-path', 'y', 'px');

    window.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    gsap.ticker.add(function() {
        var dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());
        pos.x += (mouse.x - pos.x) * dt;
        pos.y += (mouse.y - pos.y) * dt;
        xSet(pos.x);
        ySet(pos.y);
    });

    // blob波浪线波动速率
    gsap.to(blob.tl, {
        timeScale: 1.6,
        duration: 0.3,
        ease: 'power1.inOut'
    });

    return blob;
}

// 控制蒙版显示的函数
function showOverlay() {
    toplay.style.display = 'block';
    overlay.style.display = 'block';
    
    gsap.to(toplay, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
            initBlob();
            introVideo.play();
        }
    });
    
    gsap.to(overlay, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
    });
}

// 控制蒙版隐藏的函数
function hideOverlay() {

    // 主体缩放动画
    gsap.to([toplay, overlay], {
        scale: 1.1,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
        stagger: 0.1
    });

    // Logo动画
    gsap.to(logo, {
        top: '0',
        left: '0',
        fontSize: '1.5rem',
        color: '#000',
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
            logo.classList.remove('init-play-path');
        }
    });

    setTimeout(() => {
        toplay.style.display = 'none';
        overlay.style.display = 'none';
        gsap.set([toplay, overlay], { scale: 1, opacity: 0 });
        introVideo.pause();
        introVideo.currentTime = 0;
        
        // 确保类被移除
        if (logo.classList.contains('init-play-path')) {
            console.log('Warning: init-play-path still present after timeout');
            logo.classList.remove('init-play-path');
        }
    }, 1000);
}

// 页面加载完成时显示蒙版和播放视频
document.addEventListener('DOMContentLoaded', () => {
    showOverlay();
    setTimeout(hideOverlay, 4000);
});