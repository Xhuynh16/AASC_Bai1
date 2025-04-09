const express = require('express');
const router = express.Router();
const fs = require('fs');


router.post('/', (req, res) => {
    console.log('POST /install called with body:', req.body);
    console.log('POST /install called with query:', req.query);

    // Lấy dữ liệu từ req.body.auth
    const authData = req.body.auth || {};
    const { access_token, expires, refresh_token, domain, member_id } = authData;

    if (!access_token || !refresh_token) {
        console.log('Missing access_token or refresh_token:', { access_token, refresh_token });
        return res.status(400).send('Cấu trúc dữ liệu không hợp lệ');
    }

    const tokens = {
        access_token: access_token,
        expires: parseInt(expires),
        refresh_token: refresh_token,
        domain: domain,
        member_id: member_id
    };

    fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
    console.log('Tokens saved:', tokens);
    res.send('Cài đặt ứng dụng thành công!');
});


module.exports = router;