protoc -I ./proto \
  --plugin=protoc-gen-ts_proto=.\\node_modules\\.bin\\protoc-gen-ts_proto.cmd \
  --ts_proto_out=.\\ \
  --proto_path=.\\proto\\foxglove \
  .\\proto\\foxglove\\*.proto
