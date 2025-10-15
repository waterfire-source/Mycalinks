# ----------
# Web server
# ----------
FROM public.ecr.aws/docker/library/nginx:1.26.0-alpine as builder

RUN rm -f /etc/nginx/conf.d/*

COPY ./copilot/pos-web-app/sidecars/nginx/default.local.conf /etc/nginx/conf.d/default.conf

WORKDIR /var/www/html

EXPOSE 80


FROM builder as production
COPY ./copilot/pos-web-app/sidecars/nginx/default.production.conf /etc/nginx/conf.d/default.conf

# デーモンはoffで
CMD ["nginx", "-g", "daemon off;"]