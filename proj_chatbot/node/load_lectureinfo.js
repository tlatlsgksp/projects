const { google } = require('googleapis');
const fs = require('fs').promises;

// Google Sheets API 설정
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = 'credentials.json'; // 서비스 계정의 키 파일
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = '메트로폴 강의 계획서!A4:AB';

// 헤더 정의
const HEADER = [
  "No", "과목코드", "과목명", "교수명", "핸드폰", "이메일", "분반", "성적평가구분", "과정구분", "이수구분",
  "개설학과", "개설학년", "교과목개요", "교과목표", "교재 및 참고 문헌", "평가항목 및 방법",
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
          if (header[i] === "평가항목 및 방법") {
            rowData[header[i]] = {
              출석: {
                반영비율: row[i] || '',
                평가방법_및_주요내용: row[i + 1] || ''
              },
              중간: {
                반영비율: row[i + 2] || '',
                평가방법_및_주요내용: row[i + 3] || ''
              },
              기말: {
                반영비율: row[i + 4] || '',
                평가방법_및_주요내용: row[i + 5] || ''
              },
              과제: {
                반영비율: row[i + 6] || '',
                평가방법_및_주요내용: row[i + 7] || ''
              },
              기타: {
                반영비율: row[i + 8] || '',
                평가방법_및_주요내용: row[i + 9] || ''
              },
              과제개요: {
                과제주제: row[i + 10] || '',
                분량: row[i + 11] || '',
                제출일자: row[i + 12] || ''
              }
            };
            i += 12;
          } else {
            rowData[header[i]] = row[i] || '';
          }
        }
        rowData["과목명"] = row[2].replace(/\s+/g, '').toUpperCase();
        rowData["교수명"] = row[3].replace(/\s+/g, '');
        return rowData;
      });
  
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
      console.log('Data saved to JSON file:', filePath);
    } catch (error) {
      console.error('Error saving data to JSON file:', error.message);
    }
  }

// 메인 함수
async function main_lectureinfo() {
  const auth = await authorize();
  
  // Google Sheets에서 데이터 읽기
  const sheetData = await readFromGoogleSheets(auth, SPREADSHEET_ID, RANGE);
  
  if (sheetData) {
    // 데이터를 JSON 파일로 저장
    await saveToJsonFile(sheetData, 'lectureinfo.json', HEADER);
  }
}

module.exports = {
  main_lectureinfo
};