I have this crazy idea to generate map tiles in the browser.

Why? I think it would be nice to generate tiles on demand easily based on an extract of OSM data. Then anyone could very easily generate some map tiles to self-host or use a tool to experiment with tile generation without setting up more complicated programs. This would be especially helpful for looking at older snapshots of data.

I looked into a few tools, but each has challenges:
- planetiler - Nope, because it requires Java 21. See [this issue](https://github.com/onthegomap/planetiler/issues/1138).
- [sequentially-generate-planet-mbtiles](https://github.com/lambdajack/sequentially-generate-planet-mbtiles) - No, because it requires Docker.

So I'm trying to get tilemaker running in the browser.

Unfortunately, I have no experience with compiling C++ programs, so I've been flying blind and trying to use Claude to help me get through it.

I've gotten stuck with this issue for a while now:

```
/Users/rayberger/testmap/boost_1_87_0/boost/asio/detail/signal_blocker.hpp:27:3: error: Only Windows and POSIX are supported!
   27 | # error Only Windows and POSIX are supported!
      |   ^
In file included from src/geojson_processor.cpp:4:
In file included from /Users/rayberger/testmap/boost_1_87_0/boost/asio/thread_pool.hpp:20:
In file included from /Users/rayberger/testmap/boost_1_87_0/boost/asio/detail/scheduler.hpp:239:
In file included from /Users/rayberger/testmap/boost_1_87_0/boost/asio/detail/impl/scheduler.ipp:28:
/Users/rayberger/testmap/boost_1_87_0/boost/asio/detail/io_uring_service.hpp:22:10: fatal error: 'liburing.h' file not found
   22 | #include <liburing.h>
      |          ^~~~~~~~~~~~
2 errors generated.
make: *** [src/geojson_processor.o] Error 1
```
It seems that compiling Boost to work with Emscripten is not going well.

If anyone happens to see this and is familiar with these toolchains and wants to help, I would greatly appreciate it.

# What I've tried so far

## Compile Boost
```
curl -O "https://archives.boost.io/release/1.87.0/source/boost_1_87_0.tar.gz"
tar -xzvf boost_1_87_0.tar.gz
cd boost_1_87_0/
rm -r stage
./b2 toolset=emscripten link=static threading=multi runtime-link=static \
    --with-program_options --with-filesystem --with-system \
    -j8 \
    define=BOOST_ASIO_DISABLE_STD_ALIGNED_ALLOC \
    define=BOOST_ASIO_DISABLE_EPOLL \
    define=BOOST_ASIO_HAS_POSIX_STREAM_DESCRIPTOR=0 \
    define=BOOST_ASIO_DISABLE_SIGNAL \
    define=BOOST_ASIO_HAS_IO_URING=0 \
    define=BOOST_ASIO_DISABLE_EVENTFD \
    define=BOOST_ASIO_HAS_FILE=0 \
    define=BOOST_ASIO_HAS_PIPE=0 \
    define=BOOST_ASIO_HAS_LOCAL_SOCKETS=0 \
    define=BOOST_ASIO_HAS_SIGNAL=0 \
    define=BOOST_ASIO_NO_SIGNAL_BLOCKING=1 \
    define=BOOST_ASIO_DISABLE_IO_URING \
    define=BOOST_ASIO_HAS_IO_URING=0 \
    stage
```

## Update Makefile
See the recent commit to the Makefile on my branch.

```
make clean
BOOST_ROOT=./boost_1_87_0 make web CXX=em++ CC=emcc
```

## Installing SQLite for Emscripten

`embuilder build sqlite3`

# Additional Links

I posted in the WebAssembly Discord [here](https://discord.com/channels/453584038356058112/590215642444202044/1324266418874748979) to see if anyone could point me in the right direction.

I also created an issue on the tilemaker GitHub [here](https://github.com/systemed/tilemaker/issues/790).
