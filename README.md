# Save Full HTML

一个轻量的 Chrome 扩展（Manifest V3）：一键把当前网页**已渲染完成的完整 HTML** 导出为本地 `.html` 文件。

抓取的是运行时 DOM（`document.documentElement.outerHTML`），而不是服务器返回的原始源码，因此由 JavaScript 动态插入的内容——SPA 渲染结果、懒加载区块、无限滚动列表、脚本注入的样式——都会被一并保存下来。

## 功能

- 导出当前页面渲染后的完整 DOM 快照，含 `<!DOCTYPE>` 声明
- 保留动态加载的内容，而非初始 HTML 源码
- 自动以页面标题命名文件，并清洗非法文件名字符（`/ \ ? % * : | " < >`）
- 不请求任何网络权限，不上传数据，全部在本地完成
- 通过 `activeTab` 按需授权，只在点击按钮时访问当前标签页

## 安装

1. 克隆或下载本仓库：

   ```bash
   git clone git@github.com:neotu23/SaveHTML.git
   ```

2. 打开 Chrome，访问 `chrome://extensions/`
3. 打开右上角的 **开发者模式 / Developer mode**
4. 点击 **加载已解压的扩展程序 / Load unpacked**，选择 `SaveHTML` 目录
5. 扩展图标会出现在工具栏（可固定显示）

> 也适用于 Edge、Brave 等基于 Chromium 的浏览器，步骤相同。

## 使用

1. 打开任意网页，等待内容加载完成（若有「加载更多」按钮，先点开想要保存的部分）
2. 点击工具栏中的扩展图标
3. 点击 **Export HTML**
4. 文件会以页面标题为名下载到默认下载目录

状态栏会提示 `Export successful!` 或对应的错误信息。

## 项目结构

```
SaveHTML/
├── manifest.json   # Manifest V3 配置：权限、图标、popup 入口
├── popup.html      # 弹出面板 UI
├── popup.js        # 注入脚本抓取 DOM 并触发下载
├── icons/          # 16 / 32 / 48 / 128 px 图标
└── README.md
```

### 工作原理

`popup.js` 通过 `chrome.scripting.executeScript` 往当前标签页注入一个函数，读取：

```js
document.documentElement.outerHTML
```

再把 `document.doctype` 序列化后拼到最前面，接着用 `Blob` + `URL.createObjectURL` 生成临时链接，借由 `<a download>` 触发浏览器下载。整个过程不需要 service worker，也不需要后台常驻。

## 权限说明

| 权限        | 用途                                 |
| ----------- | ------------------------------------ |
| `activeTab` | 仅在用户点击扩展图标时访问当前标签页 |
| `scripting` | 注入脚本以读取页面渲染后的 DOM       |

## 已知限制

- 只能保存 HTML 结构本身，**不包含**外部图片、CSS、字体等资源，因此离线打开时可能丢失样式或图片（如需完整归档，可改用 SingleFile 这类内联资源的方案）
- 部分跨域 iframe 的内容无法被读取
- 页面中通过 Canvas 绘制或 Shadow DOM 封闭描述的内容不会被序列化
- `chrome://`、Chrome 应用商店等受限页面无法注入脚本

## License

MIT
