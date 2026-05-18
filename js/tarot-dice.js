/**
 * 塔罗牌 + 占星骰子系统
 */

var TarotDice = (function() {
  'use strict';

  // ==================== 塔罗牌 ====================

  var MAJOR_ARCANA = [
    { id:0,  name:'愚者', en:'The Fool', desc:'新的开始，冒险，天真，无限可能，信任生命的旅程', keywords:['开始','自由','冒险','潜力'] },
    { id:1,  name:'魔术师', en:'The Magician', desc:'创造力，意志力，技能，显化，资源充沛', keywords:['创造','技能','显化','资源'] },
    { id:2,  name:'女祭司', en:'The High Priestess', desc:'直觉，潜意识，神秘智慧，内在认知，等待', keywords:['直觉','神秘','等待','智慧'] },
    { id:3,  name:'皇后', en:'The Empress', desc:'丰盛，滋养，母性，自然，感官享受', keywords:['丰盛','滋养','美丽','自然'] },
    { id:4,  name:'皇帝', en:'The Emperor', desc:'权威，结构，秩序，领导力，稳定', keywords:['权威','秩序','领导','稳定'] },
    { id:5,  name:'教皇', en:'The Hierophant', desc:'传统，信仰，教育，精神导师，制度', keywords:['传统','信仰','教育','规则'] },
    { id:6,  name:'恋人', en:'The Lovers', desc:'爱情，选择，和谐，价值观，结合', keywords:['爱情','选择','结合','和谐'] },
    { id:7,  name:'战车', en:'The Chariot', desc:'胜利，意志力，决心，掌控，前进', keywords:['胜利','意志','前进','掌控'] },
    { id:8,  name:'力量', en:'Strength', desc:'勇气，力量，耐心，内在掌控，柔和', keywords:['勇气','力量','耐心','柔和'] },
    { id:9,  name:'隐者', en:'The Hermit', desc:'内省，孤独，智慧，引导，沉思', keywords:['内省','孤独','智慧','引导'] },
    { id:10, name:'命运之轮', en:'Wheel of Fortune', desc:'命运，转折，循环，机遇，因果', keywords:['命运','转折','机遇','循环'] },
    { id:11, name:'正义', en:'Justice', desc:'公平，真理，因果，法律，平衡', keywords:['公平','真理','因果','平衡'] },
    { id:12, name:'倒吊人', en:'The Hanged Man', desc:'牺牲，放手，新视角，等待，顿悟', keywords:['牺牲','放手','视角','等待'] },
    { id:13, name:'死神', en:'Death', desc:'结束，转变，重生，放下，蜕变', keywords:['结束','转变','重生','放下'] },
    { id:14, name:'节制', en:'Temperance', desc:'平衡，调和，耐心，中庸，融合', keywords:['平衡','调和','耐心','融合'] },
    { id:15, name:'恶魔', en:'The Devil', desc:'束缚，欲望，物质主义，阴影，执着', keywords:['束缚','欲望','执着','阴影'] },
    { id:16, name:'高塔', en:'The Tower', desc:'突变，瓦解，启示，觉醒，打破幻象', keywords:['突变','瓦解','觉醒','打破'] },
    { id:17, name:'星星', en:'The Star', desc:'希望，信仰，灵感，疗愈，宁静', keywords:['希望','信仰','疗愈','宁静'] },
    { id:18, name:'月亮', en:'The Moon', desc:'幻觉，恐惧，潜意识，梦境，迷惑', keywords:['幻觉','恐惧','潜意识','迷惑'] },
    { id:19, name:'太阳', en:'The Sun', desc:'快乐，成功，活力，自信，光明', keywords:['快乐','成功','活力','光明'] },
    { id:20, name:'审判', en:'Judgement', desc:'觉醒，重生，召唤，原谅，抉择', keywords:['觉醒','重生','召唤','抉择'] },
    { id:21, name:'世界', en:'The World', desc:'完成，圆满，成就，整合，旅行', keywords:['完成','圆满','成就','整合'] }
  ];

  function drawTarot(count) {
    count = count || 3;
    var deck = MAJOR_ARCANA.slice();
    // Fisher-Yates shuffle
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }
    var drawn = deck.slice(0, count);
    // 随机反转
    return drawn.map(function(c) {
      var reversed = Math.random() < 0.3;
      return {
        card: c,
        reversed: reversed,
        displayName: reversed ? '逆位 ' + c.name : '正位 ' + c.name,
        desc: reversed ? '逆位：' + c.desc.replace(/，/g, '减弱，').replace('无限可能','犹豫不决').replace('创造','受阻') : '正位：' + c.desc
      };
    });
  }

  function drawTarotSpread(spreadType) {
    spreadType = spreadType || 'three';
    var spreads = {
      single: { count:1, positions:['核心指引'] },
      three: { count:3, positions:['过去','现在','未来'] },
      celtic: { count:10, positions:['现状','挑战','过去','未来','目标','近未来','态度','环境','希望','结果'] },
      relationship: { count:5, positions:['你','对方','关系现状','挑战','未来'] },
      career: { count:5, positions:['当前状态','阻碍','助力','建议','结果'] }
    };
    var spread = spreads[spreadType] || spreads.three;
    var cards = drawTarot(spread.count);
    var result = [];
    for (var i = 0; i < spread.count; i++) {
      result.push({ position: spread.positions[i], card: cards[i] });
    }
    return { spreadType: spreadType, cards: result };
  }

  // ==================== 占星骰子 ====================

  var DICE_PLANETS = [
    { name:'太阳', glyph:'☉', color:'#ffcc00', meaning:'自我、意志、生命力、创造力、父亲' },
    { name:'月亮', glyph:'☽', color:'#ccccee', meaning:'情绪、直觉、母亲、安全感、潜意识' },
    { name:'水星', glyph:'☿', color:'#88ccff', meaning:'沟通、思维、学习、短途旅行、信息' },
    { name:'金星', glyph:'♀', color:'#ff88cc', meaning:'爱情、美、金钱、和谐、艺术' },
    { name:'火星', glyph:'♂', color:'#ff6666', meaning:'行动、欲望、竞争、勇气、冲突' },
    { name:'木星', glyph:'♃', color:'#cc9966', meaning:'扩张、幸运、信仰、成长、乐观' },
    { name:'土星', glyph:'♄', color:'#889988', meaning:'限制、责任、纪律、耐心、考验' },
    { name:'天王星', glyph:'♅', color:'#66ccaa', meaning:'突变、革新、自由、颠覆、意外' },
    { name:'海王星', glyph:'♆', color:'#8888cc', meaning:'梦想、幻象、灵感、牺牲、超越' },
    { name:'冥王星', glyph:'♇', color:'#886644', meaning:'蜕变、权力、毁灭、重生、深层' }
  ];

  var DICE_SIGNS = [
    { name:'白羊座', symbol:'♈', element:'火', meaning:'开创、直接、勇敢、冲动' },
    { name:'金牛座', symbol:'♉', element:'土', meaning:'稳定、物质、享受、固执' },
    { name:'双子座', symbol:'♊', element:'风', meaning:'灵活、好奇、沟通、多变' },
    { name:'巨蟹座', symbol:'♋', element:'水', meaning:'情感、保护、家庭、敏感' },
    { name:'狮子座', symbol:'♌', element:'火', meaning:'自信、慷慨、戏剧、骄傲' },
    { name:'处女座', symbol:'♍', element:'土', meaning:'分析、服务、完美、挑剔' },
    { name:'天秤座', symbol:'♎', element:'风', meaning:'平衡、优雅、合作、犹豫' },
    { name:'天蝎座', symbol:'♏', element:'水', meaning:'深刻、激情、洞察、极端' },
    { name:'射手座', symbol:'♐', element:'火', meaning:'探索、自由、乐观、粗心' },
    { name:'摩羯座', symbol:'♑', element:'土', meaning:'野心、责任、攀登、冷漠' },
    { name:'水瓶座', symbol:'♒', element:'风', meaning:'创新、博爱、独立、疏离' },
    { name:'双鱼座', symbol:'♓', element:'水', meaning:'同情、梦幻、艺术、逃避' }
  ];

  var DICE_HOUSES = [
    { name:'1宫(命宫)', meaning:'自我、外貌、新开始' },
    { name:'2宫(财帛)', meaning:'金钱、价值、资源' },
    { name:'3宫(兄弟)', meaning:'沟通、学习、短途' },
    { name:'4宫(田宅)', meaning:'家庭、根源、安全感' },
    { name:'5宫(子女)', meaning:'创造、恋爱、娱乐' },
    { name:'6宫(奴仆)', meaning:'工作、健康、服务' },
    { name:'7宫(夫妻)', meaning:'伴侣、合作、公开敌人' },
    { name:'8宫(疾厄)', meaning:'偏财、性、转变' },
    { name:'9宫(迁移)', meaning:'远行、信仰、哲学' },
    { name:'10宫(官禄)', meaning:'事业、名声、地位' },
    { name:'11宫(福德)', meaning:'朋友、希望、社群' },
    { name:'12宫(玄秘)', meaning:'潜意识、因果、隐秘' }
  ];

  function rollDice() {
    var planet = DICE_PLANETS[Math.floor(Math.random() * DICE_PLANETS.length)];
    var sign = DICE_SIGNS[Math.floor(Math.random() * DICE_SIGNS.length)];
    var house = DICE_HOUSES[Math.floor(Math.random() * DICE_HOUSES.length)];

    function buildInterpretation(p, s, h) {
      return p.name + '落在' + s.name + '在' + h.name + '：' +
        '当' + p.name + '（' + p.meaning.substring(0,4) + '）的能量通过' +
        s.name + '（' + s.element + '象）的方式，在' + h.name.replace(/\(.*\)/,'') +
        '领域展现。' + s.meaning.substring(0,6) + '的能量特质影响' + h.meaning;
    }

    return {
      planet: planet,
      sign: sign,
      house: house,
      interpretation: buildInterpretation(planet, sign, house)
    };
  }

  function rollDiceMulti(count) {
    count = count || 3;
    var results = [];
    for (var i = 0; i < count; i++) {
      results.push(rollDice());
    }
    return results;
  }

  return {
    MAJOR_ARCANA: MAJOR_ARCANA,
    drawTarot: drawTarot,
    drawTarotSpread: drawTarotSpread,
    rollDice: rollDice,
    rollDiceMulti: rollDiceMulti,
    DICE_PLANETS: DICE_PLANETS,
    DICE_SIGNS: DICE_SIGNS,
    DICE_HOUSES: DICE_HOUSES
  };
})();
