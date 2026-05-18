/**
 * 西洋占星高级引擎
 * 行运盘 · 日返/月返盘 · 太阳弧 · 法达星限 · 比较盘 · 组合盘 · 时空盘 · 马盘
 */

var AstrologyPro = (function() {
  'use strict';

  // ==================== 行运盘 (Transit) ====================

  function calcTransitChart(birthYear, birthMonth, birthDay, birthHour, birthMinute, transitYear, transitMonth, transitDay, transitHour) {
    transitHour = transitHour || 0;
    var natal = Astrology.calculateChart(birthYear, birthMonth, birthDay, birthHour, birthMinute);
    var transit = Astrology.calculateChart(transitYear, transitMonth, transitDay, transitHour, 0);
    
    // 行运行星 vs 本命行星的相位
    var aspects = [];
    var ASPECT_TYPES = [
      {name:'合', angle:0, orb:8, color:'#ffaa00', symbol:'☌'},
      {name:'六合', angle:60, orb:4, color:'#66ccff', symbol:'⚹'},
      {name:'刑', angle:90, orb:5, color:'#ff6666', symbol:'□'},
      {name:'三合', angle:120, orb:6, color:'#66ff88', symbol:'△'},
      {name:'冲', angle:180, orb:6, color:'#ff4444', symbol:'☍'}
    ];

    var transitPlanets = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
    var natalPlanets = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];

    transitPlanets.forEach(function(tKey) {
      var tp = findPlanet(transit.planets, tKey);
      if (!tp) return;
      natalPlanets.forEach(function(nKey) {
        var np = findPlanet(natal.planets, nKey);
        if (!np) return;
        var diff = Math.abs(tp.lon - np.lon);
        if (diff > 180) diff = 360 - diff;
        ASPECT_TYPES.forEach(function(at) {
          var orb = Math.abs(diff - at.angle);
          if (orb <= at.orb) {
            aspects.push({
              transitPlanet: tp.name,
              transitGlyph: tp.glyph,
              transitColor: tp.color,
              natalPlanet: np.name,
              natalGlyph: np.glyph,
              natalColor: np.color,
              aspect: at.name,
              symbol: at.symbol,
              orb: Math.round(orb * 10) / 10,
              color: at.color,
              desc: '行运' + tp.name + at.name + '本命' + np.name
            });
          }
        });
      });
    });

    // 行运行星过宫
    var transitHouses = [];
    transit.planets.forEach(function(p) {
      var houseIdx = Math.floor(((p.lon - natal.asc + 360) % 360) / 30);
      var houseName = ['一宫·命宫','二宫·财帛','三宫·兄弟','四宫·田宅','五宫·子女',
        '六宫·奴仆','七宫·夫妻','八宫·疾厄','九宫·迁移','十宫·官禄','十一宫·福德','十二宫·玄秘'][houseIdx];
      transitHouses.push({
        planet: p.name, glyph: p.glyph, color: p.color,
        house: houseName, houseIdx: houseIdx + 1,
        zodiac: p.zodiac, degree: p.degree,
        desc: '行运' + p.name + '进入' + houseName
      });
    });

    return {
      type: 'transit',
      transitDate: transitYear + '-' + String(transitMonth).padStart(2,'0') + '-' + String(transitDay).padStart(2,'0'),
      aspects: aspects,
      transitHouses: transitHouses,
      transitPlanets: transit.planets,
      natalPlanets: natal.planets,
      natal: natal
    };
  }

  // ==================== 太阳返照盘 (Solar Return) ====================

  function calcSolarReturn(birthYear, birthMonth, birthDay, birthHour, birthMinute, targetYear) {
    // 寻找太阳回到本命太阳精确度数的时刻
    var natal = Astrology.calculateChart(birthYear, birthMonth, birthDay, birthHour, birthMinute);
    var natalSunLon = natal.planets[0].lon; // Sun is first

    // 简化：用目标年的生日前后几天估算
    var jdBase = gregorianToJDN(targetYear, birthMonth, birthDay);
    var bestJD = jdBase;
    var bestDiff = 360;

    for (var d = -2; d <= 2; d += 0.1) {
      var jd = jdBase + d;
      var gd = jdnToGregorian(jd);
      var srChart = Astrology.calculateChart(gd.year, gd.month, gd.day, Math.floor(gd.hour), Math.round((gd.hour - Math.floor(gd.hour)) * 60));
      var srSunLon = srChart.planets[0].lon;
      var diff = Math.abs(srSunLon - natalSunLon);
      if (diff > 180) diff = 360 - diff;
      if (diff < bestDiff) {
        bestDiff = diff;
        bestJD = jd;
      }
    }

    var gd = jdnToGregorian(bestJD);
    var solarReturn = Astrology.calculateChart(Math.round(gd.year), Math.round(gd.month), Math.round(gd.day), Math.round(gd.hour), Math.round((gd.hour - Math.floor(gd.hour)) * 60));

    // 日返盘解读重点：ASC星座为本年主题
    var ascZod = solarReturn.ascZod;
    var ascInterpretation = '日返上升' + ascZod.zodiac + '：今年你将以' + ascZod.zodiac + '的特质应对外界，这一年的人生主题围绕' + ascZod.zodiac + '座相关领域展开。';

    return {
      type: 'solarReturn',
      targetYear: targetYear,
      chart: solarReturn,
      ascInterpretation: ascInterpretation,
      date: Math.round(gd.year) + '-' + String(Math.round(gd.month)).padStart(2,'0') + '-' + String(Math.round(gd.day)).padStart(2,'0'),
      planets: solarReturn.planets,
      houses: solarReturn.houses,
      asc: solarReturn.asc,
      mc: solarReturn.mc
    };
  }

  // ==================== 月亮返照盘 (Lunar Return) ====================

  function calcLunarReturn(birthYear, birthMonth, birthDay, birthHour, birthMinute, targetYear, targetMonth) {
    var natal = Astrology.calculateChart(birthYear, birthMonth, birthDay, birthHour, birthMinute);
    var natalMoonLon = natal.planets[1].lon; // Moon is second

    var jdBase = gregorianToJDN(targetYear, targetMonth, 15);
    var bestJD = jdBase;
    var bestDiff = 360;

    for (var d = -15; d <= 15; d += 0.05) {
      var jd = jdBase + d;
      var gd = jdnToGregorian(jd);
      var lrChart = Astrology.calculateChart(gd.year, gd.month, gd.day, Math.floor(gd.hour), Math.round((gd.hour - Math.floor(gd.hour)) * 60));
      var lrMoonLon = lrChart.planets[1].lon;
      var diff = Math.abs(lrMoonLon - natalMoonLon);
      if (diff > 180) diff = 360 - diff;
      if (diff < bestDiff) {
        bestDiff = diff;
        bestJD = jd;
      }
    }

    var gd = jdnToGregorian(bestJD);
    var lunarReturn = Astrology.calculateChart(Math.round(gd.year), Math.round(gd.month), Math.round(gd.day), Math.round(gd.hour), Math.round((gd.hour - Math.floor(gd.hour)) * 60));

    return {
      type: 'lunarReturn',
      targetYear: targetYear,
      targetMonth: targetMonth,
      chart: lunarReturn,
      date: Math.round(gd.year) + '-' + String(Math.round(gd.month)).padStart(2,'0') + '-' + String(Math.round(gd.day)).padStart(2,'0'),
      planets: lunarReturn.planets,
      houses: lunarReturn.houses,
      asc: lunarReturn.asc
    };
  }

  // ==================== 太阳弧推运 (Solar Arc) ====================

  function calcSolarArc(birthYear, birthMonth, birthDay, birthHour, birthMinute, targetYear) {
    var natal = Astrology.calculateChart(birthYear, birthMonth, birthDay, birthHour, birthMinute);
    var age = targetYear - birthYear;
    var arcPerYear = 1.0; // 1 degree per year (simplified)
    var solarArc = arcPerYear * age;

    var progressedPlanets = natal.planets.map(function(p) {
      return {
        name: p.name,
        glyph: p.glyph,
        color: p.color,
        lon: p.lon + solarArc,
        progressedLon: (p.lon + solarArc) % 360,
        natalLon: p.lon
      };
    });

    // 太阳弧行星 vs 本命行星/轴点的相位
    var aspects = [];
    var ASPECT_TYPES = [
      {name:'合', angle:0, orb:1.5, symbol:'☌'},
      {name:'刑', angle:90, orb:1.5, symbol:'□'},
      {name:'冲', angle:180, orb:1.5, symbol:'☍'},
      {name:'三合', angle:120, orb:2, symbol:'△'}
    ];

    // Check SA planets against natal planets and angles
    var natalTargets = natal.planets.concat([
      {name:'ASC', lon: natal.asc, glyph:'AC', color:'#ff8888'},
      {name:'MC', lon: natal.mc, glyph:'MC', color:'#88ccff'},
      {name:'DES', lon: natal.desc, glyph:'DS', color:'#ff8888'},
      {name:'IC', lon: natal.ic, glyph:'IC', color:'#88ccff'}
    ]);

    progressedPlanets.forEach(function(sap) {
      natalTargets.forEach(function(nt) {
        var diff = Math.abs(sap.progressedLon - nt.lon);
        if (diff > 180) diff = 360 - diff;
        ASPECT_TYPES.forEach(function(at) {
          var orb = Math.abs(diff - at.angle);
          if (orb <= at.orb) {
            aspects.push({
              saPlanet: sap.name,
              saGlyph: sap.glyph,
              saColor: sap.color,
              natalTarget: nt.name,
              natalGlyph: nt.glyph,
              natalColor: nt.color || '#ccc',
              aspect: at.name,
              symbol: at.symbol,
              orb: Math.round(orb * 100) / 100,
              desc: 'SA ' + sap.name + ' ' + at.name + ' 本命' + nt.name + ' (' + Math.round(age) + '岁)'
            });
          }
        });
      });
    });

    return {
      type: 'solarArc',
      targetYear: targetYear,
      age: age,
      solarArc: Math.round(solarArc * 100) / 100,
      aspects: aspects,
      progressedPlanets: progressedPlanets
    };
  }

  // ==================== 法达星限 (Firdaria) ====================

  function calcFirdaria(birthYear, birthMonth, birthDay, birthHour, targetYear) {
    var age = targetYear - birthYear;
    var periods = [
      { planet:'太阳', glyph:'☉', color:'#ffcc00', startAge:0, duration:10, nocturnal:'月亮' },
      { planet:'金星', glyph:'♀', color:'#ff88cc', startAge:10, duration:8, nocturnal:'土星' },
      { planet:'水星', glyph:'☿', color:'#88ccff', startAge:18, duration:13, nocturnal:'木星' },
      { planet:'月亮', glyph:'☽', color:'#ccccee', startAge:31, duration:9, nocturnal:'太阳' },
      { planet:'土星', glyph:'♄', color:'#889988', startAge:40, duration:11, nocturnal:'水星' },
      { planet:'木星', glyph:'♃', color:'#cc9966', startAge:51, duration:12, nocturnal:'金星' },
      { planet:'火星', glyph:'♂', color:'#ff6666', startAge:63, duration:7, nocturnal:'火星' },
      { planet:'北交', glyph:'☊', startAge:70, duration:3 },
      { planet:'南交', glyph:'☋', startAge:73, duration:2 }
    ];

    var current = null;
    var next = null;
    for (var i = 0; i < periods.length; i++) {
      var p = periods[i];
      var endAge = p.startAge + p.duration;
      if (age >= p.startAge && age < endAge) {
        current = p;
        if (i + 1 < periods.length) next = periods[i + 1];
        break;
      }
    }

    // 子周期（简化：平均分配）
    var subPeriods = [];
    if (current) {
      var subDur = current.duration / 7;
      var subPlanets = ['太阳','月亮','火星','水星','木星','金星','土星'];
      for (var j = 0; j < 7; j++) {
        subPeriods.push({
          planet: subPlanets[j],
          startAge: current.startAge + j * subDur,
          duration: subDur
        });
      }
    }

    return {
      type: 'firdaria',
      currentPeriod: current,
      nextPeriod: next,
      subPeriods: subPeriods,
      age: age,
      allPeriods: periods
    };
  }

  // ==================== 比较盘 (Synastry / 合盘) ====================

  function calcSynastryChart(birth1, birth2) {
    var chart1 = Astrology.calculateChart(birth1.year, birth1.month, birth1.day, birth1.hour, birth1.minute || 0);
    var chart2 = Astrology.calculateChart(birth2.year, birth2.month, birth2.day, birth2.hour, birth2.minute || 0);

    var aspects = [];
    var ASPECT_TYPES = [
      {name:'合', angle:0, orb:6, color:'#ffaa00', symbol:'☌', score:10},
      {name:'六合', angle:60, orb:4, color:'#66ccff', symbol:'⚹', score:6},
      {name:'刑', angle:90, orb:5, color:'#ff6666', symbol:'□', score:-5},
      {name:'三合', angle:120, orb:6, color:'#66ff88', symbol:'△', score:8},
      {name:'冲', angle:180, orb:6, color:'#ff4444', symbol:'☍', score:-3}
    ];

    chart1.planets.forEach(function(p1) {
      chart2.planets.forEach(function(p2) {
        var diff = Math.abs(p1.lon - p2.lon);
        if (diff > 180) diff = 360 - diff;
        ASPECT_TYPES.forEach(function(at) {
          var orb = Math.abs(diff - at.angle);
          if (orb <= at.orb) {
            aspects.push({
              planet1: p1.name, glyph1: p1.glyph, color1: p1.color,
              planet2: p2.name, glyph2: p2.glyph, color2: p2.color,
              aspect: at.name, symbol: at.symbol, color: at.color,
              orb: Math.round(orb * 10) / 10, score: at.score,
              desc: p1.name + '与' + p2.name + at.name
            });
          }
        });
      });
    });

    // 总分
    var totalScore = 0;
    aspects.forEach(function(a) { totalScore += a.score; });
    var maxScore = 500;
    var normalizedScore = Math.max(0, Math.min(100, Math.round((totalScore + 200) / 4)));

    var level;
    if (normalizedScore >= 85) level = '天作之合';
    else if (normalizedScore >= 70) level = '非常契合';
    else if (normalizedScore >= 55) level = '较为和谐';
    else if (normalizedScore >= 40) level = '需要磨合';
    else level = '挑战较多';

    return {
      type: 'synastry',
      aspects: aspects,
      score: normalizedScore,
      level: level,
      chart1: chart1, chart2: chart2
    };
  }

  // ==================== 组合盘 (Composite) ====================

  function calcCompositeChart(birth1, birth2) {
    var chart1 = Astrology.calculateChart(birth1.year, birth1.month, birth1.day, birth1.hour, birth1.minute || 0);
    var chart2 = Astrology.calculateChart(birth2.year, birth2.month, birth2.day, birth2.hour, birth2.minute || 0);

    // 组合盘中点法
    var midPlanets = [];
    var planetKeys = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
    
    for (var i = 0; i < planetKeys.length; i++) {
      var p1 = chart1.planets[i];
      var p2 = chart2.planets[i];
      if (!p1 || !p2) continue;
      var midLon = midpoint(p1.lon, p2.lon);
      var zod = getZodiacSign(midLon);
      midPlanets.push({
        name: p1.name, glyph: p1.glyph, color: p1.color,
        lon: midLon, zodiac: zod.zodiac, degree: zod.degree,
        zodiacSymbol: zod.symbol
      });
    }

    // 组合盘ASC/DES/MC/IC取中点
    var midAsc = midpoint(chart1.asc, chart2.asc);
    var midMc = midpoint(chart1.mc, chart2.mc);

    // 组合盘相位
    var aspects = [];
    var ASPECT_TYPES = [
      {name:'合', angle:0, orb:8, symbol:'☌', color:'#ffaa00'},
      {name:'六合', angle:60, orb:5, symbol:'⚹', color:'#66ccff'},
      {name:'刑', angle:90, orb:6, symbol:'□', color:'#ff6666'},
      {name:'三合', angle:120, orb:7, symbol:'△', color:'#66ff88'},
      {name:'冲', angle:180, orb:7, symbol:'☍', color:'#ff4444'}
    ];

    for (var i = 0; i < midPlanets.length; i++) {
      for (var j = i + 1; j < midPlanets.length; j++) {
        var diff = Math.abs(midPlanets[i].lon - midPlanets[j].lon);
        if (diff > 180) diff = 360 - diff;
        ASPECT_TYPES.forEach(function(at) {
          var orb = Math.abs(diff - at.angle);
          if (orb <= at.orb) {
            aspects.push({
              planet1: midPlanets[i].name, glyph1: midPlanets[i].glyph, color1: midPlanets[i].color,
              planet2: midPlanets[j].name, glyph2: midPlanets[j].glyph, color2: midPlanets[j].color,
              aspect: at.name, symbol: at.symbol, color: at.color,
              orb: Math.round(orb * 10) / 10
            });
          }
        });
      }
    }

    return {
      type: 'composite',
      planets: midPlanets,
      asc: midAsc,
      mc: midMc,
      ascZod: getZodiacSign(midAsc),
      mcZod: getZodiacSign(midMc),
      aspects: aspects
    };
  }

  // ==================== 时空盘 (Time-Space Midpoint) ====================

  function calcTimeSpaceChart(birth1, birth2) {
    // 时间和空间的中点
    var midYear = Math.round((birth1.year + birth2.year) / 2);
    var midMonth = Math.round((birth1.month + birth2.month) / 2);
    var midDay = Math.round((birth1.day + birth2.day) / 2);
    var midHour = (birth1.hour + birth2.hour) / 2;
    var midMinute = Math.round(((birth1.minute || 0) + (birth2.minute || 0)) / 2);

    // 地理中点（简化）
    var chart = Astrology.calculateChart(midYear, midMonth, midDay, Math.floor(midHour), midMinute);

    return {
      type: 'timeSpace',
      chart: chart,
      date: midYear + '-' + String(midMonth).padStart(2,'0') + '-' + String(midDay).padStart(2,'0'),
      planets: chart.planets
    };
  }

  // ==================== 马盘 (Marks Chart / 马克思盘) ====================

  function calcMarksChart(birth1, birth2) {
    // 马盘是组合盘的衍生：以其中一人为本命盘基础来计算
    // 简化：使用比较盘 + 组合盘的混合
    var synastry = calcSynastryChart(birth1, birth2);
    var composite = calcCompositeChart(birth1, birth2);

    return {
      type: 'marks',
      synastryScore: synastry.score,
      synastryLevel: synastry.level,
      compositePlanets: composite.planets,
      keyAspects: synastry.aspects.filter(function(a) {
        return a.aspect === '合' || a.aspect === '三合' || a.aspect === '刑';
      }).slice(0, 10)
    };
  }

  // ==================== 次限盘 (Secondary Progression) ====================

  function calcSecondaryProgression(birthYear, birthMonth, birthDay, birthHour, birthMinute, targetYear) {
    var age = targetYear - birthYear;
    // 次限：出生后1天 = 生命1年
    var jd = gregorianToJDN(birthYear, birthMonth, birthDay);
    var progJD = jd + age;
    var gd = jdnToGregorian(progJD);
    var birthTimeDec = birthHour + (birthMinute || 0) / 60;
    var progChart = Astrology.calculateChart(
      Math.round(gd.year), Math.round(gd.month), Math.round(gd.day),
      Math.floor(birthTimeDec), Math.round((birthTimeDec - Math.floor(birthTimeDec)) * 60)
    );

    return {
      type: 'secondaryProgression',
      targetYear: targetYear,
      age: age,
      chart: progChart,
      planets: progChart.planets,
      asc: progChart.asc,
      mc: progChart.mc,
      progDate: Math.round(gd.year) + '-' + String(Math.round(gd.month)).padStart(2,'0') + '-' + String(Math.round(gd.day)).padStart(2,'0')
    };
  }

  // ==================== 三限盘 (Tertiary Progression) ====================

  function calcTertiaryProgression(birthYear, birthMonth, birthDay, birthHour, birthMinute, targetYear) {
    var ageMonths = (targetYear - birthYear) * 12;
    // 三限：出生后1天 = 生命1月
    var jd = gregorianToJDN(birthYear, birthMonth, birthDay);
    var progJD = jd + ageMonths;
    var gd = jdnToGregorian(progJD);
    var birthTimeDec = birthHour + (birthMinute || 0) / 60;
    var progChart = Astrology.calculateChart(
      Math.round(gd.year), Math.round(gd.month), Math.round(gd.day),
      Math.floor(birthTimeDec), Math.round((birthTimeDec - Math.floor(birthTimeDec)) * 60)
    );

    return {
      type: 'tertiaryProgression',
      targetYear: targetYear,
      ageMonths: ageMonths,
      chart: progChart,
      planets: progChart.planets
    };
  }

  // ==================== 辅助函数 ====================

  function findPlanet(planets, key) {
    for (var i = 0; i < planets.length; i++) {
      if (planets[i].key === key) return planets[i];
    }
    return null;
  }

  function midpoint(lon1, lon2) {
    var diff = lon2 - lon1;
    if (Math.abs(diff) > 180) {
      if (diff > 0) diff = diff - 360;
      else diff = diff + 360;
    }
    return (lon1 + diff / 2 + 360) % 360;
  }

  function getZodiacSign(lon) {
    var ZODIAC_ALL = ['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
    var ZODIAC_SYM = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
    var idx = Math.floor((lon % 360) / 30);
    var degree = (lon % 30);
    return { zodiac: ZODIAC_ALL[idx], symbol: ZODIAC_SYM[idx], degree: Math.round(degree * 10) / 10, index: idx };
  }

  // ==================== 对外接口 ====================

  return {
    calcTransitChart: calcTransitChart,
    calcSolarReturn: calcSolarReturn,
    calcLunarReturn: calcLunarReturn,
    calcSolarArc: calcSolarArc,
    calcFirdaria: calcFirdaria,
    calcSynastryChart: calcSynastryChart,
    calcCompositeChart: calcCompositeChart,
    calcTimeSpaceChart: calcTimeSpaceChart,
    calcMarksChart: calcMarksChart,
    calcSecondaryProgression: calcSecondaryProgression,
    calcTertiaryProgression: calcTertiaryProgression
  };
})();
