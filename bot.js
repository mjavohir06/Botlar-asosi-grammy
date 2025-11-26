import { Bot, session, InlineKeyboard } from "grammy";
import { session } from "@grammyjs/session";

import { MEMBERS, memberQoshish } from "./elements/jsonreaders/member.js";
import obunatek, { obunami } from "./elements/funksiyalar/obunatek.js";


import Chanel_change from "./elements/ega/Chanel_change.js";
import messagetomembers from "./elements/admin/messagetomembers.js";
import Memberchange from "./elements/ega/Memberchange.js";
import Foydalanuchilar_soni from "./elements/admin/Foydalanuchilar_soni.js";
import Habarochir from "./elements/admin/Habarochir.js";

// Bot token va egasi
const bot_token = "8471724009:AAE-9Ke0ViWHx7RlnmT_994479eaqAlJrHY";
const ega = 6622110096;

// Grammy botini yaratish
const bot = new Bot(bot_token);
bot.use(session({
    initial: () => ({})
}));
bot.catch(async err=>{
    const ctx=err.ctx

    try{
        await bot.api.sendMessage(ega,`------❗Botda Xatolik❗------ \n \n User: ${ctx.from.first_name}, ID:${ctx.from.id} \n\n Error: ${err.error.message}`)

    }catch(e){
        console.log("Ega id xatosi: "+e.message);
    }

    if(ctx.update?.message && ctx.from){
        try{
            await ctx.reply("Botda nosozlik aniqlandi va bu xaqida bot egasiga xabar berildi! \n Iltimos /start tugmasini qayta bosing.")
        }catch{
            
        }
    }
})

// Majburiy obuna kanallari
const newMembersMap = new Map(Object.entries(MEMBERS));

// Global o'zgaruvchilar
let userId, bott;
const backmenu = new InlineKeyboard().text("🔙 Bosh menuga qaytish", "check_sub");

// ✅ /start komandasi
bot.command("start", async (ctx) => {
    bott = ctx;
    userId = ctx.from.id;

    if (newMembersMap.has(String(userId))) {
        MEMBERS[userId].name = ctx.from.first_name;
    } else {
        MEMBERS[userId] = {
            name: ctx.from.first_name,
            turi: "member",
            obunalar: [],
        };
    }
    memberQoshish();
    await obunatek(ctx);
});

// ✅ "Tekshirish" tugmasi
bot.callbackQuery("check_sub", async (ctx) => {
    await obunatek(ctx);
    if (!ctx.session) ctx.session = {};
    await ctx.answerCallbackQuery(); // tugma bosilganda xabar berish
});

//-----------------------------------------Majburiy-kanal-a'zoligi---------------------------------------------//
// Majburiy kanal sozlamari faqat bot egasi uchun ishlaydi 
Chanel_change();

// Foydaluvchi statusini o'zgartirish : member, admin, ega
Memberchange();

//-------------A'zolarga xabar yuborish-----------//
messagetomembers();
Habarochir();
Foydalanuchilar_soni();

// Botni ishga tushurish
bot.start({
    drop_pending_updates: true, // pending update'larni o'chirish
});
console.log("✅ Bot ishga tushdi...");

// Export qilish
export { bott, userId, bot, backmenu };
