const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function main_met_bus() {
  try{
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const dir = './images_bus_school';

  // 뷰포트 크기 설정
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto('https://www.kduniv.ac.kr/iphak/CMS/Contents/Contents.do?mCode=MN064');

  // gap을 기준으로 페이지를 분할
  const gaps = await page.$$('.gap');
  const tits = await page.$$('h5.c-tit03');

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

      if (i === 2) {
        let previousTitBoundingBox = null;

        for (let j = 0; j < 3; j++) {
          const currentTit = tits[j];

          if (previousTitBoundingBox) {
            const currentTitBoundingBox = await currentTit.boundingBox();

            const titclip = {
              x: previousTitBoundingBox.x,
              y: previousTitBoundingBox.y,
              width: previousTitBoundingBox.width,
              height: currentTitBoundingBox.y - previousTitBoundingBox.y
            };

            await page.screenshot({ path: path.join(dir, `schoolbus_${i}_${j}.png`), clip: titclip }); // 수정된 부분
          }

          previousTitBoundingBox = await currentTit.boundingBox();
        }

        // 마지막 tit 이후의 영역 스크린샷
        const lastTitBoundingBox = await previousTitBoundingBox;
        const lastBoundingBox = await gaps[2].boundingBox();

        const lasttitClip = {
          x: lastTitBoundingBox.x,
          y: lastTitBoundingBox.y,
          width: lastTitBoundingBox.width,
          height: lastBoundingBox.y - lastTitBoundingBox.y + 60
        };

        await page.screenshot({ path: path.join(dir, `schoolbus_2_3.png`), clip: lasttitClip });
      } else {
        await page.screenshot({ path: path.join(dir, `schoolbus_${i}.png`), clip });
      }
    }

    // 이전 gap의 bounding box 업데이트
    previousGapBoundingBox = await currentGap.boundingBox();
  }

  // 마지막 gap 이후의 영역 스크린샷
  const lastGapBoundingBox = await previousGapBoundingBox;
  const footerWrap = await page.$('#footer-wrap');
  const footerBoundingBox = await footerWrap.boundingBox();

  const lastClip = {
    x: lastGapBoundingBox.x,
    y: lastGapBoundingBox.y,
    width: lastGapBoundingBox.width,
    height: footerBoundingBox.y - lastGapBoundingBox.y
  };

  await page.screenshot({ path: path.join(dir, `schoolbus_${gaps.length}.png`), clip: lastClip });

  await browser.close();

  console.log('Saved schoolbus Images');
  }catch (error) {
    console.error(error);
  }
}

module.exports = {
  main_met_bus
};