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
const docClient = DynamoDBDocument.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
}
});
const { stationId_21 } = require('./route21');

async function buspredict() {
  const stateparams = {
    TableName: 'BusLocation21',
    Key: {
      Bus: '21'
    }
  };
  docClient.get(stateparams, (err, data) => {
    const states = data.Item.states;
    if (states === '운행 중'){
      for (let i = 0; i < stationId_21.length; i++) {
        try {
          const stationSeq = i+1;
          var url = 'https://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalItem';
          var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + PUBLIC_API_KEY;
              queryParams += '&' + encodeURIComponent('stationId') + '=' + encodeURIComponent(stationId_21[i]);
              queryParams += '&' + encodeURIComponent('routeId') + '=' + encodeURIComponent('241451005');
          const predictUrl = url + queryParams;
          request(predictUrl, async function (error, response, body) {
            if (error) {
              console.error('API request failed:', error);
              return;
            }
          const xml = new DOMParser().parseFromString(body, 'text/xml');
          const resultCodeElement = xml.getElementsByTagName('resultCode')[0];
          const resultCode = resultCodeElement ? resultCodeElement.textContent : 'N/A';
      
          if (resultCode === '0') {
            const locationNo1 = xml.getElementsByTagName('locationNo1')[0].textContent;
            const predictTime1 = xml.getElementsByTagName('predictTime1')[0].textContent;
      
            const params = {
              TableName: 'Bus21',
              Key: {
                stationId: stationId_21[i],
                stationSeq: stationSeq
              },
              UpdateExpression: 'SET locationNo1 = :locationNo1, predictTime1 = :predictTime1',
              ExpressionAttributeValues: {
                ':locationNo1': locationNo1,
                ':predictTime1': predictTime1
              }
            };
          
            await docClient.update(params)
              .then(() => {
              })
              .catch((err) => {
                console.error('Error updating Route data in DynamoDB:', err);
              });
          }else{
            const params = {
              TableName: 'Bus21',
              Key: {
                stationId: stationId_21[i],
                stationSeq: stationSeq
              },
              UpdateExpression: 'SET locationNo1 = :locationNo1, predictTime1 = :predictTime1',
              ExpressionAttributeValues: {
                ':locationNo1': 'X',
                ':predictTime1': 'X'
              }
            };
          
            await docClient.update(params)
              .then(() => {
              })
              .catch((err) => {
                console.error('Error updating Route data in DynamoDB:', err);
              });
          }
        });
        } catch (error) {
          console.error('Error:', error);
        }
    }
    }else{
      console.log('21 운행 정보 없음')
    }
  });
  }setInterval(() => {
    buspredict();
  }, 30000);