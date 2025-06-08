# 12306 微信小程序服务端

这是一个基于 Node.js + Express 开发的 12306 微信小程序服务端项目。

## 项目简介

本项目是 12306 微信小程序的后端服务，提供用户登录、头像上传等基础功能。项目使用 Express 框架开发，采用 MySQL 数据库存储数据。

## 技术栈

- Node.js
- Express 5.1.0
- MySQL 8.0.41
- Axios 1.9.0
- Multer 2.0.1
- CORS 2.8.5
- MySQL2 3.14.1
- Body-parser 2.2.0

## 主要功能

- 用户管理
  - 微信小程序登录
  - 用户信息更新
  - 头像上传
  - 昵称修改

## 项目结构

```
├── server.js           # 主应用文件
├── 12306db.sql        # 数据库初始化脚本
├── package.json       # 项目依赖配置
├── image/            # 头像存储目录
└── node_modules/     # 依赖包
```

## 环境要求

- Node.js 12+
- MySQL 8.0.41+
- 微信小程序开发者账号

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

使用提供的 `12306db.sql` 文件初始化数据库：

```bash
mysql -u your_username -p < 12306db.sql
```

数据库表结构：
```sql
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openid` varchar(64) NOT NULL COMMENT '微信openid',
  `nickname` varchar(64) DEFAULT NULL COMMENT '用户昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `gender` tinyint(1) DEFAULT 0 COMMENT '性别 0-未知 1-男 2-女',
  `province` varchar(32) DEFAULT NULL COMMENT '省份',
  `city` varchar(32) DEFAULT NULL COMMENT '城市',
  `country` varchar(32) DEFAULT NULL COMMENT '国家',
  `language` varchar(16) DEFAULT 'zh_CN' COMMENT '语言',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';
```

## 数据库说明

- 用户表（user）包含以下字段：
  - id: 自增主键
  - openid: 微信用户唯一标识
  - nickname: 用户昵称
  - avatar: 头像URL
  - gender: 性别（0-未知，1-男，2-女）
  - province: 省份
  - city: 城市
  - country: 国家
  - language: 语言（默认zh_CN）
  - create_time: 创建时间
  - update_time: 更新时间（自动更新）

### 3. 配置微信小程序信息

在 `server.js` 中配置你的微信小程序信息：

```javascript
const appid = '你的小程序appid';
const secret = '你的小程序secret';
```

### 4. 启动服务

```bash
node server.js
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
  - avatar: 图片文件（multipart/form-data）
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
5. 所有时间字段使用 UTC 时间存储

## 联系方式
项目维护者：QGJ
邮箱：2644832053@qq.com