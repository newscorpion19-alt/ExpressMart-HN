const fs = require('fs');
const key = (fs.readFileSync('.env', 'utf8').match(/GEMINI_API_KEY=(.+)/) || [])[1]?.trim();
fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', { headers: { 'x-goog-api-key': key } })
  .then(r => r.json())
  .then(d => (d.models || [])
    .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
    .forEach(m => console.log(m.name.replace('models/', ''))))
  .catch(e => console.log('Error:', e.message));
