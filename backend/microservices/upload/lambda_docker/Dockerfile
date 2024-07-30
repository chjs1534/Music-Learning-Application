FROM public.ecr.aws/lambda/python:3.9

ENV NUMBA_CACHE_DIR=/tmp/numba_cache
ENV JOBLIB_MULTIPROCESSING=0

# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install the specified packages
RUN yum -y install gcc-c++ && \
    pip install -r requirements.txt && \
    pip install chord-extractor

# Install libsndfile for librosa library
RUN yum install -y libsndfile && \
    yum clean all && \
    rm -rf /var/cache/yum

COPY ffmpeg ${LAMBDA_TASK_ROOT}

# Copy function code
COPY review.py ${LAMBDA_TASK_ROOT}


# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "review.handler" ]