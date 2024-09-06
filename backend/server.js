const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const {
  trimGraphData,
  transformData
} = require('./trimData'); // 引入修剪模块
const app = express();
const port = 3000;

// 使用 cors 中间件来允许跨域请求
app.use(cors());

// 使用 bodyParser 中间件来解析 JSON 请求体
app.use(bodyParser.json({ limit: '50mb' })); // 增加解析大小限制，以处理大型图像数据

// 定义一个根路径路由来响应 GET 请求
app.get('/', (req, res) => {
  res.send('Welcome to the Graph API server!');
});

// 定义一个路由来接收 JSON 数据并保存为文件
app.post('/upload', (req, res) => {
  const graphData = req.body;
  console.log('Received graph data:');
  console.log(JSON.stringify(graphData, null, 2));

  // 修剪数据
  const trimmedGraphData = trimGraphData(graphData);
  console.log('Trimmed graph data');
 
  // 转换数据结构
  const transformedGraphData = transformData(trimmedGraphData);
  console.log('Transformed graph data:');
  console.log(JSON.stringify(transformedGraphData, null, 2));

  // 将修剪后的数据保存为 JSON 文件
  const jsonContent = JSON.stringify(transformedGraphData, null, 2);
  const filePath = path.join(__dirname, 'graphData.json');

  fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing JSON to file', err);
      return res.status(500).send('Error saving data');
    }
    console.log('JSON file has been saved.');

    // 返回下载链接
    res.send({
      message: 'Graph data received and trimmed successfully!',
      downloadUrl: `http://localhost:${port}/download`
    });
  });
});

// 定义一个路由来接收 SVG/PNG 数据并保存为文件
app.post('/uploadImage', (req, res) => {
  const { svg, png } = req.body;
  
  if (svg) {
    const filePath = path.join(__dirname, 'graph.svg');
    fs.writeFile(filePath, svg, 'utf8', (err) => {
      if (err) {
        console.error('Error writing SVG to file', err);
        return res.status(500).send('Error saving SVG');
      }
      console.log('SVG file has been saved.');

      res.send({
        message: 'SVG data received and saved successfully!',
        downloadUrl: `http://localhost:${port}/downloadImage?type=svg`
      });
    });
  } else if (png) {
    const base64Data = png.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(__dirname, 'graph.png');
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Error writing PNG to file', err);
        return res.status(500).send('Error saving PNG');
      }
      console.log('PNG file has been saved.');

      res.send({
        message: 'PNG data received and saved successfully!',
        downloadUrl: `http://localhost:${port}/downloadImage?type=png`
      });
    });
  } else {
    res.status(400).send('No SVG or PNG data provided.');
  }
});

// 定义一个路由来提供 JSON 文件下载
app.get('/download', (req, res) => {
  const filePath = path.join(__dirname, 'graphData.json');
  res.download(filePath, 'graphData.json', (err) => {
    if (err) {
      console.error('Error downloading the file', err);
      res.status(500).send('Error downloading the file');
    }
  });
});

// 定义一个路由来提供 SVG/PNG 文件下载
app.get('/downloadImage', (req, res) => {
  const { type } = req.query;
  const fileName = type === 'svg' ? 'graph.svg' : 'graph.png';
  const filePath = path.join(__dirname, fileName);
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Error downloading the image file', err);
      res.status(500).send('Error downloading the image file');
    }
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
