const { create, Client } = require('@open-wa/wa-automate')
const msgHandler = require('./msgHndlr')
const options = require('./options')

const start = async (client = new Client()) => {
        console.log('[ MFarelS ] BOT NULIS TELAH AKTIF')
        // Force it to keep the current session
        client.onStateChanged((state) => {
            console.log('[ Bermasalah ]', state)
            if (state === 'Masalah' || state === 'UNLAUNCHED') client.forceRefocus()
        })
        // listening on message
        client.onMessage((async (message) => {
            client.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 3000) {
                    client.cutMsgCache()
                }
            })
            msgHandler(client, message)
        }))

        client.onGlobalParicipantsChanged((async (heuh) => {
            await welcome(client, heuh)
            //left(client, heuh)
            }))
        
        client.onAddedToGroup(((chat) => {
            let totalMem = chat.groupMetadata.participants.length
            if (totalMem < 1) { 
            	client.sendText(chat.id, `Member nya cuma ${totalMem}, Kalo mau invite bot, minimal jumlah mem ada 1`).then(() => client.leaveGroup(chat.id)).then(() => client.deleteChat(chat.id))
            } else {
                client.sendText(chat.groupMetadata.id, `Halo warga grup *${chat.contact.name}* terimakasih sudah menginvite bot ini, untuk melihat menu silahkan kirim /help atau /menu\nNote : Aga Pending`)
            }
        }))

        /*client.onAck((x => {
            const { from, to, ack } = x
            if (x !== 3) client.sendSeen(to)
        }))*/

        // listening on Incoming Call
        client.onIncomingCall(( async (call) => {
            await client.sendText(call.peerJid, 'Maaf, saya tidak bisa menerima panggilan. nelfon = block & blacklist!')
            .then(() => client.contactBlock(call.peerJid))
        }))
    }

create('MFarelS', options(true, start))
    .then(client => start(client))
    .catch((error) => console.log(error))
