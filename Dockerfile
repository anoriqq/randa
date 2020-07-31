FROM alpine:latest as builder

RUN apk update && \
    apk add --no-cache \
      curl \
      go \
      upx \
      nodejs \
      yarn

RUN mkdir /gobin
ENV GOBIN /gobin
ENV PATH $PATH:/gobin
ADD ./ /usr/src/randa
WORKDIR /usr/src/randa
RUN go build -ldflags "-s -w"
RUN go get github.com/pwaller/goupx
RUN goupx randa
RUN yarn install && \
    yarn run build

FROM alpine:latest as runner
RUN apk add --no-cache libc6-compat
COPY --from=builder /usr/src/randa/randa ./
COPY --from=builder /usr/src/randa/dist ./dist
COPY --from=builder /usr/src/randa/public ./public
EXPOSE 8000
CMD GIN_MODE=release ./randa
