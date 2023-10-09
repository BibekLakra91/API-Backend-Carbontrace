#FROM ubuntu:latest
FROM node:18.7.0

WORKDIR /home/co2-api
# Creating folders, and files for a project:
COPY . .

#RUN apt update && \
#    echo "Y" | apt install nodejs && \
#    echo "Y" | apt install npm && \
#    npm install --global yarn

RUN yarn install
