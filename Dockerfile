FROM nginx:alpine

ARG GIT_COMMIT=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="Silicon Hustle"
LABEL org.opencontainers.image.description="A modernized Dope Wars style trading game"
LABEL org.opencontainers.image.source="https://github.com/zfouts/SiliconHustle"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy game files
COPY index.html style.css main.js robots.txt /usr/share/nginx/html/
COPY data/ /usr/share/nginx/html/data/
COPY systems/ /usr/share/nginx/html/systems/
COPY ui/ /usr/share/nginx/html/ui/

# Inject git commit into the footer at build time
RUN sed -i "s|Silicon Hustle is a fictional game.|Silicon Hustle is a fictional game. Build: ${GIT_COMMIT}|" /usr/share/nginx/html/index.html

EXPOSE 80
