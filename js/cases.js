/**
 * 命例库 — 本地存储管理
 * 使用 localStorage 持久化保存排盘记录
 */
var CaseDB = (function() {
  var KEY = 'ziwei_cases';
  var _maxId = 0;

  /** 从 localStorage 加载全部命例 */
  function loadAll() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      // 修复旧数据可能缺失 id 的情况
      arr.forEach(function(c) { if (c.id && c.id > _maxId) _maxId = c.id; });
      return arr;
    } catch (e) {
      return [];
    }
  }

  function saveAll(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  /** 将当前排盘状态序列化为命例对象 */
  function capture(name, tags) {
    var dateVal = document.getElementById('birthDate').value;
    var hourVal = parseInt(document.getElementById('birthHour').value) || 0;
    var minVal  = parseInt(document.getElementById('birthMinute').value) || 0;
    var gender  = document.getElementById('gender').value;
    var useTS   = document.getElementById('useTrueSolar').checked;
    var lngVal  = parseFloat(document.getElementById('longitude').value) || 120;
    var provVal = document.getElementById('provinceSelect').value || '';
    var cityVal = document.getElementById('citySelect').value || '';

    var now = new Date();
    var ts = now.getFullYear() + '-'
      + String(now.getMonth() + 1).padStart(2, '0') + '-'
      + String(now.getDate()).padStart(2, '0') + ' '
      + String(now.getHours()).padStart(2, '0') + ':'
      + String(now.getMinutes()).padStart(2, '0');

    var c = {
      id: ++_maxId,
      savedAt: ts,
      name: name || '',
      tags: tags || [],
      label: '',
      date: dateVal,
      hour: hourVal,
      minute: minVal,
      gender: gender,
      useTrueSolar: useTS,
      longitude: lngVal,
      province: provVal,
      city: cityVal
    };

    // 序列化八字摘要
    if (typeof currentBazi !== 'undefined' && currentBazi) {
      c.bazi = {
        year: currentBazi.year.full,
        month: currentBazi.month.full,
        day: currentBazi.day.full,
        hour: currentBazi.hour.full,
        animal: currentBazi.year.animal,
        shichen: currentBazi.hour.shichenName,
        lunarYear: currentBazi.lunar.lunarYear,
        lunarMonth: currentBazi.lunar.lunarMonth,
        lunarDay: currentBazi.lunar.lunarDay,
        isLeap: currentBazi.lunar.isLeap
      };
      if (currentBazi.trueSolar) {
        c.bazi.trueSolar = {
          hour: currentBazi.trueSolar.hour,
          totalAdjust: currentBazi.trueSolar.totalAdjustMinutes
        };
      }
      c.label = c.bazi.year + ' ' + c.bazi.month + ' ' + c.bazi.day + ' ' + c.bazi.hour;
    }

    // 序列化命盘摘要
    if (typeof currentChart !== 'undefined' && currentChart) {
      c.chart = {
        mingGong: ZHI[currentChart.mingGong.zhiIndex] + '宫',
        shenGong: ZHI[currentChart.shenGong.zhiIndex] + '宫',
        bureau: currentChart.bureauName
      };
      c.label = (c.label || '') + ' | ' + c.chart.mingGong;
    }

    return c;
  }

  /** 保存当前排盘 */
  function save(name, tags) {
    var c = capture(name, tags);
    var arr = loadAll();
    arr.unshift(c);
    saveAll(arr);
    return c;
  }

  /** 删除指定 id 的命例 */
  function remove(id) {
    var arr = loadAll();
    arr = arr.filter(function(x) { return x.id !== id; });
    saveAll(arr);
  }

  /** 更新某个命例的 label */
  function updateLabel(id, label) {
    var arr = loadAll();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) { arr[i].label = label; break; }
    }
    saveAll(arr);
  }

  /** 更新某个命例 */
  function update(id, name, tags) {
    var arr = loadAll();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        if (name !== undefined) arr[i].name = name;
        if (tags !== undefined) arr[i].tags = tags;
        break;
      }
    }
    saveAll(arr);
  }

  /** 收集所有不重复的标签 */
  function getAllTags() {
    var arr = loadAll();
    var tagSet = {};
    arr.forEach(function(c) {
      (c.tags || []).forEach(function(t) { if (t) tagSet[t] = true; });
    });
    return Object.keys(tagSet).sort();
  }

  /** 恢复到某个命例的输入状态（不自动排盘） */
  function restore(id) {
    var arr = loadAll();
    var c = null;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) { c = arr[i]; break; }
    }
    if (!c) return;
    document.getElementById('birthDate').value = c.date;
    document.getElementById('birthHour').value = c.hour;
    document.getElementById('birthMinute').value = c.minute;
    document.getElementById('gender').value = c.gender;
    document.getElementById('useTrueSolar').checked = !!c.useTrueSolar;
    if (c.useTrueSolar) {
      document.getElementById('trueSolarRow').style.display = 'flex';
    } else {
      document.getElementById('trueSolarRow').style.display = 'none';
    }
    document.getElementById('longitude').value = c.longitude;
    // 恢复省市选择
    if (c.province) {
      document.getElementById('provinceSelect').value = c.province;
      onProvinceChange();
      if (c.city) {
        document.getElementById('citySelect').value = c.city;
        onCityChange();
      }
    }
    onTimeChange();
  }

  /** 更新断事笔记 */
  function updateNotes(id, notes) {
    var arr = loadAll();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) { arr[i].notes = notes; break; }
    }
    saveAll(arr);
  }

  // 启动时自动加载最大 ID
  loadAll();

  return {
    loadAll: loadAll,
    save: save,
    remove: remove,
    update: update,
    updateLabel: updateLabel,
    updateNotes: updateNotes,
    restore: restore,
    getAllTags: getAllTags,
    capture: capture
  };
})();
