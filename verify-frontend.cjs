const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
let scripts=0;
for(const name of ['index.html','login.html']){
 const html=fs.readFileSync(path.join(__dirname,'src/main/resources/static',name),'utf8');
 for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){
  new vm.Script(match[1],{filename:name+':inline-'+(++scripts)});
 }
}
const html=fs.readFileSync(path.join(__dirname,'src/main/resources/static/index.html'),'utf8');
const begin=html.indexOf('let planDraftZone=');
const end=html.indexOf('\nfunction zoneInfo(',begin);
assert.ok(begin>=0&&end>begin,'Map renderer must be present');
const elements={};
const element=id=>elements[id]??=(
 {value:id==='planZoneSelect'?'5':'',naturalWidth:100,complete:false,files:[],hidden:false,
  classList:{add(){},remove(){}},setAttribute(){},dispatchEvent(){},listeners:{},
  addEventListener(event,fn){this.listeners[event]=fn},
  getBoundingClientRect(){return {left:0,top:0,width:100,height:100}}});
const polygon={dataset:{zone:'5'}};
const context=vm.createContext({
 $:id=>['mapPrev','mapNext','mapDate'].includes(id)?null:element(id),clubId:1,halls:[{id:5,name:'Test zone',outline:'10,10 20,10 20,20',archived:false}],clubs:[],
 dev:()=>true,esc:String,enhanceRafiSelects(){},Event:class{},notify(){},Date,console,
 document:{querySelectorAll(selector){return selector==='#planOverlay [data-zone]'?[polygon]:[]}}
});
vm.runInContext(html.slice(begin,end),context);
vm.runInContext('renderMap()',context);
elements.planDraw.onclick();
polygon.onclick();
for(const [x,y] of [[11,11],[19,11],[19,19]])
 elements.planOverlay.listeners.click({clientX:x,clientY:y,target:{closest:()=>polygon}});
assert.equal(vm.runInContext('planDraftPoints.length',context),3,'Existing polygons must not swallow new outline points');
assert.equal(elements.planSave.disabled,false,'Three points enable saving');
elements.planUndo.onclick();
assert.equal(vm.runInContext('planDraftPoints.length',context),2);
assert.equal(elements.planSave.disabled,true);
assert.ok(html.includes("cache: 'no-store'"),'Private API requests must bypass browser cache');
console.log(`PASS: ${scripts} inline scripts parse; contour redraw/undo work in a DOM model; private API fetch uses no-store.`);
console.log('This is not a real browser, Java type check, or database integration test.');
