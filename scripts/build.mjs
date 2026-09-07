import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/lib',{recursive:true});await mkdir('dist/data',{recursive:true});
for(const file of ['index.html','styles.css','app.js','lib/data.js','data/snapshot.json'])await copyFile(file,'dist/'+file);
console.log('Sitio compilado en dist');
