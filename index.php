<?php

/**
 * Shared-hosting entry point when the web root is the project directory
 * instead of the public/ folder. Requests are forwarded to public/index.php.
 */
require __DIR__.'/public/index.php';
