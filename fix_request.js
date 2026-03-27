const fs = require('fs');
const filePath = 'C:\\Users\\swaya\\AppData\\Local\\Temp\\postman-draft-0061783c-b4ac-477c-be96-f1de10d3467c.request.yaml';
const content = [
  'type: http',
  'name: ""',
  'url: http://localhost:3000/api/shows/add',
  'method: POST',
  'queryParams: []',
  'body:',
  '  type: json',
  '  content: |-',
  '    {',
  '        "movieId": "1265609",',
  '        "showsInput": [',
  '            {',
  '                "date": "2025-06-05",',
  '                "time": ["16:00"]',
  '            }',
  '        ],',
  '        "ShowPrice": 300',
  '    }',
  ''
].join('\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('File written successfully');
