const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const serverHost = 'localhost:3000';
const imageDir = path.join(__dirname, 'image');
const iconDir = path.join(imageDir, 'icon');



const app = express();
app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir);
}

// 数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: '12306db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 微信小程序配置
const appid = 'wx86e4aef09b96f6dc';
const secret = 'c6de62c8472f8764069f68ab5067c266';

// 登录接口
app.post('/api/user/login', async (req, res) => {
  const { code, userInfo } = req.body;
  if (!code) return res.json({ success: false, msg: '缺少code' });
  if (!userInfo) return res.json({ success: false, msg: '缺少用户信息' });

  // 1. 用code换openid
  const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
  try {
    const wxRes = await axios.get(wxUrl);
    const { openid } = wxRes.data;
    if (!openid) return res.json({ success: false, msg: '获取openid失败' });

    // 2. 查找或注册用户
    const [rows] = await pool.query('SELECT * FROM user WHERE openid = ?', [openid]);
    if (rows.length === 0) {
      // 新用户注册
      await pool.query(
        'INSERT INTO user (openid, nickname, avatar, create_time) VALUES (?, ?, ?, NOW())',
        [openid, userInfo.nickName, userInfo.avatarUrl]
      );
    } else {
      // 更新头像昵称
      await pool.query(
        'UPDATE user SET nickname=?, avatar=? WHERE openid=?',
        [userInfo.nickName, userInfo.avatarUrl, openid]
      );
    }
    // 查询最新用户信息
    const [userRows] = await pool.query('SELECT * FROM user WHERE openid = ?', [openid]);
    const user = userRows[0];
    
    // 拼接完整头像地址
    let avatarUrl = user.avatar;
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      avatarUrl = `${serverHost}${avatarUrl}`;
    }

    res.json({
      success: true,
      openid,
      userInfo: {
        nickName: user.nickname,
        avatarUrl: avatarUrl,
        gender: userInfo.gender || 0,
        province: userInfo.province || '',
        city: userInfo.city || '',
        country: userInfo.country || '',
        language: userInfo.language || 'zh_CN'
      }
    });
  } catch (err) {
    console.error('登录处理错误:', err);
    res.json({ success: false, msg: '服务异常', error: err.message });
  }
});

// 配置 multer 用于头像上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageDir);
  },
  filename: function (req, file, cb) {
    // 用 openid 命名
    const ext = path.extname(file.originalname);
    cb(null, req.body.uid + ext);
  }
});
const upload = multer({ storage: storage });

// 头像上传接口
app.post('/api/user/uploadAvatar', upload.single('avatar'), async (req, res) => {
  const { uid } = req.body;
  if (!uid || !req.file) return res.json({ success: false, msg: '缺少参数' });

  const avatarUrl = `http://${serverHost}/image/${req.file.filename}`;
  await pool.query('UPDATE user SET avatar=? WHERE openid=?', [avatarUrl, uid]);
  res.json({ success: true, avatarUrl });
});

// 静态资源服务
app.use('/image', express.static(imageDir));

// 昵称修改接口
app.post('/api/user/updateNickname', async (req, res) => {
  const { uid, nickname } = req.body;
  if (!uid || !nickname) return res.json({ success: false, msg: '缺少参数' });

  await pool.query('UPDATE user SET nickname=? WHERE openid=?', [nickname, uid]);
  res.json({ success: true });
});

//获取所有 icon 图片 URL 的接口
app.get('/api/icons', (req, res) => {
  fs.readdir(iconDir, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, msg: '读取icon目录失败', error: err.message });
    }
    // 只保留图片文件
    const icons = {};
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
        // 去掉扩展名作为 key
        const key = path.basename(file, ext);
        icons[key] = `http://${serverHost}/image/icon/${file}`;
      }
    });
    res.json(icons);
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('服务运行在 http://localhost:3000');
}); 