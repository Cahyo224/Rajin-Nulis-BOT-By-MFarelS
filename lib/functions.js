const { default: got } = require('got/dist/source');
const fetch = require('node-fetch')
const { getBase64 } = require("./fetcher")
const request = require('request')
const emoji = require('emoji-regex')
const fs = require('fs-extra')


const emojiStrip = (string) => {
    return string.replace(emoji, '')
}

exports.emojiStrip = emojiStrip