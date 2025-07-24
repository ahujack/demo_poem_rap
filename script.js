// DOM元素
const transformBtn = document.getElementById('transform-btn');
const loading = document.getElementById('loading');
const resultSection = document.getElementById('result-section');
const rapResult = document.getElementById('rap-result');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// 预定义的嘻哈版《静夜思》
const rapLyrics = `
<p class="rap-line">Yo，半夜我醒来 看到月光洒满窗台</p>
<p class="rap-line">一眼望出去 白茫茫像霜覆盖</p>
<p class="rap-line">抬起头仰望 那明月照亮黑夜</p>
<p class="rap-line">低下头沉思 思念远方的家Yeah!</p>
`;

// 初始化Web Audio API
let audioContext;
let beatSequencer;

// 模拟AI处理过程
transformBtn.addEventListener('click', () => {
    // 显示加载动画
    loading.style.display = 'block';
    transformBtn.disabled = true;
    
    // 模拟AI处理延迟
    setTimeout(() => {
        // 隐藏加载动画并显示结果
        loading.style.display = 'none';
        resultSection.style.display = 'block';
        rapResult.innerHTML = rapLyrics;
        transformBtn.disabled = false;
        
        // 添加动画效果
        const lines = document.querySelectorAll('.rap-line');
        lines.forEach((line, index) => {
            line.style.opacity = '0';
            line.style.transform = 'translateY(20px)';
            line.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                line.style.opacity = '1';
                line.style.transform = 'translateY(0)';
            }, index * 800);
        });

        // 处理完成后自动滚动到结果区域
        setTimeout(() => {
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
    }, 2000);
});

// 初始化音频系统
function initAudio() {
    if (audioContext) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    beatSequencer = new BeatSequencer(audioContext);
}

// 播放按钮事件
playBtn.addEventListener('click', () => {
    initAudio();
    beatSequencer.start();
    playBtn.disabled = true;
    stopBtn.disabled = false;
    
    // 添加播放动画效果
    document.querySelectorAll('.rap-line').forEach((line) => {
        line.classList.add('ready-to-animate');
    });
});

// 停止按钮事件
stopBtn.addEventListener('click', () => {
    if (beatSequencer) {
        beatSequencer.stop();
    }
    playBtn.disabled = false;
    stopBtn.disabled = true;
    
    // 移除播放动画
    document.querySelectorAll('.rap-line').forEach((line) => {
        line.classList.remove('ready-to-animate');
        line.classList.remove('highlight');
    });
});

// 标签切换功能
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // 更新按钮状态
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 更新内容显示
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// 初始隐藏结果部分
resultSection.style.display = 'none';
stopBtn.disabled = true;

// 鼓点节奏生成器类
class BeatSequencer {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.isPlaying = false;
        this.tempo = 90; // BPM
        this.nextNoteTime = 0;
        this.current16thNote = 0;
        this.timerWorker = null;
        
        // 嘻哈节奏模式
        this.kickPattern = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0];
        this.snarePattern = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
        this.hihatPattern = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
        
        this.initWorker();
    }
    
    initWorker() {
        // 创建一个离线worker来处理定时
        const workerBlob = new Blob([`
            let timerID = null;
            let interval = 100;
            
            self.onmessage = function(e) {
                if (e.data === "start") {
                    timerID = setInterval(function() { postMessage("tick"); }, interval);
                } else if (e.data.interval) {
                    interval = e.data.interval;
                    if (timerID) {
                        clearInterval(timerID);
                        timerID = setInterval(function() { postMessage("tick"); }, interval);
                    }
                } else if (e.data === "stop") {
                    clearInterval(timerID);
                    timerID = null;
                }
            };
        `], { type: "text/javascript" });
        
        this.timerWorker = new Worker(URL.createObjectURL(workerBlob));
        
        this.timerWorker.onmessage = (e) => {
            if (e.data === "tick") {
                this.scheduler();
            }
        };
        
        this.timerWorker.postMessage({ "interval": 25 });
    }
    
    nextNote() {
        // 计算多久后播放下一个音符
        const secondsPerBeat = 60.0 / this.tempo;
        const secondsPer16thNote = secondsPerBeat / 4;
        
        this.nextNoteTime += secondsPer16thNote;
        this.current16thNote++;
        
        if (this.current16thNote === 16) {
            this.current16thNote = 0;
        }
    }
    
    playDrumSound(time, type) {
        // 创建音源节点
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // 连接节点
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 根据鼓点类型设置参数
        if (type === 'kick') {
            // 模拟低音鼓声音
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(150, time);
            oscillator.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);
            
            gainNode.gain.setValueAtTime(1, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
            
            oscillator.start(time);
            oscillator.stop(time + 0.3);
        } else if (type === 'snare') {
            // 模拟军鼓声音
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(100, time);
            
            gainNode.gain.setValueAtTime(0.7, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            
            // 添加噪音成分
            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(0.5, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            
            oscillator.start(time);
            oscillator.stop(time + 0.2);
            
            // 创建白噪音
            const bufferSize = this.audioContext.sampleRate * 0.2;
            const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioContext.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.connect(noiseGain);
            noiseGain.connect(this.audioContext.destination);
            noise.start(time);
            noise.stop(time + 0.2);
        } else if (type === 'hihat') {
            // 模拟踩镲声音
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, time);
            
            gainNode.gain.setValueAtTime(0.2, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            
            oscillator.start(time);
            oscillator.stop(time + 0.1);
            
            // 添加高频噪音
            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(0.1, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            
            const bufferSize = this.audioContext.sampleRate * 0.1;
            const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const highPassFilter = this.audioContext.createBiquadFilter();
            highPassFilter.type = 'highpass';
            highPassFilter.frequency.setValueAtTime(7000, time);
            
            const noise = this.audioContext.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.connect(highPassFilter);
            highPassFilter.connect(noiseGain);
            noiseGain.connect(this.audioContext.destination);
            noise.start(time);
            noise.stop(time + 0.1);
        }
    }
    
    scheduler() {
        // 安排未来几个音符的播放
        while (this.nextNoteTime < this.audioContext.currentTime + 0.1) {
            // 检查节奏模式并播放相应鼓点
            const currentNote = this.current16thNote;
            
            if (this.kickPattern[currentNote]) {
                this.playDrumSound(this.nextNoteTime, 'kick');
            }
            
            if (this.snarePattern[currentNote]) {
                this.playDrumSound(this.nextNoteTime, 'snare');
            }
            
            if (this.hihatPattern[currentNote]) {
                this.playDrumSound(this.nextNoteTime, 'hihat');
            }
            
            // 突出显示当前的歌词行
            if (currentNote % 4 === 0) {
                const lineIndex = Math.floor(currentNote / 4);
                const lines = document.querySelectorAll('.rap-line');
                
                lines.forEach(line => line.classList.remove('highlight'));
                
                if (lines[lineIndex]) {
                    lines[lineIndex].classList.add('highlight');
                }
            }
            
            this.nextNote();
        }
    }
    
    start() {
        if (this.isPlaying) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isPlaying = true;
        this.current16thNote = 0;
        this.nextNoteTime = this.audioContext.currentTime;
        this.timerWorker.postMessage("start");
        
        // 添加歌词高亮样式
        const style = document.createElement('style');
        style.textContent = `
            .rap-line {
                transition: all 0.2s ease;
            }
            .rap-line.highlight {
                color: #2c7bff;
                transform: scale(1.05);
                font-weight: bold;
                text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
            }
            .rap-line.ready-to-animate {
                position: relative;
            }
            .rap-line.ready-to-animate:before {
                content: '🎵';
                position: absolute;
                left: -20px;
                opacity: 0;
                transition: all 0.3s ease;
            }
            .rap-line.highlight.ready-to-animate:before {
                opacity: 1;
                left: -25px;
            }
        `;
        document.head.appendChild(style);
    }
    
    stop() {
        this.isPlaying = false;
        this.timerWorker.postMessage("stop");
        
        // 移除所有高亮
        const lines = document.querySelectorAll('.rap-line');
        lines.forEach(line => line.classList.remove('highlight'));
    }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 为解释部分添加动画效果
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        // 延迟出现动画
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
        step.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
        }, 500 + index * 300);
    });
    
    // 添加交互式视觉效果
    const modelSteps = document.querySelectorAll('.model-step');
    modelSteps.forEach((step) => {
        step.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        });
        
        step.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.boxShadow = 'none';
        });
    });
}); 