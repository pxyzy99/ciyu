# 词屿 · 四六级手机背词

词屿是一个安静、轻量的手机端英语背词网站，包含大学英语四级与六级两个独立版本。

整个项目使用原生 HTML、CSS 和 JavaScript 构建，不需要后端、数据库或联网接口。词库、字体和页面资源均随站点一同分发，打开浏览器即可使用。

## 两个版本

| 版本 | 词条数量 | 入口 |
| --- | ---: | --- |
| 四级 CET-4 | 1398 | [`cet4-mobile/index.html`](cet4-mobile/index.html) |
| 六级 CET-6 | 2697 | [`cet6-mobile/index.html`](cet6-mobile/index.html) |

两个版本使用不同的学习记录键名，进度互不覆盖。

## 功能

- 今日学习：30 词、50 词或 1–200 词的自定义目标
- 卡片回想、英译中、中译英、拼写挑战与混合练习
- 全词库搜索，可按学习状态筛选
- 易错本、熟悉度统计与学习偏好记录
- 随机、A–Z、最易错和最近学习等排序方式
- 手机优先的单列布局与全屏答题界面
- 学习数据保存在浏览器 `localStorage`，不会上传到服务器

## 本地运行

可以直接双击各版本目录中的 `index.html`。如果浏览器限制了本地文件访问，也可以在当前目录启动一个静态服务器：

```bash
python -m http.server 8000
```

然后访问：

- `http://localhost:8000/cet4-mobile/`
- `http://localhost:8000/cet6-mobile/`

## GitHub Pages

仓库根目录已经包含总入口 `index.html`。在 GitHub 仓库的 **Settings → Pages** 中选择从 `main` 分支根目录发布即可。

发布后的地址通常为：

```text
https://<GitHub 用户名>.github.io/<仓库名>/
```

## 目录结构

```text
.
├── index.html
├── cet4-mobile/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── mobile.css
│   ├── README.md
│   ├── assets/fonts/
│   └── data/
└── cet6-mobile/
    ├── index.html
    ├── app.js
    ├── styles.css
    ├── mobile.css
    ├── README.md
    ├── assets/fonts/
    └── data/
```

## 数据说明

- 四级词库共 1398 个不重复词条。
- 六级词库共 2697 个词条。
- 词条释义参考 ECDICT 数据整理。
- 如果词库、音标或释义有误，欢迎提交 Issue 或 Pull Request。

## 字体与第三方资源

项目内嵌的字体和词库来源说明见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。

## 许可证

项目代码以 [MIT License](LICENSE) 开源。
