
import { backmenu, bot } from "../../bot.js";
import { MEMBERS } from "../jsonreaders/member.js";
import { delmess, delmessages } from "../funksiyalar/delmess.js";

export default function () {
    bot.callbackQuery("foydalanuvchi_soni", async (ctx) => {
        await delmess(ctx);
        // Foydalanuvchilar soni
        const count = Object.keys(MEMBERS).length;

        // Javob yuborish
        const msg=await ctx.reply(`Botning Foydalanuvchilari soni: ${count}`, {
            reply_markup: backmenu
        });
        // delmessages.set(ctx.chat.id, msg);
        
    });
}
