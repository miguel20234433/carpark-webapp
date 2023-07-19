# Carpark Web App

The code fetches car park availability data from the API, processes it, and displays the car park information on the webpage. It repeats this process every minute to keep the data up-to-date with the latest information.


## Docker Build

```
1. docker build -t carpark_web_app .
2. docker run -d -p 8080:80 carpark_web_app
```
Site URL : [localhost:8080](http://localhost:8080)
