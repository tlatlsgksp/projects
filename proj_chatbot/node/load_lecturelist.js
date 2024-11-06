const { google } = require('googleapis');
const fs = require('fs').promises;

// Google Sheets API 설정
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = 'credentials.json'; // 서비스 계정의 키 파일
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = '개설강좌!A3:Z';

// 헤더 정의
const HEADER = [
  "No", "과목코드", "과목명", "분반", "캠퍼스", "이수구분", "과목구분", "교과적용구분", "교수명", "소속",
  "대학", "학과", "전공", "학점", "이론", "실습", "성적평가구분", "강의평가여부", "수업계획서출력", "시간표",
  "수강가능학과", "수강신청학점초과가능", "수강인원", "강의실", "팀티칭", "폐강여부"
];

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

// Google Sheets에서 데이터 읽기
async function readFromGoogleSheets(auth, spreadsheetId, range) {
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });

    const values = response.data.values;
    return values;
  } catch (error) {
    console.error('Error reading data from Google Sheets:', error.message);
    return null;
  }
}

// 데이터를 JSON 파일로 저장
async function saveToJsonFile(data, filePath, header) {
  try {
    const jsonData = data.map(row => {
      const rowData = {};
      for (let i = 0; i < header.length; i++) {
        rowData[header[i]] = row[i] || '';
      }
      rowData["과목명"] = row[2].replace(/\s+/g, '').toUpperCase();
      rowData["교수명"] = row[8].replace(/\s+/g, '');
      return rowData;
    }).filter(row => row["캠퍼스"] === "메트로폴"); // 캠퍼스가 "메트로폴"인 데이터만 필터링

    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
    console.log('Data saved to JSON file:', filePath);
  } catch (error) {
    console.error('Error saving data to JSON file:', error.message);
  }
}

// 메인 함수
async function main_lecturelist() {
  const auth = await authorize();
  
  // Google Sheets에서 데이터 읽기
  const sheetData = await readFromGoogleSheets(auth, SPREADSHEET_ID, RANGE);
  
  if (sheetData) {
    // 데이터를 JSON 파일로 저장
    await saveToJsonFile(sheetData, 'lecturelist.json', HEADER);
  }
}

module.exports = {
  main_lecturelist
};