var fs = require('fs')
var log = console.log
var src = fs.readFileSync(__dirname + '/test.proto', 'utf-8')
var protobuf = require('./')
var Foo = protobuf.fromProtoSrc(src).Foo
var PassThrough = require('stream').PassThrough

// en/decode
var buf = Foo.encode({text: "Hello World"})
log(buf)
log(Foo.decode(buf))

// make en/decode streams
var stream1 = Foo.createEncodeStream()
stream1.write({text: "Foo"})
log(stream1.read())

var stream2 = Foo.createDecodeStream()
stream2.on('data', console.log)
stream1.pipe(stream2)
stream1.write({text: "Bar"})
stream1.write({text: "Baz"})

// wrap an encoded duplex stream with duplex en/decoding
var encodedWireStream = PassThrough()
var stream3 = Foo.wrapDuplexStream(encodedWireStream)
stream3.on('data', console.log)
stream3.write({text: "Boz"})

// pipe segment with en/decoding
var encodedWireStream2 = PassThrough()
var stream4 = Foo.createPipeSegment()
stream4.encoded.pipe(encodedWireStream2).pipe(stream4.encoded)
stream4.decoded.on('data', console.log)
stream4.decoded.write({text: "Boz"})
