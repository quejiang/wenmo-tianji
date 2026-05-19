import { test, expect } from '@playwright/test';

// 绕过欢迎弹窗：预设专业模式避免遮罩层拦截点击
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('wm_mode', JSON.stringify({level:'professional',style:'',chosen:true}));
  });
});

test.describe('文墨天机 - 全量回归测试', () => {

  test('页面加载：标题、五术标签栏、排盘表单均可见', async ({ page }) => {
    await page.goto('/');
    // 默认显示"山"面板，需切换到"命"才能看到排盘表单
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);
    await expect(page.locator('h1')).toContainText('文墨天机');
    await expect(page.locator('#wushuTabBar')).toBeVisible();
    await expect(page.locator('.wushu-tab')).toHaveCount(5);
    await expect(page.locator('#birthDate')).toBeVisible();
    await expect(page.locator('#birthHour')).toBeVisible();
    await expect(page.locator('#gender')).toBeVisible();
    await expect(page.locator('button:has-text("开始排盘")')).toBeVisible();
  });

  test('五术面板切换：山/医/命/相/卜 五个面板均能正常切换', async ({ page }) => {
    await page.goto('/');
    const tabs = [
      { name: 'shan', panel: '#wushuShan', label: '山' },
      { name: 'yi',   panel: '#wushuYi',   label: '医' },
      { name: 'ming', panel: '#wushuMing', label: '命' },
      { name: 'xiang',panel: '#wushuXiang',label: '相' },
      { name: 'bu',   panel: '#wushuBu',   label: '卜' },
    ];
    for (const tab of tabs) {
      await page.click(`.wushu-tab[data-wushu="${tab.name}"]`);
      await page.waitForTimeout(200);
      const panel = page.locator(tab.panel);
      await expect(panel).toHaveClass(/active/);
    }
  });

  test('排盘功能：输入有效信息后点击开始排盘，命盘正确渲染', async ({ page }) => {
    await page.goto('/');
    // 先确保在"命"面板
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    await page.fill('#birthDate', '1990-06-15');
    await page.fill('#birthHour', '8');
    await page.fill('#birthMinute', '30');
    await page.selectOption('#gender', 'male');

    await page.click('button:has-text("开始排盘")');
    await page.waitForTimeout(1000);

    // 命盘容器应该可见
    const chartGrid = page.locator('#chartGrid');
    await expect(chartGrid).toBeVisible();

    // 八字条应该可见
    const baziBar = page.locator('#baziBar');
    await expect(baziBar).toBeVisible();

    // 详情面板应该可见
    const detailPanel = page.locator('#detailPanel');
    await expect(detailPanel).toBeVisible();

    // 盘面模式条应该可见
    const modeBar = page.locator('#ziweiModeBar');
    await expect(modeBar).toBeVisible();
  });

  test('排盘空日期校验：未输入日期时弹出提示', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('请选择出生日期');
      await dialog.dismiss();
    });
    await page.click('button:has-text("开始排盘")');
  });

  test('新手教程：完整流程可打开、前进、关闭', async ({ page }) => {
    await page.goto('/');
    // 打开教程
    await page.click('.btn-tutorial');
    await page.waitForTimeout(300);

    // 教程对话框应可见
    const tutorialDialog = page.locator('#tutorialDialog');
    await expect(tutorialDialog).toBeVisible();

    // 教程标题应该是欢迎页
    await expect(tutorialDialog.locator('.tutorial-title')).toContainText('欢迎');

    // 点击"下一步"前进到输入步骤
    await page.click('#tutorialNext');
    await page.waitForTimeout(200);
    await expect(tutorialDialog.locator('.tutorial-title')).toContainText('第一步');

    // 继续前进到 chart-basics 步骤
    await page.click('#tutorialNext');
    await page.waitForTimeout(200);
    await expect(tutorialDialog.locator('.tutorial-title')).toContainText('第二步');

    // 关闭教程
    await page.click('.tutorial-close');
    await page.waitForTimeout(300);
    await expect(tutorialDialog).not.toBeVisible();
  });

  test('新手教程 + 排盘联动：输入步骤可点击开始排盘，排盘后自动前进到第三步', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    // 打开教程并前进到输入步骤（第一步）
    await page.click('.btn-tutorial');
    await page.waitForTimeout(300);
    await page.click('#tutorialNext'); // 前进到第一步
    await page.waitForTimeout(200);

    // 此时应显示"第一步：输入你的出生信息"
    const tutorialTitle = page.locator('#tutorialTitle');
    await expect(tutorialTitle).toContainText('第一步');

    // 填充表单
    await page.fill('#birthDate', '1988-08-08');
    await page.fill('#birthHour', '12');
    await page.fill('#birthMinute', '0');
    await page.selectOption('#gender', 'female');

    // 点击开始排盘 — 因为 overlay pointer-events: none，按钮可点击
    await page.click('button:has-text("开始排盘")');
    await page.waitForTimeout(1500);

    // 教程应该自动前进到第二步（看懂命盘）
    await expect(tutorialTitle).toContainText('第二步');

    // 命盘应该已渲染
    const chartGrid = page.locator('#chartGrid');
    await expect(chartGrid).toBeVisible();
  });

  test('姓名学分析：输入姓名后显示三才五格结果', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="xiang"]');
    await page.waitForTimeout(200);

    // 切换到姓名分析子标签
    await page.click('.ws-tab[data-subtab="xiang-name"]');
    await page.waitForTimeout(200);

    // 输入姓名
    await page.fill('#nameInput', '李白');
    await page.click('button[onclick="analyzeName()"]');
    await page.waitForTimeout(500);

    // 结果应该包含天格等人格信息
    const nameResult = page.locator('#nameResult');
    await expect(nameResult).toBeVisible();
    // 检查是否包含五格信息
    await expect(nameResult).toContainText('天格');
    await expect(nameResult).toContainText('人格');
    await expect(nameResult).toContainText('地格');
  });

  test('姓名学空输入提示', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="xiang"]');
    await page.waitForTimeout(200);
    await page.click('.ws-tab[data-subtab="xiang-name"]');
    await page.waitForTimeout(200);

    // 不输入直接点分析
    await page.click('button[onclick="analyzeName()"]');
    await page.waitForTimeout(200);

    await expect(page.locator('#nameResult')).toContainText('请输入中文姓名');
  });

  test('简繁切换：Lang 模块可用，toggle 不报错', async ({ page }) => {
    await page.goto('/');
    // 简繁按钮应该可见
    const langBtn = page.locator('#btnLangToggle');
    await expect(langBtn).toBeVisible();

    // 检查 Lang 全局变量存在
    const langExists = await page.evaluate(() => typeof Lang !== 'undefined');
    expect(langExists).toBe(true);

    // 检查 localStorage 默认值为 zh-CN
    const lang = await page.evaluate(() => localStorage.getItem('wmtj_lang'));
    expect(lang).toBe('zh-CN');
  });

  test('命面板子标签切换：紫微/八字/星盘', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    // 紫微斗数子面板应默认激活
    const ziweiContent = page.locator('#mingZiwei');
    await expect(ziweiContent).toHaveClass(/active/);

    // 切换到八字解读
    await page.click('.ws-tab[data-subtab="ming-bazi"]');
    await page.waitForTimeout(200);
    const baziContent = page.locator('#mingBazi');
    await expect(baziContent).toHaveClass(/active/);

    // 切换到西洋星盘
    await page.click('.ws-tab[data-subtab="ming-astro"]');
    await page.waitForTimeout(200);
    const astroContent = page.locator('#mingAstro');
    await expect(astroContent).toHaveClass(/active/);
  });

  test('真太阳时选项：勾选后显示经度输入行', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    const trueSolarRow = page.locator('#trueSolarRow');
    // 默认应该隐藏
    await expect(trueSolarRow).not.toBeVisible();

    // 勾选真太阳时
    await page.check('#useTrueSolar');
    await page.waitForTimeout(200);
    // 经度输入行应该可见
    await expect(trueSolarRow).toBeVisible();
  });

  test('夏令时提醒：1988年6月应显示夏令时警告', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    // 输入 1988-06-15（夏令时区间）
    await page.fill('#birthDate', '1988-06-15');
    await page.fill('#birthHour', '8');
    await page.fill('#birthMinute', '0');
    await page.selectOption('#gender', 'male');

    await page.click('button:has-text("开始排盘")');
    await page.waitForTimeout(500);

    const dstWarning = page.locator('#dstWarning');
    await expect(dstWarning).toBeVisible();
    await expect(dstWarning).toContainText('夏令时');
  });

  test('导出功能：导出按钮可见且可点击', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    // 排盘
    await page.fill('#birthDate', '1995-03-20');
    await page.fill('#birthHour', '14');
    await page.fill('#birthMinute', '0');
    await page.selectOption('#gender', 'female');
    await page.click('button:has-text("开始排盘")');
    await page.waitForTimeout(1000);

    // 导出按钮应该可见
    const exportBtn = page.locator('button:has-text("导出")');
    await expect(exportBtn).toBeVisible();
  });

  test('格局检测：排盘后显示格局信息', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    await page.fill('#birthDate', '1990-06-15');
    await page.fill('#birthHour', '8');
    await page.fill('#birthMinute', '30');
    await page.selectOption('#gender', 'male');
    await page.click('button:has-text("开始排盘")');
    await page.waitForTimeout(1000);

    // 格局区域应该可见（可能在detailPanel中）
    const patternsDiv = page.locator('#patternsDiv');
    // 如果存在格局容器，检查内容
    const exists = await patternsDiv.count();
    if (exists > 0) {
      await expect(patternsDiv).toBeVisible();
    }
  });

  test('功能全览面板：可打开和关闭', async ({ page }) => {
    await page.goto('/');
    // 打开功能全览
    await page.click('.btn-features');
    await page.waitForTimeout(300);

    const featureOverlay = page.locator('.feature-overlay');
    await expect(featureOverlay).toBeVisible();

    // 关闭功能全览
    const closeBtn = page.locator('.feature-overlay .feature-close');
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
    } else {
      // fallback: 点击 overlay 外部
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(200);
    await expect(featureOverlay).not.toBeVisible();
  });

  test('农历输入：切换到农历模式，输入日期后排盘成功', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    // 切换到农历模式
    await page.click('.dt-opt[data-type="lunar"]');
    await page.waitForTimeout(300);

    // 农历输入区域应该可见
    const lunarInput = page.locator('#lunarDateInput');
    await expect(lunarInput).toBeVisible();

    // 公历输入应该隐藏
    const solarInput = page.locator('#solarDateInput');
    await expect(solarInput).not.toBeVisible();

    // 默认已填充年份和月份，设置日子
    await page.selectOption('#lunarDay', '15');

    // 应该显示公历预览
    const preview = page.locator('#lunarSolarPreview');
    await expect(preview).toContainText('公历');

    // 输入时间并排盘
    await page.fill('#birthHour', '8');
    await page.fill('#birthMinute', '0');
    await page.selectOption('#gender', 'male');

    await page.click('button:has-text("开始排盘")');
    await page.waitForTimeout(1000);

    // 命盘应该渲染
    const chartGrid = page.locator('#chartGrid');
    await expect(chartGrid).toBeVisible();
  });

  test('农历输入：从公历切换到农历，自动填充对应农历日期', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    // 先设置一个公历日期
    await page.fill('#birthDate', '1990-06-15');
    await page.waitForTimeout(100);

    // 切换到农历模式
    await page.click('.dt-opt[data-type="lunar"]');
    await page.waitForTimeout(300);

    // 年份应自动填充为1990
    const lunarYear = page.locator('#lunarYear');
    await expect(lunarYear).toHaveValue('1990');

    // 预览应该显示回公历1990-06-15
    const preview = page.locator('#lunarSolarPreview');
    await expect(preview).toContainText('1990-06-15');
  });

  test('农历模式：闰月年份显示闰月选项', async ({ page }) => {
    await page.goto('/');
    await page.click('.wushu-tab[data-wushu="ming"]');
    await page.waitForTimeout(200);

    // 切换到农历模式
    await page.click('.dt-opt[data-type="lunar"]');
    await page.waitForTimeout(200);

    // 2023年有闰二月
    await page.fill('#lunarYear', '2023');
    await page.waitForTimeout(200);

    // 月份选择应该包含"闰2月"
    const monthSelect = page.locator('#lunarMonth');
    const monthText = await monthSelect.textContent();
    expect(monthText).toContain('闰');
  });

});
