# درگاه پرداخت گروه جهادی بسیج — ایمیج سرویس استاتیک
# ---
# Basij payment portal — static site serving image

FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json ./
COPY scripts ./scripts
COPY 404.html cards-form.html cards-scripts.js cards-styles.css index.html payment-form.html payment-scripts.js payment-styles.css robots.txt sitemap.xml ./
COPY assets ./assets
COPY fonts ./fonts
COPY images ./images
COPY src ./src

ARG SITE_ORIGIN
ENV SITE_ORIGIN=${SITE_ORIGIN}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

# Custom configuration replaces the image default (already listening on 8080).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the prepared public site into the final image.
COPY --from=builder /app/site/ /usr/share/nginx/html/

# اجرای سرویس با کاربر بدون‌امتیاز (UID 101)
# Service runs as the unprivileged nginx user (UID 101)
USER nginx

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
