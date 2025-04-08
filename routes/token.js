const express = require('express');
const axios = require('axios');
const fs = require('fs');
const router = express.Router();
const config = require('../config');

async function refreshToken() {
    const tokens = JSON.parse(fs.readFileSync('tokens.json'));
    try {
        const response = await axios.get(`https://${tokens.domain}/oauth/token/`, {
            params: {
                client_id: config.clientId,
                client_secret: config.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: tokens.refresh_token
            }
        });

        const newTokens = {
            access_token: response.data.access_token,
            expires: Math.floor(Date.now() / 1000) + response.data.expires_in,
            refresh_token: response.data.refresh_token,
            domain: response.data.domain,
            member_id: response.data.member_id
        };

        fs.writeFileSync('tokens.json', JSON.stringify(newTokens, null, 2));
        return newTokens;
    } catch (error) {
        throw new Error(`Lỗi lấy lại token: ${error.response?.data?.error || error.message}`);
    }
}

router.get('/refresh', async (req, res) => {
    try {
        const newTokens = await refreshToken();
        res.json({ message: 'debug token mới', tokens: newTokens });
    } catch (error) {
        res.status(error.response?.status || 500).send(error.message);
    }
});

module.exports = { router, refreshToken };