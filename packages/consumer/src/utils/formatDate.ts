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


export function formatTimeDiff(targetTime: string) {
  const now = Date.now();
  const target = new Date(targetTime).getTime();
  const diffMs = target - now;

  // 小时差（可能为负）
  const diffHours = diffMs / (1000 * 60 * 60);

  // 向下取整小时
  const hours = Math.floor(diffHours);

  if (hours >= 1) {
    return `${hours}小时`;
  } else {
    // 小时 < 1，则计算分钟（向下取整）
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes}分钟`;
  }
}
