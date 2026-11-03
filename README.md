# dsh-plugin-wenkai-font

A DeepSeek Harness plugin that switches the Web GUI's interface and conversation text to **LXGW WenKai (霞鹜文楷)**. The web font is bundled, so it works offline: an installed copy of the typeface is used first (no download), and the packaged woff2 subsets are fetched only when the font is missing.

把 DeepSeek Harness 的界面 / 对话文字字体切换为 **霞鹜文楷（LXGW WenKai）** 的 Harness 插件。字体文件随插件内置，离线可用：系统已安装霞鹜文楷时直接使用本机字体（零下载），未安装时按需加载内置的 woff2 分片。

## Install / 安装

```sh
dsh plugin --profile web add github:AaronOhO/dsh-plugin-wenkai-font
```

Or install this directory with Plugin Manager's `install_bundle`. Reload the page once after enabling: the Host half contributes the stylesheet to the index document, and the stylesheet is also attached to an already-open page when the client half loads.

也可以在本机用 Plugin Manager 的 `install_bundle` 直接安装本目录。启用后重新加载一次页面：Host 半会把样式表注入 index 文档，Client 半则负责给已经打开的页面补挂。

## Scope / 生效范围

- **Interface and conversation text**: the plugin puts LXGW WenKai ahead of the built-in text stack through the Harness theme variable `--dsh-font-family-text`, so `body` and every component that reads `--dsw-font-family` follow (Markdown, composer, sidebar, settings, and so on).
- **Code blocks and terminal are intentionally left alone**: they follow `--ds-font-family-code` and the sidebar terminal's xterm font setting. Set them separately in **Settings → General → More font settings** (for example `LXGW WenKai Mono`, which requires the Mono variant to be installed). Choosing a text font in Settings writes the same variable inline on `body`, so a user's explicit choice overrides this plugin's default.

- **界面与对话文本**：通过 Harness 主题变量 `--dsh-font-family-text` 把「霞鹜文楷」放在内置字体栈之前，`body`（外壳样式）和所有读取 `--dsw-font-family` 的组件（Markdown、输入框、侧栏、设置页等）都会跟随。
- **代码块 / 终端**：有意不改，分别由 `--ds-font-family-code` 与侧栏终端的 xterm 字体设置控制，可在 **设置 → 通用 → 更多字体设置** 中单独指定（例如终端用 `LXGW WenKai Mono`，需系统已安装等宽版）。在设置里为「文本」另行选择字体时，设置值以内联变量写到 `body`，会覆盖本插件的默认值——插件不会强制覆盖用户选择。

## How it works / 实现方式

| Part | File | Role |
|---|---|---|
| Host half | [index.js](index.js) | Registers the prefix route `/dsh-wenkai`, serves `font.css` and the packaged woff2 subsets, and listens to `webserver/index-inject` to put the stylesheet `<link>` into the index document `<head>` before the app paints. |
| Client half | [client.js](client.js) | Attaches the same stylesheet to a page that was already open (skipped when the Host half already injected it) and removes the `<link>` on unload. |
| Stylesheet | `assets/font.css` | 97 `@font-face` rules: `src` first tries `local("LXGW WenKai")` / `local("LXGWWenKai-Regular")` / `local("霞鹜文楷")`, then the packaged subset; ends with `:root{--dsh-font-family-text:"LXGW WenKai","霞鹜文楷"}`. |
| Font assets | `assets/fonts/*.woff2` | LXGW WenKai Regular (400) split into woff2 subsets by `unicode-range`, copied byte-for-byte from `lxgw-wenkai-webfont@1.7.0` (upstream v1.250); the OFL text ships alongside. |
| Bundle manifest | [package.json](package.json) / [cordis.patch.yml](cordis.patch.yml) | `dsh.bundle.patch` inserts the `wenkai-font` row; `dsh.client` declares the browser half. |
| Display metadata | [locale/](locale) / [icon.svg](icon.svg) | Title, description, and icon shown by Plugin Manager. |

| 部分 | 文件 | 作用 |
|---|---|---|
| Host 半 | [index.js](index.js) | 注册前缀路由 `/dsh-wenkai`，提供 `font.css` 与内置 woff2 分片；监听 `webserver/index-inject`，把样式表 `<link>` 注入 index 文档 `<head>`，首屏即可用新字体 |
| Client 半 | [client.js](client.js) | 页面已在打开状态时补挂同一份样式表（Host 已注入时自动跳过），卸载插件时移除 `<link>` |
| 样式表 | `assets/font.css` | 97 条 `@font-face`：`src` 先尝试 `local(...)`，再回退到内置分片；末尾 `:root{--dsh-font-family-text:"LXGW WenKai","霞鹜文楷"}` |
| 字体资源 | `assets/fonts/*.woff2` | 霞鹜文楷 Regular（400）按 unicode-range 切分的 woff2 分片，逐字节复制；OFL 文本随附 |
| Bundle 清单 | [package.json](package.json) / [cordis.patch.yml](cordis.patch.yml) | `dsh.bundle.patch` 插入 `wenkai-font` 行；`dsh.client` 声明浏览器半 |
| 显示元数据 | [locale/](locale) / [icon.svg](icon.svg) | 插件管理器中的标题、说明与图标 |

No tools, conversation rows, slots, or settings namespaces are modified. Disabling or uninstalling the plugin removes the route, the index injection, and the client stylesheet, and the default font returns.

没有工具、对话行、槽位或设置命名空间的改动；禁用或卸载插件即移除路由、index 注入与客户端样式表，字体恢复默认。

## Settings / 启停

- Toggle the "霞鹜文楷字体" row on the Plugins page (or through `plugin_manager` / the profile patch layer).
- The route prefix is `/dsh-wenkai/...`; packaged subsets are fetched only for the `unicode-range` chunks the page actually uses.

- 在 Plugins 页面里启停「霞鹜文楷字体」一行，或通过 `plugin_manager` / profile 补丁层操作。
- 路由路径固定为 `/dsh-wenkai/...`；内置分片只为页面实际用到的 unicode 区段按需拉取。

## Verify / 验证

1. After the page loads, `document.fonts.check('16px "LXGW WenKai"')` should be `true`, and `getComputedStyle(document.body).fontFamily` should mention `LXGW WenKai`.
2. `curl -I http://127.0.0.1:<port>/dsh-wenkai/font.css` and any subset should return `200` with the right `content-type`.
3. Plugin Manager's detail view should show the title and description and render this package's icon.

## License / 许可

Plugin code and artwork are MIT ([LICENSE](LICENSE)). The bundled font is SIL Open Font License 1.1; copyright, source, modifications, and redistribution requirements are in [FONT-LICENSES.md](FONT-LICENSES.md), and the complete OFL text ships as `assets/fonts/OFL.txt`.

插件代码与图标为 MIT（[LICENSE](LICENSE)）。内置字体为 SIL Open Font License 1.1，版权、来源、修改说明与再分发要求见 [FONT-LICENSES.md](FONT-LICENSES.md)，完整 OFL 文本随字体文件一起位于 `assets/fonts/OFL.txt`。
