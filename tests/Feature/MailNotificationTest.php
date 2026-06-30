<?php

use App\Mail\TestSmtpMail;
use App\Models\MailSetting;
use App\Models\Schedule;
use App\Notifications\ScheduleActivityNotification;
use App\Notifications\TestNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

test('users can update email notification preferences', function () {
    $user = regularUser();

    $response = $this->actingAs($user)->patch(route('smtp.preferences.update'), [
        'email_notifications_enabled' => false,
    ]);

    $response->assertRedirect(route('smtp.edit'));

    expect($user->fresh()->email_notifications_enabled)->toBeFalse();
});

test('admins can update mail settings', function () {
    $admin = adminUser();

    $response = $this->actingAs($admin)->patch(route('smtp.update'), [
        'mailer' => 'log',
        'host' => null,
        'port' => 587,
        'username' => null,
        'password' => null,
        'encryption' => 'tls',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $response->assertRedirect(route('smtp.edit'));

    $settings = MailSetting::current();

    expect($settings->mailer)->toBe('log');
    expect($settings->from_address)->toBe('alerts@example.com');
    expect($settings->isConfigured())->toBeTrue();
});

test('admins can update smtp mail settings with password', function () {
    $admin = adminUser();

    $response = $this->actingAs($admin)->patch(route('smtp.update'), [
        'mailer' => 'smtp',
        'host' => 'smtp.example.com',
        'port' => 587,
        'username' => 'smtp-user',
        'password' => 'secret-password',
        'encryption' => 'tls',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $response->assertRedirect(route('smtp.edit'));

    $settings = MailSetting::current()->fresh();

    expect($settings->host)->toBe('smtp.example.com');
    expect($settings->username)->toBe('smtp-user');
    expect($settings->password)->toBe('secret-password');
    expect($settings->isConfigured())->toBeTrue();
});

test('admins can update mail settings without changing password when omitted', function () {
    $admin = adminUser();

    MailSetting::current()->update([
        'mailer' => 'smtp',
        'host' => 'smtp.example.com',
        'port' => 587,
        'username' => 'smtp-user',
        'password' => 'existing-password',
        'encryption' => 'tls',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $response = $this->actingAs($admin)->patch(route('smtp.update'), [
        'mailer' => 'smtp',
        'host' => 'smtp.updated.com',
        'port' => 587,
        'username' => 'smtp-user',
        'password' => null,
        'encryption' => 'tls',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $response->assertRedirect(route('smtp.edit'));

    $settings = MailSetting::current()->fresh();

    expect($settings->host)->toBe('smtp.updated.com');
    expect($settings->password)->toBe('existing-password');
});

test('regular users can access email settings page', function () {
    MailSetting::current()->update([
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
        'mailer' => 'log',
    ]);

    $response = $this->actingAs(regularUser())->get(route('smtp.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/smtp')
        ->where('mailSettings', null)
        ->where('mailConfigured', true)
        ->where('emailNotificationsEnabled', true));
});

test('regular users cannot update mail settings', function () {
    $user = regularUser();

    $response = $this->actingAs($user)->patch(route('smtp.update'), [
        'mailer' => 'log',
        'host' => null,
        'port' => 587,
        'username' => null,
        'password' => null,
        'encryption' => 'tls',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $response->assertForbidden();
});

test('admins can view smtp settings page', function () {
    MailSetting::current()->update([
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
        'mailer' => 'log',
    ]);

    $response = $this->actingAs(adminUser())->get(route('smtp.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/smtp')
        ->where('mailSettings.configured', true)
        ->where('mailSettings.from_address', 'alerts@example.com'));
});

test('email settings page exposes preferences for all users', function () {
    MailSetting::current()->update([
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
        'mailer' => 'log',
    ]);

    $response = $this->actingAs(regularUser())->get(route('smtp.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('mailConfigured', true)
        ->where('emailNotificationsEnabled', true));
});

test('notification settings page no longer includes email preferences', function () {
    $response = $this->actingAs(regularUser())->get(route('notifications.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->missing('emailNotificationsEnabled')
        ->missing('mailConfigured'));
});

test('admins can send a test email when smtp is configured', function () {
    Mail::fake();

    $admin = adminUser();

    MailSetting::current()->update([
        'mailer' => 'log',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $response = $this->actingAs($admin)->post(route('smtp.test'));

    $response->assertRedirect(route('smtp.edit'));

    Mail::assertSent(TestSmtpMail::class, fn (TestSmtpMail $mail) => $mail->hasTo($admin->email));
});

test('admins cannot send test email when smtp is not configured', function () {
    Mail::fake();

    $admin = adminUser();

    MailSetting::current()->update([
        'mailer' => 'smtp',
        'host' => null,
        'from_address' => null,
        'from_name' => 'Overseas',
    ]);

    $response = $this->actingAs($admin)->post(route('smtp.test'));

    $response->assertRedirect(route('smtp.edit'));

    Mail::assertNothingSent();
});

test('regular users can send smtp test email when configured', function () {
    Mail::fake();

    $user = regularUser();

    MailSetting::current()->update([
        'mailer' => 'log',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $response = $this->actingAs($user)->post(route('smtp.test'));

    $response->assertRedirect(route('smtp.edit'));

    Mail::assertSent(TestSmtpMail::class, fn (TestSmtpMail $mail) => $mail->hasTo($user->email));
});

test('notification test does not send email', function () {
    Notification::fake();

    $user = adminUser();

    MailSetting::current()->update([
        'mailer' => 'log',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $this->actingAs($user)->post(route('notifications.test'));

    $notification = Notification::sent($user, TestNotification::class)->first();

    expect($notification)->not->toBeNull();
    expect($notification->via($user))->not->toContain('mail');
});

test('test notification uses mail channel when email is enabled and mail is configured', function () {
    $user = adminUser();

    MailSetting::current()->update([
        'mailer' => 'log',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $notification = new TestNotification;

    expect($notification->via($user))->toContain('mail');
});

test('test notification can include mail when explicitly enabled', function () {
    $user = adminUser();

    MailSetting::current()->update([
        'mailer' => 'log',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $notification = new TestNotification(withEmail: true);

    expect($notification->via($user))->toContain('mail');
});

test('test notification does not use mail channel when email notifications are disabled', function () {
    $user = adminUser();
    $user->update(['email_notifications_enabled' => false]);

    MailSetting::current()->update([
        'mailer' => 'log',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $notification = new TestNotification;

    expect($notification->via($user->fresh()))->not->toContain('mail');
});

test('test notification does not use mail channel when mail is not configured', function () {
    $user = adminUser();

    MailSetting::current()->update([
        'mailer' => 'smtp',
        'host' => null,
        'from_address' => null,
        'from_name' => 'Overseas',
    ]);

    $notification = new TestNotification;

    expect($notification->via($user))->not->toContain('mail');
});

test('authenticated users can send a test notification that includes mail when configured', function () {
    Notification::fake();

    $user = adminUser();

    MailSetting::current()->update([
        'mailer' => 'log',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $response = $this->actingAs($user)->post(route('notifications.test'));

    $response->assertRedirect();

    Notification::assertSentTo($user, TestNotification::class);
});

test('schedule activity notification uses mail channel when configured', function () {
    $admin = adminUser();
    $user = regularUser();
    $schedule = Schedule::factory()->create();

    MailSetting::current()->update([
        'mailer' => 'log',
        'from_address' => 'alerts@example.com',
        'from_name' => 'Overseas',
    ]);

    $notification = new ScheduleActivityNotification($schedule, $user, 'created');

    expect($notification->via($admin))->toContain('mail');
});
