import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 60 }, // Ramping up to 60 users
        { duration: '3m', target: 60 }, // Stay at 60 users for 3 minutes
        { duration: '1m', target: 0 },  // Ramping down
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'], // 95% of requests must be under 3s
        http_req_failed: ['rate<0.1'],     // Fail if more than 10% of requests fail
    },
};

const BASE_URL = 'https://cashierin.syhrulimtkhan.my.id/api';

// Realistic User Pool (Matching Dummy Data)
const USERS = [
    { login: 'owner1', pass: 'password123', store_id: 11 },
    { login: 'owner2', pass: 'password123', store_id: 12 },
    { login: 'staf1', pass: 'password123', store_id: 11 },
    { login: 'staf2', pass: 'password123', store_id: 12 },
    { login: 'staf5', pass: 'password123', store_id: 13 },
    { login: 'superadmin', pass: 'password123', store_id: null },
];

export default function () {
    const user = USERS[Math.floor(Math.random() * USERS.length)];
    const params = {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    };

    group('Complex Workflow: Realistic Operations', function () {
        // 1. LOGIN (Read/Write to tokens table)
        const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
            login_id: user.login,
            password: user.pass,
        }), params);

        const isLoginOk = check(loginRes, { 'login success': (r) => r.status === 200 });

        if (isLoginOk) {
            const token = loginRes.json().token;
            const authHeader = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            };

            // 2. READ: Get Products & Categories (Frequent Activity)
            const prodRes = http.get(`${BASE_URL}/products`, authHeader);
            check(prodRes, { 'read products': (r) => r.status === 200 });

            http.get(`${BASE_URL}/categories`, authHeader);

            sleep(Math.random() * 2 + 1);

            // 3. WRITE: Create a new Category (Database Write)
            if (user.login.startsWith('staf') || user.login.startsWith('owner')) {
                const catRes = http.post(`${BASE_URL}/categories`, JSON.stringify({
                    name: `Test Cat ${Math.floor(Math.random() * 1000)}`,
                    store_id: user.store_id
                }), authHeader);
                check(catRes, { 'write category': (r) => r.status === 201 });
            }

            sleep(1);

            // 4. READ: View Shift Schedules
            const shiftRes = http.get(`${BASE_URL}/shift-schedules`, authHeader);
            check(shiftRes, { 'read shift schedules': (r) => r.status === 200 });

            // 5. WRITE: Create a new Transaction (Heavy Write/Transaction)
            // Only for non-superadmin users
            if (user.store_id) {
                const transPayload = JSON.stringify({
                    store_id: user.store_id,
                    payment_method: 'cash',
                    items: [
                        { product_id: 1, quantity: 1 } // Note: Assuming product ID 1 exists based on dummy data
                    ]
                });
                const transRes = http.post(`${BASE_URL}/transactions`, transPayload, authHeader);
                // Note: This might fail if shift is not open, but it simulates the attempt and DB load
                check(transRes, { 'transaction attempt': (r) => [201, 403, 422].includes(r.status) });
            }
        }

        sleep(Math.random() * 3 + 2); // Realistic delay between user activities
    });
}
