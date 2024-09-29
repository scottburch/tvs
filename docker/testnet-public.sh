docker compose -f compose-demo-public.yaml build --build-arg ARCH=amd64 --no-cache --parallel=1 && \

docker compose -f compose-demo-public.yaml down && \
docker compose -f compose-demo-public.yaml up -d