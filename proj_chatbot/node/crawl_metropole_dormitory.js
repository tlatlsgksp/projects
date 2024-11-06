const puppeteer = require('puppeteer');
const { google } = require('googleapis');
const fs = require('fs').promises;

// Google Sheets API 설정
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = 'credentials.json'; // 서비스 계정의 키 파일
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = '학식_메트로폴_기숙사!A2:N';

// Google Sheets API 인증 정보 가져오기
async function authorize() {
  const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
  const { client_email, private_key } = credentials;

  const auth = new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes: SCOPES,
  });

  return auth;
}

// Google Sheets에 데이터 쓰기
async function writeToGoogleSheets(auth, spreadsheetId, range, dates, breakfasts, dinners, origins) {
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' });

    await sheets.spreadsheets.values.clear({
      spreadsheetId: spreadsheetId,
      range: range,
    });

    const values = dates.map((date, index) => [timestamp, date, breakfasts[index], dinners[index], origins[index]]);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: values,
      },
    });

    console.log('Appended metropole dormitory meal data to Google Sheets');
  } catch (error) {
    console.error('Error appending data to Google Sheets:', error.message);
  }
}

// 크롤링 함수
async function scrapeWebsite() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.goto('https://www.kduniv.ac.kr/kor/CMS/DietMenuMgr/list.do?mCode=MN183&searchDietCategory=5', { timeout: 60000 });
  await page.waitForSelector('#cafeteria-menu');

  const dates = await page.$$eval('#cafeteria-menu tbody tr th', (dates) => dates.map(date => {
    return date.textContent.trim().match(/월요일|화요일|수요일|목요일|금요일|토요일|일요일/g)[0];
  }));
  const breakfasts = await page.$$eval('#cafeteria-menu tbody tr td ul.res-depth1', (breakfasts) => breakfasts.map(breakfast => breakfast.textContent.trim()));
  const dinners = await page.$$eval('#cafeteria-menu tbody tr td ul.res-depth2', (dinners) => dinners.map(dinner => dinner.textContent.trim()));
  const origins = await page.$$eval('#cafeteria-menu tbody tr td ul.res-depth3', (origins) => origins.map(origin => origin.textContent.trim()));

  await browser.close();

  return { dates, breakfasts, dinners, origins };
}

// 메인 함수
async function main_met_dorm() {
  const auth = await authorize();
  const { dates, breakfasts, dinners, origins } = await scrapeWebsite();
  await writeToGoogleSheets(auth, SPREADSHEET_ID, RANGE, dates, breakfasts, dinners, origins);
}

module.exports = {
  main_met_dorm
};