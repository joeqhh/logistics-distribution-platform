# 使用 Node 镜像作为基础镜像
FROM node:22.16.0

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml 文件
COPY package*.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装项目依赖
RUN pnpm install

# 复制项目源代码到容器内
COPY . .

# 生成 Prisma 客户端（如果你使用 Prisma）
RUN npx prisma generate --schema=./prisma/schema.prisma

# 编译 TypeScript 代码
RUN npx tsc

# 暴露应用端口
EXPOSE 3001

# 启动命令（运行编译后的 JavaScript 代码）
CMD ["node", "dist/app.js"]
