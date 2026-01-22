const http = require('http');

function testAPI() {
  console.log('Тестирование API...\n');

  // Тест 1: GET /memes
  const options1 = {
    hostname: 'localhost',
    port: 3000,
    path: '/memes',
    method: 'GET'
  };

  const req1 = http.request(options1, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('GET /memes:', res.statusCode);
      console.log(JSON.parse(data));
      console.log('\n');
    });
  });

  req1.on('error', (e) => {
    console.error(`Ошибка: ${e.message}`);
  });

  req1.end();

  // Тест 2: GET /memes/1
  setTimeout(() => {
    const req2 = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/memes/1',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('GET /memes/1:', res.statusCode);
        console.log(JSON.parse(data));
        console.log('\n');
      });
    });
    req2.end();
  }, 500);

  // Тест 3: POST /memes
  setTimeout(() => {
    const postData = JSON.stringify({
      название: 'Тестовый мем',
      описание: 'Это тестовое описание',
      категория: 'тест',
      популярность: 75
    });

    const req3 = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/memes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('POST /memes:', res.statusCode);
        console.log(JSON.parse(data));
        console.log('\n');
      });
    });
    req3.write(postData);
    req3.end();
  }, 1000);
}

testAPI();
