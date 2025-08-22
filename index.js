const crypto = require('crypto');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
}));

app.use(express.json());

const SECRET_KEY = "mN4!pQs6JrYwV9";
const LOGIN_URL = "https://kingshot-giftcode.centurygame.com/api/player";

function generateSign(data) {
    const sortedKeys = Object.keys(data).sort();
    const joined = sortedKeys.map(key => `${key}=${data[key]}`).join("&");
    return crypto.createHash("md5").update(joined + SECRET_KEY).digest("hex");
}

async function sendRequest(url, payload) {
    const signedPayload = { ...payload, sign: generateSign(payload) };
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signedPayload)
    });
    return response.json();
}

async function verificarJogador(fid) {
    const payload = { fid: fid.toString(), time: Date.now() };
    const resposta = await sendRequest(LOGIN_URL, payload);
    if (resposta.code !== 0) return null;
    return resposta.data;
}

app.post('/user', async (req, res) => {

    try {

        const { id } = req.body;

        if (!id || id === '') {
            return res.json({ data: 'Verifique se o campo de id está preenchido corretamente!' }).status(400);
        };

        const data = await verificarJogador(id);

        return res.json(data).status(200);
    } catch (err) {
        return res.json({ data: 'catch' }).status(500);
    }
});