# Use an official Python runtime as a parent image
FROM node:12

WORKDIR /src


# Install any needed packages specified in requirements.txt
COPY package*.json ./

RUN npm install

COPY ./src .

# Make port 80 available to the world outside this container
EXPOSE 80

# Run app.py when the container launches
CMD [ "node", "Index.js" ]