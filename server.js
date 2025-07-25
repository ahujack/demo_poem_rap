const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

// 环境变量中的API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const TIANYI_API_KEY = process.env.TIANYI_API_KEY || '';

// API路由: 转换诗歌为Rap
app.post('/api/transform-poem', async (req, res) => {
    try {
        const { poem, poemId } = req.body;
        
        // 预设的备用Rap版本
        const fallbackRaps = {
            jingye: `Yo，半夜我醒来 看到月光洒满窗台\n一眼望出去 白茫茫像霜覆盖\n抬起头仰望 那明月照亮黑夜\n低下头沉思 思念远方的家Yeah!`,
            chun: `春天的睡眠太舒适 不知不觉天已亮\n听听四周小鸟唱 叽叽喳喳把春报上\n昨夜风雨声不断 敲打窗户整晚响\n美丽的花儿凋落了 数也数不清多少Yeah!`,
            lijiang: `太阳照耀香炉峰 紫色的烟雾缥缥缈缈\n远远望去那瀑布 挂在山前像条白绸带\n水流飞奔向下冲 足足三千尺的高度\n看上去就像银河 从九重天上落到人间Yeah!`
        };
        
        // 如果没有API密钥，使用备用内容
        if (!DEEPSEEK_API_KEY) {
            console.log('使用预设歌词（API密钥未提供）');
            return res.json({ 
                success: true, 
                rap: fallbackRaps[poemId] || fallbackRaps.jingye 
            });
        }
        
        // 准备请求到DeepSeek API的提示词
        const prompt = `请将这首中国古诗改编成嘻哈/Rap风格的歌词，保持原意但使用现代嘻哈语言和节奏。
        保持四行结构，每行要有押韵，最后一行结尾加"Yeah!"。用现代口语表达。
        原诗：${poem}`;
        
        // 调用DeepSeek API
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            }
        });
        
        if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
            const rapText = response.data.choices[0].message.content.trim();
            return res.json({ success: true, rap: rapText });
        } else {
            console.error('API返回格式不符合预期', response.data);
            return res.json({ 
                success: true, 
                rap: fallbackRaps[poemId] || fallbackRaps.jingye
            });
        }
        
    } catch (error) {
        console.error('诗歌转换失败:', error.message);
        return res.status(500).json({ 
            success: false, 
            error: '处理请求时出错', 
            message: error.message 
        });
    }
});

// API路由: 生成音乐
app.post('/api/generate-music', async (req, res) => {
    try {
        const { lyrics } = req.body;
        
        // 如果没有API密钥，返回空结果
        if (!TIANYI_API_KEY) {
            console.log('未提供天工API密钥');
            return res.json({ 
                success: false, 
                error: 'API密钥未提供'
            });
        }
        
        // 调用天工API生成音乐
        const response = await axios.post('https://api.tiangong.com/v1/audio/generations', {
            model: "music-generation",
            prompt: `根据以下嘻哈风格的歌词生成一段15秒的Rap音乐: ${lyrics}`,
            duration: 15
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TIANYI_API_KEY}`
            }
        });
        
        if (response.data.audio && response.data.audio.url) {
            return res.json({ 
                success: true, 
                musicUrl: response.data.audio.url 
            });
        } else {
            console.error('天工API返回格式不符合预期', response.data);
            return res.json({ 
                success: false, 
                error: 'API返回格式不符合预期' 
            });
        }
        
    } catch (error) {
        console.error('音乐生成失败:', error.message);
        return res.status(500).json({ 
            success: false, 
            error: '处理请求时出错', 
            message: error.message 
        });
    }
});

// 默认路由处理首页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 输出配置信息
console.log(`后端服务已启动`);
console.log(`DeepSeek API密钥状态: ${DEEPSEEK_API_KEY ? '已配置' : '未配置'}`);
console.log(`天工API密钥状态: ${TIANYI_API_KEY ? '已配置' : '未配置'}`); 