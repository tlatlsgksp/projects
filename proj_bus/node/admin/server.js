const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const client = new DynamoDBClient({
  region: AWS_REGION, 
  credentials: { 
    accessKeyId: AWS_ACCESS_KEY_ID, 
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});
const docClient = DynamoDBDocument.from(client);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.get('/users', async (req, res) => {
    try {
        const scanResponse = await docClient.send(new ScanCommand({
            TableName: 'Access'
        }));
        console.log(scanResponse);
        if (scanResponse.Items) {
            const users = scanResponse.Items.map(item => {
                const user = unmarshall(item);
                return {
                    deviceid: user.deviceid,
                    name: user.name,
                    Access: user.Access
                };
            });
            res.json(users);
        } else {
            res.json({ message: 'No users found' });
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/grant-access', async (req, res) => {
    const deviceid = req.query.deviceid;

    try {
        const updateParams = {
            TableName: 'Access',
            Key: { deviceid: deviceid },
            UpdateExpression: 'SET Access = :newAccess',
            ExpressionAttributeValues: {
                ':newAccess': '허용'
            },
            ReturnValues: 'ALL_NEW'
        };

        const updatedData = await docClient.update(updateParams);
        res.json({ message: 'Access granted', updatedData });
    } catch (error) {
        console.error("Error granting access:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/revoke-access', async (req, res) => {
  const deviceid = req.query.deviceid;

  try {
      const updateParams = {
          TableName: 'Access',
          Key: { deviceid: deviceid },
          UpdateExpression: 'SET Access = :newAccess',
          ExpressionAttributeValues: {
              ':newAccess': '불가'
          },
          ReturnValues: 'ALL_NEW'
      };

      const updatedData = await docClient.update(updateParams);
      res.json({ message: 'Access granted', updatedData });
  } catch (error) {
      console.error("Error granting access:", error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/bus-routes', async (req, res) => {
    try {
        const scanResponse = await docClient.send(new ScanCommand({
            TableName: 'BusRoute'
        }));
        console.log(scanResponse);
        if (scanResponse.Items) {
            const busRoutes = scanResponse.Items.map(item => {
                const route = unmarshall(item);
                return {
                    id: route.id,
                    stationName: route.stationName,
                    latitude: route.latitude,
                    longitude: route.longitude
                };
            });
            res.json(busRoutes);
        } else {
            res.json({ message: 'No bus routes found' });
        }
    } catch (error) {
        console.error("Error fetching bus route data:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/delete-bus-route', async (req, res) => {
    const stationName = req.query.stationName;

    try {
        const deleteParams = {
            TableName: 'BusRoute',
            Key: { stationName: stationName }
        };

        await docClient.delete(deleteParams);
        res.json({ success: true, message: 'Bus route deleted' });
    } catch (error) {
        console.error("Error deleting bus route:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
app.use(express.json());
app.post('/add-bus-route', async (req, res) => {
    const { stationName, latitude, longitude } = req.body;

    try {
        const putParams = {
            TableName: 'BusRoute',
            Item: {
                stationName: stationName,
                latitude: latitude,
                longitude: longitude
            }
        };

        await docClient.put(putParams);
        res.json({ success: true, message: 'Bus route added successfully' });
    } catch (error) {
        console.error("Error adding bus route:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.get('/button-list', async (req, res) => {
    try {
        const scanResponse = await docClient.send(new ScanCommand({
            TableName: 'Busbutton'
        }));
        console.log(scanResponse);
        if (scanResponse.Items) {
            const buttons = scanResponse.Items.map(item => {
                const button = unmarshall(item);
                return {
                    assort: button.assort,
                    destination: button.destination,
                    type: button.type,
                    time: button.time,
                    buttonText: button.buttonText
                };
            });
            res.json(buttons);
        } else {
            res.json({ message: '배차 정보가 존재하지 않습니다.' });
        }
    } catch (error) {
        console.error("배차 정보를 가져오는 중 오류:", error);
        res.status(500).json({ error: '내부 서버 오류' });
    }
});

app.post('/delete-button', async (req, res) => {
    const buttonId = req.query.assort;

    try {
        const deleteParams = {
            TableName: 'Busbutton',
            Key: { assort: buttonId },
        };

        await docClient.delete(deleteParams);
        res.json({ success: true, message: '버튼 정보가 삭제되었습니다.' });
    } catch (error) {
        console.error("버튼 정보 삭제 중 오류:", error);
        res.status(500).json({ success: false, error: '내부 서버 오류' });
    }
});

app.post('/save-button-data', async (req, res) => {
    const { assort, destination, type, time, buttonText } = req.body;
  
    try {
        const params = {
            TableName: 'Busbutton',
            Item: { 
                assort,
                destination,
                type, 
                time,
                buttonText 
            },
        };
    
        await docClient.put(params, (err, data) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).send('데이터를 저장하는 중에 오류가 발생했습니다.');
        } else {
            console.log('데이터가 성공적으로 저장되었습니다:', data);
            res.send('데이터가 성공적으로 저장되었습니다.');
        }
        
        });
    } catch (error) {
        console.error("Error deleting bus route:", error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  app.post('/login', (req, res) => {
    //예시 하드코딩
    const username = req.body.username;
    const password = req.body.password;

    if (username === 'test' && password === 'test') {
        res.redirect('/main.html');
    } else {
        console.log("로그인 실패");
        res.status(401).json({ message: '로그인 실패' });
    }
});
