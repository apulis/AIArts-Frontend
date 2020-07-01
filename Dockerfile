FROM nginx:alpine
# configure ports and listeners with custom nginx.conf
RUN rm /etc/nginx/conf.d/default.conf
ADD default.conf /etc/nginx/conf.d/

# copy from dist to nginx root dir
COPY dist/ /usr/share/nginx/html

ADD start.sh /

RUN chmod +x /start.sh
# expose port 6511
EXPOSE 6511
# run nginx in foreground
ENTRYPOINT ./start.sh

