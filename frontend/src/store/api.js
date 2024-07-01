export async function sendDataToServer(data) {
  try {
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Data sent successfully!');
      return result.downloadUrl; // 返回下载链接
    } else {
      console.error('Failed to send data');
      return null;
    }
  } catch (error) {
    console.error('Error sending data:', error);
    return null;
  }
}