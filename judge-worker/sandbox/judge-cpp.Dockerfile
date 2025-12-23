FROM gcc:12

RUN apt-get update && apt-get install -y \
    coreutils \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /sandbox

RUN useradd -m judgeuser
USER judgeuser
