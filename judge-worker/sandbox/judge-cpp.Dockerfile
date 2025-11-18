FROM gcc:12-alpine

RUN apk add --no-cache bash coreutils \
    && rm -rf /var/cache/apk/* \
    && adduser -D -h /sandbox judgeuser

USER judgeuser
WORKDIR /sandbox