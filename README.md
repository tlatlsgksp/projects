/proj_bus
경동대학교 셔틀 프로젝트

📚 프로젝트 개요
경동대학교 학생들을 대상으로 셔틀버스 및 경유 버스 정보 제공을 위한 애플리케이션입니다. 실시간 위치 확인, 시간표 조회, 알림 기능을 통해 셔틀버스 사용의 편의성을 대폭 향상시키고자 개발되었습니다.

🎯 개발 목표
셔틀버스 및 경유 버스 시간표 제공

학생들이 시간표 정보를 쉽게 확인할 수 있도록 지원.
실시간 위치 안내 기능

셔틀버스 위치를 실시간으로 확인하여 효율적인 시간 관리 가능.
알림 기능 제공

주요 정보들을 알림을 통해 간편하게 확인.

📋 주요 기능
학생용 애플리케이션

셔틀버스 및 마을버스 시간표 확인.
셔틀버스 및 경유 버스 실시간 위치 확인.
정류장 즐겨찾기 및 알림 설정.
기사용 애플리케이션

버스 상태 및 노선 관리 기능.
관리자 웹 애플리케이션

관리자 로그인.
사용자 및 권한 관리.
노선 및 배차 수정 기능.
🛠️ 기술 스택 및 구현 환경
프로그래밍 언어: JAVA
프론트엔드 기술: HTML, CSS
백엔드 기술: Node.js, Express.js
배포 플랫폼: Google Cloud Platform
기타 사용 기술:
API: 셔틀버스 실시간 위치 API
WAS: Web Application Server

📅 개발 일정
프로젝트 기간: 8주
1주차: 요구사항 분석 및 설계
2~3주차: 데이터 수집 및 API 설계
4~6주차: 애플리케이션 개발 (학생, 기사, 관리자 기능)
7주차: 테스트 및 디버깅
8주차: 최종 배포 및 사용자 피드백 수집

📊 설문조사 결과
셔틀버스 애플리케이션 수요 조사:
62%: 매우 좋다
11%: 좋다
27%: 보통
0%: 필요하지 않다

🚀 실행 방법
학생용 애플리케이션
애플리케이션 설치 후 실행.
셔틀버스 시간표 및 위치 정보 확인.
필요한 정류장 즐겨찾기 및 알림 설정.
관리자 웹 애플리케이션
웹사이트 접속: [관리자 페이지])
로그인 후 노선 및 배차 정보 관리.

🛠️ 추후 개선 사항
다국어 지원: 외국인 유학생을 위한 다국어 번역 기능 추가.
통합 서비스 제공: 교내 다른 정보와의 연계.
정확성 개선: 실시간 위치 정보의 정확성 향상.





/proj_chatbot
경동대학교 챗봇 프로젝트

📚 프로젝트 개요
경동대학교 학생들이 학식, 강의 정보, 학사 일정, 통학버스 시간표 등 학교 생활에 필요한 정보를 간단하고 빠르게 제공받을 수 있는 챗봇을 개발하였습니다. 이 챗봇은 번거로운 포털 사이트 방문 없이 학교 관련 정보를 통합적으로 제공합니다.

🎯 개발 목표
학생 편의성 증대: 학교 홈페이지 로그인을 하지 않고 간단한 방식으로 정보 제공.
다양한 정보 제공: 학식, 강의 정보, 학사 일정, 통학버스 시간표 등 종합 정보 제공.
최신 정보 유지: 주기적인 데이터 업데이트를 통해 정확한 정보 제공.
🛠️ 기술 스택 및 구현 환경
프로그래밍 언어: Node.js, JavaScript
백엔드 기술: Node.js
데이터 관리: Google Sheets API
배포 환경: 클라우드 기반 서버
플랫폼: Kakao i open Builder

📋 주요 기능

학식 정보 제공:
오늘/내일/이번 주 학식 정보 확인
학생식당과 기숙사 식사 정보 제공
식단 원산지 정보 제공

강의실 정보 제공:
현재 및 다음 교시 빈 강의실 조회
우당관, 선덕관, 충효관 별 강의실 정보 제공

강의 및 교수 검색:
강의명 또는 교수명을 기반으로 강의 정보 검색

통학버스 정보:
노선 및 시간표 정보 제공

📅 개발 일정
프로젝트 기간: 4주
1주차: 요구사항 분석 및 설계
2주차: 데이터 수집 및 챗봇 기초 구현
3주차: Webhook 서버 연동 및 기능 추가
4주차: 테스트 및 배포
🔍 프로젝트 구조
├── chatbot/               # 챗봇 관련 스크립트 및 설정 파일
├── server.js              # 서버 코드 (Express.js 기반)
├── data/                  # 데이터 처리 및 저장
├── docs/                  # 문서 및 설문조사 결과
└── README.md              # 프로젝트 개요 및 설명 파일

🚀 실행 방법
환경 설정:
npm install
서버 실행:
node server.js
챗봇 테스트:
챗봇 플랫폼에서 설정된 인텐트와 연결된 Webhook 서버를 통해 테스트.

📊 설문조사 결과
학생들의 요구:
기존 학식, 강의 정보, 통학버스 시간표를 확인하는 과정이 번거로움.
챗봇을 통해 쉽게 정보를 확인하고 싶다는 의견 다수.

🛠️ 추후 개선 사항
다국어 지원: 외국인 유학생을 위한 다국어 번역 기능 추가.
추가 정보 제공: 동아리 활동 정보, 교내 공지사항 등.
정교한 응답 개선: AI 모델 기반의 자연어 처리 고도화.