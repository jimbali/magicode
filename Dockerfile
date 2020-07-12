FROM php:7.4-apache

RUN apt-get update
RUN apt-get install -y zip

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

RUN curl -sS https://getcomposer.org/installer | php -- \
                                                     --install-dir=/usr/bin \
                                                     --filename=composer

COPY ./magicode.co.uk /var/www/html/

WORKDIR /var/www/html/

RUN composer install

COPY ./exttest.magicode.co.uk /var/www/exttest.magicode.co.uk/
COPY ./apache/exttest.magicode.co.uk.conf /etc/apache2/sites-available/

RUN a2ensite exttest.magicode.co.uk
