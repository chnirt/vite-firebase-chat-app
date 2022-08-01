# https://blog.baudson.de/blog/stop-and-remove-all-docker-containers-and-images

FROM nginx:stable-alpine

COPY dist/ /usr/share/nginx/html