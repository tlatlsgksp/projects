const request = require('request');
const DOMParser = require('xmldom').DOMParser;
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;
const client = new DynamoDBClient({
  region: AWS_REGION, 
  credentials: { 
    accessKeyId: AWS_ACCESS_KEY_ID, 
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});
const docClient = DynamoDBDocument.from(client);

async function buslocation() {
    try {
      var url = 'https://apis.data.go.kr/6410000/buslocationservice/getBusLocationList';
      var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + PUBLIC_API_KEY;
          queryParams += '&' + encodeURIComponent('routeId') + '=' + encodeURIComponent('241451015');
          const locationUrl = url + queryParams;
          request(locationUrl, function (error, response, body) {
            if (error) {
              console.error('API request failed:', error);
              return;
            }
            
          const xml = new DOMParser().parseFromString(body, 'text/xml');
          const resultCodeElement = xml.getElementsByTagName('resultCode')[0];
          const resultCode = resultCodeElement ? resultCodeElement.textContent : 'N/A';
    
          if (resultCode === '0') {
            const endBus = xml.getElementsByTagName('endBus')[0].textContent;
            const plateNo = xml.getElementsByTagName('plateNo')[0].textContent;
            const stationId = xml.getElementsByTagName('stationId')[0].textContent;
    
            const params = {
                TableName: 'BusLocation733',
                Item: {
                Bus: '733',
                states: '운행 중',
                stationId: stationId,
                endBus: endBus,
                plateNo: plateNo
                },
            };
      
            docClient.put(params)
                .then(() => {
                })
                .catch((err) => {
                console.error('Error saving Location_733 data to DynamoDB:', err);
                });
        } else{
            const deleteParams = {
                TableName: 'BusLocation733',
                Item: {
                    Bus: '733',
                    states: '운행 정보 없음',
                    stationId: 'X',
                    endBus: 'X',
                    plateNo: 'X'
                    },
              };
    
            docClient.put(deleteParams)
                .then(() => {
                })
                .catch((err) => {
                console.error('Error saving Location_733 data to DynamoDB:', err);
                });
        }
        });
        } catch (error) {
          console.error('Error:', error);
        }
      }setInterval(() => {
        buslocation();
      }, 10000);