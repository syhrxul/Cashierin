import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10, // Virtual Users
    duration: '10s', // Durasi tes
};

const BASE_URL = 'https://cashierin.syhrulimtkhan.my.id/api';

export default function () {
    // 1. Tes Login
    const loginPayload = JSON.stringify({
        login_id: 'superadmin',
        password: 'password123',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const loginRes = http.post(`${BASE_URL}/login`, loginPayload, params);

    check(loginRes, {
        'login status is 200': (r) => r.status === 200,
        'has token': (r) => r.json().token !== undefined,
    });

    if (loginRes.status === 200) {
        const token = loginRes.json().token;
        const authParams = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };

        // 2. Tes Get Users (Superadmin access)
        const usersRes = http.get(`${BASE_URL}/superadmin/users`, authParams);
        check(usersRes, {
            'get users status is 200': (r) => r.status === 200,
        });

        // 3. Tes Get Stores
        const storesRes = http.get(`${BASE_URL}/superadmin/stores`, authParams);
        check(storesRes, {
            'get stores status is 200': (r) => r.status === 200,
        });
    }

    sleep(1);
}
