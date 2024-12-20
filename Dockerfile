#Creating a new image on top of existing nodejs environment image from dockerhub
FROM node:22-alpine

#Setting the working directory for a new environment
WORKDIR /app

#Copying the app files to the new environment folder

#Copying package.json and package-lock.json first to then install needed dependencies
# . means that we are copying from the same path as dockerfile
COPY package*.json .

#Installing the needed dependencies (copying it separately to not run npm install again when
# we change something in a codebase and then build new image - performance boost)
RUN npm install

#Copying the rest of the files (. - root folder of the app and root folder for docker environment(/app))
COPY . .

#Exposing a port for environment to listen to
EXPOSE 9000

#Defining command to run the app inside the new environment
CMD ["node", "./src/server.js"]