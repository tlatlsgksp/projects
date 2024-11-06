const { google } = require('googleapis');
const fs = require('fs').promises;

// Google Sheets API 설정
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = 'credentials.json'; // 서비스 계정의 키 파일
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = '학식_메트로폴!A2:N';

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

// Google Sheets에서 데이터 읽어오기
async function readFromGoogleSheets(auth, spreadsheetId, range) {
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });

    const rows = response.data.values;

    return rows;
  } catch (error) {
    console.error('Error reading data from Google Sheets:', error.message);
    throw error;
  }
}

// JSON 파일로 데이터 저장
async function saveToJson(data) {
  const transformedData = {
    data: data.map(item => ({
      "date": item[1],
      "meal": item[2],
      "origin": item[3]
    }))
  };

  await fs.writeFile('crawl_met.json', JSON.stringify(transformedData, null, 2));
  console.log('Data saved to JSON file: crawl_met.json');
}

// 메인 함수
async function main_met_load() {
  const auth = await authorize();
  

  // Google Sheets에서 데이터 읽어오기
  const sheetData = await readFromGoogleSheets(auth, SPREADSHEET_ID, RANGE);

  // JSON 파일로 저장
  await saveToJson(sheetData);
}

module.exports = {
  main_met_load
};