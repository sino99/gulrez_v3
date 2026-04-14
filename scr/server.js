const express  = require('express');
const session  = require('express-session');
const bcrypt   = require('bcryptjs');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const db       = require('../database/db');

const app  = express();
const PORT = 3001;

// ─── PATHS ───
const ROOT       = path.join(__dirname, '..');           // project root
const PUBLIC     = path.join(ROOT, 'public');            // /public
const imagesDir       = path.join(ROOT, 'images');         // /images
const avatarsDir      = path.join(ROOT, 'avatars');        // /avatars
const reviewPhotosDir = path.join(ROOT, 'review-photos');  // /review-photos

if (!fs.existsSync(imagesDir))       fs.mkdirSync(imagesDir);
if (!fs.existsSync(avatarsDir))      fs.mkdirSync(avatarsDir);
if (!fs.existsSync(reviewPhotosDir)) fs.mkdirSync(reviewPhotosDir);

// ─── MIDDLEWARE ───
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Cookie parser (inline, no extra package needed)
app.use((req, _res, next) => {
  req.cookies = {};
  const raw = req.headers.cookie || '';
  raw.split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    if (k && k.trim()) req.cookies[k.trim()] = decodeURIComponent(v.join('='));
  });
  next();
});
app.use(session({
  secret: 'gulrez-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

// Static files
app.use(express.static(PUBLIC));                                     // HTML, CSS, JS
app.use('/images',        express.static(imagesDir));                // /images/...
app.use('/avatars',       express.static(avatarsDir));               // /avatars/...
app.use('/review-photos', express.static(reviewPhotosDir));          // /review-photos/...

// ─── MULTER (image upload → /images/) ───
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imagesDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Только изображения'));
  }
});

// ─── MULTER (avatar upload → /avatars/) ───
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, avatarsDir),
    filename:    (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `av_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`);
    }
  }),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Только изображения'));
  }
});

// ─── MULTER (review photos → /review-photos/) ───
const reviewPhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, reviewPhotosDir),
    filename:    (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `rv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Только изображения'));
  }
});

// ─── AUTH GUARD ───
function requireAdmin(req, res, next) {
  if (req.session && req.session.userId) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ══════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════

// POST /register
app.post('/register', (req, res) => {
  const { login, phone, password } = req.body;
  if (!login || !phone || !password)
    return res.status(400).json({ error: 'Заполните все поля' });

  const digits = phone.replace(/\D/g, '');
  const fullPhone = digits.startsWith('992') ? '+' + digits : '+992' + digits.slice(-9);
  if (digits.length < 9)
    return res.status(400).json({ error: 'Введите 9 цифр номера телефона' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Пароль — минимум 6 символов' });
  if (db.prepare('SELECT id FROM users WHERE login = ?').get(login))
    return res.status(409).json({ error: 'Этот логин уже занят' });
  if (db.prepare('SELECT id FROM users WHERE phone = ?').get(fullPhone))
    return res.status(409).json({ error: 'Этот номер телефона уже зарегистрирован' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (login, phone, password, role) VALUES (?,?,?,?)').run(login, fullPhone, hash, 'user');

  req.session.userId = result.lastInsertRowid;
  req.session.login  = login;
  req.session.phone  = fullPhone;
  req.session.role   = 'user';
  res.json({ ok: true, login, role: 'user' });
});

// POST /login — by login or phone
app.post('/login', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password)
    return res.status(400).json({ error: 'Введите логин и пароль' });

  // Normalise: if looks like a phone number, format it
  const digits = login.replace(/\D/g, '');
  const asPhone = digits.length >= 9 ? '+992' + digits.slice(-9) : null;

  const user = db.prepare('SELECT * FROM users WHERE login = ? OR (phone IS NOT NULL AND phone = ?)').get(login, asPhone || '');
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Неверный логин или пароль' });

  req.session.userId = user.id;
  req.session.login  = user.login;
  req.session.phone  = user.phone || '';
  req.session.role   = user.role;

  return res.json({ ok: true, login: user.login, role: user.role });
});

// POST /logout
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// GET /api/me
app.get('/api/me', (req, res) => {
  if (req.session && req.session.userId) {
    const user = db.prepare('SELECT avatar FROM users WHERE id = ?').get(req.session.userId);
    return res.json({
      loggedIn: true,
      login:  req.session.login,
      phone:  req.session.phone || '',
      role:   req.session.role,
      avatar: user ? (user.avatar || null) : null
    });
  }
  res.json({ loggedIn: false });
});

// POST /api/user/change-password
app.post('/api/user/change-password', (req, res) => {
  if (!req.session || !req.session.userId) return res.status(401).json({ error: 'Не авторизован' });
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Заполните все поля' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Минимум 6 символов' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (!bcrypt.compareSync(currentPassword, user.password))
    return res.status(401).json({ error: 'Неверный текущий пароль' });
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), req.session.userId);
  res.json({ ok: true });
});

// POST /api/user/avatar — upload avatar (any logged-in user)
app.post('/api/user/avatar', avatarUpload.single('avatar'), (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: 'Не авторизован' });
  if (!req.file) return res.status(400).json({ error: 'Файл не получен' });

  // Delete old avatar file if it was user-uploaded
  const existing = db.prepare('SELECT avatar FROM users WHERE id = ?').get(req.session.userId);
  if (existing && existing.avatar && existing.avatar.startsWith('avatars/av_')) {
    const oldPath = path.join(ROOT, existing.avatar);
    if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch (_) {} }
  }

  const avatarUrl = `avatars/${req.file.filename}`;
  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatarUrl, req.session.userId);
  res.json({ ok: true, avatar: avatarUrl });
});

// DELETE /api/user/avatar — remove avatar
app.delete('/api/user/avatar', (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: 'Не авторизован' });
  const existing = db.prepare('SELECT avatar FROM users WHERE id = ?').get(req.session.userId);
  if (existing && existing.avatar && existing.avatar.startsWith('avatars/av_')) {
    const oldPath = path.join(ROOT, existing.avatar);
    if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch (_) {} }
  }
  db.prepare('UPDATE users SET avatar = NULL WHERE id = ?').run(req.session.userId);
  res.json({ ok: true });
});

// GET /user — user profile page
app.get('/user', (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/login.html');
  res.sendFile(path.join(PUBLIC, 'user.html'));
});

// ══════════════════════════════════════════
//  PUBLIC PRODUCTS API
// ══════════════════════════════════════════

const TRANS_JOIN = `
  LEFT JOIN product_translations t_en ON t_en.product_id = p.id AND t_en.lang = 'EN'
  LEFT JOIN product_translations t_tj ON t_tj.product_id = p.id AND t_tj.lang = 'TJ'
`;
const TRANS_COLS = `,
  t_en.name as en_name, t_en.description as en_desc, t_en.tag as en_tag,
  t_en.color as en_color, t_en.composition as en_composition, t_en.size as en_size,
  t_tj.name as tj_name, t_tj.description as tj_desc, t_tj.tag as tj_tag,
  t_tj.color as tj_color, t_tj.composition as tj_composition, t_tj.size as tj_size
`;

// Public: always only active products
app.get('/api/products', (req, res) => {
  const rows = db.prepare(`SELECT p.*${TRANS_COLS} FROM products p ${TRANS_JOIN} WHERE p.status = 1 ORDER BY p.sort_order ASC, p.id ASC`).all();
  res.json(rows.map(mapProduct));
});

// Admin: all products including inactive
app.get('/api/admin/products', requireAdmin, (req, res) => {
  const rows = db.prepare(`SELECT p.*${TRANS_COLS} FROM products p ${TRANS_JOIN} ORDER BY p.sort_order ASC, p.id ASC`).all();
  res.json(rows.map(mapProduct));
});

// ══════════════════════════════════════════
//  ADMIN PRODUCTS API
// ══════════════════════════════════════════

// Create product
app.post('/api/admin/products', requireAdmin, (req, res) => {
  const f = req.body;
  const result = db.prepare(`
    INSERT INTO products
      (sort_order, name, description, composition, size, color, price, currency, discount, status, tag, tag_bg, image1, image2, image3, likes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    num(f.sort_order, 0), str(f.name), str(f.description),
    str(f.composition), str(f.size), str(f.color),
    flt(f.price, 0), str(f.currency, 'TJS'),
    num(f.discount, 0), num(f.status, 1),
    str(f.tag), str(f.tag_bg, 'var(--rose)'),
    str(f.image1), str(f.image2), str(f.image3),
    num(f.likes, 0)
  );
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.json(mapProduct(product));
});

// Update product
app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const ex = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!ex) return res.status(404).json({ error: 'Товар не найден' });

  const f = req.body;
  db.prepare(`
    UPDATE products SET
      sort_order=?, name=?, description=?, composition=?, size=?, color=?,
      price=?, currency=?, discount=?, status=?, tag=?, tag_bg=?,
      image1=?, image2=?, image3=?, likes=?
    WHERE id=?
  `).run(
    f.sort_order !== undefined ? num(f.sort_order) : ex.sort_order,
    f.name        !== undefined ? str(f.name)        : ex.name,
    f.description !== undefined ? str(f.description) : ex.description,
    f.composition !== undefined ? str(f.composition) : ex.composition,
    f.size        !== undefined ? str(f.size)        : ex.size,
    f.color       !== undefined ? str(f.color)       : ex.color,
    f.price       !== undefined ? flt(f.price)       : ex.price,
    f.currency    !== undefined ? str(f.currency)    : ex.currency,
    f.discount    !== undefined ? num(f.discount)    : ex.discount,
    f.status      !== undefined ? num(f.status)      : ex.status,
    f.tag         !== undefined ? str(f.tag)         : ex.tag,
    f.tag_bg      !== undefined ? str(f.tag_bg)      : ex.tag_bg,
    f.image1      !== undefined ? str(f.image1)      : ex.image1,
    f.image2      !== undefined ? str(f.image2)      : ex.image2,
    f.image3      !== undefined ? str(f.image3)      : ex.image3,
    f.likes       !== undefined ? num(f.likes)       : ex.likes,
    id
  );
  res.json(mapProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id)));
});

// Delete product
app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!db.prepare('SELECT id FROM products WHERE id = ?').get(id))
    return res.status(404).json({ error: 'Товар не найден' });
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ ok: true });
});

// Toggle status (active ↔ inactive)
app.post('/api/admin/products/:id/toggle', requireAdmin, (req, res) => {
  const { id } = req.params;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return res.status(404).json({ error: 'Не найдено' });
  const newStatus = product.status === 1 ? 0 : 1;
  db.prepare('UPDATE products SET status = ? WHERE id = ?').run(newStatus, id);
  res.json({ ok: true, status: newStatus });
});

// GET translations for one product
app.get('/api/admin/products/:id/translations', requireAdmin, (req, res) => {
  const { id } = req.params;
  const rows = db.prepare('SELECT lang, name, description, tag, color, composition, size FROM product_translations WHERE product_id = ?').all(id);
  const result = {};
  rows.forEach(r => {
    result[r.lang] = { title: r.name || '', desc: r.description || '', tag: r.tag || '', color: r.color || '', composition: r.composition || '', size: r.size || '' };
  });
  res.json(result);
});

// PUT translations for one product (upsert EN + TJ)
app.put('/api/admin/products/:id/translations', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!db.prepare('SELECT id FROM products WHERE id = ?').get(id))
    return res.status(404).json({ error: 'Товар не найден' });

  const upsert = db.prepare(`
    INSERT INTO product_translations (product_id, lang, name, description, tag, color, composition, size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(product_id, lang) DO UPDATE SET
      name        = excluded.name,
      description = excluded.description,
      tag         = excluded.tag,
      color       = excluded.color,
      composition = excluded.composition,
      size        = excluded.size
  `);

  const save = db.transaction(() => {
    ['EN', 'TJ'].forEach(lang => {
      const t = req.body[lang];
      if (!t) return;
      upsert.run(id, lang, str(t.title), str(t.desc), str(t.tag), str(t.color), str(t.composition), str(t.size));
    });
  });
  save();
  res.json({ ok: true });
});

// Upload image
app.post('/api/admin/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не получен' });
  res.json({ url: `images/${req.file.filename}` });
});

// ─── MEDIA LIBRARY ───

// Uploaded files have the img_TIMESTAMP_RAND pattern — only those can be deleted
function isUploaded(filename) { return /^img_\d+_[a-z0-9]+\./i.test(filename); }

// GET /api/admin/media — list all images with usage & size info
app.get('/api/admin/media', requireAdmin, (req, res) => {
  const products = db.prepare('SELECT id, name, image1, image2, image3 FROM products').all();

  // Build map: imageUrl → [product names]
  const usedMap = {};
  products.forEach(p => {
    [p.image1, p.image2, p.image3].forEach(url => {
      if (!url) return;
      if (!usedMap[url]) usedMap[url] = [];
      usedMap[url].push(p.name);
    });
  });

  const files = [];
  try {
    fs.readdirSync(imagesDir).forEach(filename => {
      if (!isUploaded(filename)) return; // show only admin-uploaded files
      const filepath = path.join(imagesDir, filename);
      const stat = fs.statSync(filepath);
      if (!stat.isFile()) return;
      const url = `images/${filename}`;
      files.push({
        filename, url,
        size: stat.size,
        date: stat.mtime.toISOString(),
        usedBy: usedMap[url] || [],
        canDelete: true
      });
    });
  } catch (_) {}

  res.json(files);
});

// DELETE /api/admin/media/unused — delete all unused uploaded files (must be before :filename)
app.delete('/api/admin/media/unused', requireAdmin, (req, res) => {
  const products = db.prepare('SELECT image1, image2, image3 FROM products').all();
  const usedUrls = new Set();
  products.forEach(p => {
    [p.image1, p.image2, p.image3].forEach(url => { if (url) usedUrls.add(url); });
  });

  let deleted = 0;
  try {
    fs.readdirSync(imagesDir).forEach(filename => {
      if (!isUploaded(filename)) return; // never delete static files
      const url = `images/${filename}`;
      if (!usedUrls.has(url)) {
        const filepath = path.join(imagesDir, filename);
        if (fs.statSync(filepath).isFile()) { fs.unlinkSync(filepath); deleted++; }
      }
    });
  } catch (_) {}
  res.json({ ok: true, deleted });
});

// DELETE /api/admin/media/:filename — delete a single uploaded file
app.delete('/api/admin/media/:filename', requireAdmin, (req, res) => {
  const { filename } = req.params;
  if (!filename || filename.includes('/') || filename.includes('..') || !isUploaded(filename))
    return res.status(400).json({ error: 'Недопустимый файл' });
  const filepath = path.join(imagesDir, filename);
  if (!fs.existsSync(filepath))
    return res.status(404).json({ error: 'Файл не найден' });
  fs.unlinkSync(filepath);
  res.json({ ok: true });
});

// ─── STATS (dashboard) ───
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const total    = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const active   = db.prepare('SELECT COUNT(*) as c FROM products WHERE status=1').get().c;
  const inactive = db.prepare('SELECT COUNT(*) as c FROM products WHERE status=0').get().c;
  const users    = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  res.json({ total, active, inactive, users });
});

// ─── USERS ───
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, login, role, created_at FROM users ORDER BY id ASC').all();
  res.json(rows);
});

app.post('/api/admin/users', requireAdmin, (req, res) => {
  const { login, password, role } = req.body;
  if (!login || !password) return res.status(400).json({ error: 'Введите логин и пароль' });
  if (db.prepare('SELECT id FROM users WHERE login=?').get(login))
    return res.status(409).json({ error: 'Логин уже занят' });
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (login, password, role) VALUES (?,?,?)').run(login, hash, role || 'admin');
  res.json({ id: result.lastInsertRowid, login, role: role || 'admin' });
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.session.userId)
    return res.status(400).json({ error: 'Нельзя удалить самого себя' });
  if (!db.prepare('SELECT id FROM users WHERE id=?').get(id))
    return res.status(404).json({ error: 'Пользователь не найден' });
  db.prepare('DELETE FROM users WHERE id=?').run(id);
  res.json({ ok: true });
});

// ─── CHANGE PASSWORD ───
app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Заполните все поля' });
  if (newPassword.length < 4) return res.status(400).json({ error: 'Минимум 4 символа' });
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.session.userId);
  if (!bcrypt.compareSync(currentPassword, user.password))
    return res.status(401).json({ error: 'Неверный текущий пароль' });
  db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.hashSync(newPassword, 10), req.session.userId);
  res.json({ ok: true });
});

// ─── ADMIN PAGE ───
app.get('/admin', (req, res) => {
  if (!req.session || !req.session.userId)
    return res.redirect('/login.html');
  res.sendFile(path.join(PUBLIC, 'admin.html'));
});

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════

function str(v, def = '') { return v !== undefined && v !== null ? String(v) : def; }
function num(v, def = 0)  { const n = parseInt(v); return isNaN(n) ? def : n; }
function flt(v, def = 0)  { const n = parseFloat(v); return isNaN(n) ? def : n; }

const SVG_COMPOSITION = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>';
const SVG_SIZE        = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
const SVG_COLOR       = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
const SVG_FRESH       = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>';

function mapProduct(row) {
  const images = [row.image1, row.image2, row.image3].filter(Boolean);
  if (!images.length) images.push('images/1.jpg');

  // EN / TJ translation overrides (empty string means "fall back to RU")
  const translations = {};
  if (row.en_name !== undefined) {
    translations.EN = {
      title:       row.en_name        || '',
      desc:        row.en_desc        || '',
      tag:         row.en_tag         || '',
      color:       row.en_color       || '',
      composition: row.en_composition || '',
      size:        row.en_size        || ''
    };
  }
  if (row.tj_name !== undefined) {
    translations.TJ = {
      title:       row.tj_name        || '',
      desc:        row.tj_desc        || '',
      tag:         row.tj_tag         || '',
      color:       row.tj_color       || '',
      composition: row.tj_composition || '',
      size:        row.tj_size        || ''
    };
  }

  return {
    id:          row.id,
    sort_order:  row.sort_order,
    status:      row.status,
    tag:         row.tag    || '',
    tagBg:       row.tag_bg || 'var(--rose)',
    title:       row.name,
    desc:        row.description || '',
    price:       row.price,
    currency:    row.currency || 'TJS',
    discount:    row.discount  || 0,
    likes:       row.likes     || 0,
    images,
    composition: row.composition || '',
    size:        row.size        || '',
    color:       row.color       || '',
    translations,
    info: [
      { icon: SVG_COMPOSITION, label: 'Состав',   value: row.composition || '—' },
      { icon: SVG_SIZE,        label: 'Размер',   value: row.size        || '—' },
      { icon: SVG_COLOR,       label: 'Цвет',     value: row.color       || '—' },
      { icon: SVG_FRESH,       label: 'Свежесть', value: '7+ дней'              }
    ]
  };
}

// ══════════════════════════════════════════
//  REVIEWS API
// ══════════════════════════════════════════

// GET /api/reviews — public
app.get('/api/reviews', (req, res) => {
  const userId = req.session && req.session.userId ? req.session.userId : null;
  const rows = db.prepare(`
    SELECT r.*,
      u.avatar AS user_avatar,
      (SELECT COUNT(*) FROM review_reactions rr WHERE rr.review_id = r.id AND rr.type = 'like')    AS likes,
      (SELECT COUNT(*) FROM review_reactions rr WHERE rr.review_id = r.id AND rr.type = 'dislike') AS dislikes
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC
  `).all();

  const myReactions = userId
    ? db.prepare('SELECT review_id, type FROM review_reactions WHERE user_id = ?').all(userId)
    : [];
  const myMap = {};
  myReactions.forEach(r => { myMap[r.review_id] = r.type; });

  const stats = db.prepare('SELECT AVG(rating) AS avg, COUNT(*) AS total FROM reviews').get();

  res.json({
    reviews: rows.map(r => ({
      ...r,
      photos: (() => { try { return JSON.parse(r.photos || '[]'); } catch { return []; } })(),
      myReaction: myMap[r.id] || null
    })),
    stats: { avg: stats.avg ? Math.round(stats.avg * 10) / 10 : 0, total: stats.total }
  });
});

// POST /api/reviews — auth required (multipart/form-data)
app.post('/api/reviews', reviewPhotoUpload.array('photos', 3), (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: 'Войдите в аккаунт, чтобы оставить отзыв' });
  const { rating, text } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Оценка от 1 до 5' });
  if (!text || !text.trim()) return res.status(400).json({ error: 'Напишите текст отзыва' });
  if (text.trim().length > 800) return res.status(400).json({ error: 'Не более 800 символов' });

  const photos = (req.files || []).map(f => `review-photos/${f.filename}`);

  const result = db.prepare(
    'INSERT INTO reviews (user_id, user_login, rating, text, photos) VALUES (?,?,?,?,?)'
  ).run(req.session.userId, req.session.login, num(rating), text.trim(), JSON.stringify(photos));

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  res.json({ ...review, photos, likes: 0, dislikes: 0, myReaction: null });
});

// POST /api/reviews/:id/react — auth required
app.post('/api/reviews/:id/react', (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: 'Нужна авторизация' });
  const reviewId = parseInt(req.params.id);
  const { type } = req.body; // 'like' | 'dislike'
  if (!['like','dislike'].includes(type)) return res.status(400).json({ error: 'Неверный тип' });
  if (!db.prepare('SELECT id FROM reviews WHERE id = ?').get(reviewId))
    return res.status(404).json({ error: 'Отзыв не найден' });

  const userId = req.session.userId;
  const existing = db.prepare('SELECT type FROM review_reactions WHERE user_id=? AND review_id=?').get(userId, reviewId);

  if (existing && existing.type === type) {
    // Remove reaction (toggle off)
    db.prepare('DELETE FROM review_reactions WHERE user_id=? AND review_id=?').run(userId, reviewId);
  } else {
    // Insert or replace
    db.prepare('INSERT OR REPLACE INTO review_reactions (user_id, review_id, type) VALUES (?,?,?)').run(userId, reviewId, type);
  }

  const likes    = db.prepare("SELECT COUNT(*) AS c FROM review_reactions WHERE review_id=? AND type='like'").get(reviewId).c;
  const dislikes = db.prepare("SELECT COUNT(*) AS c FROM review_reactions WHERE review_id=? AND type='dislike'").get(reviewId).c;
  const myNew    = db.prepare('SELECT type FROM review_reactions WHERE user_id=? AND review_id=?').get(userId, reviewId);
  res.json({ likes, dislikes, myReaction: myNew ? myNew.type : null });
});

// DELETE /api/admin/reviews/:id — admin only
app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!db.prepare('SELECT id FROM reviews WHERE id=?').get(id))
    return res.status(404).json({ error: 'Отзыв не найден' });
  db.prepare('DELETE FROM review_reactions WHERE review_id=?').run(id);
  db.prepare('DELETE FROM reviews WHERE id=?').run(id);
  res.json({ ok: true });
});

// ══════════════════════════════════════════
//  HERO SETTINGS API
// ══════════════════════════════════════════

// GET /api/hero — public, returns hero images + quotes
app.get('/api/hero', (req, res) => {
  const row = db.prepare('SELECT * FROM hero_settings WHERE id = 1').get();
  if (!row) return res.json(null);
  res.json({
    images: [row.slide1_img, row.slide2_img, row.slide3_img, row.slide4_img],
    quotes: {
      RU: JSON.parse(row.quotes_ru),
      EN: JSON.parse(row.quotes_en),
      TJ: JSON.parse(row.quotes_tj)
    }
  });
});

// PUT /api/admin/hero — admin only, save hero settings
app.put('/api/admin/hero', requireAdmin, (req, res) => {
  const { images, quotes } = req.body;
  if (!images || !Array.isArray(images) || images.length !== 4)
    return res.status(400).json({ error: 'Нужно 4 изображения' });
  if (!quotes || !quotes.RU || !quotes.EN || !quotes.TJ)
    return res.status(400).json({ error: 'Нужны цитаты на трёх языках' });

  const qRU = Array.isArray(quotes.RU) ? quotes.RU : JSON.parse(quotes.RU);
  const qEN = Array.isArray(quotes.EN) ? quotes.EN : JSON.parse(quotes.EN);
  const qTJ = Array.isArray(quotes.TJ) ? quotes.TJ : JSON.parse(quotes.TJ);

  db.prepare(`
    INSERT INTO hero_settings (id, slide1_img, slide2_img, slide3_img, slide4_img, quotes_ru, quotes_en, quotes_tj)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slide1_img = excluded.slide1_img,
      slide2_img = excluded.slide2_img,
      slide3_img = excluded.slide3_img,
      slide4_img = excluded.slide4_img,
      quotes_ru  = excluded.quotes_ru,
      quotes_en  = excluded.quotes_en,
      quotes_tj  = excluded.quotes_tj
  `).run(
    str(images[0]), str(images[1]), str(images[2]), str(images[3]),
    JSON.stringify(qRU), JSON.stringify(qEN), JSON.stringify(qTJ)
  );
  res.json({ ok: true });
});

// ══════════════════════════════════════════
//  FAVORITES API
// ══════════════════════════════════════════

// GET /api/favorites — returns product IDs favorited by the logged-in user
app.get('/api/favorites', (req, res) => {
  if (!req.session || !req.session.userId) return res.json({ ids: [] });
  const rows = db.prepare('SELECT product_id FROM favorites WHERE user_id = ?').all(req.session.userId);
  res.json({ ids: rows.map(r => r.product_id) });
});

// POST /api/favorites/:productId — toggle favorite, return new state + live count
app.post('/api/favorites/:productId', (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: 'Войдите в аккаунт, чтобы добавить в избранное' });

  const userId    = req.session.userId;
  const productId = parseInt(req.params.productId);
  if (!db.prepare('SELECT id FROM products WHERE id = ?').get(productId))
    return res.status(404).json({ error: 'Товар не найден' });

  const exists = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ?').get(userId, productId);

  if (exists) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(userId, productId);
    db.prepare('UPDATE products SET likes = MAX(0, likes - 1) WHERE id = ?').run(productId);
  } else {
    db.prepare('INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)').run(userId, productId);
    db.prepare('UPDATE products SET likes = likes + 1 WHERE id = ?').run(productId);
  }

  const product = db.prepare('SELECT likes FROM products WHERE id = ?').get(productId);
  res.json({ liked: !exists, likes: product.likes });
});

// ══════════════════════════════════════════
//  CHAT API
// ══════════════════════════════════════════

// Helper — get or create session
// Reads from: request body, query param, or cookie (in that order)
function getChatSession(req) {
  let sid = (req.body && req.body._sid) || req.query._sid || (req.cookies && req.cookies._gsid);
  const isNew = !sid;
  if (!sid) {
    sid = 'gs_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }
  const exists = db.prepare('SELECT id FROM chat_sessions WHERE id = ?').get(sid);
  if (!exists) {
    // Assign a sequential guest number
    const maxNum = db.prepare('SELECT MAX(guest_num) AS n FROM chat_sessions').get();
    const guestNum = (maxNum.n || 0) + 1;
    db.prepare('INSERT INTO chat_sessions (id, guest_num) VALUES (?,?)').run(sid, guestNum);
  }
  return sid;
}

// Get display name for a session
function getSessionDisplayName(sid) {
  const row = db.prepare('SELECT user_name, guest_num FROM chat_sessions WHERE id = ?').get(sid);
  if (!row) return 'Гость';
  return row.user_name || `Гость #${row.guest_num}`;
}
// POST /api/chat/message — visitor sends a message
app.post('/api/chat/message', (req, res) => {
  const { text, _sid } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'empty' });
  const sid = getChatSession(req);
  db.prepare('INSERT INTO chat_messages (session_id, dir, text) VALUES (?,?,?)').run(sid, 'in', text.trim());
  // Save user name if logged in
  const userName = req.session && req.session.login ? req.session.login : null;
  if (userName) {
    db.prepare('UPDATE chat_sessions SET user_name = ? WHERE id = ?').run(userName, sid);
  }
  db.prepare('UPDATE chat_sessions SET last_msg = CURRENT_TIMESTAMP, unread = unread + 1 WHERE id = ?').run(sid);
  const inserted = db.prepare('SELECT last_insert_rowid() AS id').get();
  const displayName = getSessionDisplayName(sid);
  res.json({ ok: true, session_id: sid, msg_id: inserted.id, display_name: displayName });
});

// GET /api/chat/poll?since=ID&_sid=... — visitor polls for admin replies
app.get('/api/chat/poll', (req, res) => {
  const sid   = req.query._sid || req.cookies._gsid;
  if (!sid) return res.json({ messages: [] });
  const since = parseInt(req.query.since) || 0;
  const msgs  = db.prepare(
    "SELECT id, dir, text, photo, created_at FROM chat_messages WHERE session_id = ? AND id > ? AND dir = 'out' ORDER BY id ASC"
  ).all(sid, since);
  // Mark admin's outgoing messages as read (user has seen them)
  if (msgs.length) {
    db.prepare("UPDATE chat_messages SET read_at = CURRENT_TIMESTAMP WHERE session_id = ? AND dir = 'out' AND read_at IS NULL")
      .run(sid);
  }
  res.json({ messages: msgs });
});

// GET /api/chat/init — returns current max message ID + session info
app.get('/api/chat/init', (req, res) => {
  const sid = req.query._sid || req.cookies._gsid;
  if (!sid) return res.json({ last_id: 0, display_name: null });
  const row = db.prepare(
    "SELECT MAX(id) AS last_id FROM chat_messages WHERE session_id = ? AND dir = 'out'"
  ).get(sid);
  const displayName = getSessionDisplayName(sid);
  res.json({ last_id: row.last_id || 0, display_name: displayName });
});

// GET /api/chat/poll?since=ID — visitor polls for admin replies
// (also accepts _sid in query for sessionStorage-based sessions)

// GET /api/chat/status — visitor checks if admin read their messages
app.get('/api/chat/status', (req, res) => {
  const sid = req.query._sid || req.cookies._gsid;
  if (!sid) return res.json({ read_up_to: 0 });
  const row = db.prepare(
    "SELECT MAX(id) AS read_up_to FROM chat_messages WHERE session_id = ? AND dir = 'in' AND read_at IS NOT NULL"
  ).get(sid);
  res.json({ read_up_to: row.read_up_to || 0 });
});

// ── Admin chat endpoints ──

// GET /api/admin/chat/sessions — all conversations
app.get('/api/admin/chat/sessions', requireAdmin, (req, res) => {
  const sessions = db.prepare(`
    SELECT s.id, s.last_msg, s.unread, s.user_name, s.guest_num,
      (SELECT text FROM chat_messages WHERE session_id = s.id ORDER BY id DESC LIMIT 1) AS last_text,
      (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) AS msg_count
    FROM chat_sessions s ORDER BY s.last_msg DESC
  `).all();
  res.json(sessions.map(s => ({
    ...s,
    display_name: s.user_name || `Гость #${s.guest_num || '?'}`
  })));
});

// GET /api/admin/chat/session/:id — all messages in a conversation
app.get('/api/admin/chat/session/:id', requireAdmin, (req, res) => {
  const msgs = db.prepare(
    'SELECT id, dir, text, photo, created_at, read_at FROM chat_messages WHERE session_id = ? ORDER BY id ASC'
  ).all(req.params.id);
  // Mark incoming messages as read by admin
  db.prepare("UPDATE chat_messages SET read_at = CURRENT_TIMESTAMP WHERE session_id = ? AND dir = 'in' AND read_at IS NULL").run(req.params.id);
  db.prepare('UPDATE chat_sessions SET unread = 0 WHERE id = ?').run(req.params.id);
  res.json(msgs);
});

// POST /api/admin/chat/reply — admin replies
app.post('/api/admin/chat/reply', requireAdmin, (req, res) => {
  const { session_id, text } = req.body;
  if (!session_id || !text || !text.trim()) return res.status(400).json({ error: 'invalid' });
  const r = db.prepare('INSERT INTO chat_messages (session_id, dir, text) VALUES (?,?,?)').run(session_id, 'out', text.trim());
  db.prepare('UPDATE chat_sessions SET last_msg = CURRENT_TIMESTAMP WHERE id = ?').run(session_id);
  res.json({ ok: true, msg_id: r.lastInsertRowid });
});

// GET /api/admin/chat/triggers — get all triggers
app.get('/api/admin/chat/triggers', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM chat_triggers ORDER BY id ASC').all());
});

// POST /api/admin/chat/triggers — create trigger
app.post('/api/admin/chat/triggers', requireAdmin, (req, res) => {
  const { keywords, reply } = req.body;
  if (!keywords || !reply) return res.status(400).json({ error: 'invalid' });
  const r = db.prepare('INSERT INTO chat_triggers (keywords, reply) VALUES (?,?)').run(keywords.trim(), reply.trim());
  res.json({ id: r.lastInsertRowid, keywords: keywords.trim(), reply: reply.trim(), active: 1 });
});

// PUT /api/admin/chat/triggers/:id — update trigger
app.put('/api/admin/chat/triggers/:id', requireAdmin, (req, res) => {
  const { keywords, reply, active } = req.body;
  db.prepare('UPDATE chat_triggers SET keywords=?, reply=?, active=? WHERE id=?')
    .run(keywords, reply, active ? 1 : 0, parseInt(req.params.id));
  res.json({ ok: true });
});

// DELETE /api/admin/chat/triggers/:id — delete trigger
app.delete('/api/admin/chat/triggers/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM chat_triggers WHERE id = ?').run(parseInt(req.params.id));
  res.json({ ok: true });
});

// GET /api/chat/triggers — public (for frontend bot)
app.get('/api/chat/triggers', (req, res) => {
  const triggers = db.prepare('SELECT id, keywords, reply FROM chat_triggers WHERE active = 1').all();
  res.json(triggers);
});

// GET /api/chat/config — public chat config (enabled/disabled + corner)
app.get('/api/chat/config', (req, res) => {
  const rows = db.prepare("SELECT key, value FROM site_settings WHERE key IN ('chat_enabled','widget_corner')").all();
  const s = {};
  rows.forEach(r => { s[r.key] = r.value; });
  res.json({ chat_enabled: s.chat_enabled !== '0', widget_corner: s.widget_corner || 'br' });
});

// GET /api/admin/site-settings — get all settings
app.get('/api/admin/site-settings', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_settings').all();
  const obj = {};
  rows.forEach(r => { obj[r.key] = r.value; });
  res.json(obj);
});

// POST /api/admin/site-settings — save settings
app.post('/api/admin/site-settings', requireAdmin, (req, res) => {
  const upsert = db.prepare("INSERT INTO site_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
  const save = db.transaction(data => {
    for (const [k, v] of Object.entries(data)) upsert.run(k, String(v));
  });
  save(req.body);
  res.json({ ok: true });
});

// GET /api/chat/deals — returns products with discount or Хит tag for акции trigger
app.get('/api/chat/deals', (req, res) => {
  const deals = db.prepare(
    "SELECT name, price, discount, tag FROM products WHERE status = 1 AND (discount > 0 OR tag IN ('Хит','Топ','Premium')) ORDER BY discount DESC, likes DESC LIMIT 5"
  ).all();
  res.json(deals);
});

// ─── START ───
app.listen(PORT, () => {
  console.log(`\n🌸 GULREZ server: http://localhost:${PORT}`);
  console.log(`   Admin panel:    http://localhost:${PORT}/admin`);
  console.log(`   Login:          Malika / 999999\n`);
});
