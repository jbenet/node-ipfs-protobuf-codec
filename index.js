var map = require('map-values')
var protobuf = require('protobufjs')
var segment = require('pipe-segment')
var protobufStream = require('protobufjs-stream')
var transDuplex = require('duplex-transform')
var duplexer2 = require('duplexer2')

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

// must implement
Codec.prototype.createPipeSegment = function() {
  var self = this

  var encode = this.createEncodeStream()
  var decode = this.createDecodeStream()

  return segment({
    decoded: duplexer2(encode, decode),
    encoded: duplexer2(decode, encode),
  })
}

Codec.fromProtoSrc = function(src) {
  var result = protobuf.loadProto(src).result
  var protos = filter(result.messages || result)
  return map(protos, Codec)
}

function filter(inp) {
  var out = {}
  for (var p in inp) {
    if (typeof(inp[p]) === 'function')
      out[p] = inp[p]
  }
  return out
}
