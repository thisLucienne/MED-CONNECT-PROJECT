// Test de connectivité simple
const testConnection = async () => {
  const urls = [
    'http://localhost:5000/health',
    'http://10.0.2.2:5000/health',
    'http://10.38.12.152:5000/health'
  ];

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      console.log(`✅ ${url} - Status: ${data.status}`);
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`);
    }
  }
};

testConnection();