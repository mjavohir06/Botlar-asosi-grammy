import { InlineKeyboard } from "grammy";
import { bot, backmenu } from "../../bot.js";
import { delmess, delmessages } from "../funksiyalar/delmess.js";
import { MEMBERS } from "../jsonreaders/member.js";
import { obunami } from "../funksiyalar/obunatek.js";
import fs from "fs";

let YUBORILGAN;

function qaytaol() {
    if (fs.existsSync("yuborilgan.json")) {
        YUBORILGAN = JSON.parse(fs.readFileSync("yuborilgan.json", "utf-8"));
    } else {
        YUBORILGAN = { id: 0 };
    }
}
qaytaol();

function yukla(object) {
    if (object) {
        fs.writeFileSync("yuborilgan.json", JSON.stringify(object, null, 2), "utf-8");
    } else {
        fs.writeFileSync("yuborilgan.json", JSON.stringify(YUBORILGAN, null, 2), "utf-8");
    }
}

//-------------A'zolarga-habar-yuborish-----------//
export default function () {
    // Habar yuborish tugmasi
    bot.callbackQuery("send_messagetm", async (ctx) => {
        qaytaol();
        if (!ctx.session) ctx.session = {};
        ctx.session.step = "messagetm";
        const msg = await ctx.reply(
            "Barcha a'zoga habar yuborish uchun habar kiriting (Eslatma: URL link kerak bo'lsa oxirida || bilan ajrating va [['nomi','url:htttps'],['nomi','url']] shaklida yozing):",
            { reply_markup: backmenu }
        );
        await delmess(ctx);
        delmessages.set(ctx.chat.id, msg);
        await ctx.answerCallbackQuery();
    });

    // Habarni o'chirish tugmasi
    bot.callbackQuery("delate_this", async (ctx) => {
        await delmess(ctx);
        try {
            if (ctx.session?.delmessid) {
                const x = ctx.session.delmessid;
                if (typeof x === "object" && x !== null && !Array.isArray(x)) {
                    for (let chatId in x) {
                        try {
                            await ctx.api.deleteMessage(chatId, x[chatId]);
                        } catch {}
                    }
                    const msg = await ctx.reply("O'chirildi", { reply_markup: backmenu });
                    qaytaol();
                    delmessages.set(ctx.chat.id, msg);
                }
                ctx.session.delmessid = {};
            }
        } catch {}
        await ctx.answerCallbackQuery();
    });

    // Text habarlarni yuborish
    bot.on("message:text", async (ctx, next) => {
        if (ctx.session?.step === "messagetm") {
            await delmess(ctx);
            let text = ctx.message.text;
            let urlbtn = [];

            if (text.includes("||")) {
                const [mainText, urls] = text.split("||");
                text = mainText;
                try {
                    const parsed = JSON.parse(urls.trim());
                    for (const u of parsed) {
                        if (u.length === 2 && u[1].startsWith("https://")) {
                            urlbtn.push([{ text: u[0], url: u[1] }]);
                        }
                    }
                } catch {
                    const msg = await ctx.reply("❌ Yozishda xatolik bor", { reply_markup: backmenu });
                    delmessages.set(ctx.chat.id, msg);
                    return next();
                }
            }

            try {
                ctx.session.delmessid = {};
                const messageId = YUBORILGAN.id;
                YUBORILGAN[messageId] = {};
                let failCount = 0;
                let lastMessage;

                for (const member in MEMBERS) {
                    try {
                        if (urlbtn.length > 0) {
                            lastMessage = await ctx.api.sendMessage(member, text, { reply_markup: { inline_keyboard: urlbtn } });
                        } else {
                            lastMessage = await ctx.api.sendMessage(member, text);
                        }
                        YUBORILGAN[messageId][member] = lastMessage.message_id;
                        ctx.session.delmessid[member] = lastMessage.message_id;

                        if (MEMBERS[member].turi === "ega") {
                            await ctx.api.sendMessage(member, `A'zolarga habar yuborildi! Yuboruvchi: ${MEMBERS[member].name} , id: ${member}`);
                        }
                    } catch {
                        failCount++;
                    }
                }

                YUBORILGAN.id += 1;
                const msg = await ctx.reply(
                    `Xabar yuborildi ✅.\n${failCount} ta foydalanuvchiga yuborilmadi.\nHabar o'chirilsinmi? Habar idisi: ----- ${lastMessage.message_id} -----`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "Ha,O'chirilsin", callback_data: "delate_this" }],
                                ...backmenu.inline_keyboard
                            ]
                        }
                    }
                );
                delmessages.set(ctx.chat.id, msg);
            } catch {
                const msg = await ctx.reply("Habarda xato bor ❌", { reply_markup: backmenu });
                delmessages.set(ctx.chat.id, msg);
            }
        }
        return next();
    });

    // Photo habarlarni yuborish
    bot.on("message:photo", async (ctx, next) => {
        if (ctx.session?.step !== "messagetm") return next();

        await delmess(ctx);
        const photoArray = ctx.message.photo;
        const photoId = photoArray[photoArray.length - 1].file_id;

        let captionData = {};
        if (ctx.message.caption) {
            let caption = ctx.message.caption;
            let urlbtn = [];
            if (caption.includes("||")) {
                const [mainText, urls] = caption.split("||");
                caption = mainText;
                try {
                    const parsed = JSON.parse(urls.trim());
                    for (const u of parsed) {
                        if (u.length === 2 && u[1].startsWith("https://")) {
                            urlbtn.push([{ text: u[0], url: u[1] }]);
                        }
                    }
                    captionData = { caption, reply_markup: { inline_keyboard: urlbtn } };
                } catch {
                    const msg = await ctx.reply("❌ Yozishda xatolik bor", { reply_markup: backmenu });
                    delmessages.set(ctx.chat.id, msg);
                    return next();
                }
            } else {
                captionData.caption = caption;
            }
        }

        try {
            ctx.session.delmessid = {};
            const messageId = YUBORILGAN.id;
            YUBORILGAN[messageId] = {};
            let failCount = 0;
            let lastMessage;

            for (const member in MEMBERS) {
                try {
                    lastMessage = await ctx.api.sendPhoto(member, photoId, captionData);
                    YUBORILGAN[messageId][member] = lastMessage.message_id;
                    ctx.session.delmessid[member] = lastMessage.message_id;

                    if (MEMBERS[member].turi === "ega") {
                        await ctx.api.sendMessage(member, `A'zolarga habar yuborildi! Yuboruvchi: ${MEMBERS[member].name} , id: ${member}`);
                    }
                } catch {
                    failCount++;
                }
            }

            YUBORILGAN.id += 1;
            const msg = await ctx.reply(
                `Xabar yuborildi ✅.\n${failCount} ta foydalanuvchiga yuborilmadi.\nHabar o'chirilsinmi? Habar idisi: ----- ${lastMessage.message_id} -----`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Ha,O'chirilsin", callback_data: "delate_this" }],
                            ...backmenu.inline_keyboard
                        ]
                    }
                }
            );
            delmessages.set(ctx.chat.id, msg);
        } catch {
            const msg = await ctx.reply("Xabar yuborilmadi ❌", { reply_markup: backmenu });
            delmessages.set(ctx.chat.id, msg);
        }

        return next();
    });
}

export { YUBORILGAN, yukla, qaytaol };
