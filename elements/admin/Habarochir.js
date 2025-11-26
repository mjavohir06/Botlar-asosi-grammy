import { InlineKeyboard } from "grammy";
import { backmenu, bot } from "../../bot.js";
import { qaytaol, YUBORILGAN, yukla } from "./messagetomembers.js";
import { delmess, delmessages } from "../funksiyalar/delmess.js";

export default function () {
    // Xabarni o'chirish tugmasi
    bot.callbackQuery("xabarochir", async (ctx) => {
        if (!ctx.session) ctx.session = {};
        await delmess(ctx);
        qaytaol();

        // Yuborilgan xabarlar IDlarini yig‘ish
        let buttonText = "";
        for (let y in YUBORILGAN) {
            if (y !== "id") {
                buttonText += `id: ${y}\n`;
            }
        }

        const msg = await ctx.reply(`Kerakli habarni IDsini yuboring:\n${buttonText}`, {
            reply_markup: backmenu,
        });
        delmessages.set(ctx.chat.id, msg);
        ctx.session.step = "habarochir";

        await ctx.answerCallbackQuery();
    });

    // Foydalanuvchi xabarini qabul qilish
    bot.on("message:text", async (ctx, next) => {
        if (ctx.session?.step === "habarochir") {
            await delmess(ctx);
            const id = ctx.message.text;
            const newdata = {};

            if (!isNaN(parseInt(id)) && YUBORILGAN[id] !== undefined) {
                const x = YUBORILGAN[id];
                if (typeof x === "object" && x !== null && !Array.isArray(x)) {
                    try {
                        // Har bir chatdagi xabarni o'chirish
                        for (let chatId in x) {
                            await ctx.api.deleteMessage(chatId, x[chatId]);
                        }

                        // YUBORILGAN massivni yangilash
                        for (let y in YUBORILGAN) {
                            if (y !== id) {
                                newdata[y] = YUBORILGAN[y];
                            }
                        }
                        yukla(newdata);
                        qaytaol();

                        const msg = await ctx.reply("O'chirildi", {
                            reply_markup: backmenu,
                        });
                        delmessages.set(ctx.chat.id, msg);
                    } catch (err) {
                        console.error("Xabarni o'chirishda xatolik:", err);
                    }
                }
            }
        }

        return next();
    });
}
