# DeepSeek AI 扩展

## 简介

DeepSeek AI 扩展提供文本、图像、音频和视频 AI 服务，支持多种模型，满足不同场景需求。

## 扩展信息

- **名称**: DeepSeek
- **版本**: 1.0.0
- **作者**: DeepSeek Team
- **官网**: [DeepSeek](https://deepseek.com)
- **入口文件**: index.js

## AI 集合

### 1. DeepSeek Text

- **描述**: DeepSeek 文本生成模型
- **角色**: 助手
- **模型**: `deepseek-chat`, `deepseek-coder`
- **API 端点**: `https://api.deepseek.com/v1/chat`
- **支持功能**:
  - 生成高质量文本
  - 代码生成与解释

### 2. DeepSeek Image

- **描述**: DeepSeek AI 生成图像
- **角色**: 艺术家
- **模型**: `deepseek-image`
- **API 端点**: `https://api.deepseek.com/v1/image`
- **支持功能**:
  - AI 绘画
  - 图像风格转换

### 3. DeepSeek Audio

- **描述**: DeepSeek AI 音频处理
- **角色**: 音频专家
- **模型**: `deepseek-audio`
- **API 端点**: `https://api.deepseek.com/v1/audio`
- **支持功能**:
  - 文本转语音（TTS）
  - 音频降噪

### 4. DeepSeek Video

- **描述**: DeepSeek AI 处理视频
- **角色**: 视频剪辑师
- **模型**: `deepseek-video`
- **API 端点**: `https://api.deepseek.com/v1/video`
- **支持功能**:
  - 视频剪辑与优化
  - 视频风格转换

## 使用方式

1. 获取 API Key（[点击申请](https://deepseek.com)）
2. 在 `index.js` 中配置 `apiKey`
3. 通过 API 端点调用相应的 AI 服务

## 许可证

该扩展受 DeepSeek 许可协议约束，禁止未经授权的使用与分发。

---

**DeepSeek Team © 2025**
