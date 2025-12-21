# @cookee/iptv-cli

IPTV 频道管理命令行工具

## 安装

```bash
# 全局安装
npm install -g @cookee/iptv-cli

# 或使用 pnpm
pnpm add -g @cookee/iptv-cli
```

## 使用

```bash
# 运行 CLI 工具
iptv-cli

# 或使用 npx（无需安装）
npx @cookee/iptv-cli
```

## 功能

- 合并 Markdown 文件：将多个频道 Markdown 文件合并为一个
- 生成 M3U 播放列表
- 频道数据管理和组织

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 监听模式
npm run watch
```

## 发布

```bash
# 补丁版本（bug 修复）
npm run release:patch

# 次版本（新功能）
npm run release:minor

# 主版本（破坏性更新）
npm run release:major
```

## License

ISC
