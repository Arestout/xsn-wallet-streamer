FROM ubuntu:18.04 as stage
ARG XSN_VERSION="1.0.28"

WORKDIR /xsncore
ADD https://github.com/X9Developers/XSN/releases/download/v${XSN_VERSION}/xsn-${XSN_VERSION}-x86_64-linux-gnu.tar.gz . 
# ADD https://github.com/X9Developers/XSN/releases/download/v${XSN_VERSION}/bootstrap.zip .

RUN tar xfvz xsn-${XSN_VERSION}-x86_64-linux-gnu.tar.gz \
    && rm xsn-${XSN_VERSION}-x86_64-linux-gnu.tar.gz
    # && apt-get update \
    # && apt-get install unzip \
    # && unzip bootstrap.zip

# COPY xsn.conf .

FROM ubuntu:18.04 as release
ARG MAINNET_PORT="8332"
ARG XSN_VERSION="1.0.28"


COPY --from=stage /xsncore/xsn-${XSN_VERSION}/bin/xsnd /usr/bin/
COPY --from=stage /xsncore/xsn-${XSN_VERSION}/bin/xsn-cli /usr/bin/
COPY --from=stage /xsncore/xsn-${XSN_VERSION}/include/xsn* /usr/include/
# COPY --from=stage /xsncore/bootstrap.dat /root/.xsncore/
COPY xsn.conf /root/.xsncore/

EXPOSE $MAINNET_PORT

CMD ["/usr/bin/xsnd", "-conf=/root/.xsncore/xsn.conf", "-rest=1", "-server=1", "-printtoconsole", "-txindex=1"]






















# FROM ubuntu:18.04
# ARG DEFAULT_PORT="62583"
# ARG MAINNET_PORT="8332"
# ARG XSN_VERSION="1.0.26"

# WORKDIR /xsncore
# ADD https://github.com/X9Developers/XSN/releases/download/v${XSN_VERSION}/xsn-${XSN_VERSION}-x86_64-linux-gnu.tar.gz . 
# ADD https://github.com/X9Developers/XSN/releases/download/v${XSN_VERSION}/bootstrap.zip .

# RUN tar xfvz xsn-${XSN_VERSION}-x86_64-linux-gnu.tar.gz && rm xsn-${XSN_VERSION}-x86_64-linux-gnu.tar.gz


# RUN cp xsn-${XSN_VERSION}/bin/xsnd /usr/bin/ \
#     && cp xsn-${XSN_VERSION}/bin/xsn-cli /usr/bin/ \
#     && cp xsn-${XSN_VERSION}/include/xsn* /usr/include/ \
#     && chmod 777 /usr/bin/xsn* \
#     && rm -r xsn-${XSN_VERSION}/ \
#     && apt-get install unzip

# COPY xsn.conf /usr/bin/

# # VOLUME [ "/home/xsn/.xsncore" ]

# EXPOSE $DEFAULT_PORT $MAINNET_PORT

# CMD ["/usr/bin/xsnd", "-conf=/usr/bin/xsn.conf", "-rest=1", "-server=1", "-printtoconsole", "-txindex=1"]
