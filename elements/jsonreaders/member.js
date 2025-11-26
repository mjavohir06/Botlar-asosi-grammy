import fs from 'fs'


let MEMBERS={}

if(fs.existsSync('members.json')){
  MEMBERS=JSON.parse(fs.readFileSync('members.json','utf-8'))
  
  
}
function memberQoshish(){
  fs.writeFileSync('members.json', JSON.stringify(MEMBERS,null,2),'utf-8')
}


export {memberQoshish,MEMBERS}