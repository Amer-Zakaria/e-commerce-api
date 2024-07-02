FROM node:16

# copy from local project to Docker Container File System(DCFS) inside of the top-leve /tmp
ADD package.json /tmp/package.json

ADD package-lock.json /tmp/package-lock.json

# will start a shell session 
# it runs inside of /src in DCFS, remove recursivly dist(everything inside of the folder)
RUN rm -rf dist

# it runs in /src (whereas you can cd within docker by specifing the top-level folder like /tmp)
# the cd is specific for the current RUN
RUN cd /tmp && npm i

# will neglect ignored file and folders
ADD ./ /src 

RUN cp -a /tmp/node_modules /src/

# all subsequent commands will be running inside of /src, like the CMD one
WORKDIR /src

RUN npm run build 

ENV NODE_ENV=production

# wouldn't start a shell session 
CMD ["node", "./dist/src/index.js"]