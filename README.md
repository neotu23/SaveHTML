<p align="center">
  <img src="icons/icon128.png" width="128" height="128" alt="Save Full HTML Logo" />
</p>

<h1 align="center">Save Full HTML</h1>

<p align="center"><strong>把网页此刻的样子，原样存成一份 HTML。</strong></p>
<p align="center">Save the page as it renders, not as it shipped.</p>

<p align="center">
  一个 Manifest V3 扩展：点击一次，导出当前页面渲染后的完整 DOM。脚本注入的内容、懒加载的区块、滚动追加的列表，都会一起被保存下来。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" /></a>
  <img src="https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/platform-Chromium-2563eb" alt="Platform: Chromium" />
  <img src="https://img.shields.io/badge/version-1.0-22c55e" alt="Version 1.0" />
</p>

<p align="center">
  <a href="#安装">安装</a> ·
  <a href="#使用">使用</a> ·
  <a href="#功能一览">功能一览</a> ·
  <a href="#工作原理">工作原理</a> ·
  <a href="#权限说明">权限说明</a> ·
  <a href="#已知限制">已知限制</a>
</p>

## 为什么用它？

浏览器的「另存为」保存的是服务器返回的原始响应，「查看源代码」看到的也是同一份东西。但对今天大多数页面来说，真正的正文是 JavaScript 跑完之后才出现的：React / Vue 渲染出来的结构、滚动到底才加载的评论、点击「展开」才插入的段落——这些在原始响应里一个都找不到。

Save Full HTML 读的是运行时 DOM：

```js
document.documentElement.outerHTML
```

也就是你在开发者工具 Elements 面板里看到的那份结构。页面现在长什么样，存下来就是什么样。

## 功能一览

### 一份完整快照，而不是一份源码

导出结果包含序列化后的 `<!DOCTYPE>` 与整个 `<html>` 树，用浏览器直接打开即可复现当时的 DOM。

### 动态内容不会漏掉

先让页面加载到你想要的状态（点开「加载更多」、滚动到评论区底部、展开折叠内容），再导出，已插入的内容全部保留。

### 文件名自动整理

以 `document.title` 作为文件名，并清洗掉文件名非法字符（`/ \ ? % * : | " < >`），避免下载时被浏览器改名或截断。

### 全程本地，没有后端

不请求任何网络权限，不加载远程脚本，不上传统计或页面内容。DOM 在标签页内读出，用 `Blob` 转成本地下载链接，不经过任何服务器。

### 按需授权

只声明 `activeTab` 与 `scripting`。前者意味着权限仅在你点击图标的那一刻授予当前标签页，不会常驻访问你浏览的所有网站。没有 service worker，也没有后台常驻进程。

## 安装

这个扩展没有发布到 Chrome 应用商店，以「加载已解压」的方式安装（适合自己使用或二次改造）：

1. 克隆仓库：

   ```bash
   git clone git@github.com:neotu23/SaveHTML.git
   ```

2. 打开 Chrome，访问 `chrome://extensions/`
3. 打开右上角的 **开发者模式 / Developer mode**
4. 点击 **加载已解压的扩展程序 / Load unpacked**，选择 `SaveHTML` 目录
5. 在工具栏的拼图菜单里把扩展固定出来，方便随时点击

> Edge、Brave、Vivaldi 等 Chromium 内核浏览器的操作步骤一致，入口分别是 `edge://extensions/`、`brave://extensions/` 等。

## 使用

1. 打开目标网页，等待内容加载完成；如果有「加载更多」，先点开到需要保存的部分
2. 点击工具栏中的扩展图标
3. 点击 **Export HTML**
4. 文件以页面标题命名，保存到浏览器的默认下载目录

弹出面板下方会显示 `Export successful!`，失败时显示对应的错误信息。

## 技术说明

`popup.js` 通过 `chrome.scripting.executeScript` 向当前标签页注入一段函数，读取 DOM，序列化 doctype 并拼到最前面：

```js
const result = await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  func: () => {
    let html = document.documentElement.outerHTML;
    if (document.doctype) {
      html = new XMLSerializer().serializeToString(document.doctype) + '\n' + html;
    }
    return { html, title: document.title || 'page' };
  },
});
```

拿到字符串后用 `Blob` + `URL.createObjectURL` 生成临时链接，创建一个 `<a download>` 元素并 `.click()`，随后释放 ObjectURL。整个过程只发生在弹出面板的生命周期内，不需要消息通信、不需要 background。

### 项目结构

```
SaveHTML/
├── manifest.json   # Manifest V3 配置：权限、图标、popup 入口
├── popup.html      # 弹出面板 UI
├── popup.js        # 注入脚本抓取 DOM 并触发下载
├── icons/          # 16 / 32 / 48 / 128 px 图标
├── LICENSE
└── README.md
```

## 权限说明

| 权限        | 用途                                   |
| ----------- | -------------------------------------- |
| `activeTab` | 仅在用户点击扩展图标时访问当前标签页   |
| `scripting` | 注入函数以读取页面渲染后的 DOM         |

扩展不申请 `host_permissions`、`downloads`、`storage` 或任何远程访问能力。

## 已知限制

- **只保存 HTML 结构**，不内联图片、CSS、字体和脚本。离线打开时可能丢失样式或图片；如果需要完整归档，请改用 SingleFile 这类会内联资源的方案。
- **跨域 iframe 的内容读不到**，受同源策略限制。
- **Canvas 绘制的内容、封闭的 Shadow DOM** 不会被序列化。
- **受限页面无法注入脚本**，例如 `chrome://` 开头的页面、Chrome 应用商店、其他扩展的页面。
- **超长页面**一次性序列化后通过 Blob 下载，极端情况下可能占用较多内存。

## 许可证

本项目基于 **[MIT License](LICENSE)** 发布。

Copyright © 2026 Neotu
