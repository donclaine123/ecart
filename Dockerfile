FROM php:8.4-cli-alpine

# Install PostgreSQL client dev packages & system utilities
RUN apk add --no-cache libpq-dev zip unzip git curl \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy backend files specifically
COPY backend/ .

# Install production PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-req=php

# Permissions for Laravel storage & cache
RUN chmod -R 777 storage bootstrap/cache

# Render automatically sets $PORT
EXPOSE 10000

CMD sh -c "php -S 0.0.0.0:\${PORT:-10000} server.php"
