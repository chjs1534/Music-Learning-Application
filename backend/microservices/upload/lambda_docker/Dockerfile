FROM public.ecr.aws/lambda/python:3.7.2021.05.04.14

ENV NUMBA_CACHE_DIR=/tmp/numba_cache
# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# libsndfile
# RUN curl -o libsndfile-1.0.28-alt1.x86_64.rpm http://ftp.altlinux.org/pub/distributions/ALTLinux/Sisyphus/x86_64/RPMS.classic//libsndfile-1.0.28-alt1.x86_64.rpm 
# RUN curl -o libsndfile-devel-1.0.28-alt1.x86_64.rpm http://ftp.altlinux.org/pub/distributions/ALTLinux/Sisyphus/x86_64/RPMS.classic//libsndfile-devel-1.0.28-alt1.x86_64.rpm
# #ffmpeg
# RUN curl -o ffmpeg-4.4-alt5.x86_64.rpm  http://ftp.altlinux.org/pub/distributions/ALTLinux/Sisyphus/x86_64/RPMS.classic//ffmpeg-4.4-alt5.x86_64.rpm 

# RUN yum localinstall \
#     libsndfile-devel-1.0.28-alt1.x86_64.rpm \
#     ffmpeg-4.4-alt5.x86_64.rpm

RUN curl -o libsndfile-1.2.2.tar.xz https://github.com/libsndfile/libsndfile/releases/download/1.2.2/libsndfile-1.2.2.tar.xz
RUN yum -y install xz
RUN tar -xvf libsndfile-1.2.2.tar.xz
RUN cd libsndfile-1.2.2
RUN ./configure
RUN ./configure --prefix=/usr    \
    --docdir=/usr/share/doc/libsndfile-1.2.2 && \
    make
RUN make install
RUN cd ..
# Install the specified packages
RUN yum -y install gcc-c++ && \
    pip install -r requirements.txt && \
    pip install chord-extractor

# Copy function code
COPY review.py ${LAMBDA_TASK_ROOT}

COPY ffmpeg ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "review.handle" ]