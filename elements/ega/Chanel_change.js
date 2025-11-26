import { bot, backmenu } from "../../bot.js";
import { chanelochirish, chanelqoshish, chanelsonichange, CHANNELS, natija } from "../jsonreaders/chanel.js";
import { delmess, delmessages } from "../funksiyalar/delmess.js";
import { obunami } from "../funksiyalar/obunatek.js";
import { InlineKeyboard } from "grammy";

export default function () {
    // Kanal sozlamalari
    bot.callbackQuery("setting_sub", async (ctx) => {
        if (!ctx.session) ctx.session = {};

        let kanal = "";
        for (let ch of CHANNELS) {
            kanal += ch.username === "boshqa"
                ? `\n ${ch.name}: ${ch.link}, kerak: ${ch.soni} obunachi || Boshqa tarmoq`
                : ` ${ch.name}: ${ch.link}, kerak: ${ch.soni} obunachi || Telegram \n`;
        }

        const obj = {
            chanel_plus: "➕ Kanal qo'shish",
            chanel_minus: "➖ Kanal olib tashlash",
            chanel_soni: "🔢 Kanal obuna sonini o'zgartirish",
            check_sub: "🔙 Bosh menuga qaytish"
        };

        const button = Object.entries(obj).map(([key, value]) => [{ text: value, callback_data: key }]);
        const msg = await ctx.reply(`Kanallar:\n\n${kanal}\nMajburiy kanal sozlamalari:`, {
            reply_markup: { inline_keyboard: button }
        });
        await delmess(ctx);
        delmessages.set(ctx.chat.id, msg);
        await ctx.answerCallbackQuery();
    });

    // Kanal qo'shish
    bot.callbackQuery("chanel_plus", async (ctx) => {
        const keyboard = new InlineKeyboard()
            .text("Telegram kanal yoki guruh", "chanel_type_telegram")
            .text("Boshqa turdagi tarmoq", "chanel_type_boshqa")
            .row(...backmenu.inline_keyboard);
        const msg = await ctx.reply("Kanal turini tanlang:", { reply_markup: keyboard });
        await delmess(ctx);
        delmessages.set(ctx.chat.id, msg);
        await ctx.answerCallbackQuery();
    });

    // Kanal o'chirish
    bot.callbackQuery("chanel_minus", async (ctx) => {
        let kanalText = "";
        const keyboard = [];
        for (let i = 0; i < CHANNELS.length; i++) {
            const ch = CHANNELS[i];
            kanalText += ch.username === "boshqa"
                ? `\n ${ch.name}: ${ch.link}, soni: ${ch.soni} || Boshqa tarmoq`
                : ` ${ch.name}: ${ch.link}, soni: ${ch.soni} || Telegram \n`;
            keyboard.push([{ text: ch.link, callback_data: `chanel_change_${i}` }]);
        }
        keyboard.push(...backmenu.inline_keyboard);

        const msg = await ctx.reply(`Kanallar:\n\n${kanalText}\nO'chirilishi kerak bo'lgan kanalni tanlang:`, {
            reply_markup: { inline_keyboard: keyboard }
        });
        await delmess(ctx);
        delmessages.set(ctx.chat.id, msg);
        await ctx.answerCallbackQuery();
    });

    // Kanal obuna sonini o'zgartirish
    bot.callbackQuery("chanel_soni", async (ctx) => {
        let kanalText = "";
        const keyboard = [];
        for (let i = 0; i < CHANNELS.length; i++) {
            const ch = CHANNELS[i];
            kanalText += ch.username === "boshqa"
                ? `\n ${ch.link}: ${ch.soni} || Boshqa tarmoq`
                : ` ${ch.link}: ${ch.soni} || Telegram \n`;
            keyboard.push([{ text: ch.link, callback_data: `chanel_chsoni_${i}` }]);
        }
        keyboard.push(...backmenu.inline_keyboard);

        const msg = await ctx.reply(`Kanallar:\n\n${kanalText}\nSonini o'zgartirish kerak bo'lgan kanalni tanlang:`, {
            reply_markup: { inline_keyboard: keyboard }
        });
        await delmess(ctx);
        delmessages.set(ctx.chat.id, msg);
        await ctx.answerCallbackQuery();
    });

    // Text input orqali kanal qo'shish va sonini o'zgartirish
    bot.on("message:text", async (ctx, next) => {
        if (!ctx.session) ctx.session = {};
        let msg;
        const step = ctx.session.step;

        if (step === "kanalid") {
            const son = parseInt(ctx.message.text);
            if (!isNaN(son)) {
                chanelqoshish(ctx.session.nomi, ctx.session.kanallinki, ctx.session.turi, 2000, son);
                msg = natija === 1
                    ? await ctx.reply("Kanal default(2000) son bilan qo'shildi. O'zgartirish uchun kanal sonini kiriting,yoki Bosh menuga qayting", { reply_markup: backmenu })
                    : await ctx.reply("❌ Kanal linkida muammo bor!!!", { reply_markup: backmenu });
                ctx.session.step = "chanelsoni";
            } else {
                msg = await ctx.reply("Id son bo'lishi kerak!!!", { reply_markup: backmenu });
            }
            await delmess(ctx);
            delmessages.set(ctx.chat.id, msg);

        } else if (step === "kanallinki") {
            if (ctx.session.turi === "boshqa") {
                chanelqoshish(ctx.session.nomi, ctx.message.text, ctx.session.turi, 2000);
                msg = natija === 1
                    ? await ctx.reply("Kanal default(2000) son bilan qo'shildi. O'zgartirish uchun Son o'zgartirish tugmasidan foydalaning", { reply_markup: backmenu })
                    : await ctx.reply("❌ Kanal linkida muammo bor!!!", { reply_markup: backmenu });
                await delmess(ctx);
                delmessages.set(ctx.chat.id, msg);
            } else if (ctx.session.turi === "telegram") {
                ctx.session.kanallinki = ctx.message.text;
                msg = await ctx.reply("Telegram Kanal/Guruh idsini kiriting:", { reply_markup: backmenu });
                ctx.session.step = "kanalid";
                await delmess(ctx);
                delmessages.set(ctx.chat.id, msg);
            }

        } else if (step === "kanalnomi") {
            ctx.session.nomi = ctx.message.text;
            msg = await ctx.reply("Kanal linkini kiriting:", { reply_markup: backmenu });
            ctx.session.step = "kanallinki";
            await delmess(ctx);
            delmessages.set(ctx.chat.id, msg);

        } else if (step === "chanelsoni") {
            const son = parseInt(ctx.message.text);
            const indexlink = parseInt(ctx.session.soni);
            chanelsonichange(ctx, CHANNELS[indexlink].link, son);
            msg = ctx.session.natija === "fail"
                ? await ctx.reply("❌ Sonda muammo bor", { reply_markup: backmenu })
                : await ctx.reply("✅ Soni o'zgartirildi", { reply_markup: backmenu });
            await delmessages.set(ctx.chat.id, msg);
            await delmess(ctx);
        }

        return next();
    });

    // Callback query orqali turli kanal amallari
    bot.on("callback_query", async (ctx, next) => {
        const data = ctx.callbackQuery.data;
        if (data.startsWith("chanel_type_")) {
            await delmess(ctx);
            ctx.session.turi = data.split("chanel_type_")[1];
            const msg = await ctx.reply("Kanal nomini kiriting:", { reply_markup: backmenu });
            ctx.session.step = "kanalnomi";
            delmessages.set(ctx.chat.id, msg);
        }

        if (data.startsWith("chanel_change_")) {
            await delmess(ctx);
            const indexlink = parseInt(data.split("chanel_change_")[1]);
            chanelochirish(CHANNELS[indexlink].link);
            const msg = await ctx.reply("✅ Bot o'chirildi", { reply_markup: backmenu });
            delmessages.set(ctx.chat.id, msg);
        }

        if (data.startsWith("chanel_chsoni_")) {
            await delmess(ctx);
            ctx.session.soni = parseInt(data.split("chanel_chsoni_")[1]);
            ctx.session.step = "chanelsoni";
            const msg = await ctx.reply("Yangi sonni kiriting (cheksiz uchun manfiy son):", { reply_markup: backmenu });
            delmessages.set(ctx.chat.id, msg);
        }

        await ctx.answerCallbackQuery();
        return next();
    });
}
