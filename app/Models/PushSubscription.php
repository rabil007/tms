<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use NotificationChannels\WebPush\PushSubscription as WebPushSubscription;

/**
 * @property int $id
 * @property string $subscribable_type
 * @property int $subscribable_id
 * @property string $endpoint
 * @property string|null $public_key
 * @property string|null $auth_token
 * @property string|null $content_encoding
 * @property string|null $user_agent
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class PushSubscription extends WebPushSubscription
{
    //
}
