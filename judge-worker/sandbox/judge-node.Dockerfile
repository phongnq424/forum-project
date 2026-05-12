FROM node:20-alpine

RUN apk add --no-cache bash curl coreutils

# Cài sẵn dependency whitelist trong folder không tên node_modules
WORKDIR /opt/judge-deps

RUN npm init -y \
 && npm install express@4.18.2 cors@2.8.5 joi@17.13.3 bcryptjs@2.4.3 jsonwebtoken@9.0.2 --omit=dev --no-audit --no-fund

ENV NODE_PATH=/opt/judge-deps/node_modules

RUN adduser -D -h /sandbox judgeuser

WORKDIR /sandbox
RUN chown -R judgeuser:judgeuser /sandbox

COPY runner/run-node-server.sh /runner/run-node-server.sh
COPY runner/api-test-runner.cjs /runner/api-test-runner.cjs

RUN chmod +x /runner/run-node-server.sh

USER judgeuser

CMD ["sleep", "infinity"]