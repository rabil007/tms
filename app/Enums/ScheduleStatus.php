<?php

namespace App\Enums;

enum ScheduleStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
}
