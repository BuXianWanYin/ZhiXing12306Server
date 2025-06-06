# 12306 微信小程序服务端

这是一个基于 Node.js + Express 开发的 12306 微信小程序服务端项目。

## 项目简介

本项目是 12306 微信小程序的后端服务，提供用户登录、头像上传等基础功能。项目使用 Express 框架开发，采用 MySQL 数据库存储数据。

## 技术栈

- Node.js
- Express
- MySQL
- Axios
- Multer
- CORS

## 主要功能

- 用户管理
  - 微信小程序登录
  - 用户信息更新
  - 头像上传
  - 昵称修改

## 项目结构

```
├── app.js              # 主应用文件
├── image/             # 头像存储目录
└── node_modules/      # 依赖包
```

## 环境要求

- Node.js 12+
- MySQL 8
- 微信小程序开发者账号

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

创建 MySQL 数据库并执行以下 SQL：

```sql
CREATE DATABASE 12306db;
USE 12306db;

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(100) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar VARCHAR(255),
    create_time DATETIME
);
```

### 3. 配置微信小程序信息

在 `app.js` 中配置你的微信小程序信息：

```javascript
const appid = '你的小程序appid';
const secret = '你的小程序secret';
```

### 4. 启动服务

```bash
node app.js
```

服务将在 http://localhost:3000 启动

## API 文档

### 用户接口

#### 1. 登录接口
- 路径：`POST /api/user/login`
- 参数：
  ```json
  {
    "code": "微信登录code",
    "avatar": "用户头像URL",
    "nickname": "用户昵称"
  }
  ```
- 返回：
  ```json
  {
    "success": true,
    "openid": "用户openid",
    "nickname": "用户昵称",
    "avatar": "用户头像URL"
  }
  ```

#### 2. 头像上传
- 路径：`POST /api/user/uploadAvatar`
- 参数：
  - uid: 用户openid
  - avatar: 图片文件
- 返回：
  ```json
  {
    "success": true,
    "avatarUrl": "头像URL"
  }
  ```

#### 3. 修改昵称
- 路径：`POST /api/user/updateNickname`
- 参数：
  ```json
  {
    "uid": "用户openid",
    "nickname": "新昵称"
  }
  ```
- 返回：
  ```json
  {
    "success": true
  }
  ```

## 注意事项

1. 确保 MySQL 服务已启动
2. 确保 image 目录具有写入权限
3. 微信小程序配置信息需要替换为自己的
4. 生产环境部署时注意修改数据库连接信息


## 联系方式
项目维护者：[QGJ]
邮箱：[2644832053@qq.com]

