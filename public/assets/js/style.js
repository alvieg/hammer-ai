// ===== Button Tilt + Gradient Glow Effect =====
const buttons = document.querySelectorAll('#sendButton, .toolButton');

for (const button of buttons) {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -20;
        const rotateY = ((x - centerX) / centerX) * 20;

        button.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        button.style.boxShadow = ``

        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        //button.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, #0ea5e9, #0f172a)`;
    });

    button.addEventListener('mouseleave', function () {
        button.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        button.style.boxShadow = '0 4px 6px rgb(14 165 233 / 0.6)';
        button.style.background = '#0ea5e9';
    });
}

// ===== Typing Effect Function (Reusable) =====
function typeTextEffect(element, text, speed = 40) {
    let i = 0;
    element.textContent = '';
    function typeNextChar() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeNextChar, speed);
        }
    }
    typeNextChar();
}

// ===== Typing Effect on Header =====
window.addEventListener('DOMContentLoaded', () => {
    typeTextEffect(document.querySelector('h3'), 'Powered by Groq', 70);
});

// ===== Node Mesh Effect =====
const canvasNode = document.getElementById('canvas1');
const ctxNode = canvasNode.getContext('2d');
canvasNode.width = window.innerWidth;
canvasNode.height = window.innerHeight;

const particles = Array.from({ length: 200 }, () => ({
    x: Math.random() * canvasNode.width,
    y: Math.random() * canvasNode.height,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5
}));

function drawNodeMesh() {
    ctxNode.clearRect(0, 0, canvasNode.width, canvasNode.height);
    for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvasNode.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvasNode.height) p.vy *= -1;

        ctxNode.beginPath();
        ctxNode.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctxNode.fillStyle = '#38bdf8';
        ctxNode.fill();

        for (let q of particles) {
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctxNode.strokeStyle = `rgba(56, 189, 248, ${1 - dist / 120})`;
                ctxNode.beginPath();
                ctxNode.moveTo(p.x, p.y);
                ctxNode.lineTo(q.x, q.y);
                ctxNode.stroke();
            }
        }
    }
    requestAnimationFrame(drawNodeMesh);
}
drawNodeMesh();

// ===== Wave Grid Effect =====
const canvasWave = document.getElementById('canvas2');
const ctxWave = canvasWave.getContext('2d');
canvasWave.width = window.innerWidth;
canvasWave.height = window.innerHeight;

let time = 0;
function drawWaveGrid() {
    ctxWave.clearRect(0, 0, canvasWave.width, canvasWave.height);
    const spacing = 30;
    for (let x = 0; x < canvasWave.width; x += spacing) {
        for (let y = 0; y < canvasWave.height; y += spacing) {
            const dx = x + Math.sin(time + y * 0.05) * 10;
            const dy = y + Math.cos(time + x * 0.05) * 10;
            ctxWave.beginPath();
            ctxWave.arc(dx, dy, 2, 0, Math.PI * 2);
            ctxWave.fillStyle = '#22d3ee';
            ctxWave.fill();
        }
    }
    time += 0.02;
    requestAnimationFrame(drawWaveGrid);
}
drawWaveGrid();

// ===== Canvas Resize (Responsive) =====
function resizeCanvases() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvasNode.width = width;
    canvasNode.height = height;
    canvasWave.width = width;
    canvasWave.height = height;
}

window.addEventListener("load", resizeCanvases);
window.addEventListener("resize", resizeCanvases);
window.addEventListener("orientationchange", resizeCanvases);


