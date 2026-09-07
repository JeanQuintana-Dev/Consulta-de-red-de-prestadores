import {SOURCE_ID,SHEETS,parseCSV,validateSheet} from '../lib/data.js';
export default async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Método no permitido'});}
 try{
  const entries=await Promise.all(Object.entries(SHEETS).map(async([key,title])=>{
   const url=`https://docs.google.com/spreadsheets/d/${SOURCE_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(title)}`;
   const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw Error('No fue posible consultar la fuente');
   const text=await response.text();
   if(/^\s*</.test(text))throw Error('La fuente no está disponible como tabla');
   return [key,validateSheet(key,parseCSV(text))];
  }));
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).json({source:'live',loadedAt:new Date().toISOString(),sheets:Object.fromEntries(entries)});
 }catch{res.status(503).json({error:'No se pudo consultar Google Sheets en este momento.'});}
}
