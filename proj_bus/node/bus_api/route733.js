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
const stationId_733 = [];
module.exports = { stationId_733 };

async function busroute() {
  try {
    var url = 'http://apis.data.go.kr/6410000/busrouteservice/getBusRouteStationList';
    var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + PUBLIC_API_KEY;
        queryParams += '&' + encodeURIComponent('routeId') + '=' + encodeURIComponent('241451015');
    const routeUrl = url + queryParams;
    request(routeUrl, function (error, response, body) {
      if (error) {
        console.error('API request failed:', error);
        return;
      }
    const xml = new DOMParser().parseFromString(body, 'text/xml');
    const route_nodeList = xml.getElementsByTagName('busRouteStationList');

    for (i = 0; i < route_nodeList.length; i++) {
      const route_element = route_nodeList.item(i);
      const stationId = route_element.getElementsByTagName('stationId')[0].textContent;
      const stationName = route_element.getElementsByTagName('stationName')[0].textContent;
      const latitude = route_element.getElementsByTagName('y')[0].textContent;
      const longitude = route_element.getElementsByTagName('x')[0].textContent;
      const stationSeq = parseInt(route_element.getElementsByTagName('stationSeq')[0].textContent);
      const turnYn = route_element.getElementsByTagName('turnYn')[0].textContent;
      stationId_733.push(stationId);
      
    const params = {
      TableName: 'Bus733',
      Item: {
        stationId: stationId,
        stationName: stationName,
        latitude: latitude,
        longitude: longitude,
        stationSeq: stationSeq,
        turnYn: turnYn,
        locationNo1: 'X',
        predictTime1: 'X'
      },
    };

    docClient.put(params)
      .then(() => {
      })
      .catch((err) => {
        console.error('Error saving Route data to DynamoDB:', err);
      });
    }
  });
  } catch (error) {
    console.error('Error:', error);
  }
}busroute();