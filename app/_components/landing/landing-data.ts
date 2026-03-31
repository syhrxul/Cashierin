import {
  BarChart4,
  Layers,
  ShieldCheck,
  Store,
  Users,
  Zap,
} from 'lucide-react';

export const landingNavItems = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Fitur', href: '#features' },
  { label: 'Harga', href: '#pricing' },
  { label: 'Kontak', href: '#contact' },
];

export const landingFeatures = [
  {
    title: 'Multi-Role Access',
    desc: 'Sistem manajemen akses untuk Owner, Manager, hingga Kasir dalam satu aplikasi.',
    icon: Users,
    iconClassName: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Realtime POS',
    desc: 'Proses transaksi secepat kilat dengan antarmuka Point of Sale yang intuitif dan mudah dipelajari.',
    icon: Zap,
    iconClassName: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Advanced Analytics',
    desc: 'Pantau performa penjualan harian, tren produk, dan laporan keuangan secara komprehensif.',
    icon: BarChart4,
    iconClassName: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Enterprise Security',
    desc: 'Data Anda dilindungi dengan enkripsi tingkat tinggi dan sistem approval yang ketat.',
    icon: ShieldCheck,
    iconClassName: 'bg-rose-50 text-rose-600',
  },
  {
    title: 'Inventory Sync',
    desc: 'Sinkronisasi stok barang secara real-time untuk mencegah kehilangan data atau overload order.',
    icon: Layers,
    iconClassName: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Cloud-Based',
    desc: 'Akses data bisnis Anda dari mana saja dan kapan saja secara aman melalui infrastruktur cloud.',
    icon: Store,
    iconClassName: 'bg-violet-50 text-violet-600',
  },
];

export const landingPlans = [
  {
    name: 'Starter',
    period: '30 Hari',
    price: '20k',
    desc: 'Esensial untuk operasional dasar toko tunggal.',
    features: [
      'Multi-Role Access (Staff/Kasir)',
      'Realtime Cloud-Based POS',
      'Basic Sales Report (Daily)',
      'Manajemen Master Barang',
      '1 Cabang Toko Aktif',
      'Laporan Stok Dasar',
    ],
    popular: false,
  },
  {
    name: 'Standard',
    period: '90 Hari',
    price: '50k',
    desc: 'Opsi terbaik untuk toko yang sedang berkembang.',
    features: [
      'Priority Support Ticketing',
      'Advanced Sales Analytics',
      'Unlimited Product SKUs',
      'Inventory Alert (Low Stock)',
      'Customer Loyalty & Points',
      'Sales Trend Prediction',
      'Opsi Multi-Cabang Aktif',
    ],
    popular: true,
  },
  {
    name: 'Professional',
    period: '1 Tahun',
    price: '100k',
    desc: 'Solusi enterprise untuk kontrol bisnis total.',
    features: [
      'Custom Domain Dashboard',
      'Export Data (PDF/Excel/CSV)',
      'Private Cloud Storage (Audit)',
      'Automated Cloud Backups',
      'Branded Digital Receipts',
      'API Access Integrations',
      'Dedicated Success Manager',
      'Prioritas Update Fitur Baru',
      'White-label Branding Opsi',
    ],
    popular: false,
  },
];

export const landingTrustItems = [
  { label: 'Verified', color: '#10B981' },
  { label: 'Secure', color: '#6366F1' },
  { label: 'Reliable', color: '#F59E0B' },
];

export const landingFooterLinks = ['Privacy', 'Terms', 'Support'];
