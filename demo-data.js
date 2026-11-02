/* Standalone visual demo. Contains only synthetic data. */
(()=>{
let presentation={settings:{version:0,token:'demo-token',published:false,showMenu:true,showServices:true,description:''},photos:[]};let role=localStorage.getItem('rafi-preview-role')||'ADMIN',lastSaved=null,writes=0;const errors=[];
const menu=[{id:11,name:'Куриные наггетсы с картофелем',price:390,unit:'порция',kind:'MENU',category:'Горячее'},{id:12,name:'Пицца Маргарита',price:650,unit:'шт.',kind:'MENU',category:'Пицца'}];
const services=[{id:21,name:'Шоу мыльных пузырей',price:3500,unit:'программа',kind:'SERVICE',category:'Развлечения',quantityEnabled:false},{id:22,name:'Аниматор',price:3000,unit:'час',kind:'SERVICE',category:'Развлечения',quantityEnabled:true},{id:23,name:'Вынос торта',price:800,unit:'услуга',kind:'SERVICE',category:'Поздравления'}];
const tables=[{id:1,name:'Космос 1',hallId:1,typeId:1,x:20,y:30,width:12,height:8},{id:2,name:'Космос 2',hallId:1,typeId:1,x:45,y:30,width:12,height:8},{id:3,name:'Облака 1',hallId:2,typeId:1,x:70,y:50,width:12,height:8}];
const clubs=[{id:1,name:'Облака',opensAt:'10:00',closesAt:'21:00'}];
const config={club:clubs[0],halls:[{id:1,name:'Космос'},{id:2,name:'Облака'}],types:[{id:1,capacity:14,shape:'RECTANGLE'}],tables};
config.types.push({id:2,capacity:4,shape:'SQUARE'},{id:3,capacity:6,shape:'ROUND'});tables.push({id:4,name:'Маленький',typeId:2,x:25,y:65,width:7,height:12},{id:5,name:'Круглый',typeId:3,x:55,y:65,width:8,height:14});
const cards=[{id:1,version:0,clubId:1,clientName:'Большой банкет',phone:'79991234567',eventDate:'2026-11-01',startTime:'14:00',endTime:'18:00',guests:20,selectionKey:'h:1',status:'CONFIRMED',prepayment:1000,extraOrder:0,seats:[{tableId:1,tableName:'Космос 1'},{tableId:3,tableName:'Облака 1'}],items:[]},{id:2,clubId:1,clientName:'Другая дата',eventDate:'2026-11-02',startTime:'14:00',endTime:'18:00',selectionKey:'h:1',status:'CONFIRMED',seats:[{tableId:1,tableName:'Космос 1'}]}];
const historyFixtures=[{id:5,occurredAt:'2026-11-01T15:42:00',actor:'Анна',action:'UPDATE',detail:JSON.stringify({format:'rafi-changes-v1',changes:[{field:'Гостей',before:'14',after:'18'},{field:'Начало',before:'14:00',after:'15:00'}]})},{id:3,occurredAt:'2026-10-31T11:04:00',actor:'admin',action:'UPDATE',detail:'Дата: 30.10.2026, время: 14:00–18:00, гостей: 10, предоплата: 0, дозаказ: 0 → Дата: 01.11.2026, время: 15:00–19:00, гостей: 14, предоплата: 500, дозаказ: 0'},{id:4,occurredAt:'2026-11-01T12:00:00',actor:'owner',action:'CANCELLED',detail:'Статус: CANCELLED'}];

const day=new Date(), dateOf=(offset=0)=>{const d=new Date(day.getFullYear(),day.getMonth(),day.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
clubs[0].name='Демо · Облака'; config.club.planAspectRatio=1200/720;
cards[0]= {...cards[0],clientName:'Мария · День рождения Алисы',eventDate:dateOf(),startTime:'12:00',endTime:'16:00',guests:20,total:13800,balance:10800,prepayment:3000,items:[{id:101,catalogItemId:11,name:menu[0].name,kind:'MENU',quantity:20,unitPrice:390},{id:102,catalogItemId:22,name:services[1].name,kind:'SERVICE',quantity:2,unitPrice:3000}]};
cards[1]={...cards[1],clientName:'Алексей · Праздник Максима',phone:'70000000002',eventDate:dateOf(),status:'PRELIMINARY',guests:10,total:3900,balance:3900,version:0,items:[],missing:['Меню'],seats:[],holdUntil:dateOf(2)+'T21:00:00'};
cards.push({...cards[0],id:3,clientName:'Елена · Отменённый праздник',status:'CANCELLED',eventDate:dateOf(1)}, {...cards[0],id:4,clientName:'Анна · Прошедший банкет',eventDate:dateOf(-1)}, {...cards[0],id:5,clientName:'Ирина · Праздник Софии',eventDate:dateOf(3)});
const staff=[{id:1,username:'demo-manager',displayName:'Анна Морозова',role:'OWNER',enabled:true,clubIds:[1]},{id:2,username:'demo-admin',displayName:'Ольга Соколова',role:'ADMIN',enabled:true,clubIds:[1]}];
const originalFetch=window.fetch.bind(window);
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8'}});
window.fetch=async(input,options={})=>{
 const url=new URL(typeof input==='string'?input:input.url,location.href),p=url.pathname,method=(options.method||'GET').toUpperCase();
 if(!p.includes('/api/'))return originalFetch(input,options);
 const body=typeof options.body==='string'?JSON.parse(options.body):{};
 if(p.includes('/recommend'))return json({tables:body.guests&&body.startTime?[{id:2,name:'Космос 2',guests:Number(body.guests)}]:[],warning:'',availabilityChecked:Boolean(body.startTime&&body.endTime)});
 if(p.match(/\/v3\/cards(?:\/\d+)?$/)){
   const match=p.match(/\/cards\/(\d+)$/),id=match?Number(match[1]):null;
   if(method==='GET')return json(id?{booking:cards.find(b=>b.id===id),items:cards.find(b=>b.id===id)?.items||[],history:historyFixtures}:cards.filter(b=>!b.eventDate||(!url.searchParams.has('month')||(Number(b.eventDate.slice(5,7))===Number(url.searchParams.get('month'))&&Number(b.eventDate.slice(0,4))===Number(url.searchParams.get('year'))))));
   if(['POST','PUT'].includes(method)){
     const existing=cards.find(b=>b.id===id),next={...existing,...body,id:id||Math.max(...cards.map(b=>b.id))+1,clubId:1,version:(existing?.version||0)+1,status:existing?.status||'PRELIMINARY',seats:existing?.seats||[],missing:[]};
     next.items=(body.items||[]).map((line,i)=>{const item=menu.concat(services).find(c=>c.id===line.catalogItemId)||{};return {...item,...line,id:line.id||100+i,unitPrice:item.price||line.unitPrice||0};});
     next.total=next.items.reduce((s,l)=>s+l.quantity*l.unitPrice,0)+Number(next.extraOrder||0);next.balance=next.total-Number(next.prepayment||0);
     if(existing)cards.splice(cards.indexOf(existing),1,next);else cards.push(next);return json(next);
   }
 }
 if(method!=='GET')return json({message:'Визуальная демонстрация: это действие доступно в рабочем приложении.'},409);
 if(p.endsWith('/me'))return json({username:'demo',displayName:role==='DEVELOPER'?'Разработчик':role==='OWNER'?'Анна Морозова':'Ольга Соколова',role,clubId:1,clubIds:[1]});
 if(p.endsWith('/clubs'))return json(clubs);
 if(p.endsWith('/v3/config'))return json(config);
 if(p.endsWith('/halls'))return json(config.halls);
 if(p.endsWith('/catalog'))return json(url.searchParams.get('kind')==='MENU'?menu:services);
 if(p.endsWith('/categories'))return json((url.searchParams.get('kind')==='MENU'?['Горячее','Пицца']:['Развлечения','Поздравления']).map(name=>({name})));
 if(p.endsWith('/v3/staff')||p.endsWith('/accounts'))return json(staff);
 if(p.endsWith('/v3/statistics'))return json({count:12,orders:156000,received:56000,remaining:100000,guests:168,average:13000,cancelled:2,preliminary:3});
 if(p.endsWith('/v3/presentation'))return json(presentation);
 if(p.endsWith('/v3/recipients'))return json([{name:'Пример клиента',phone:'70000000001'}]);
 if(p.endsWith('.xlsx')||p.includes('/pdf'))return json({message:'Документы доступны только в рабочем приложении.'},409);
 console.info('Preview read:',p);return json([]);
};
document.addEventListener('DOMContentLoaded',()=>{
 const bar=document.createElement('div');bar.id='demo-toolbar';
 bar.innerHTML='<span>Демонстрация · вымышленные данные</span><label>Роль <select aria-label="Роль демонстрации"><option value="ADMIN">Администратор</option><option value="OWNER">Управляющий</option><option value="DEVELOPER">Разработчик</option></select></label>';
 const style=document.createElement('style');style.textContent='#demo-toolbar{position:relative;z-index:1000;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 18px;padding:6px 10px;background:#163832;color:#daf1de;font:12px/1.4 system-ui}#demo-toolbar label{display:flex;align-items:center;gap:8px}#demo-toolbar select{width:auto;min-height:28px;padding:3px 24px 3px 10px;margin:0;border:0;border-radius:16px;background:#daf1de;color:#163832;font:inherit}';
 document.head.append(style);document.body.prepend(bar);bar.querySelector('select').value=role;
 bar.querySelector('select').onchange=e=>{localStorage.setItem('rafi-preview-role',e.target.value);location.reload();};
 document.addEventListener('submit',e=>{if(e.target.action?.includes('/logout')){e.preventDefault();alert('Это демонстрационная версия. Выберите другую роль в верхней полосе.');}},true);
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&(a.getAttribute('href')||'').includes('/p/')){e.preventDefault();alert('Публичная презентация работает в серверной версии Rafi.');}},true);
});

})();
