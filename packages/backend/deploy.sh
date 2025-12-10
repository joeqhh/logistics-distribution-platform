docker build -t logistics-platform-backend-image ./ -f Dockerfile
docker rm -f logistics-platform-backend
docker run --name=logistics-platform-backend -itd -p 3001:3001 --env-file .env --network=logistics-platform-nwtwork logistics-platform-backend-image