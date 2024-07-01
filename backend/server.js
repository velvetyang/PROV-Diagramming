const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { trimGraphData } = require('./trimData'); // 引入修剪模块
const app = express();
const port = 3000;

// 使用 cors 中间件来允许跨域请求
app.use(cors());

// 使用 bodyParser 中间件来解析 JSON 请求体
app.use(bodyParser.json());

// 定义一个根路径路由来响应 GET 请求
app.get('/', (req, res) => {
  res.send('Welcome to the Graph API server!');
});



// 定义一个路由来接收 JSON 数据并保存为文件
app.post('/upload', (req, res) => {
  const graphData = req.body;
  console.log('Received graph data:');
  console.log(JSON.stringify(graphData, null, 2));

  // 修剪不需要的属性
  const trimmedGraphData = trimGraphData(graphData);
  console.log('Trimmed graph data:');
  console.log(JSON.stringify(trimmedGraphData, null, 2));

  // 将修剪后的数据保存为 JSON 文件
  const jsonContent = JSON.stringify(trimmedGraphData, null, 2);
  const filePath = path.join(__dirname, 'graphData.json');

  fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing JSON to file', err);
      return res.status(500).send('Error saving data');
    }
    console.log('JSON file has been saved.');

    // 返回下载链接
    res.send({ message: 'Graph data received and trimmed successfully!', downloadUrl: `http://localhost:${port}/download` });
  });
});

// 定义一个路由来提供文件下载
app.get('/download', (req, res) => {
  const filePath = path.join(__dirname, 'graphData.json');
  res.download(filePath, 'graphData.json', (err) => {
    if (err) {
      console.error('Error downloading the file', err);
      res.status(500).send('Error downloading the file');
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
