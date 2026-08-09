FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY pages /usr/share/nginx/html/pages
COPY assets /usr/share/nginx/html/assets

# voxvaani-style publish dir marker (Coolify serves /out)
RUN mkdir -p /out && cp -r /usr/share/nginx/html/* /out/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
