import { InlineKeyboard } from "grammy";
import { backmenu, bot } from "../../bot.js";
import { MEMBERS } from "../jsonreaders/member.js";
import { delmess } from "../funksiyalar/delmess.js";

export default function () {
    bot.callbackQuery("foydalanuvchi_soni", async (ctx) => {
        await delmess(ctx);

        // Foydalanuvchilar soni
        const count = Object.keys(MEMBERS).length;

        // Javob yuborish
        await ctx.reply(`Botning Foydalanuvchilari soni: ${count}`, {
            reply_markup: backmenu
        });

        // Callback query ni javobsiz qoldirmaslik
        await ctx.answerCallbackQuery();
        
    });
}
