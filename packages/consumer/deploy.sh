docker build -t logistics-platform-consumer-frontend-image ./ -f Dockerfile
docker rm -f logistics-platform-consumer-frontend
docker run --name=logistics-platform-consumer-frontend -itd  -p 80:80 --network=logistics-platform-nwtwork logistics-platform-consumer-frontend-image