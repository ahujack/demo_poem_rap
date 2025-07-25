// DOM元素
const transformBtn = document.getElementById('transform-btn');
const loading = document.getElementById('loading');
const resultSection = document.getElementById('result-section');
const rapResult = document.getElementById('rap-result');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const poemBox = document.getElementById('poem-box');
const magicVisualization = document.getElementById('magic-visualization');
const poemBtns = document.querySelectorAll('.poem-btn');

// 后端API地址
const API_BASE_URL = 'http://localhost:3000/api';

// 转换状态
let transformState = 0; // 0-未开始, 1-理解古诗, 2-学习嘻哈, 3-创意重组, 4-魔法呈现, 5-完成
let isGeneratingMusic = false; // 是否正在生成音乐

// 古诗数据
const poems = {
    jingye: {
        title: "《静夜思》 - 李白",
        content: `<p>床前明月光，</p>
                <p>疑是地上霜。</p>
                <p>举头望明月，</p>
                <p>低头思故乡。</p>`,
        rap: null // 将通过API获取
    },
    chun: {
        title: "《春晓》 - 孟浩然",
        content: `<p>春眠不觉晓，</p>
                <p>处处闻啼鸟。</p>
                <p>夜来风雨声，</p>
                <p>花落知多少。</p>`,
        rap: null // 将通过API获取
    },
    lijiang: {
        title: "《望庐山瀑布》 - 李白",
        content: `<p>日照香炉生紫烟，</p>
                <p>遥看瀑布挂前川。</p>
                <p>飞流直下三千尺，</p>
                <p>疑是银河落九天。</p>`,
        rap: null // 将通过API获取
    }
};

// 当前选中的诗
let currentPoem = 'jingye';

// 初始化Web Audio API
let audioContext;
let beatSequencer;
let audioElement = null; // 用于播放生成的音乐

// 诗歌选择器事件
poemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const poemId = btn.getAttribute('data-poem');
        
        // 更新按钮状态
        poemBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 更新显示的诗歌
        currentPoem = poemId;
        poemBox.innerHTML = `<h3>${poems[poemId].title}</h3>${poems[poemId].content}`;
        
        // 重置转换结果
        resultSection.style.display = 'none';
        magicVisualization.style.display = 'none';
        resetTransformation();
    });
});

// 重置转换状态
function resetTransformation() {
    transformState = 0;
    const magicSteps = document.querySelectorAll('.magic-step');
    magicSteps.forEach(step => {
        step.classList.remove('visible');
        step.classList.remove('active');
    });
}

// 通过后端API转换古诗为Rap
async function transformPoemToRap(poemText, poemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/transform-poem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ poem: poemText, poemId })
        });
        
        const data = await response.json();
        if (data.success && data.rap) {
            // 将返回的文本转换为HTML格式
            const rapHtml = data.rap.split('\n')
                .filter(line => line.trim() !== '')
                .map(line => `<p class="rap-line">${line}</p>`)
                .join('\n');
            return rapHtml;
        } else {
            throw new Error(data.error || '获取Rap版本失败');
        }
    } catch (error) {
        console.error('调用转换API失败:', error);
        // 使用预设的备用歌词
        return getFallbackRap(poemId);
    }
}

// 获取预设的备用Rap歌词
function getFallbackRap(poemId) {
    const fallbackRaps = {
        jingye: `<p class="rap-line">Yo，半夜我醒来 看到月光洒满窗台</p>
                <p class="rap-line">一眼望出去 白茫茫像霜覆盖</p>
                <p class="rap-line">抬起头仰望 那明月照亮黑夜</p>
                <p class="rap-line">低下头沉思 思念远方的家Yeah!</p>`,
        chun: `<p class="rap-line">春天的睡眠太舒适 不知不觉天已亮</p>
                <p class="rap-line">听听四周小鸟唱 叽叽喳喳把春报上</p>
                <p class="rap-line">昨夜风雨声不断 敲打窗户整晚响</p>
                <p class="rap-line">美丽的花儿凋落了 数也数不清多少Yeah!</p>`,
        lijiang: `<p class="rap-line">太阳照耀香炉峰 紫色的烟雾缥缥缈缈</p>
                <p class="rap-line">远远望去那瀑布 挂在山前像条白绸带</p>
                <p class="rap-line">水流飞奔向下冲 足足三千尺的高度</p>
                <p class="rap-line">看上去就像银河 从九重天上落到人间Yeah!</p>`
    };
    return fallbackRaps[poemId] || fallbackRaps.jingye;
}

// 通过后端API生成音乐
async function generateMusic(lyrics) {
    try {
        // 从Rap歌词中提取纯文本
        const lyricsText = lyrics.replace(/<[^>]*>/g, '');
        
        const response = await fetch(`${API_BASE_URL}/generate-music`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lyrics: lyricsText })
        });
        
        const data = await response.json();
        if (data.success && data.musicUrl) {
            return data.musicUrl;
        } else {
            throw new Error(data.error || '生成音乐失败');
        }
    } catch (error) {
        console.error('调用音乐生成API失败:', error);
        return null;
    }
}

// 模拟转换过程的单个步骤
function simulateStep(step) {
    return new Promise(resolve => {
        // 显示当前步骤
        const magicSteps = document.querySelectorAll('.magic-step');
        
        // 移除之前的活动状态
        magicSteps.forEach(s => s.classList.remove('active'));
        
        // 激活当前步骤
        if (magicSteps[step-1]) {
            magicSteps[step-1].classList.add('visible');
            magicSteps[step-1].classList.add('active');
        }
        
        // 等待一段时间后进入下一步
        setTimeout(resolve, 1500);
    });
}

// 分步执行转换过程
async function startTransformation() {
    try {
        transformBtn.disabled = true;
        loading.style.display = 'block';
        magicVisualization.style.display = 'block';
        
        // 第1步：理解古诗
        transformState = 1;
        await simulateStep(1);
        
        // 第2步：学习嘻哈
        transformState = 2;
        await simulateStep(2);
        
        // 第3步：创意重组
        transformState = 3;
        await simulateStep(3);
        
        // 同时调用API获取Rap版本
        const poemContent = getPoemTextContent();
        const rapHtml = await transformPoemToRap(poemContent, currentPoem);
        poems[currentPoem].rap = rapHtml;
        
        // 第4步：魔法呈现
        transformState = 4;
        await simulateStep(4);
        
        // 显示结果
        transformState = 5;
        resultSection.style.display = 'block';
        rapResult.innerHTML = poems[currentPoem].rap;
        
        // 添加歌词动画效果
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
        
        // 启用按钮
        transformBtn.disabled = false;
        loading.style.display = 'none';
        
    } catch (error) {
        console.error('转换过程中出错:', error);
        transformBtn.disabled = false;
        loading.style.display = 'none';
    }
}

// 获取当前选中诗歌的纯文本内容
function getPoemTextContent() {
    const poemPs = document.querySelectorAll('#poem-box p');
    let poemText = '';
    poemPs.forEach(p => {
        poemText += p.textContent + '\n';
    });
    return poemText.trim();
}

// 转换按钮事件
transformBtn.addEventListener('click', startTransformation);

// 初始化音频系统
function initAudio() {
    if (audioContext) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    beatSequencer = new BeatSequencer(audioContext);
}

// 播放按钮事件
playBtn.addEventListener('click', async () => {
    // 如果已经在生成音乐，就不再处理点击
    if (isGeneratingMusic) return;
    
    playBtn.disabled = true;
    playBtn.textContent = '生成音乐中...';
    isGeneratingMusic = true;
    
    try {
        // 尝试使用API生成音乐
        const musicUrl = await generateMusic(poems[currentPoem].rap);
        
        if (musicUrl) {
            // 如果生成了音乐，播放它
            if (audioElement) {
                audioElement.pause();
                document.body.removeChild(audioElement);
            }
            
            audioElement = document.createElement('audio');
            audioElement.src = musicUrl;
            audioElement.style.display = 'none';
            document.body.appendChild(audioElement);
            
            audioElement.play();
            audioElement.onended = () => {
                stopBtn.disabled = true;
                playBtn.disabled = false;
                playBtn.textContent = '播放音乐';
            };
            
            stopBtn.disabled = false;
            playBtn.textContent = '播放音乐';
        } else {
            // 否则使用本地音频系统
            initAudio();
            beatSequencer.start();
            stopBtn.disabled = false;
            playBtn.textContent = '播放节奏';
        }
        
        // 添加播放动画效果
        document.querySelectorAll('.rap-line').forEach((line) => {
            line.classList.add('ready-to-animate');
        });
    } catch (error) {
        console.error('生成或播放音乐时出错:', error);
        
        // 回退到本地音频
        initAudio();
        beatSequencer.start();
        stopBtn.disabled = false;
    } finally {
        isGeneratingMusic = false;
        playBtn.disabled = false;
    }
});

// 停止按钮事件
stopBtn.addEventListener('click', () => {
    if (audioElement && !audioElement.paused) {
        audioElement.pause();
    }
    
    if (beatSequencer && beatSequencer.isPlaying) {
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

// 互动游戏功能
document.addEventListener('DOMContentLoaded', function() {
    const matchItems = document.querySelectorAll('.match-item');
    const checkBtn = document.getElementById('check-matches');
    let firstSelected = null;
    
    // 连线匹配游戏
    matchItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('correct')) return;
            
            if (!firstSelected) {
                // 第一次选择
                firstSelected = item;
                item.classList.add('selected');
            } else {
                // 第二次选择
                const secondSelected = item;
                
                // 检查是否同类型（防止连接两个源或两个目标）
                if (
                    (firstSelected.classList.contains('source') && secondSelected.classList.contains('source')) ||
                    (firstSelected.classList.contains('target') && secondSelected.classList.contains('target'))
                ) {
                    firstSelected.classList.remove('selected');
                    firstSelected = secondSelected;
                    secondSelected.classList.add('selected');
                    return;
                }
                
                // 检查匹配
                const match1 = firstSelected.getAttribute('data-match');
                const match2 = secondSelected.getAttribute('data-match');
                
                if (match1 === match2) {
                    // 匹配成功
                    firstSelected.classList.remove('selected');
                    secondSelected.classList.remove('selected');
                    firstSelected.classList.add('correct');
                    secondSelected.classList.add('correct');
                    
                    // 显示匹配成功反馈
                    firstSelected.style.transform = 'scale(1.1)';
                    secondSelected.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        firstSelected.style.transform = 'scale(1)';
                        secondSelected.style.transform = 'scale(1)';
                    }, 500);
                } else {
                    // 匹配失败
                    firstSelected.classList.remove('selected');
                    secondSelected.classList.add('selected');
                    firstSelected = secondSelected;
                }
            }
        });
    });
    
    // 检查答案按钮
    checkBtn.addEventListener('click', () => {
        matchItems.forEach(item => {
            const match = item.getAttribute('data-match');
            
            if (!item.classList.contains('correct')) {
                item.classList.add('wrong');
                setTimeout(() => {
                    item.classList.remove('wrong');
                }, 1000);
            }
        });
    });
});

// 初始隐藏结果部分和魔法过程部分
resultSection.style.display = 'none';
magicVisualization.style.display = 'none';
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