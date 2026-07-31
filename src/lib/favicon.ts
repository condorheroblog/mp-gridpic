/**
 * favicon 资源 URL - 直接拼接 Vite 的 base 路径,
 * 兼容子路径部署 (例如 GitHub Pages base = /mp-gridpic/),
 * 避免硬编码 /favicon.svg 在非根路径下出现 404。
 */
export const FAVICON_URL: string = `${import.meta.env.BASE_URL}favicon.svg`;
