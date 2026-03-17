import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Naik bertahap ke 20 user
        { duration: '1m', target: 20 },  // Bertahan di 20 user selama 1 menit
        { duration: '20s', target: 0 },  // Turun pelan-pelan
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% request harus di bawah 2 detik
        http_req_failed: ['rate<0.5'],      // Toleransi error di bawah 50% (karena kita tahu ada rate limiting)
    },
};

const BASE_URL = 'https://cashierin.syhrulimtkhan.my.id/api';

// Data simulasi user (Manager & Kasir dari dummy data sebelumnya)
const USER_CREDENTIALS = [
    { id: 'owner1', pass: 'password123' },
    { id: 'staf1', pass: 'password123' },
    { id: 'staf5', pass: 'password123' },
    { id: 'staf10', pass: 'password123' },
    { id: 'superadmin', pass: 'password123' },
];

export default function () {
    // Pilih user acak untuk simulasi
    const user = USER_CREDENTIALS[Math.floor(Math.random() * USER_CREDENTIALS.length)];

    const params = {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    };

    group('User Journey: Daily Activities', function () {
        // 1. Login
        const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
            login_id: user.id,
            password: user.pass,
        }), params);

        const isLoginOk = check(loginRes, { 'login success': (r) => r.status === 200 });

        if (isLoginOk) {
            const token = loginRes.json().token;
            const authHeader = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            };

            // 2. Cek Stok Produk (Aktivitas paling sering)
            const productsRes = http.get(`${BASE_URL}/products?search=c`, authHeader);
            check(productsRes, { 'browse products ok': (r) => r.status === 200 });

            sleep(Math.random() * 3 + 1); // Jeda simulasi user berpikir/melihat layar

            // 3. Lihat Jadwal Shift
            const shiftRes = http.get(`${BASE_URL}/shift-schedules`, authHeader);
            check(shiftRes, { 'view schedules ok': (r) => r.status === 200 });

            // 4. Simulasi Transaksi (Hanya jika login ok dan bukan superadmin)
            if (user.id !== 'superadmin') {
                // Cek kategori
                http.get(`${BASE_URL}/categories`, authHeader);

                // Ambil detail satu produk acak
                http.get(`${BASE_URL}/products`, authHeader);
            }

        } else if (loginRes.status === 429) {
            // Jika kena tangkis bot protection, lewati iterasi ini
            console.log(`User ${user.id} diblokir sementara (Anti-Spam active)`);
        }

        sleep(2);
    });
}
