docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres


docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.digitalocean.com/lhotan-registry/stl-gallery:latest --no-cache -f ../Dockerfile .