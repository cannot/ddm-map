#docker build --no-cache -t wlmapro-map:1.0 .
#docker image push wlmapro-map:1.0
#docker save --output wlmapro-map.tar wlmapro-map:1.0
#docker load --input wlmapro-map.tar
#docker run -d -p 8083:12010 --restart=always  wlmapro-map:1.0
FROM node:latest

# set working directory
RUN mkdir -p /wlmapro-map

# install and cache wlmapro-map dependencies
ENV PATH /wlmapro-map/node_modules/.bin:$PATH
WORKDIR /wlmapro-map

COPY . /wlmapro-map

# Bind to all network interfaces so that it can be mwlmapro-maped to the host OS
ENV HOST=0.0.0.0 PORT=12010

EXPOSE ${PORT}
CMD ["npm", "start"]