// 文章风格定义

export interface ArticleStyle {
  id: string;
  name: string;
  shortDesc: string; // 一句话简短描述
  fullDesc: string;  // 详细描述（用于 tooltip）
  icon: string;
}

export const ARTICLE_STYLES: ArticleStyle[] = [
  {
    id: 'technical',
    name: '技术风格',
    shortDesc: '以解决问题为导向，代码图表丰富',
    fullDesc: '以"解决问题"为导向，受众为专业人士。标题直给，结构严谨，包含大量代码块、流程图和专业术语，排版克制。',
    icon: '💻'
  },
  {
    id: 'news',
    name: '新闻风格',
    shortDesc: '追求快准全，信息传递高效',
    fullDesc: '以"信息传递"和"时效性"为导向。标题客观，采用倒金字塔结构，信源明确，语气中立，常配现场照片和数据图表。',
    icon: '📰'
  },
  {
    id: 'marketing',
    name: '营销软文风格',
    shortDesc: '故事化植入，情绪调动强',
    fullDesc: '以"转化"为最终目的。标题直击痛点，采用SCQA模型故事化植入，情绪调动强，有信任背书和明确CTA行动号召。',
    icon: '🎯'
  },
  {
    id: 'emotional',
    name: '情感鸡汤风格',
    shortDesc: '情绪渲染，引发共鸣转发',
    fullDesc: '侧重情绪渲染，标题带强烈感性色彩。内容多讲述个人故事、职场感悟或生活哲理，旨在引发读者转发表达自我态度。',
    icon: '❤️'
  },
  {
    id: 'investigative',
    name: '深度调查风格',
    shortDesc: '非虚构特稿，细节详实',
    fullDesc: '篇幅极长（5000字以上），注重细节描写、人物访谈和事实核查。节奏慢但逻辑严密，能揭示社会现象深层原因。',
    icon: '🔍'
  },
  {
    id: 'sharp',
    name: '犀利锐评风格',
    shortDesc: '观点鲜明，金句频出',
    fullDesc: '以鲜明个人观点为核心，语言辛辣幽默甚至带攻击性。擅长解构热点，反其道而行，输出独特价值观。',
    icon: '⚡'
  },
  {
    id: 'tutorial',
    name: '干货教程风格',
    shortDesc: '清单体结构，收藏价值高',
    fullDesc: '实用性极强，主打"收藏价值"。结构清晰，采用清单体，内容高度浓缩，步骤明确，图表丰富，读者倾向先收藏。',
    icon: '📚'
  },
  {
    id: 'visual',
    name: '极简条漫风格',
    shortDesc: '以图为主，阅读门槛低',
    fullDesc: '以图为主文字为辅，通过长图、漫画、信息图表演绎内容。画风独特，适合碎片化时间阅读，传播力极强。',
    icon: '🎨'
  },
  {
    id: 'personal',
    name: '私域对话风格',
    shortDesc: '朋友聊天感，真实亲切',
    fullDesc: '去媒体化，营造"朋友聊天"氛围。第一人称叙述，语气随意，排版不修边幅，以此建立真实感和信任感。',
    icon: '💬'
  },
  {
    id: 'data',
    name: '数据研报风格',
    shortDesc: '用数据说话，理性客观',
    fullDesc: '用数据说话，理性客观拒绝情绪化。大量引用图表、财报数据、行业统计，逻辑推导严密，受众为专业人士。',
    icon: '📊'
  },
  {
    id: 'interactive',
    name: '互动测试风格',
    shortDesc: '游戏化参与，诱导分享',
    fullDesc: '利用微信功能增加参与感。嵌入投票、小程序测试、答题互动，通过结果生成海报诱导分享，趣味性强。',
    icon: '🎮'
  },
  {
    id: 'review',
    name: '种草评测风格',
    shortDesc: '亲测体验，对比推荐',
    fullDesc: '以"亲测"为卖点，对比多款产品列出优缺点。文风客观中带主观感受，图片精美，强调生活美学。',
    icon: '⭐'
  }
];