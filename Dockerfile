# build environment
FROM node:14-alpine as react-build

ENV WDR=/app
# working directory in container
WORKDIR ${WDR}

# copy the package.json into the container
COPY package.json ${WDR}
COPY . ${WDR}

# install all dependencies
RUN yarn

# run the start command
CMD ["npm", "start"]