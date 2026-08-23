# درگاه پرداخت گروه جهادی بسیج — ایمیج سرویس استاتیک
# ---
# Basij payment portal — static site serving image

FROM nginx:1.27-alpine

# حذف صفحهٔ پیش‌فرض و افزودن پیکربندی سفارشی
# Remove the default page and add the custom configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# کپی دارایی‌های سایت
# Copy site assets
COPY . /usr/share/nginx/html/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
