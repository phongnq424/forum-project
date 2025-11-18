FROM python:3.11-alpine

RUN apk add --no-cache bash coreutils \
    && adduser -D -h /sandbox judgeuser

USER judgeuser
WORKDIR /sandbox