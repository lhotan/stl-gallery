FROM node:18

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install curl gnupg -y \
  && apt-get update \
  && apt-get install chromium -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY .  .
RUN yarn install

EXPOSE 8080

CMD [ "node", "index.js" ]