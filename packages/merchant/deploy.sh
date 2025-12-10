docker build -t logistics-platform-merchant-frontend-image ./ -f Dockerfile
docker rm -f logistics-platform-merchant-frontend
docker run --name=logistics-platform-merchant-frontend -itd  -p 8081:80 --network=logistics-platform-nwtwork logistics-platform-merchant-frontend-image