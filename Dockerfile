FROM oven/bun:latest

RUN apt-get update && apt-get install -y \
    openssh-client \
    git

RUN mkdir -p /root/.ssh

RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

RUN rm -rf /var/lib/apt/lists/*

WORKDIR /app

CMD ["bun", "run", "dev"]