FROM alpine:3.19

RUN apk add --no-cache sqlite bash

RUN adduser -D judgeuser

WORKDIR /sandbox
RUN chown -R judgeuser:judgeuser /sandbox

COPY runner/run-sql.sh /runner/run-sql.sh
RUN chmod +x /runner/run-sql.sh

USER judgeuser

CMD ["sleep","infinity"]