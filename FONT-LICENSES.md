# Bundled font licensing

This package bundles web-font subsets of **霞鹜文楷 / LXGW WenKai** as
`assets/fonts/lxgwwenkai-regular-subset-*.woff2` and declares them in
`assets/font.css`. The plugin's own code and icon are MIT licensed (see
[LICENSE](LICENSE)); the font software keeps its own license below.

## LXGW WenKai (霞鹜文楷)

- Upstream project: <https://github.com/lxgw/LxgwWenKai>
- Copyright: Copyright 2020-2024 LXGW (<https://github.com/lxgw>)
- Version bundled: v1.250 (the version shipped by the packaging package below)
- License: SIL Open Font License, Version 1.1. The complete license text ships
  byte-for-byte as [assets/fonts/OFL.txt](assets/fonts/OFL.txt).

### Source and modifications

The subset files were obtained from the npm package
[`lxgw-wenkai-webfont@1.7.0`](https://www.npmjs.com/package/lxgw-wenkai-webfont)
by Chawye Hsu, whose packaging is MIT licensed:

- Registry tarball: `https://registry.npmjs.org/lxgw-wenkai-webfont/-/lxgw-wenkai-webfont-1.7.0.tgz`
- The downloaded tarball's SHA-1 was checked against the registry's published
  `dist.shasum`: `72ef4ef9d00fd185a2ed8898d1a60f73ab732f97`.
- Only the **Regular (400)** weight's subset files are bundled; Light, Medium,
  Bold, and the Mono variants are not.
- The `.woff2` subset files are copied **byte-for-byte**. The font outlines,
  glyph names, and internal names are unchanged, so the reserved font name
  "LXGW WenKai" is not used by a modified derivative.
- The only modification is to the CSS packaging: the upstream `@font-face`
  `src` list is rebuilt so an installed system copy of the font is tried first
  (`local("LXGW WenKai")`, `local("LXGWWenKai-Regular")`,
  `local("霞鹜文楷")`), and the packaged subset URL comes after it. The upstream
  `unicode-range` values are preserved verbatim.

### Redistribution requirements

The SIL Open Font License requires the copyright notice and the complete
license text to accompany redistributed copies of the font software. Keep
[assets/fonts/OFL.txt](assets/fonts/OFL.txt) with the bundled `.woff2` files when
copying, publishing, or redistributing this package.
