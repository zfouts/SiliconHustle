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
# Sanitize GIT_COMMIT to prevent sed command injection (allow only hex chars)
RUN SAFE_COMMIT=$(printf '%s' "${GIT_COMMIT}" | tr -cd 'a-f0-9A-F') && \
    if [ -z "${SAFE_COMMIT}" ]; then SAFE_COMMIT="unknown"; fi && \
    sed -i "s|Silicon Hustle is a fictional game.|Silicon Hustle is a fictional game. Build: ${SAFE_COMMIT}|" /usr/share/nginx/html/index.html

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO /dev/null http://localhost:80/ || exit 1

EXPOSE 80
