export const SOURCE_ID='1jJseGFsbLr52BJ79ohkOYXXLiC27G_e___2-_2aPYg4';
export const SHEETS={servicios:'SERVICIOS POR PRESTADOR',farmacias:'OPERADORES FARMACEUTICOS',hospitalarios:'HOSPITALARIOS',pgp:'PGP'};
export const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
export function municipalities(value){return String(value??'').split(/[,;\n]+/).map(v=>v.trim()).filter(Boolean);}
// RFC 4180: embedded line breaks, commas and escaped quotes remain inside a cell.
export function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(quoted)throw Error('CSV incompleto');
 row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
 return rows;
}
export function validateSheet(key,rows){
 const widths={servicios:7,farmacias:5,hospitalarios:4,pgp:5};
 if(!rows.length||rows[0].length<widths[key]||!normalize(rows[0][0]).match(/prestador|operador/))throw Error('Estructura inesperada: '+key);
 const width=widths[key];
 return {title:SHEETS[key],headers:rows[0].slice(0,width),rows:rows.slice(1).filter(r=>r.some(v=>String(v).trim())).map(r=>Array.from({length:width},(_,i)=>String(r[i]??'').trim()))};
}
export function filterRows(rows,{query='',municipality='',type='',service=''}={},config={}){
 const q=normalize(query);
 return rows.filter(row=>(!q||normalize(row.join(' ')).includes(q))&&(!municipality||municipalities(row[config.municipality]).some(v=>normalize(v)===normalize(municipality)))&&(!type||row[config.type]===type)&&(!service||row[config.service]===service));
}
