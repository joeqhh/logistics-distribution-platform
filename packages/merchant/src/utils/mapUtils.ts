
/**
 * 开发环境添加key
 */
export const mapUrlAddedKey = (url: string) => {
    return import.meta.env.MODE === 'development' ? `${url}&key=${import.meta.env.VITE_KEY}&jscode=${import.meta.env.VITE_JSCODE}` : url
}