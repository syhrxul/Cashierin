import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 2, // Virtual Users kecil untuk debugging
    duration: '5s',
};

const BASE_URL = 'https://cashierin.syhrulimtkhan.my.id/api';

export default function () {
    const loginPayload = JSON.stringify({
        login_id: 'superadmin',
        password: 'password123',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    const loginRes = http.post(`${BASE_URL}/login`, loginPayload, params);

    console.log(`Status: ${loginRes.status}`);
    if (loginRes.status !== 200) {
        console.log(`Response Body: ${loginRes.body.substring(0, 200)}`);
    }

    check(loginRes, {
        'login status is 200': (r) => r.status === 200,
    });

    sleep(2);
}
