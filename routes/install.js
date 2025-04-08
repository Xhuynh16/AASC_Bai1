const express = require('express');
const router = express.Router();
const fs = require('fs');

router.post('/', (req, res) => {
    const { AUTH_ID, AUTH_EXPIRES, REFRESH_ID, DOMAIN, MEMBER_ID } = req.body;
    if (!AUTH_ID || !REFRESH_ID) {
        return res.status(400).send('Cấu trúc dữ liệu không hợp lệ');
    }

    const tokens = {
        access_token: AUTH_ID,
        expires: Math.floor(Date.now() / 1000) + parseInt(AUTH_EXPIRES),
        refresh_token: REFRESH_ID,
        domain: DOMAIN,
        member_id: MEMBER_ID
    };

    fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
    res.send('Cài đặt ứng dụng thành công!');
});

module.exports = router;