import { bot, backmenu } from "../../bot.js";
import { delmess, delmessages } from "../funksiyalar/delmess.js";
import { MEMBERS } from "../jsonreaders/member.js";

export default function () {

    bot.callbackQuery("member_change", async (ctx) => {
        await delmess(ctx);

        let memberlist = "Egalar\\=\\=\\=\\=\\>\\\n";
        for (let m in MEMBERS) {
            if (MEMBERS[m].turi === "ega") {
                const nameEscaped = MEMBERS[m].name
                    .replace(/([._*[\]()~`>#+\-=|{}!])/g, '\\$1')
                memberlist += `Username: [${nameEscaped}](tg://user?id=${m}), id: *${m}*\n`;
            }
        }

        memberlist += "\nAdminlar\\=\\=\\=\\=\\>\n";
        for (let m in MEMBERS) {
            if (MEMBERS[m].turi === "admin") {
                const nameEscaped = MEMBERS[m].name
                    .replace(/([._*[\]()~`>#+\-=|{}!])/g, '\\$1')
                memberlist += `Username: [${nameEscaped}](tg://user?id=${m}), id: *${m}*\n`;
            }
        }

        await ctx.reply(memberlist, { parse_mode: "MarkdownV2" });

        if (!ctx.session) ctx.session = {};
        const msg = await ctx.reply("A'zo idsini kiriting:", {
            reply_markup: { inline_keyboard: backmenu.inline_keyboard }
        });
        delmessages.set(ctx.chat.id, msg);
        ctx.session.step = "memberid";

        await ctx.answerCallbackQuery();
    });

    bot.on("message:text", async (ctx, next) => {
        if (!ctx.session) ctx.session = {};

        if (ctx.session.step === "memberid") {
            const id = Number(ctx.message.text);
            await delmess(ctx);

            const user = MEMBERS[id];
            if (!user) {
                const msg = await ctx.reply("Bu id egasi bot Foydalanuvchisi emas", {
                    reply_markup: { inline_keyboard: backmenu.inline_keyboard }
                });
                delmessages.set(ctx.chat.id, msg);
            } else {
                const msg = await ctx.reply(`Foydalanuvchi: ${user.name}\nTuri: ${user.turi}\n\nO'zgartirish:`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Ega", callback_data: `memberch_ega_${id}` }],
                            [{ text: "Admin", callback_data: `memberch_admin_${id}` }],
                            [{ text: "Premium", callback_data: `memberch_premium_${id}` }],
                            [{ text: "Foydalanuvchi", callback_data: `memberch_member_${id}` }],
                            ...backmenu.inline_keyboard
                        ]
                    }
                });
                delmessages.set(ctx.chat.id, msg);
            }
        }

        return next();
    });

    bot.on("callback_query", async (ctx, next) => {
        const data = ctx.callbackQuery.data;

        if (data.startsWith("memberch_")) {
            await delmess(ctx);
            try {
                const [status, id] = data.split("memberch_")[1].split("_");
                MEMBERS[id].turi = status;
                try{
                    await ctx.api.sendMessage(id, `Sizning statusingiz <b>${status.toUpperCase()}</b> ga o'zgartirildi!!!`, {
                        parse_mode: "HTML"
                    });

                }catch(error){

                }

                const msg = await ctx.reply("O'zgartirildi", {
                    reply_markup: { inline_keyboard: backmenu.inline_keyboard }
                });
                delmessages.set(ctx.chat.id, msg);
            } catch (err) {
                console.error(err);
            }
        }

        await ctx.answerCallbackQuery();
        return next();
    });
}
