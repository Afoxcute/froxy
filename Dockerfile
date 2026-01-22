FROM node:20-alpine

WORKDIR /usr/src/app

# STEP 1 Debug: Show build context contents
RUN echo "=== Build Context Contents ==="
RUN ls -la

# STEP 2 Copy package.json
COPY backend/package.json ./

# STEP 3 Debug: Show after package.json copy
RUN echo "=== After package.json copy ==="
RUN ls -la

# STEP 4 Install dependencies
RUN npm install

# STEP 5 Copy backend directory
COPY backend/ ./

# STEP 6 Debug: Show final contents
RUN echo "=== Final Contents ==="
RUN ls -la

EXPOSE 8080

CMD ["npm", "start"]
