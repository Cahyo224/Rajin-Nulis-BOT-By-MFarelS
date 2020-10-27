const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
const axios = require('axios')
const moment = require('moment-timezone')
const get = require('got')
const color = require('./lib/color')
const { spawn, exec } = require('child_process')
const { help, donate, info, tnc, author, credit } = require('./lib/help')
const { stdout } = require('process')

moment.tz.setDefault('Asia/Jakarta').locale('id')

module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName } = sender
        pushname = pushname || verifiedName
        const commands = caption || body || ''
        const command = commands.toLowerCase().split(' ')[0] || ''
        const args =  commands.split(' ')

        const msgs = (message) => {
            if (command.startsWith('!')) {
                if (message.length >= 10){
                    return `${message.substr(0, 15)}`
                }else{
                    return `${message}`
                }
            }
        }

        const mess = {
            wait: 'Harap Tunggu, Bot Sedang Menulis Buku!~'
            }

        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const botNumber = await client.getHostNumber()
        const blockNumber = await client.getBlockedIds()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const ownerNumber = '628xxxxxxxxx@c.us'
        const isOwner = sender.id === ownerNumber
        const isBlocked = blockNumber.includes(sender.id)
        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        if (!isGroupMsg && command.startsWith('!')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname))
        if (isGroupMsg && command.startsWith('!')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname), 'in', color(formattedTitle))
        if (!isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname))
        if (isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname), 'in', color(formattedTitle))
        if (isBlocked) return
        //if (!isOwner) return
        switch(command) {
        case '/donasi':
        case '/donate':
            client.sendLinkWithAutoPreview(from, 'https://saweria.co/donate/mfarels', donate)
            break
        case '/magernulis1':
            if (args.length === 1) return client.reply(from, 'Ketik /magernulis1 [teks]', id)
            const text = body.slice(12) 
            client.reply(from, mess.wait, id)
            const splitText = text.replace(/(\S+\s*){1,10}/g, '$&\n')
            const fixHeight = splitText.split('\n').slice(0, 25).join('\n')
            spawn('convert', [
                './mager/magernulis1blom.jpg',
                '-font',
                'Indie-Flower',
                '-size',
                '700x960',
                '-pointsize',
                '25',
                '-interline-spacing',
                '1',
                '-annotate',
                '+170+222',
                fixHeight,
                './mager/magernulis1udah.jpg'
            ])
            .on('error', () => client.reply(from, 'Error gan', id))
            .on('exit', () => {
                client.sendImage(from, './mager/magernulis1udah.jpg', 'magernulis1.jpg', 'Neh Mhank\n\nKetik /donasi.', id)
            })
            break
        case '/bc':
            if (!isOwner) return client.reply(from, 'Perintah ini hanya untuk Owner bot!', id)
            let msg = body.slice(4)
            const chatz = await client.getAllChatIds()
            for (let ids of chatz) {
                var cvk = await client.getChatById(ids)
                if (!cvk.isReadOnly) await client.sendText(ids, `[ INFO BOT NULIS ]\n\n${msg}`)
            }
            client.reply(from, 'Broadcast Success!', id)
            break
        case '/clearall':
            if (!isOwner) return client.reply(from, 'Perintah ini hanya untuk Owner bot', id)
            const allChatz = await client.getAllChats()
            for (let dchat of allChatz) {
                await client.deleteChat(dchat.id)
            }
            client.reply(from, 'Succes clear all chat!', id)
            break
        case '/leave':
            if (!isGroupMsg) return client.reply(from, 'Perintah ini hanya bisa di gunakan dalam group', id)
            if (!isGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan oleh admin group', id)
            await client.sendText(from,'bye...').then(() => client.leaveGroup(groupId))
            break
        case '/join':
            if (args.length === 1) return client.reply(from, 'Kirim perintah /join linkgroup\n\nEx:\n/join https://chat.whatsapp.com/blablablablablabla', id)
            const link = body.slice(6)
            const tGr = await client.getAllGroups()
            const minMem = 1
            const isLink = link.match(/(https:\/\/chat.whatsapp.com)/gi)
            const check = await client.inviteInfo(link)
            if (!isLink) return client.reply(from, 'Ini link? 👊🤬', id)
            if (tGr.length > 209) return client.reply(from, 'Maaf jumlah group sudah maksimal!', id)
            if (check.size < minMem) return client.reply(from, 'Member group tidak melebihi 1, bot tidak bisa masuk', id)
            if (check.status === 200) {
                await client.joinGroupViaLink(link).then(() => client.reply(from, 'Bot akan segera masuk!'))
            } else {
                client.reply(from, 'Link group tidak valid!', id)
            }
            break
        case '/listblock':
            let hih = `This is list of blocked number\nTotal : ${blockNumber.length}\n`
            for (let i of blockNumber) {
                hih += `☞ @${i.replace(/@c.us/g,'')}\n`
            }
            client.sendTextWithMentions(from, hih, id)
            break
        case '/menu':
        case '/help':
            client.sendFileFromUrl(from, 'https://i.ibb.co/p2DnHv7/menu.jpg', 'bot.jpg', help)
            break
        case '/info':
            client.sendLinkWithAutoPreview(from, 'https://m.youtube.com/channel/UCYfBSMa1JJbKwD8bNm-etiA', info)
            break
        case '/tnc':
            client.reply(from, tnc, id)
            break
        case '/author':
            client.reply(from, author, id) 
            break
        case '/credit':
            client.reply(from, credit, id) 
            break
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
        //client.kill().then(a => console.log(a))
    }
}
