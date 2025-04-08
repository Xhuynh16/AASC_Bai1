const express = require('express');
const axios = require('axios');
const fs = require('fs');
const router = express.Router();
const { refreshToken } = require('./token');

async function callBitrixApi(action, payload = {}) {
    let tokens = JSON.parse(fs.readFileSync('tokens.json'));
    if (!tokens) {
        throw new Error('không tìm thấy token');
    }

    // check lấy lại token
    if (tokens.expires <= Math.floor(Date.now() / 1000)) {
        tokens = await refreshToken();
    }

    try {
        const response = await axios.get(`https://${tokens.domain}/rest/${action}`, {
            params: { ...payload, auth: tokens.access_token },
            timeout: 30000
        });
        return response.data;
    } catch (error) {
        if (error.response?.data?.error === 'expired_token') {
            tokens = await refreshToken();
            return callBitrixApi(action, payload); 
        }
        throw new Error(`debug API: ${error.response?.data?.error || error.message}`);
    }
}
router.get('/contacts', async (req, res) => {
    try {
        const result = await callBitrixApi('crm.contact.list', {
            select: ['ID', 'NAME', 'EMAIL'],
            filter: { NAME: 'Hùng' }
        });
        res.json(result);
    } catch (error) {
        res.status(error.response?.status || 500).send(error.message);
    }
});

module.exports = router;