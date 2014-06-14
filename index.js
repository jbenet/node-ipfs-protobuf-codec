var map = require('map-values')
var protobuf = require('protobufjs')
var protobufStream = require('protobufjs-stream')
var transDuplex = require('duplex-transform')

module.exports = Codec

// Simple codec example
// protocol buffers (using protobufjs-stream)
function Codec(pbSchema) {
  if (!(this instanceof Codec))
    return new Codec(pbSchema)

  this.schema = protobufStream(pbSchema)
}

// must implement
Codec.prototype.encode = function(msg) {
  return this.schema.encode(msg)
}

// must implement
Codec.prototype.decode = function(buf) {
  return this.schema.decode(buf)
}

// must implement
Codec.prototype.createEncodeStream = function() {
  return this.schema.createEncodeStream()
}

// must implement
Codec.prototype.createDecodeStream = function() {
  return this.schema.createDecodeStream()
}

// must implement
Codec.prototype.wrapDuplexStream = function(stream) {
  var self = this
  return transDuplex.obj(encode, stream, decode)

  function encode(item, enc, next) {
    this.push(self.encode(item))
    next()
  }

  function decode(item, enc, next) {
    this.push(self.decode(item))
    next()
  }
}

Codec.fromProtoSrc = function(src) {
  var result = protobuf.loadProto(src).result
  var protos = result.messages || result
  return map(protos, Codec)
}
