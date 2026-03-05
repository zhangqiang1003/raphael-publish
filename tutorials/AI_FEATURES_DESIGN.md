# Raphael Publish - AI 辅助功能需求设计文档

## 一、AI 辅助功能战略定位

### 1.1 为什么选择 AI 辅助作为核心功能？

**市场竞争分析**：
- 市面上排版工具众多（135 编辑器、i 排版、新榜等）
- 同质化严重，缺乏差异化竞争力
- 深度集成 AI 的排版工具几乎空白

**用户需求洞察**：
- 90% 的作者会在标题创作上卡壳
- 文案优化需求高频但缺乏专业指导
- 排版选择困难，不知道什么风格适合自己的内容

**技术成熟度**：
- LLM API 成本低（GPT-4 Turbo 约¥0.01/次）
- 响应速度快（流式输出 3-5 秒）
- 生成质量高（人类难以区分）

**商业价值**：
- 用户感知强，效果立竿见影
- 可直接作为付费点（按次或会员制）
- 易于形成口碑传播

### 1.2 AI 能力金字塔模型

```
                    ┌─────────────────┐
                    │  智能创作层     │  
                    │  (生成式 AI)    │  ← GPT-4/Claude
                    │  • 标题生成     │
                    │  • 大纲创作     │
                    │  • 段落续写     │
                    └─────────────────┘
                           /    \
                          /      \
                         /        \
            ┌──────────┐          ┌──────────┐
            │ 内容优化 │          │ 灵感启发 │
            └──────────┘          └──────────┘
                    \              /
                     \            /
                      \          /
                    ┌─────────────────┐
                    │  智能助手层     │  
                    │  (分析 + 建议)  │  ← 轻量级模型
                    │  • 文案润色     │
                    │  • 语法检查     │
                    │  • 主题推荐     │
                    └─────────────────┘
                           /    \
                          /      \
                         /        \
            ┌──────────┐          ┌──────────┐
            │ 排版推荐 │          │ 文案诊断 │
            └──────────┘          └──────────┘
                      \          /
                       \        /
                        \      /
                    ┌─────────────────┐
                    │  基础服务层     │  
                    │  (实时响应)     │  ← 本地/规则引擎
                    │  • 拼写检查     │
                    │  • 关键词提取   │
                    │  • 字数统计     │
                    └─────────────────┘
```

---

## 二、核心功能详细设计

### 功能 1：AI 标题大师（优先级：P0）⭐⭐⭐⭐⭐

#### 用户故事
> 作为一名公众号作者，我希望根据文章内容一键生成多个吸引人的标题，这样我就不需要绞尽脑汁想标题，还能提高点击率。

#### 功能描述
- **触发方式**：顶部工具栏「✨ AI」按钮 → 选择「起标题」
- **输入**：当前文章前 1500 字
- **输出**：10 个带评分和技巧标签的标题建议
- **交互**：流式展示，生成一个显示一个，减少等待焦虑

#### 技术实现

**Prompt 工程设计**：

```typescript
const systemPrompt = `你是一位微信公众号爆款标题专家，擅长创作高点击率的标题。

请根据文章内容生成 10 个吸引人的标题，要求：

【风格要求】
- 符合微信生态，避免过度标题党
- 运用数字、疑问、对比、悬念等技巧
- 激发读者好奇心或痛点共鸣
- 长度：15-20 字（可调整）

【评分标准】
每个标题从三个维度评分 (0-10 分)，计算综合得分：
- 吸引力：是否吸引眼球
- 相关性：是否贴合内容
- 传播力：是否容易引发转发

【输出格式】
严格输出 JSON 数组，不要其他内容：
[
  {
    "id": "title_1",
    "content": "标题内容",
    "score": 8.5,
    "techniques": ["数字", "疑问"],
    "scores": {
      "attraction": 9,
      "relevance": 8,
      "viral": 8.5
    }
  }
]`;

const userPrompt = `文章主题：${extractTopic(content)}

文章内容摘要：
${content.substring(0, 800)}...

请生成 10 个适合微信传播的标题。`;
```

**API 调用代码**：

```typescript
// src/main/api/ai-titles.ts
import OpenAI from 'openai';
import type { IpcMainInvokeEvent } from 'electron';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

ipcMain.handle('ai:generate-titles', async (event, options) => {
  const { content, tone = 'wechat', length = 'medium' } = options;
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8, // 增加创造性
      max_tokens: 800,
      stream: true // 启用流式输出
    });

    // 流式返回给前端
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content.trim()) {
        event.sender.send('ai:titles:stream', content);
      }
    }
    
  } catch (error) {
    console.error('AI title generation error:', error);
    throw error;
  }
});
```

**前端组件设计**：

```typescript
// src/renderer/components/AITitleGenerator.tsx
interface TitleSuggestion {
  id: string;
  content: string;
  score: number;
  techniques: string[];
  scores: {
    attraction: number;
    relevance: number;
    viral: number;
  };
}

export function AITitleGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState<TitleSuggestion[]>([]);
  const DAILY_LIMIT = 10;
  
  const generateTitles = async () => {
    setLoading(true);
    
    const response = await fetch('/api/ai/generate-titles', {
      method: 'POST',
      body: JSON.stringify({
        content: editor.getContent().substring(0, 1500),
        tone: 'wechat',
        length: 'medium'
      })
    });
    
    // 流式读取
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const parsed = JSON.parse(chunk);
      setTitles(prev => [...prev, ...parsed]);
    }
    
    setLoading(false);
  };
  
  return (
    <div className="ai-title-panel">
      <button onClick={generateTitles} disabled={loading}>
        {loading ? 'AI 思考中...' : '✨ AI 起标题'}
      </button>
      
      {titles.map(title => (
        <TitleCard 
          key={title.id}
          title={title}
          onApply={() => applyTitle(title.content)}
        />
      ))}
    </div>
  );
}
```

#### UI 设计规范

**弹窗设计**：
- 尺寸：最大宽度 800px，高度自适应（最大 60vh）
- 样式：毛玻璃背景 + 圆角卡片
- 动画：从底部淡入 + 向上滑动
- 配色：紫色到粉色渐变（AI 感）

**标题卡片设计**：
```
┌─────────────────────────────────────────────┐
│ 标题内容（16px，中等粗细）                   │
│                                             │
│ [数字] [疑问] [对比] ← 技巧标签             │
│                                      8.5 ⭐ │
└─────────────────────────────────────────────┘
```

**交互细节**：
- 悬停卡片：显示操作按钮（复制、点赞、点踩）
- 点击卡片：直接应用标题到文章开头
- 生成过程中：卡片逐个淡入显示

#### 验收标准

- ✅ 生成 10 个不重复的标题
- ✅ 每个标题都有评分和技巧标签
- ✅ 流式输出，首个标题在 2 秒内显示
- ✅ 支持一键应用到文章
- ✅ 每日限次 10 次（后续可扩展会员）

#### 成功指标

| 指标 | 目标值 | 测量方式 |
|-----|-------|---------|
| 使用率 | >60% | 使用人数/总用户数 |
| 满意度 | >4.5/5 | 点赞率 |
| 日均使用次数 | >5 次/用户 | 后台统计 |
| 转化率 | >5% | 免费→付费 |

---

### 功能 2：AI 文案润色（优先级：P0）⭐⭐⭐⭐⭐

#### 用户故事
> 作为一名非专业作者，我希望选中一段文字后能让 AI 帮我优化表达，让文案更流畅、更有感染力。

#### 功能描述
- **触发方式**：选中文本 → 右键菜单 → 「✨ AI 润色」
- **三种模式**：
  - **简洁**：去除冗余，精炼表达
  - **正式**：商务专业，适合报告
  - **生动**：增加感染力，适合软文
- **展示形式**：Diff 对比视图（修改前 vs 修改后）

#### Prompt 设计

```typescript
const optimizationPrompts = {
  concise: `简化这段文字，去除冗余词汇，保持原意但更精炼。
要求：
- 删除重复表达
- 缩短长句
- 保留核心信息
原文：{text}`,

  formal: `将这段文字改写得更正式、专业，适合商务场景。
要求：
- 使用书面语
- 避免口语化表达
- 增强权威感
原文：{text}`,

  engaging: `让这段文字更生动有趣，增加感染力和可读性。
要求：
- 使用修辞手法（比喻、排比等）
- 增加情感色彩
- 拉近与读者距离
原文：{text}`
};
```

#### 交互流程

```
1. 用户选中一段文字（50-500 字）
         ↓
2. 右键菜单显示「✨ AI 润色」
         ↓
3. 弹出模式选择面板（简洁/正式/生动）
         ↓
4. AI 处理（显示 Loading，预计 3-5 秒）
         ↓
5. 展示 Diff 对比视图
   ┌──────────────┬──────────────┐
   │  原文        │  优化后      │
   │  (红色删除)  │  (绿色新增)  │
   └──────────────┴──────────────┘
         ↓
6. 用户选择：应用 / 重新生成 / 取消
```

#### 技术实现

```typescript
// 右键菜单集成
editor.on('contextmenu', (e) => {
  const selection = editor.getSelection();
  if (selection && selection.length >= 50) {
    showContextMenu([
      { 
        label: '✨ AI 润色', 
        action: () => showOptimizationPanel(selection)
      }
    ]);
  }
});

// 优化面板
function OptimizationPanel({ text }: { text: string }) {
  const [mode, setMode] = useState<'concise' | 'formal' | 'engaging'>('concise');
  const [optimized, setOptimized] = useState('');
  const [loading, setLoading] = useState(false);
  
  const optimize = async () => {
    setLoading(true);
    
    const response = await fetch('/api/ai/optimize-text', {
      method: 'POST',
      body: JSON.stringify({
        text,
        mode,
        context: editor.getSurroundingParagraphs() // 上下文
      })
    });
    
    const result = await response.json();
    setOptimized(result.optimized);
    setLoading(false);
  };
  
  return (
    <div className="optimization-modal">
      <div className="mode-selector">
        <Button onClick={() => setMode('concise')}>简洁</Button>
        <Button onClick={() => setMode('formal')}>正式</Button>
        <Button onClick={() => setMode('engaging')}>生动</Button>
      </div>
      
      <div className="diff-viewer">
        <DiffViewer original={text} modified={optimized} />
      </div>
      
      <div className="actions">
        <Button onClick={() => applyOptimization(optimized)}>
          应用优化
        </Button>
        <Button onClick={optimize} disabled={loading}>
          {loading ? '优化中...' : '重新生成'}
        </Button>
      </div>
    </div>
  );
}
```

#### 验收标准

- ✅ 支持三种优化模式
- ✅ Diff 视图清晰展示修改处
- ✅ 响应时间 < 5 秒
- ✅ 支持一键替换原文
- ✅ 保留撤销历史

---

### 功能 3：AI 排版顾问（优先级：P1）⭐⭐⭐

#### 用户故事
> 作为一名选择困难症患者，我不知道该用哪个主题，希望 AI 能根据我的内容推荐最合适的排版风格。

#### 功能描述
- **触发时机**：用户切换主题时，或主动点击「AI 推荐主题」
- **分析维度**：
  - 内容情感（积极/消极/中性）
  - 内容类型（技术/生活/商业/教育）
  - 文字基调（严肃/活泼/温暖）
- **推荐结果**：Top 3 主题 + 推荐理由

#### 技术实现

```typescript
async function recommendTheme(content: string) {
  // Step 1: AI 语义分析
  const analysis = await analyzeWithAI(content);
  /*
  {
    sentiment: 'positive',      // 情感色彩
    topic: 'technology',        // 主题分类
    mood: 'energetic',         // 情绪基调
    formality: 0.7             // 正式程度 (0-1)
  }
  */
  
  // Step 2: 匹配主题特征
  const matchedThemes = THEMES.filter(theme => {
    return theme.tags.includes(analysis.topic) &&
           theme.mood === analysis.mood;
  }).slice(0, 3);
  
  // Step 3: 生成推荐理由
  const reasons = await Promise.all(
    matchedThemes.map(async theme => {
      const reason = await generateReason(analysis, theme);
      /*
      "这篇文章充满科技感，推荐使用「Linear 暗夜」主题。
       深色背景 + 霓虹配色能强化科技氛围，提升阅读体验。"
      */
      return reason;
    })
  );
  
  return { themes: matchedThemes, reasons };
}
```

#### UI 展示

```
┌─────────────────────────────────────────────┐
│  🤖 AI 为你推荐主题                          │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ 【Linear 暗夜】匹配度 95%           │   │
│  │                                     │   │
│  │ 推荐理由：                          │   │
│  │ 这篇文章充满科技感，深色背景 +       │   │
│  │ 霓虹配色能强化科技氛围。            │   │
│  │                                     │   │
│  │ [预览] [应用]                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 【Stripe 硅谷风】匹配度 88%         │   │
│  │ ...                                 │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

### 功能 4：AI 配图建议（优先级：P2）⭐⭐⭐

#### 功能描述
- 根据段落内容推荐 Unsplash 图片
- 自动提取关键词，搜索相关图片
- 一键插入 Markdown 图片语法

#### 实现思路

```typescript
async function recommendImages(paragraph: string) {
  // 1. 提取关键词
  const keywords = await extractImageKeywords(paragraph);
  // ["technology", "coding", "computer"]
  
  // 2. 调用 Unsplash API
  const images = await fetch(
    `https://api.unsplash.com/search/photos?query=${keywords.join(',')}&per_page=10`
  );
  
  // 3. AI 评估相关性并排序
  const rankedImages = await rankImagesByRelevance(images, paragraph);
  
  return rankedImages.slice(0, 5);
}

// 侧边栏展示
function ImageSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  
  useEffect(() => {
    const currentParagraph = editor.getCurrentParagraph();
    recommendImages(currentParagraph).then(setSuggestions);
  }, [editor.cursorPosition]);
  
  return (
    <div className="image-suggestions-panel">
      {suggestions.map(img => (
        <img 
          key={img.id}
          src={img.thumbnail}
          onClick={() => insertMarkdownImage(img.full)}
          className="suggestion-thumbnail"
        />
      ))}
    </div>
  );
}
```

---

## 三、技术架构设计

### 3.1 整体架构

```
┌──────────────────────────────────────────────────────┐
│                  前端层 (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 标题生成 │  │ 文案润色 │  │ 主题推荐 │          │
│  │ 组件     │  │ 组件     │  │ 组件     │          │
│  └──────────┘  └──────────┘  └──────────┘          │
├──────────────────────────────────────────────────────┤
│               AI 服务抽象层                            │
│  ┌────────────────────────────────────────────────┐  │
│  │  AIService (统一接口)                         │  │
│  │  - generateTitles()                           │  │
│  │  - optimizeText()                             │  │
│  │  - recommendTheme()                           │  │
│  │  - suggestImages()                            │  │
│  └────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│               Electron IPC 桥接                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Renderer │←→│ Preload  │←→│  Main    │          │
│  │ Process  │  │ Script   │  │ Process  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
├──────────────────────────────────────────────────────┤
│                 AI API 集成层                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ OpenAI   │  │ Claude   │  │ 本地模型 │          │
│  │ GPT-4    │  │ API      │  │ (可选)   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└──────────────────────────────────────────────────────┘
```

### 3.2 API 路由设计

```typescript
// Electron 主进程路由
// src/main/api/index.ts

import { ipcMain } from 'electron';
import { handleTitleGeneration } from './ai-titles';
import { handleTextOptimization } from './ai-optimize';
import { handleThemeRecommendation } from './ai-theme';

// AI 标题生成
ipcMain.handle('ai:generate-titles', handleTitleGeneration);

// AI 文案优化
ipcMain.handle('ai:optimize-text', handleTextOptimization);

// AI 主题推荐
ipcMain.handle('ai:recommend-theme', handleThemeRecommendation);

// AI 配图建议
ipcMain.handle('ai:suggest-images', handleImageSuggestion);
```

### 3.3 数据流设计

```
用户操作
   ↓
前端组件触发
   ↓
调用 AIService
   ↓
IPC 发送到主进程
   ↓
调用外部 API (OpenAI/Claude)
   ↓
接收响应
   ↓
流式返回给渲染进程
   ↓
更新 UI 展示
```

---

## 四、成本控制策略

### 4.1 分级使用不同模型

```typescript
const modelStrategy = {
  // 免费用户：使用廉价模型
  free: {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    cost: 0.002, // USD per 1K tokens
    dailyLimit: 10
  },
  
  // 付费用户：使用高质量模型
  pro: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    cost: 0.01,
    dailyLimit: 100
  },
  
  // 企业用户：顶级模型
  enterprise: {
    provider: 'anthropic',
    model: 'claude-3-opus',
    cost: 0.05,
    dailyLimit: Infinity
  }
};
```

### 4.2 缓存策略

```typescript
// 相同内容不重复调用
const aiCache = new Map<string, any>();

async function callAIWithCache(task: string, input: string) {
  const cacheKey = hash(`${task}:${input}`);
  
  // 检查缓存（有效期 24 小时）
  if (aiCache.has(cacheKey)) {
    const cached = aiCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.result;
    }
  }
  
  // 调用 AI
  const result = await callAI(input);
  
  // 写入缓存
  aiCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
  
  return result;
}
```

### 4.3 限流策略

```typescript
// 用户级别限流
const userUsage = new Map<string, number>();

function checkUsageLimit(userId: string): boolean {
  const usage = userUsage.get(userId) || 0;
  const limit = getUserLimit(userId); // 根据会员等级
  
  return usage < limit;
}

function incrementUsage(userId: string) {
  const current = userUsage.get(userId) || 0;
  userUsage.set(userId, current + 1);
  
  // 每日重置
  setTimeout(() => {
    userUsage.set(userId, 0);
  }, 24 * 60 * 60 * 1000);
}
```

---

## 五、商业模式设计

### 5.1 定价策略

| 版本 | 价格 | AI 次数/天 | 可用功能 |
|-----|------|-----------|---------|
| **免费版** | ¥0 | 10 次 | 标题生成 + 基础润色 |
| **专业版** | ¥29/月 | 100 次 | + 高级润色 + 主题推荐 + 配图建议 |
| **企业版** | ¥199/月 | 无限 | + 定制模型 + API 访问 + 数据分析 |
| **按次包** | ¥9.9/10 次 | 10 次 | 临时使用，无期限限制 |

### 5.2 收入预测

假设月活用户 10,000 人：
- 转化率 5% → 500 付费用户
- 其中 80% 选择专业版（¥29）→ 400 × 29 = ¥11,600
- 20% 选择企业版（¥199）→ 100 × 199 = ¥19,900
- **月收入**：¥31,500
- **年收入**：¥378,000

**成本估算**：
- API 调用成本：¥0.01/次 × 100 次 × 500 用户 × 30 天 = ¥15,000/月
- **月利润**：¥16,500
- **年利润**：¥198,000

---

## 六、开发计划

### Phase 1：AI 标题大师（Week 1）

**Day 1-2**: 
- [ ] 申请 OpenAI API Key
- [ ] 搭建后端 API 框架
- [ ] 编写 Prompt 模板并测试

**Day 3-4**:
- [ ] 开发前端 UI 组件
- [ ] 实现流式输出
- [ ] 添加加载动画和错误处理

**Day 5-6**:
- [ ] 内部测试（10 篇文章）
- [ ] 调优 Prompt 参数
- [ ] 修复 Bug

**Day 7**:
- [ ] 种子用户测试（20 人）
- [ ] 收集反馈
- [ ] 准备上线

### Phase 2：AI 文案润色（Week 2-3）

**Week 2**:
- [ ] 实现三种润色模式
- [ ] 开发 Diff 对比视图
- [ ] 集成右键菜单

**Week 3**:
- [ ] 上下文理解优化
- [ ] 性能优化（响应时间 < 5s）
- [ ] 用户测试

### Phase 3：AI 排版顾问（Week 4-5）

**Week 4**:
- [ ] 内容语义分析
- [ ] 主题匹配算法
- [ ] 推荐理由生成

**Week 5**:
- [ ] UI 面板开发
- [ ] A/B 测试
- [ ] 正式上线

### Phase 4：AI 配图建议（Week 6-7）

**Week 6**:
- [ ] Unsplash API 集成
- [ ] 关键词提取
- [ ] 图片相关性排序

**Week 7**:
- [ ] 侧边栏 UI
- [ ] 一键插入功能
- [ ] 性能优化

---

## 七、风险与应对

### 7.1 技术风险

| 风险 | 可能性 | 影响 | 应对措施 |
|-----|-------|------|---------|
| API 响应慢 | 中 | 中 | 流式输出 + Loading 动画 |
| 生成质量差 | 低 | 高 | Few-shot learning + 持续调优 |
| 成本超支 | 中 | 中 | 限流 + 缓存 + 分级模型 |
| 服务宕机 | 低 | 高 | 多供应商备份（OpenAI + Claude） |

### 7.2 法律风险

| 风险 | 应对措施 |
|-----|---------|
| 生成内容侵权 | 用户协议声明 + AI 生成标识 |
| 敏感内容过滤 | 关键词审核 + 人工复审通道 |
| 数据隐私 | 本地处理 + 不存储用户内容 |

### 7.3 用户体验风险

**风险**：AI 生成内容不符合预期，用户失望

**应对**：
1. 降低期望管理（标注"AI 生成，仅供参考"）
2. 提供便捷的反馈渠道（点赞/点踩）
3. 持续优化模型（基于反馈数据）
4. 保留人工编辑权利（AI 只是辅助）

---

## 八、成功指标与追踪

### 8.1 核心指标定义

```typescript
const metrics = {
  // 使用率指标
  aiFeatureUsageRate: {
    definition: '使用 AI 功能的用户占比',
    target: '>60%',
    calculation: 'DAU using AI / Total DAU'
  },
  
  // 满意度指标
  satisfactionScore: {
    definition: '用户对 AI 生成的满意度',
    target: '>4.5/5',
    calculation: '(👍 count) / (👍 + 👎 count)'
  },
  
  // 粘性指标
  avgGenerationsPerDay: {
    definition: '每用户日均使用次数',
    target: '>5 次',
    calculation: 'Total AI calls / DAU'
  },
  
  // 商业化指标
  conversionRate: {
    definition: '免费用户转付费比例',
    target: '>5%',
    calculation: 'New paid users / Free users'
  },
  
  retentionBoost: {
    definition: 'AI 功能对留存的提升',
    target: '>20%',
    calculation: '(Retention with AI - Retention without AI) / Retention without AI'
  }
};
```

### 8.2 数据埋点设计

```typescript
// 事件追踪
track('ai_title_generate', {
  userId: 'xxx',
  articleId: 'yyy',
  generatedCount: 10,
  appliedTitleIndex: 2,
  duration: 3200, // ms
  feedback: 'like' // like | dislike | none
});

track('ai_text_optimize', {
  userId: 'xxx',
  mode: 'concise',
  textLength: 150,
  applied: true,
  duration: 4500
});
```

---

## 九、附录

### 附录 A：Prompt 工程最佳实践

**Few-shot Learning 示例**：

```
你是一个标题生成专家。以下是优秀标题的示例：

示例 1:
文章：《如何学习 Python》
好标题：《我靠这 5 个资源，3 个月从 0 到精通 Python》
技巧：数字 + 时间 + 成果

示例 2:
文章：《时间管理方法》
好标题：《为什么你总是很忙？这 3 个时间管理误区害了你》
技巧：疑问 + 数字 + 痛点

请模仿以上示例，为下面的文章生成 10 个标题：
[文章内容]
```

**Chain-of-Thought 示例**：

```
请按以下步骤生成标题：

Step 1: 分析文章核心观点
Step 2: 识别目标读者群体
Step 3: 提炼 3 个关键卖点
Step 4: 为每个卖点创作 3 个标题
Step 5: 评估每个标题的吸引力
Step 6: 选出 Top 10 并给出理由
```

### 附录 B：推荐学习资源

1. **OpenAI Cookbook**: https://github.com/openai/openai-cookbook
2. **Prompt Engineering Guide**: https://www.promptingguide.ai/
3. **LangChain 文档**: https://python.langchain.com/

### 附录 C：竞品分析

| 产品 | AI 功能 | 优势 | 劣势 |
|-----|--------|------|------|
| Notion AI | 写作辅助 | 深度集成 | 不支持中文优化 |
| 秘塔写作猫 | 语法检查 | 中文友好 | 功能单一 |
| Jasper | 营销文案 | 模板丰富 | 价格昂贵 |
| **Raphael AI** | **排版 + 写作** | **垂直场景** | **起步晚** |

---

**文档版本**：v1.0  
**创建日期**：2026 年 3 月 4 日  
**作者**：AI Assistant  
**状态**：待审核

---

## 十、下一步行动

### 立即开始（本周）

1. **申请 API Key**
   - OpenAI: https://platform.openai.com/api-keys
   - 备用：Anthropic Claude

2. **环境配置**
   ```bash
   # 安装依赖
   npm install openai
   
   # 设置环境变量
   export OPENAI_API_KEY='your-key-here'
   ```

3. **快速原型**
   - 创建一个最简单的标题生成功能
   - 验证技术可行性
   - 找 3-5 个用户体验

4. **迭代优化**
   - 收集反馈
   - 调整 Prompt
   - 完善 UI

---

**记住**：完美的计划不如快速的行动。先做出 MVP，再持续迭代！🚀
