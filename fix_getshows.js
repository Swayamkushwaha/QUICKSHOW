const fs = require('fs');
const filePath = 'server/controllers/showController.js';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
const normalized = content.replace(/\r\n/g, '\n');

const oldBlock = `export const getShows = async (req , res)=>{\n    try{\n        const shows = (await Show.find({showDateTime: {$gte: new Date()}}).populate('movie')).toSorted({showDateTime: 1});\n\n        // filter unquie shows\n        const uniqueShows = new Set(shows.map(show=> show.movie))\n\n        res.json({success: true, shows:Array.from(unquieShows)})\n    }catch(error){\n        console.error(error);\n        res.json({success:false , message:error.message});\n\n    }\n}`;

const newBlock = `export const getShows = async (req, res) => {\n    try {\n        const shows = (await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie'))\n            .toSorted((a, b) => new Date(a.showDateTime) - new Date(b.showDateTime));\n\n        // filter unique shows\n        const uniqueShows = new Set(shows.map(show => show.movie));\n\n        res.json({ success: true, shows: Array.from(uniqueShows) });\n    } catch (error) {\n        console.error(error);\n        res.json({ success: false, message: error.message });\n    }\n}`;

if (!normalized.includes(oldBlock)) {
  console.error('OLD BLOCK NOT FOUND');
  process.exit(1);
}

const fixed = normalized.replace(oldBlock, newBlock);
fs.writeFileSync(filePath, fixed.replace(/\n/g, '\r\n'), 'utf8');
console.log('Done');
