const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const serverHost = 'http://localhost:3000';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 确保 image 目录存在
const imageDir = path.join(__dirname, 'image');
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
  const { code, avatar, nickname } = req.body;
  if (!code) return res.json({ success: false, msg: '缺少code' });

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
        [openid, nickname, avatar]
      );
    } else {
      // 更新头像昵称
      await pool.query(
        'UPDATE user SET nickname=?, avatar=? WHERE openid=?',
        [nickname, avatar, openid]
      );
    }
    // 查询最新用户信息
    const [userRows] = await pool.query('SELECT * FROM user WHERE openid = ?', [openid]);
    const user = userRows[0];
 // 拼接完整头像地址
  let avatar = user.avatar;
  if (avatar && !avatar.startsWith('http')) {
    avatar = `${serverHost}${avatar}`;
  }
    res.json({
      success: true,
      openid,
      nickname: user.nickname,
      avatar: user.avatar
    });
  } catch (err) {
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

  const avatarUrl = `${serverHost}/image/${req.file.filename}`;
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

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});