# PartyKeys Game Center

PartyKeys Game Center 把多个独立网页小游戏整合成一个静态网站项目，可以直接上传到 GitHub，并部署到 Netlify。

## 项目结构

```text
partykeys-games/
  index.html
  netlify.toml
  games/
    glow-game/
      index.html
    chord-climber/
      index.html
    fruit-frenzy/
      index.html
      styles.css
      app.js
    chord-runner/
      index.html
```

## 本地运行

这个项目不需要安装依赖，也不需要构建。

推荐用本地静态服务器预览：

```bash
cd partykeys-games
python3 -m http.server 8080
```

然后在浏览器打开：

```text
http://localhost:8080
```

也可以直接双击 `index.html` 打开大厅页面。为了更接近 Netlify 的运行环境，建议使用本地静态服务器。

## 添加新游戏

1. 在 `games/` 下新建一个游戏目录，例如 `games/new-game/`。
2. 把该游戏入口命名为 `index.html`。
3. 如果有 CSS、JS、图片或音频资源，放在该游戏自己的目录里，并使用相对路径，例如 `./style.css`、`./app.js`、`./assets/sound.mp3`。
4. 打开根目录的 `index.html`，在 `games` 数组里添加一项：

```js
{
  title: "New Game",
  description: "Short description.",
  url: "./games/new-game/",
  mark: "N",
  tag: "Arcade"
}
```

## Netlify 部署

这是纯静态网站，Netlify 不需要构建命令。

推荐设置：

```text
Build command: 留空
Publish directory: .
```

`netlify.toml` 已经写好这些设置。

## 上传到 GitHub

在 `partykeys-games` 目录中执行：

```bash
git init
git add .
git commit -m "Create PartyKeys Game Center"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/partykeys-games.git
git push -u origin main
```

把 `YOUR_USERNAME` 换成你的 GitHub 用户名。执行前需要先在 GitHub 上创建一个空仓库，仓库名建议使用 `partykeys-games`。

## 从 GitHub 部署到 Netlify

1. 登录 Netlify。
2. 选择 `Add new site`。
3. 选择 `Import an existing project`。
4. 连接 GitHub，并选择 `partykeys-games` 仓库。
5. 确认发布目录是 `.`，构建命令为空。
6. 点击 `Deploy`。

部署完成后，Netlify 会给你一个网址。之后每次 push 到 GitHub，Netlify 会自动重新部署。

## 浏览器说明

PartyKeys / MIDI 功能通常需要 Chrome 或 Edge，并且需要 HTTPS 环境。Netlify 默认提供 HTTPS，所以线上环境适合测试 Web MIDI。
