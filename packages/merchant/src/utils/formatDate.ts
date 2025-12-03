export function formatLocalDateTime(isoStr: string) {
  const d = new Date(isoStr)
  const pad = (n: number) => String(n).padStart(2, '0')

  //   return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 `
  //        + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 `
}

export function localeStringDate(date: string) {
  return new Date(date).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
}
