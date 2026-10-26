const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

// Tạo web server tối giản để giữ Render luôn thức (chống sleep)
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Voice Bot đang hoạt động 24/7!'));
app.listen(PORT, () => console.log(`Web server đang chạy ở cổng ${PORT}`));

// Đọc toàn bộ chuỗi token từ biến môi trường DISCORD_TOKENS trên Render
const rawTokens = process.env.DISCORD_TOKENS || "";
const tokens = rawTokens.split(/[\n,]+/).map(t => t.trim()).filter(Boolean);

// ID kênh voice cố định
const CHANNEL_ID = "1542073179722227742";

if (tokens.length === 0) {
    console.log("[CẢNH BÁO] Chưa tìm thấy token nào trong DISCORD_TOKENS trên Render!");
} else {
    console.log(`[+] Đã tải thành công ${tokens.length} token. Đang tiến hành kết nối...`);
}

tokens.forEach((token, index) => {
    const client = new Client({ checkUpdate: false });

    async function connectVoice() {
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (channel && channel.isVoice()) {
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                    selfMute: true,
                    selfDeaf: true,
                });
                console.log(`[JOIN] Bot ${index + 1} (${client.user.tag}) đã vào phòng voice thành công!`);
            } else {
                console.log(`[LỖI] Không tìm thấy kênh voice hợp lệ cho bot ${index + 1}`);
            }
        } catch (err) {
            console.log(`[LỖI] Bot ${index + 1} chưa vào được phòng, sẽ thử lại sau 10 giây...`, err.message);
            setTimeout(connectVoice, 10000);
        }
    }

    client.on('ready', async () => {
        console.log(`[OK] Bot ${index + 1} (${client.user.tag}) đã đăng nhập thành công!`);
        connectVoice();
    });

    client.login(token).catch(err => {
        console.log(`[LỖI] Token thứ ${index + 1} không hợp lệ hoặc đã chết:`, err.message);
    });
});
