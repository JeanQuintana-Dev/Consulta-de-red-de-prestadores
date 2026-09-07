import {filterRows,municipalities} from './lib/data.js';
const $=id=>document.getElementById(id);
const configs={
 servicios:{title:'Servicios por prestador',description:'Busca una especialidad, un prestador o un municipio.',service:1,type:2,municipality:3,address:4,contact:5,email:6,typeLabel:'Tipo de servicio'},
 farmacias:{title:'Operadores farmacéuticos',description:'Consulta medicamentos, puntos de atención y cobertura de los operadores.',type:1,municipality:2,address:3,contact:4,typeLabel:'Tipo de medicamento'},
 hospitalarios:{title:'Hospitalarios',description:'Encuentra servicios hospitalarios y sus datos de contacto.',serviceText:1,address:2,contact:3},
 pgp:{title:'PGP',description:'Consulta los prestadores y servicios registrados en la modalidad PGP.',type:1,serviceText:2,address:3,contact:4,typeLabel:'Tipo de PGP'}
};
let data=null,active=Object.hasOwn(configs,location.hash.slice(1))?location.hash.slice(1):'servicios',page=1,filtered=[],printing=false;
const size=12;
function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function options(id,values,label){const select=$(id);select.replaceChildren(new Option(label,''));[...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')).forEach(v=>select.add(new Option(v,v)));}
function switchTab(key){
 active=key;page=1;const c=configs[key];
 document.querySelectorAll('[role=tab]').forEach(tab=>{const selected=tab.dataset.tab===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
 $('panel').setAttribute('aria-labelledby','tab-'+key);$('section-title').textContent=c.title;$('section-description').textContent=c.description;
 $('search').value='';$('search').placeholder=key==='servicios'?'Ej. odontología, nombre del prestador…':'Nombre, servicio, dirección o contacto…';
 const rows=data?.sheets[key]?.rows??[];
 for(const field of ['service','type','municipality']){
  $('filter-'+field).hidden=c[field]===undefined;
  const values=c[field]===undefined?[]:rows.flatMap(row=>field==='municipality'?municipalities(row[c[field]]):[row[c[field]]]);
  options(field,values,field==='municipality'?'Todos los municipios':field==='service'?'Todos los servicios':'Todos los tipos');
 }
 document.querySelector('label[for=type]').textContent=c.typeLabel??'Tipo';
 if(data)render();
}
function criteria(){return {query:$('search').value,municipality:$('municipality').value,type:$('type').value,service:$('service').value};}
function field(dl,label,value){if(!value)return;dl.append(element('dt','',label),element('dd','',value));}
function card(row){
 const c=configs[active],article=element('article','card'),head=element('div','card-header');head.append(element('h3','',row[0]||'Prestador sin nombre'));
 if(c.type!==undefined&&row[c.type])head.append(element('span','tag',row[c.type]));
 const body=element('div','card-body'),dl=element('dl');
 if(c.service!==undefined)field(dl,'Servicio',row[c.service]);
 if(c.serviceText!==undefined)field(dl,'Servicios',row[c.serviceText]);
 if(c.municipality!==undefined)field(dl,'Municipio o cobertura',row[c.municipality]);
 field(dl,'Dirección',row[c.address]||'No informada');
 field(dl,'Contacto',row[c.contact]||'No informado');
 body.append(dl);
 if(c.email!==undefined&&row[c.email]){const box=element('div','contact');const raw=row[c.email];if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)){const a=element('a','',raw);a.href='mailto:'+raw;box.append(a);}else box.append(element('span','',raw));body.append(box);}
 article.append(head,body);return article;
}
function render(){
 const rows=data.sheets[active].rows;filtered=filterRows(rows,criteria(),configs[active]);
 const providers=new Set(filtered.map(r=>r[0]).filter(Boolean)).size;
 $('summary').replaceChildren(element('strong','',`${filtered.length} ${filtered.length===1?'registro':'registros'}`),document.createTextNode(` · ${providers} ${providers===1?'prestador':'prestadores'}`));
 const pages=Math.max(1,Math.ceil(filtered.length/size));page=Math.min(page,pages);
 const shown=printing?filtered:filtered.slice((page-1)*size,page*size);$('results').replaceChildren(...shown.map(card));
 if(!filtered.length){const empty=element('div','empty');empty.append(element('h3','','No encontramos coincidencias'),element('p','','Prueba con otra palabra o elimina alguno de los filtros.'));const clear=element('button','button secondary','Limpiar filtros');clear.onclick=clearFilters;empty.append(clear);$('results').append(empty);}
 $('page-info').textContent=filtered.length?`${(page-1)*size+1}–${Math.min(page*size,filtered.length)} de ${filtered.length}`:'';
 $('pagination').hidden=pages===1;$('page-label').textContent=`Página ${page} de ${pages}`;$('previous').disabled=page===1;$('next').disabled=page===pages;$('print').disabled=!filtered.length;
 $('results').setAttribute('aria-busy','false');
}
function clearFilters(){$('search').value='';['service','type','municipality'].forEach(id=>$(id).value='');page=1;render();$('search').focus();}
async function load(){
 $('retry').hidden=true;
 try{
  let response=await fetch('/api/data',{signal:AbortSignal.timeout(22000)});
  if(!response.ok)throw Error('Fuente no disponible');
  data=await response.json();if(!data.sheets?.servicios)throw Error('Datos no disponibles');
 }catch{
  try{const response=await fetch('/data/snapshot.json');if(!response.ok)throw Error();data=await response.json();data.source='snapshot';}catch{data=null;}
 }
 if(!data){$('results').replaceChildren(element('div','empty','No pudimos cargar el directorio. Comprueba tu conexión y vuelve a intentar.'));$('data-status').textContent='El directorio no está disponible.';$('summary').textContent='Sin datos disponibles';$('results').setAttribute('aria-busy','false');$('retry').hidden=false;return;}
 Object.keys(configs).forEach(key=>$('count-'+key).textContent=data.sheets[key].rows.length);
 $('filters').querySelectorAll('input,select,button').forEach(el=>el.disabled=false);
 const date=new Date(data.loadedAt).toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'});
 $('data-status').textContent=data.source==='live'?`Datos consultados en Google Sheets: ${date}.`:`Copia del directorio del ${date}. No se pudo comprobar si hay cambios más recientes.`;
 $('retry').hidden=data.source==='live';switchTab(active);
}
document.querySelectorAll('[role=tab]').forEach(tab=>{
 tab.addEventListener('click',()=>{history.replaceState(null,'','#'+tab.dataset.tab);switchTab(tab.dataset.tab);});
 tab.addEventListener('keydown',event=>{const tabs=[...document.querySelectorAll('[role=tab]')];let index=tabs.indexOf(tab);if(event.key==='ArrowRight')index=(index+1)%tabs.length;else if(event.key==='ArrowLeft')index=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=tabs.length-1;else return;event.preventDefault();tabs[index].click();tabs[index].focus();});
});
window.addEventListener('hashchange',()=>{const key=location.hash.slice(1);if(Object.hasOwn(configs,key))switchTab(key);});
let timer;$('search').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{if(data){page=1;render();}},180);});
['service','type','municipality'].forEach(id=>$(id).addEventListener('change',()=>{page=1;render();}));
 $('filters').addEventListener('submit',event=>{event.preventDefault();if(data){page=1;render();}});$('clear').onclick=clearFilters;
 for(const [id,step] of [['previous',-1],['next',1]])$(id).onclick=()=>{page+=step;render();$('summary').scrollIntoView({block:'start'});};
 $('print').onclick=()=>window.print();window.addEventListener('beforeprint',()=>{if(data){printing=true;render();}});window.addEventListener('afterprint',()=>{if(data){printing=false;render();}});
 $('retry').onclick=load;switchTab(active);load();
