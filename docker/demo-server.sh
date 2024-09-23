docker compose -f compose-demo-server.yaml build --build-arg ARCH=amd64 --no-cache --parallel=1 && \

docker compose -f compose-demo-server.yaml up -d