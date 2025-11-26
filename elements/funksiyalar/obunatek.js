import { chanelsaqla, CHANNELS } from "../jsonreaders/chanel.js";
import { delmessages, delmess } from "./delmess.js";
import { bot, backmenu, userId } from "../../bot.js";
import { memberQoshish, MEMBERS } from "../jsonreaders/member.js";
import fs from "fs";
import { qaytaol, yukla } from "../admin/messagetomembers.js";

async function obunami(ctx) {
    if (!ctx.session) ctx.session = {};
    let unsubscribed = [];

    for (let ch of CHANNELS) {
        if (ch.username === "telegram") {
            try {
                const member = await ctx.api.getChatMember(ch.id, ctx.from.id);
                if (!['member', 'administrator', 'creator'].includes(member.status)) {
                    unsubscribed.push(ch);
                }
            } catch {
                unsubscribed.push(ch);
            }
        }
    }

    if (unsubscribed.length !== 0 && MEMBERS[ctx.from.id].turi === "member") {
        ctx.session.obunami = false;
        await obunatek(ctx);
        ctx.session.step = undefined;
        ctx.session.nomi = undefined;
    } else {
        ctx.session.obunami = true;
    }
}

async function obunatek(ctx) {
    if (!ctx.session) ctx.session = {};
    yukla();
    await delmess(ctx);

    let unsubscribed = [];
    ctx.session.step = undefined;
    ctx.session.nomi = undefined;
    ctx.session.turi = undefined;

    let ObunaSet;
    if (MEMBERS[ctx.from.id]) {
        ObunaSet = new Set(MEMBERS[ctx.from.id].obunalar);
    }

    for (let ch of CHANNELS) {
        if (ch.username === "telegram") {
            try {
                const member = await ctx.api.getChatMember(ch.id, ctx.from.id);
                if (!['member', 'administrator', 'creator'].includes(member.status) && ch.soni !== 0) {
                    unsubscribed.push(ch);
                    if (ObunaSet?.has(ch.link) && ch.soni > 0) {
                        ch.soni += 1;
                        ObunaSet.delete(ch.link);
                        MEMBERS[ctx.from.id].obunalar = [...ObunaSet];
                    }
                } else {
                    if (ObunaSet && !ObunaSet.has(ch.link) && ch.soni > 0) {
                        ch.soni -= 1;
                        ObunaSet.add(ch.link);
                        MEMBERS[ctx.from.id].obunalar = [...ObunaSet];
                    }
                }
            } catch {
                unsubscribed.push(ch);
            }
        }
    }

    if (unsubscribed.length === 0) {
        ctx.session.obunami = true;
        chanelsaqla();

        const objega = [
            { setting_sub: "📢Majburiy kanal sozlamalari", member_change: "A'zolar Statusini o'zgartirish" },
            { send_messagetm: "💬Barcha bot a'zolariga habar yuborish", foydalanuvchi_soni: "👥Bot foydalanuvchilari soni" },
            { xabarochir: "A'zolarga yuborilgan habarlarni o'chirish" }
        ];
        const objadmin = [
            { send_messagetm: "💬Barcha bot a'zolariga habar yuborish", foydalanuvchi_soni: "👥Bot foydalanuvchilari soni" },
            { xabarochir: "A'zolarga yuborilgan habarlarni o'chirish" }
        ];

        const menu = [];
        if (MEMBERS[ctx.chat.id].turi === "ega") {
            objega.forEach((row) => {
                menu.push(Object.keys(row).map((k) => ({ text: row[k], callback_data: k })));
            });
        } else if (MEMBERS[ctx.chat.id].turi === "admin") {
            objadmin.forEach((row) => {
                menu.push(Object.keys(row).map((k) => ({ text: row[k], callback_data: k })));
            });
        }

        const msg = await ctx.reply(
            "Botga xush kelibsiz.\nBotdan foydalanish uchun quyidagi tugmalarni tanlang",
            { reply_markup: { inline_keyboard: menu } }
        );
        delmessages.set(ctx.chat.id, msg);
    } else {
        const buttons = unsubscribed.map((ch) => [{ text: ch.name, url: ch.link }]);
        buttons.push([{ text: '✅ Yana tekshirish', callback_data: 'check_sub' }]);

        const msg = await ctx.reply(
            '⚠️ Hali ham quyidagi kanallarga obuna bo‘lishingiz kerak:',
            { reply_markup: { inline_keyboard: buttons } }
        );
        delmessages.set(ctx.chat.id, msg);
    }
}

export default obunatek;
export { obunami };
