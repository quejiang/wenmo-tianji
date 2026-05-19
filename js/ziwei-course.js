/**
 * 文墨天机 · 紫微斗数 0基础到精通速成教程
 * 20步系统课程：从小白到断盘高手
 */

var ZiweiCourse = (function() {
  'use strict';

  var steps = [
    // ==================== Phase 1: 基础入门 ====================
    {
      id: 'welcome',
      phase: '基础入门',
      title: '1. 什么是紫微斗数？',
      emoji: '🏮',
      content: [
        '<p><strong>紫微斗数</strong>是中国古代最精密的命理学体系，起源于宋代，至今已有千年历史。</p>',
        '<p>它的核心思想是：<mark>你出生那一刻的星辰位置，决定了你一生的性格底色和命运轨迹</mark>。</p>',
        '<div class="course-card"><h5>🔑 三个关键概念</h5><ul><li><strong>命盘</strong> = 你的人生地图，由12个宫位组成</li><li><strong>星曜</strong> = 地图上的"角色"，代表不同的能量和特质</li><li><strong>四化</strong> = 星曜能量的变化，告诉你哪里好、哪里需要注意</li></ul></div>',
        '<p>和八字相比，紫微斗数的<em>精确度更高</em>，能把人生12个维度（财运、感情、事业等）分开来看。</p>',
        '<p>💡 <strong>一句话总结</strong>：紫微斗数就是中国古代的"大数据性格分析系统"。</p>'
      ]
    },
    {
      id: 'yinyang-wuxing',
      phase: '基础入门',
      title: '2. 阴阳五行 — 万物的底层代码',
      emoji: '☯',
      content: [
        '<p>理解紫微斗数之前，必须掌握<strong>阴阳五行</strong>——这是整个中国玄学的底层逻辑。</p>',
        '<div class="course-card"><h5>⚫⚪ 阴阳</h5><p>万事万物都有阴阳两面：</p><ul><li><strong>阳</strong>：主动、外向、刚强、男性、白天、热</li><li><strong>阴</strong>：被动、内向、柔顺、女性、夜晚、冷</li></ul><p>命盘中，阳星多的人主动积极，阴星多的人温和内敛。</p></div>',
        '<div class="course-card"><h5>🪵🔥⛰️⚔️💧 五行</h5><table style="width:100%;font-size:0.85em"><tr><th>行</th><th>含义</th><th>颜色</th><th>代表星曜</th></tr><tr><td>木</td><td>生长、仁爱</td><td>青</td><td>天机、贪狼</td></tr><tr><td>火</td><td>热情、礼仪</td><td>赤</td><td>太阳、廉贞</td></tr><tr><td>土</td><td>承载、诚信</td><td>黄</td><td>紫微、天府、天梁</td></tr><tr><td>金</td><td>收敛、正义</td><td>白</td><td>武曲、七杀</td></tr><tr><td>水</td><td>流动、智慧</td><td>黑</td><td>太阴、天同、巨门、天相、破军</td></tr></table></div>',
        '<p>💡 <strong>相生</strong>：木生火 → 火生土 → 土生金 → 金生水 → 水生木</p>',
        '<p>💡 <strong>相克</strong>：木克土 → 土克水 → 水克火 → 火克金 → 金克木</p>'
      ]
    },
    {
      id: 'ganzhi',
      phase: '基础入门',
      title: '3. 天干地支 — 时间的密码',
      emoji: '📜',
      content: [
        '<p><strong>天干地支</strong>是中国古代的计时系统，也是紫微斗数排盘的基础。</p>',
        '<div class="course-card"><h5>🔟 十天干</h5><p>甲 乙 丙 丁 戊 己 庚 辛 壬 癸</p><p>五行配对：甲乙木、丙丁火、戊己土、庚辛金、壬癸水<br>阴阳交替：甲丙戊庚壬为阳，乙丁己辛癸为阴</p></div>',
        '<div class="course-card"><h5>⑫ 十二地支</h5><p>子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥</p><p>对应生肖：鼠牛虎兔龙蛇马羊猴鸡狗猪<br>对应时辰：子时(23-1) 丑时(1-3) ... 亥时(21-23)</p></div>',
        '<div class="course-card"><h5>📐 地支在命盘中的位置</h5><p>命盘是一个4×4的方阵，地支按固定位置排列：</p><pre style="font-size:0.75em;color:#aaa;line-height:1.6">    巳(5)  午(6)  未(7)  申(8)<br>    辰(4)                酉(9)<br>    卯(3)                戌(10)<br>    寅(2)  丑(1)  子(0)  亥(11)</pre></div>',
        '<p>天干+地支组合成<strong>60甲子</strong>（如甲子、乙丑...），用于标记年月日时。</p>'
      ]
    },
    {
      id: 'first-chart',
      phase: '基础入门',
      title: '4. 你的第一张命盘',
      emoji: '🗺️',
      highlight: '.input-panel',
      content: [
        '<p>现在你已经掌握了基础知识，来生成你的<strong>第一张命盘</strong>吧！</p>',
        '<p>在下方输入面板中填入：</p>',
        '<ol><li><strong>出生日期</strong>：公历年月日（也支持农历切换）</li><li><strong>出生时间</strong>：精确到几点几分</li><li><strong>性别</strong>：男/女（影响大限顺逆行）</li></ol>',
        '<p>点击<strong>"开始排盘"</strong>，你的专属命盘就生成了！</p>',
        '<p>命盘中间的方块显示你的<strong>命宫</strong>——这是全盘最重要的宫位，代表你自己。</p>',
        '<p>红色边框 = <span style="color:#ff8888">命宫</span>（你这个人）<br>蓝色边框 = <span style="color:#88bbff">身宫</span>（后半生重心）</p>',
        '<p>💡 点击任意星曜或宫位名称，会弹出详细百科解释！</p>'
      ]
    },

    // ==================== Phase 2: 宫位体系 ====================
    {
      id: 'palaces-1',
      phase: '宫位体系',
      title: '5. 十二宫详解 (上) — 命宫到疾厄',
      emoji: '🏠',
      content: [
        '<p>命盘12个宫位就像<strong>人生的12个房间</strong>，每个房间管不同领域。</p>',
        '<div class="course-card"><h5>🏠 命宫（第1宫）</h5><p><strong>代表：你自己</strong>— 性格、外貌、气质、给人的第一印象。全盘最重要的宫位，所有分析的起点。</p></div>',
        '<div class="course-card"><h5>👥 兄弟宫（第2宫）</h5><p><strong>代表：手足、密友</strong>— 兄弟姐妹关系、亲近的朋友圈、合伙人。</p></div>',
        '<div class="course-card"><h5>💕 夫妻宫（第3宫）</h5><p><strong>代表：配偶、婚姻</strong>— 另一半的性格特质、感情模式、婚姻质量。</p></div>',
        '<div class="course-card"><h5>👶 子女宫（第4宫）</h5><p><strong>代表：孩子、创造力</strong>— 子女缘分、生育情况，也管娱乐和创意。</p></div>',
        '<div class="course-card"><h5>💰 财帛宫（第5宫）</h5><p><strong>代表：赚钱能力</strong>— 收入来源、花钱方式、理财观念。</p></div>',
        '<div class="course-card"><h5>🏥 疾厄宫（第6宫）</h5><p><strong>代表：健康、疾病</strong>— 身体状况、易患疾病、灾厄。</p></div>',
        '<p>💡 <strong>记忆技巧</strong>：从命宫逆时针数，依次就是这6个宫位。</p>'
      ]
    },
    {
      id: 'palaces-2',
      phase: '宫位体系',
      title: '6. 十二宫详解 (下) — 迁移到父母',
      emoji: '🏡',
      content: [
        '<div class="course-card"><h5>✈️ 迁移宫（第7宫）</h5><p><strong>代表：外在形象、外出</strong>— 别人眼中的你、外出运势、社会表现。</p></div>',
        '<div class="course-card"><h5>🤝 交友宫（第8宫）</h5><p><strong>代表：朋友、下属</strong>— 人际关系质量、合作伙伴、下属缘分。</p></div>',
        '<div class="course-card"><h5>💼 官禄宫（第9宫）</h5><p><strong>代表：事业、学业</strong>— 职业方向、工作成就、考试运。和财帛宫是"财官组合"。</p></div>',
        '<div class="course-card"><h5>🏡 田宅宫（第10宫）</h5><p><strong>代表：房产、家庭</strong>— 不动产运、居住环境、家庭关系。</p></div>',
        '<div class="course-card"><h5>🧘 福德宫（第11宫）</h5><p><strong>代表：精神享受</strong>— 兴趣爱好、内心快乐来源、晚年福气。也管来世果报。</p></div>',
        '<div class="course-card"><h5>👨‍👩‍👧 父母宫（第12宫）</h5><p><strong>代表：父母、长辈</strong>— 与父母关系、上司缘分、长辈助力。</p></div>',
        '<p>💡 <strong>六条对宫轴线</strong>：命宫↔迁移、兄弟↔交友、夫妻↔官禄、子女↔田宅、财帛↔福德、疾厄↔父母。对宫互相影响！</p>'
      ]
    },
    {
      id: 'ming-shen',
      phase: '宫位体系',
      title: '7. 命宫与身宫 — 人生的两个重心',
      emoji: '🎯',
      content: [
        '<p>命盘中有两个<strong>特别标记</strong>的宫位：</p>',
        '<div class="course-card"><h5>🔴 命宫 — 先天之我</h5><p>由<strong>生月+生时</strong>决定。代表你的性格本质、先天禀赋、一生的"出厂设定"。命宫是<mark>解读全盘的入口</mark>，也是大限起算的起点。</p></div>',
        '<div class="course-card"><h5>🔵 身宫 — 后天之我</h5><p>由<strong>生月+生时</strong>顺数决定。代表你后半生的重心所在、后天努力的方向。身宫所在的宫位，告诉你<mark>35岁之后人生重点转向哪里</mark>。</p></div>',
        '<table style="width:100%;font-size:0.82em;margin-top:8px"><tr><th>情况</th><th>含义</th></tr><tr><td>命身同宫</td><td>表里如一，人生方向一贯</td></tr><tr><td>身宫在财帛</td><td>后半生重心在赚钱理财</td></tr><tr><td>身宫在官禄</td><td>后半生重心在事业发展</td></tr><tr><td>身宫在夫妻</td><td>后半生重心在婚姻家庭</td></tr><tr><td>身宫在迁移</td><td>后半生多外出、社会活跃</td></tr></table>',
        '<p>💡 <strong>怎么看</strong>：命宫看本质，身宫看归宿。两者结合才能完整了解一个人。</p>'
      ]
    },
    {
      id: 'sanfang-sizheng',
      phase: '宫位体系',
      title: '8. 三方四正 — 宫位的"朋友圈"',
      emoji: '📐',
      content: [
        '<p>紫微斗数中，一个宫位不是独立存在的——它和<strong>三个"好朋友"</strong>互相影响。</p>',
        '<div class="course-card"><h5>🔺 三方（三合）</h5><p>每隔4个宫位为一组：</p><ul><li>命宫 ↔ 财帛 ↔ 官禄（命财官三合）</li><li>兄弟 ↔ 疾厄 ↔ 田宅</li><li>夫妻 ↔ 迁移 ↔ 福德</li><li>子女 ↔ 交友 ↔ 父母</li></ul><p>三方宫位中的星曜会<mark>互相照应、互相增强</mark>。</p></div>',
        '<div class="course-card"><h5>🔁 四正（对宫）</h5><p>相差6个宫位的两个宫互为<strong>对宫</strong>：</p><ul><li>命宫 ↔ 迁移</li><li>兄弟 ↔ 交友</li><li>夫妻 ↔ 官禄</li><li>子女 ↔ 田宅</li><li>财帛 ↔ 福德</li><li>疾厄 ↔ 父母</li></ul><p>对宫之间<mark>相互映照、相互牵制</mark>。</p></div>',
        '<p>💡 <strong>实战用法</strong>：看财运，不光看财帛宫，还要看它的三方（命宫、官禄）和对宫（福德）。这叫"三方四正"全盘看。</p>'
      ]
    },

    // ==================== Phase 3: 星曜世界 ====================
    {
      id: 'stars-ziwei',
      phase: '星曜世界',
      title: '9. 十四主星 · 紫微系六星',
      emoji: '⭐',
      content: [
        '<p>紫微斗数有<strong>14颗主星</strong>，分为紫微系（6颗）和天府系（8颗）。先来看紫微系：</p>',
        '<div class="course-card"><h5>👑 紫微 — 皇帝星</h5><p>五行属土。天生的领导者，自尊心强、爱面子、有威望。喜欢被人尊重，不喜欢被指挥。紫微坐命的人通常有领导气质。</p></div>',
        '<div class="course-card"><h5>🧠 天机 — 军师星</h5><p>五行属木。聪明灵活、善于策划、反应快。但有时想太多、优柔寡断。是最聪明的星，适合做智囊、策划。</p></div>',
        '<div class="course-card"><h5>☀️ 太阳 — 贵人之星</h5><p>五行属火。热情大方、乐于助人、光明磊落。喜欢照顾别人，人缘好。但有时太好面子、花钱大方。</p></div>',
        '<div class="course-card"><h5>⚔️ 武曲 — 财星/将军星</h5><p>五行属金。果断刚毅、执行力强、善于理财。是14主星中的"正财星"。性格刚直，有时显得冷硬。</p></div>',
        '<div class="course-card"><h5>👶 天同 — 福星/小孩星</h5><p>五行属水。温和善良、知足常乐、不喜争斗。有福气，但有时懒散、缺乏上进心。</p></div>',
        '<div class="course-card"><h5>⚖️ 廉贞 — 检察官星</h5><p>五行属火。认真执着、爱恨分明、原则性强。做事一丝不苟，有时显得固执。也主官非和血光。</p></div>'
      ]
    },
    {
      id: 'stars-tianfu',
      phase: '星曜世界',
      title: '10. 十四主星 · 天府系八星',
      emoji: '🌟',
      content: [
        '<div class="course-card"><h5>🏛️ 天府 — 宰相星</h5><p>五行属土。稳重包容、善于管理、有大局观。天府是"库"，善于储蓄和积累。和紫微同为帝王之星，但天府更务实。</p></div>',
        '<div class="course-card"><h5>🌙 太阴 — 月亮星</h5><p>五行属水。温柔细腻、情感丰富、注重家庭。是"富星"，主不动产和积蓄。女命太阴坐命尤佳。</p></div>',
        '<div class="course-card"><h5>🦊 贪狼 — 桃花星/交际花</h5><p>五行属木。多才多艺、魅力四射、善于交际。是14主星中的"第一大桃花星"。也主宗教和玄学缘分。</p></div>',
        '<div class="course-card"><h5>👄 巨门 — 律师星/口舌星</h5><p>五行属水。口才好、善于分析辩论。但容易招惹口舌是非。巨门也是一颗"暗星"，内心世界复杂。</p></div>',
        '<div class="course-card"><h5>📋 天相 — 秘书星</h5><p>五行属水。公正无私、善于辅助协调。喜欢按规矩办事，是优秀的执行者。也主衣食福禄。</p></div>',
        '<div class="course-card"><h5>👴 天梁 — 长者星/寿星</h5><p>五行属土。成熟稳重、乐于助人、有长者之风。主长寿和庇荫，但也带孤克之气。</p></div>',
        '<div class="course-card"><h5>🗡️ 七杀 — 将星</h5><p>五行属金。勇猛果断、独立自主、敢闯敢拼。是"杀破狼"格局的核心星曜之一，人生变动大。</p></div>',
        '<div class="course-card"><h5>💥 破军 — 改革者</h5><p>五行属水。敢于打破常规、创新求变、先破后立。是14主星中最不安分的一颗，但破而后能立。</p></div>'
      ]
    },
    {
      id: 'brightness',
      phase: '星曜世界',
      title: '11. 星曜亮度 — 庙旺利陷',
      emoji: '💡',
      content: [
        '<p>同一颗星在不同宫位，表现<strong>天差地别</strong>。这取决于它在那个宫位是"舒服"还是"不舒服"。</p>',
        '<div class="course-card"><h5>🌈 七个亮度等级</h5><table style="width:100%;font-size:0.82em"><tr><th>等级</th><th>含义</th><th>评分</th></tr><tr><td style="color:#4caf50">庙</td><td>星曜最舒服的位置，能量最大，吉性完全发挥</td><td>100%</td></tr><tr><td style="color:#8bc34a">旺</td><td>非常有力量，接近庙的表现</td><td>85%</td></tr><tr><td style="color:#cddc39">得</td><td>表现不错，正常发挥</td><td>70%</td></tr><tr><td style="color:#ffc107">利</td><td>中等偏上，尚可</td><td>55%</td></tr><tr><td style="color:#ff9800">平</td><td>中性，不好不坏</td><td>40%</td></tr><tr><td style="color:#f44336">不</td><td>星曜不舒服，能量受抑制</td><td>25%</td></tr><tr><td style="color:#b71c1c">陷</td><td>星曜最弱的位置，吉性不显，凶性增大</td><td>10%</td></tr></table></div>',
        '<div class="course-card"><h5>📌 经典例子</h5><ul><li>太阳在<strong>午宫（庙）</strong>：如日中天，光芒万丈</li><li>太阳在<strong>子宫（陷）</strong>：半夜的太阳，有心无力</li><li>太阴在<strong>亥宫（庙）</strong>：月朗天门，温柔富贵</li><li>太阴在<strong>巳宫（陷）</strong>：月亮被太阳盖过，潜能受限</li></ul></div>',
        '<p>💡 <strong>核心原则</strong>：星曜庙旺 = 好运加倍，星曜落陷 = 好事打折。同等条件下，庙旺星的力量是落陷星的5-10倍。</p>'
      ]
    },
    {
      id: 'aux-stars',
      phase: '星曜世界',
      title: '12. 辅星精讲 — 六吉六煞',
      emoji: '✨',
      content: [
        '<p>除了14颗主星，还有<strong>辅星</strong>和<strong>杂曜</strong>在命盘中发挥重要作用。</p>',
        '<div class="course-card"><h5>🟢 六吉星（遇到就加分）</h5><ul><li><strong>左辅、右弼</strong>：贵人星，得人相助，增加助力</li><li><strong>文昌、文曲</strong>：文星，聪明好学，利考试学业</li><li><strong>天魁、天钺</strong>：贵人星，关键时刻有贵人出现</li></ul></div>',
        '<div class="course-card"><h5>🔴 六煞星（遇到要警惕）</h5><ul><li><strong>擎羊、陀罗</strong>：刑伤之星，容易有外伤或纠纷</li><li><strong>火星、铃星</strong>：火暴之星，脾气急、突发变故</li><li><strong>地空、地劫</strong>：空虚之星，钱财难聚、精神孤独</li></ul></div>',
        '<div class="course-card"><h5>🟡 其他重要辅星</h5><ul><li><strong>禄存</strong>：小财星，主稳定的财源（和化禄不同）</li><li><strong>天马</strong>：奔波星，主外出、移动、忙碌</li><li><strong>禄马交驰</strong>：禄存+天马同宫，动中得财，越忙越有钱</li></ul></div>',
        '<p>💡 吉星多不一定全好，煞星多不一定全坏——关键在于<strong>组合</strong>和<strong>宫位</strong>。煞星有时反而激发斗志。</p>'
      ]
    },

    // ==================== Phase 4: 四化飞星 ====================
    {
      id: 'sihua-basics',
      phase: '四化飞星',
      title: '13. 四化基础 — 禄权科忌',
      emoji: '🔀',
      content: [
        '<p><strong>四化</strong>是紫微斗数最核心的技法——它告诉你好运在哪、权力在哪、才华在哪、问题在哪。</p>',
        '<div class="course-card"><h5>🟢 化禄 — 好运、增加、顺利</h5><p>代表<strong>财富、机会、缘分</strong>。哪颗星化禄，那个领域就有好运加持。化禄在财帛 = 财运好；化禄在夫妻 = 感情甜蜜。</p></div>',
        '<div class="course-card"><h5>🟠 化权 — 权力、掌控、主导</h5><p>代表<strong>权力、竞争、掌控欲</strong>。化权在官禄 = 事业上有话语权；化权在命宫 = 个性强势。</p></div>',
        '<div class="course-card"><h5>🔵 化科 — 名声、优雅、得人欣赏</h5><p>代表<strong>名誉、学识、贵人</strong>。化科的人容易被赏识，适合考试、学术、文化领域。化科在命 = 有气质、有人缘。</p></div>',
        '<div class="course-card"><h5>🟣 化忌 — 执着、收敛、需要注意</h5><p>代表<strong>执着、收敛、困扰</strong>。化忌不是纯凶，而是"过度专注导致的问题"。化忌在哪，人生的课题就在哪。化忌在夫妻 = 为感情操心。</p></div>',
        '<p>💡 <strong>牢记口诀</strong>：禄随科走（好运跟着名声来），权忌相随（权力越大责任越大）。</p>'
      ]
    },
    {
      id: 'sihua-year',
      phase: '四化飞星',
      title: '14. 生年四化 — 命中定数',
      emoji: '📌',
      content: [
        '<p><strong>生年四化</strong>是根据你出生年的天干决定的，代表<mark>与生俱来的命运密码</mark>。</p>',
        '<div class="course-card"><h5>📋 生年四化对照表</h5><table style="width:100%;font-size:0.78em"><tr><th>年干</th><th>禄</th><th>权</th><th>科</th><th>忌</th></tr><tr><td>甲</td><td>廉贞</td><td>破军</td><td>武曲</td><td>太阳</td></tr><tr><td>乙</td><td>天机</td><td>天梁</td><td>紫微</td><td>太阴</td></tr><tr><td>丙</td><td>天同</td><td>天机</td><td>文昌</td><td>廉贞</td></tr><tr><td>丁</td><td>太阴</td><td>天同</td><td>天机</td><td>巨门</td></tr><tr><td>戊</td><td>贪狼</td><td>太阴</td><td>右弼</td><td>天机</td></tr><tr><td>己</td><td>武曲</td><td>贪狼</td><td>天梁</td><td>文曲</td></tr><tr><td>庚</td><td>太阳</td><td>武曲</td><td>太阴</td><td>天同</td></tr><tr><td>辛</td><td>巨门</td><td>太阳</td><td>文曲</td><td>文昌</td></tr><tr><td>壬</td><td>天梁</td><td>紫微</td><td>左辅</td><td>武曲</td></tr><tr><td>癸</td><td>破军</td><td>巨门</td><td>太阴</td><td>贪狼</td></tr></table></div>',
        '<p>生年四化告诉你：</p><ul><li><strong>禄在哪</strong> → 天生好运在哪个领域</li><li><strong>权在哪</strong> → 天生权力欲在哪个领域</li><li><strong>科在哪</strong> → 天生才华在哪个领域</li><li><strong>忌在哪</strong> → 一生的课题和挑战在哪个方面</li></ul>',
        '<p>💡 生年四化是<strong>固定不变的</strong>，它决定了你一生的基本格局。</p>'
      ]
    },
    {
      id: 'sihua-fly',
      phase: '四化飞星',
      title: '15. 飞宫四化 — 能量流转',
      emoji: '🔄',
      content: [
        '<p>除了生年四化，每个宫位的天干也会产生四化，这叫<strong>飞宫四化</strong>——它告诉你能量如何在宫位之间<mark>流动</mark>。</p>',
        '<div class="course-card"><h5>⬇️ 离心自化（飞出去）</h5><p>一个宫位天干化出去的禄权科忌，<strong>落到了哪个宫位</strong>，就代表这个宫位把能量"发射"到了目标宫位。</p><p>例：命宫化禄入夫妻宫 → 你天生对配偶好，愿意为感情付出</p></div>',
        '<div class="course-card"><h5>⬆️ 向心自化（飞进来）</h5><p>一个宫位天干化的四化，如果该星在<strong>对宫</strong>，则能量从对宫"吸进来"。</p><p>例：命宫化权，权星在迁移 → 你在外表现强势，社会形象有权威感</p></div>',
        '<div class="course-card"><h5>📐 飞星实战口诀</h5><ul><li>命宫化禄入XX宫 → 你主动对XX领域好</li><li>XX宫化禄入命宫 → XX领域的人/事主动对你好</li><li>命宫化忌入XX宫 → 你为XX领域操心劳碌</li><li>XX宫化忌入命宫 → XX领域的压力直接到你身上</li></ul></div>',
        '<p>💡 飞宫四化是<strong>进阶断盘的核心工具</strong>，配合本命盘使用效果最佳。</p>'
      ]
    },

    // ==================== Phase 5: 格局与断盘 ====================
    {
      id: 'patterns-1',
      phase: '格局实战',
      title: '16. 富贵格局解读',
      emoji: '👑',
      content: [
        '<p>当命盘中某些星曜形成<strong>特定组合</strong>时，就构成了"格局"。格局是断盘的快捷方式。</p>',
        '<div class="course-card"><h5>🏆 十大富贵格局</h5><ul><li><strong>紫府同宫格</strong>：紫微+天府同宫坐命，帝王将相之格，一生福禄双全</li><li><strong>君臣庆会格</strong>：紫微坐命+左右昌曲魁钺拱照，如君主得贤臣</li><li><strong>日照雷门格</strong>：太阳在卯宫坐命，旭日东升，前程光明</li><li><strong>月朗天门格</strong>：太阴在亥宫坐命，温柔富贵，尤利女命</li><li><strong>明珠出海格</strong>：未宫无主星+日月对拱，早年艰辛终成大器</li><li><strong>府相朝垣格</strong>：天府天相在三方四正会照，稳重有福</li><li><strong>阳梁昌禄格</strong>：太阳+天梁+文昌+禄存会齐，利考试升迁</li><li><strong>双禄交流格</strong>：三方四正见双禄，财源广进</li><li><strong>三奇嘉会格</strong>：禄权科三奇会齐，才华横溢，名利双收</li><li><strong>将星得地格</strong>：武曲在辰戌坐命，大器晚成</li></ul></div>',
        '<p>💡 有多重格局叠加的命盘，往往是<strong>大富大贵</strong>之命。</p>'
      ]
    },
    {
      id: 'patterns-2',
      phase: '格局实战',
      title: '17. 特殊格局与凶格',
      emoji: '⚠️',
      content: [
        '<p>不是所有格局都是好的——有些格局代表<strong>波折和挑战</strong>，但凶格往往也孕育着非凡的机遇。</p>',
        '<div class="course-card"><h5>🔄 杀破狼格</h5><p>命宫见七杀、破军、贪狼之一。人生三大变动星，主人一生<strong>变动大、敢闯敢拼</strong>，适合创业开拓。不适合安稳工作。</p></div>',
        '<div class="course-card"><h5>🤔 机月同梁格</h5><p>天机、太阴、天同、天梁中见多颗。为人机敏温和，适合<strong>文职公务</strong>。心思细腻但容易想太多。</p></div>',
        '<div class="course-card"><h5>⚠️ 需要注意的格局</h5><ul><li><strong>命无正曜格</strong>：命宫无主星，人生方向需他人引导</li><li><strong>命里逢空格</strong>：地空地劫在命，钱财难聚，宜修行</li><li><strong>火铃夹命格</strong>：火星铃星夹命，多突发波折</li><li><strong>刑忌夹印格</strong>：天相被刑煞夹，注意官非口舌</li><li><strong>马头带箭格</strong>：擎羊在午宫，先苦后甜，终能脱颖而出</li></ul></div>',
        '<p>💡 <strong>重要</strong>：凶格不代表命不好！很多成功人士命带杀破狼或空劫。格局只是"底色"，后天努力才是关键。</p>'
      ]
    },
    {
      id: 'three-panels',
      phase: '格局实战',
      title: '18. 本命·大限·流年 — 三盘同参',
      emoji: '⏳',
      content: [
        '<p>紫微斗数有三层时间结构，从宏观到微观：</p>',
        '<div class="course-card"><h5>🔵 本命盘 — 一生的"出厂设置"</h5><p>出生那一刻定下的盘，<mark>一生不变</mark>。看性格本质、天赋、一生的总体趋势。所有分析的基础。</p></div>',
        '<div class="course-card"><h5>🟢 大限盘 — 每十年的"主题曲"</h5><p>每10年走一个大限，从命宫开始顺/逆行。每个大限有不同的宫位做主角。<mark>告诉你这十年人生的重心在哪里</mark>。</p><p>例：20-29岁走夫妻宫大限 → 这十年感情婚姻是主题</p></div>',
        '<div class="course-card"><h5>🟡 流年盘 — 每年的"天气预报"</h5><p>每年一张流年盘，可以精确到<strong>流月、流日、流时</strong>。<mark>告诉你今年的运势走向</mark>。</p><p>再往下细分：流年 → 流月 → 流日 → 流时，一层比一层精细。</p></div>',
        '<p>💡 <strong>三盘同参口诀</strong>：本命好 + 大限好 + 流年好 = 万事大吉<br>本命好 + 大限好 + 流年差 = 暂时不顺，终会过去<br>本命差 + 大限差 + 流年差 = 韬光养晦，等待时机</p>'
      ]
    },
    {
      id: 'diegong',
      phase: '格局实战',
      title: '19. 叠宫技法与实战断盘',
      emoji: '🎯',
      content: [
        '<p><strong>叠宫</strong>是紫微斗数高阶技法——本命、大限、流年三个盘的宫位<mark>叠在一起看</mark>。</p>',
        '<div class="course-card"><h5>📐 叠宫三步法</h5><ol><li><strong>定宫位</strong>：确定本命盘的12宫位名称</li><li><strong>叠大限</strong>：把大限盘的宫位叠上去，看这十年的重点</li><li><strong>叠流年</strong>：再把流年盘叠上去，看今年的具体事件</li></ol></div>',
        '<div class="course-card"><h5>📋 实战断盘流程</h5><ol><li>看命宫主星 + 亮度 → 了解性格本质</li><li>看三方四正 → 了解整体格局</li><li>看四化分布 → 定位好运和问题领域</li><li>看身宫位置 → 了解后半生重心</li><li>看当前大限 → 了解这十年主题</li><li>看当前流年 → 了解今年运势</li><li>综合判断 → 给出完整解读</li></ol></div>',
        '<p>💡 <strong>案例</strong>：某人问今年财运。先看本命财帛宫好坏 → 再看当前大限是否走到财帛相关宫位 → 最后看今年流年财帛宫如何。三层都对上，财运必佳。</p>'
      ]
    },
    {
      id: 'summary',
      phase: '格局实战',
      title: '20. 课程总结 + 进阶路径',
      emoji: '🏆',
      content: [
        '<p>🎉 <strong>恭喜你完成了0基础到精通的全部课程！</strong></p>',
        '<div class="course-card"><h5>📋 你已掌握的核心技能</h5><ul><li>✅ 阴阳五行和天干地支的基础知识</li><li>✅ 12宫位的含义和六条对宫轴线</li><li>✅ 14主星的性格特质和五行属性</li><li>✅ 星曜庙旺利陷的亮度判断</li><li>✅ 六吉六煞的吉凶影响</li><li>✅ 禄权科忌四化的解读方法</li><li>✅ 生年四化和飞宫四化的区别</li><li>✅ 40+种特殊格局的识别</li><li>✅ 本命/大限/流年三盘同参技法</li><li>✅ 叠宫断盘的完整流程</li></ul></div>',
        '<div class="course-card"><h5>🚀 进阶学习路径</h5><ol><li><strong>多排盘多练习</strong>：给自己和家人朋友排盘，积累经验</li><li><strong>善用百科弹窗</strong>：点击任意星曜或宫位查看详细解读</li><li><strong>使用AI解读</strong>：排盘后点击"AI命盘解读"，对比你的判断</li><li><strong>阅读古籍</strong>：《紫微斗数全书》《十八飞星策天紫微斗数》</li><li><strong>飞星深造</strong>：学习梁派飞星、钦天门飞星等流派技法</li></ol></div>',
        '<p style="text-align:center;font-size:1.2em;margin-top:16px">🌟 <strong>命理是地图，走路的是你自己。知命不认命，人生之路，永远在自己手中！</strong> 🌟</p>'
      ]
    }
  ];

  var currentStep = 0;
  var overlayEl = null;
  var isOpen = false;

  function createOverlay() {
    if (overlayEl) return;

    overlayEl = document.createElement('div');
    overlayEl.className = 'tutorial-overlay';
    overlayEl.id = 'ziweiCourseOverlay';
    overlayEl.onclick = function(e) {
      if (e.target === overlayEl) close();
    };

    overlayEl.innerHTML =
      '<div class="tutorial-dialog course-dialog" id="ziweiCourseDialog">' +
        '<div class="tutorial-header">' +
          '<div class="course-phase-indicator" id="coursePhase"></div>' +
          '<div class="tutorial-step-indicator" id="courseSteps"></div>' +
          '<button class="tutorial-close" onclick="ZiweiCourse.close()">✕</button>' +
        '</div>' +
        '<div class="tutorial-body">' +
          '<div class="tutorial-emoji" id="courseEmoji"></div>' +
          '<h2 class="tutorial-title" id="courseTitle"></h2>' +
          '<div class="tutorial-content" id="courseContent"></div>' +
        '</div>' +
        '<div class="tutorial-footer">' +
          '<button class="tutorial-btn tutorial-btn-prev" id="coursePrev" onclick="ZiweiCourse.prev()">◀ 上一步</button>' +
          '<span class="tutorial-progress" id="courseProgress"></span>' +
          '<button class="tutorial-btn tutorial-btn-next" id="courseNext" onclick="ZiweiCourse.next()">下一步 ▶</button>' +
          '<button class="tutorial-btn tutorial-btn-finish" id="courseFinish" onclick="ZiweiCourse.close()" style="display:none;">🎉 完成课程</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlayEl);
  }

  function renderStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    var step = steps[index];

    var stepsHtml = '';
    for (var i = 0; i < steps.length; i++) {
      var cls = i === index ? ' active' : (i < index ? ' done' : '');
      stepsHtml += '<span class="tutorial-dot' + cls + '" onclick="ZiweiCourse.goTo(' + i + ')"></span>';
    }
    document.getElementById('courseSteps').innerHTML = stepsHtml;

    document.getElementById('coursePhase').textContent = '📚 ' + step.phase;
    document.getElementById('courseEmoji').textContent = step.emoji;
    document.getElementById('courseTitle').textContent = step.title;
    document.getElementById('courseContent').innerHTML = step.content.join('');

    document.getElementById('courseProgress').textContent = (index + 1) + ' / ' + steps.length;

    var prevBtn = document.getElementById('coursePrev');
    var nextBtn = document.getElementById('courseNext');
    var finishBtn = document.getElementById('courseFinish');

    prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
    if (index === steps.length - 1) {
      nextBtn.style.display = 'none';
      finishBtn.style.display = 'inline-block';
    } else {
      nextBtn.style.display = 'inline-block';
      finishBtn.style.display = 'none';
    }

    clearHighlight();
    if (step.highlight) {
      highlightElement(step.highlight);
    }

    if (overlayEl) {
      if (step.id === 'first-chart') {
        overlayEl.style.pointerEvents = 'none';
        var dlg = document.getElementById('ziweiCourseDialog');
        if (dlg) dlg.style.pointerEvents = 'auto';
      } else {
        overlayEl.style.pointerEvents = '';
        var dlg = document.getElementById('ziweiCourseDialog');
        if (dlg) dlg.style.pointerEvents = '';
      }
    }

    var dialog = document.getElementById('ziweiCourseDialog');
    if (dialog) dialog.scrollTop = 0;
    var content = document.getElementById('courseContent');
    if (content) content.scrollTop = 0;
  }

  function highlightElement(selector) {
    try {
      var el = document.querySelector(selector);
      if (!el) return;
      el.classList.add('tutorial-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch(e) {}
  }

  function clearHighlight() {
    var els = document.querySelectorAll('.tutorial-highlight');
    els.forEach(function(el) { el.classList.remove('tutorial-highlight'); });
  }

  function open() {
    createOverlay();
    overlayEl.style.display = 'flex';
    isOpen = true;
    currentStep = 0;
    renderStep(0);
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (overlayEl) overlayEl.style.display = 'none';
    isOpen = false;
    clearHighlight();
    document.body.style.overflow = '';
  }

  function next() {
    if (currentStep < steps.length - 1) {
      renderStep(currentStep + 1);
    }
  }

  function prev() {
    if (currentStep > 0) {
      renderStep(currentStep - 1);
    }
  }

  function goTo(index) {
    renderStep(index);
  }

  function isCourseOpen() {
    return isOpen;
  }

  return {
    open: open,
    close: close,
    next: next,
    prev: prev,
    goTo: goTo,
    steps: steps,
    isOpen: isCourseOpen
  };
})();
