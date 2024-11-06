const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function main_plan() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const dir = './images_plan';

  // images_plan 폴더 비우기
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir, { recursive: true });

  // 뷰포트 크기 설정
  await page.setViewport({ width: 1920, height: 1080 });
  const offset = 1000 * 60 * 60 * 9
  const KST = new Date((new Date()).getTime() + offset)
  const currentYear = KST.getFullYear();
  const nextYear = currentYear + 1;

  for (let year of [currentYear, nextYear]) {
    const url = `https://www.kduniv.ac.kr/kor/CMS/ScheduleMgr/YearList.do?mCode=MN096&calendar_year=${year}&calendar_month=4`;
    await page.goto(url);

    // gap을 기준으로 페이지를 분할
    const gaps = await page.$$('.gap');

    let previousGapBoundingBox = null;

    for (let i = 0; i < gaps.length; i++) {
      const currentGap = gaps[i];

      if (previousGapBoundingBox) {
        const currentBoundingBox = await currentGap.boundingBox();

        // 페이지를 분할하기 위한 클립 영역 계산
        const clip = {
          x: previousGapBoundingBox.x,
          y: previousGapBoundingBox.y,
          width: previousGapBoundingBox.width,
          height: currentBoundingBox.y - previousGapBoundingBox.y
        };

        // 클립 영역에 따른 스크린샷 찍기
        await page.screenshot({ path: path.join(dir, `plan_${year}_${i}.png`), clip });
      }

      // 이전 gap의 bounding box 업데이트
      previousGapBoundingBox = await currentGap.boundingBox();
    }
  }

  await browser.close();

  console.log('Saved plan Images');
}

module.exports = {
  main_plan
};
