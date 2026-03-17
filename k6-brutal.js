import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 100 }, // Langsung gas ke 100 user dalam 30 detik
        { duration: '2m', target: 100 },  // Bertahan di 100 user (Sangat Brutal)
        { duration: '30s', target: 0 },   // Selesai
    ],
    thresholds: {
        http_req_duration: ['p(95)<5000'], // Toleransi 5 detik karena brutal
        http_req_failed: ['rate<0.9'],     // Kita maklumi kalau banyak yang gagal karena Rate Limit (429)
    },
};

const BASE_URL = 'https://cashierin.syhrulimtkhan.my.id/api';

const USERS = [
    { login: 'superadmin', pass: 'password123' },
    { login: 'owner1', pass: 'password123' },
    { login: 'staf1', pass: 'password123' },
    { login: 'staf5', pass: 'password123' },
    { login: 'staf10', pass: 'password123' },
    { login: 'staf20', pass: 'password123' },
];

export default function () {
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    const params = {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    };

    group('BRUTAL ATTACK', function () {
        // 1. LOGIN (Hit database tokens table)
        const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
            login_id: user.login,
            password: user.pass,
        }), params);

        if (loginRes.status === 200) {
            const token = loginRes.json().token;
            const authHeader = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            };

            // 2. READ: Browse Products (Cache stress test with random searches)
            const randomKeywords = ['a', 'b', 'c', 'd', 'mie', 'kopi', 'botol'];
            const search = randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
            http.get(`${BASE_URL}/products?search=${search}`, authHeader);

            // 3. WRITE: Spam Categories (Hit DB Write)
            if (user.login !== 'superadmin') {
                http.post(`${BASE_URL}/categories`, JSON.stringify({
                    name: `Brutal ${Math.floor(Math.random() * 10000)}`,
                    store_id: 11
                }), authHeader);
            }

            // 4. READ: All users (Heavy query for database)
            if (user.login === 'superadmin') {
                http.get(`${BASE_URL}/superadmin/users`, authHeader);
                http.get(`${BASE_URL}/superadmin/pulse-stats`, authHeader);
            }

            // 5. WRITE: Transaction attempt
            if (user.login !== 'superadmin') {
                http.post(`${BASE_URL}/transactions`, JSON.stringify({
                    store_id: 11,
                    payment_method: 'cash',
                    items: [{ product_id: 1, quantity: 1 }]
                }), authHeader);
            }
        }

        // TANPA SLEEP atau sleep sangat kecil (< 0.5s) untuk simulasi serbuan brutal
        sleep(0.2);
    });
}
