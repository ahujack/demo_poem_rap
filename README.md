# 古诗变身Rap - AI科普演示

这是一个交互式演示项目，以生动有趣的方式向小朋友讲解大语言模型（如ChatGPT）将古诗转换为嘻哈风格歌词的原理，通过"魔法步骤"和"生活化比喻"的方式呈现。

## 功能介绍

1. **多首古诗选择** - 可以在不同古诗之间切换（《静夜思》、《春晓》、《望庐山瀑布》）
2. **古诗展示与嘻哈转换** - 点击按钮将古诗转换为现代嘻哈风格
3. **魔法过程可视化** - 动态展示AI处理古诗的四个关键步骤，配有生动动画
4. **音乐生成与播放** - 通过AI接口生成与嘻哈歌词匹配的音乐，或使用本地节奏
5. **互动小游戏** - 通过连线游戏帮助理解古诗与嘻哈表达的对应关系
6. **双层科普说明** - 分为"小朋友版"和"大朋友版"，用不同深度解释AI原理

## 前后端架构

项目采用前后端分离架构：

1. **前端**：纯HTML/CSS/JavaScript实现的交互界面
2. **后端**：Node.js/Express服务器，负责调用AI接口
   - DeepSeek接口：将古诗转换为Rap歌词
   - 天工音乐接口：生成与歌词匹配的Rap音乐

## 系统要求

- Node.js 14.0+
- 现代浏览器（Chrome、Firefox、Safari、Edge等）

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置API密钥

创建`.env`文件，添加以下内容（替换为实际API密钥）：

```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
TIANYI_API_KEY=your_tianyi_api_key_here
PORT=3000
```

### 3. 运行服务器

```bash
npm start
```

或者开发模式运行（自动重载）：

```bash
npm run dev
```

### 4. 访问网页

在浏览器中打开：`http://localhost:3000`

## 离线使用

如果没有配置API密钥，系统会自动回退到使用预设的示例内容，这样也能体验基本的演示效果。

## 教学设计亮点

1. **魔法步骤可视化** - 将抽象的AI处理过程拆解为四个形象步骤，配合动画展示
2. **生活化比喻** - 用"超级拼图游戏"等小朋友熟悉的概念类比AI工作原理
3. **多层次解释** - 分为小朋友版和大朋友版，满足不同知识层次的需求
4. **学习+游戏结合** - 通过互动连线游戏增强参与感和记忆效果
5. **多感官体验** - 结合视觉、听觉和互动操作，提升学习体验
6. **前后端分离** - 采用现代web架构，便于后续扩展和维护

## 适合小孩子的解释

这个演示展示了AI如何像一个"文字魔术师"一样，把古老的诗歌变成现代的嘻哈歌词！

AI变身魔术的四个步骤：
1. 首先，AI就像一个爱读书的小朋友，读了全世界的诗歌和歌词
2. 然后，AI像一个好耳朵的音乐家，学会了嘻哈音乐的节奏和说话方式
3. 接着，AI像一个拼图大师，把古诗的意思和嘻哈的风格拼在一起
4. 最后，AI用魔法棒一挥，创造出全新的嘻哈版诗歌和音乐

## 进一步探索

可以尝试：
- 添加更多古诗，如《登鹳雀楼》《水调歌头》等
- 调整节奏模式，创造不同的嘻哈节奏
- 扩展互动游戏，增加更多古诗与嘻哈的对应关系
- 为魔法过程添加更多互动元素，如可拖拽的拼图等
- 修改后端服务，集成更多AI功能 