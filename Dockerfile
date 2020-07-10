FROM php:7.4-apache
COPY ./magicode.co.uk /var/www/html/
COPY ./exttest.magicode.co.uk /var/www/exttest.magicode.co.uk/
COPY ./apache/exttest.magicode.co.uk.conf /etc/apache2/sites-available/
RUN a2ensite exttest.magicode.co.uk
