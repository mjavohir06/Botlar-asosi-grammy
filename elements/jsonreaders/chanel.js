import fs from 'fs'
import {
    bot
} from '../../bot.js'
import { MEMBERS } from './member.js'




let CHANNELS = []

    if (fs.existsSync('chanels.json')) {
        CHANNELS = JSON.parse(fs.readFileSync('chanels.json', 'utf-8'))
    }






// const app=express()

//Frontend faylni static qilish
// app.use(express.static(path.join(__dirname,"web")))

//mini ilova url i
// const web_url="https://www.figma.com/design/rOvRUuLpYyFLJ1q8OUQIoO/UzChess?t=xo7yIG5WlHqUwp8x-0"

//chanel.json fayli bilan bog'liq amalyotlar va funksiyalar
let natija = 2 //1- muammo yo'q ; 0- linkda xatolik; 2-boshlang'ich natija 
async function chanelqoshish(nomi, linki, turi, soni,id) { //iki tur bor:ommaviy (oy) va maxviy (my)
    const data = CHANNELS

    let link
    if (linki.includes('@') && turi!=="boshqa") {
        link = linki.split('@')
        if (link[0] !== '') {
            natija = 0

        } else {

            natija = 1
        }
    } else if (linki.includes('https://t.me/') && turi!=="boshqa") {
        link = linki.split('https://t.me/')
        if (link[0] !== '') {
            natija = 0
        } else {

            natija = 1
        }
    } else if(turi=="boshqa" && linki.includes('https://')){
        link = linki.split('https://')
        if (link[0] !== '' && !link[1].includes('.')) {
            natija = 0
        } else {
            natija = 1
        }
    }

     else {
        natija = 0
    }
    
    if (natija == 1) {
        if (turi == 'telegram') {
            const idsi=String(id).startsWith("-100")? String(id) :"-100"+String(id)
            console.log(idsi);
            
            const chan = {
                "name": nomi,
                "link": "https://t.me/" + link[1],
                "username": "telegram",
                "id":idsi,
                "soni": soni
            }
            data.push(chan)
            fs.writeFileSync('chanels.json', JSON.stringify(data, null, 2), 'utf-8')
        } else if (turi == 'boshqa') {
            const chan = {
                "name": nomi,
                "link": linki,
                "username": "boshqa",
                "soni": soni
            }
            data.push(chan)
            fs.writeFileSync('chanels.json', JSON.stringify(data, null, 2), 'utf-8')
        }
        CHANNELS=data

    }

}


function chanelsonichange(ctx,linki,soni){
    if(!ctx.session) ctx.session={}
    if(!isNaN(soni)){        
        const data = CHANNELS.filter(u => u.link !== linki)
        const data2 = CHANNELS.filter(u => u.link === linki)
        data2[0].soni=soni
        data.unshift(data2[0])
        
        fs.writeFileSync('chanels.json', JSON.stringify(data, null, 2), 'utf-8')
        ctx.session.natija="success"
        CHANNELS=data
    }else{
        ctx.session.natija="fail"
    }
    
}

function chanelsaqla(){
    try{
        fs.writeFileSync('chanels.json', JSON.stringify(CHANNELS, null, 2), 'utf-8')
    }catch(error){
        console.log("error");
    }
}










// Kanal nomi linki va turini o'zgartirish


//Kanalni o'chirish
function chanelochirish(linki) {
    const data = CHANNELS.filter(u => u.link !== linki)
    CHANNELS=data
    fs.writeFileSync('chanels.json', JSON.stringify(data, null, 2), 'utf-8')
}









export {
    CHANNELS,
    natija,
    chanelochirish,
    chanelqoshish,
    chanelsonichange,
    chanelsaqla
};