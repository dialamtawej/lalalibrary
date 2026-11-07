<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>تسجيل حساب جديد</title>
    <style>
        body { font-family: sans-serif; margin: 40px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; box-sizing: border-box; }
        .error { color: red; font-size: 14px; }
        button { padding: 10px 15px; background: #0d6efd; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>

    <h2>إنشاء حساب جديد</h2>

    <form method="POST" action="{{ route('register') }}">
        @csrf <!-- حماية CSRF حتمية لجميع فورمات POST -->

        <div class="form-group">
            <label>الاسم الكامل:</label>
            <input type="text" name="name" value="{{ old('name') }}" required>
            @error('name') <div class="error">{{ $message }}</div> @enderror
        </div>

        <div class="form-group">
            <label>البريد الإلكتروني:</label>
            <input type="email" name="email" value="{{ old('email') }}" required>
            @error('email') <div class="error">{{ $message }}</div> @enderror
        </div>

        <div class="form-group">
            <label>كلمة السر:</label>
            <input type="password" name="password" required>
            @error('password') <div class="error">{{ $message }}</div> @enderror
        </div>

        <div class="form-group">
            <label>تأكيد كلمة السر:</label>
            <input type="password" name="password_confirmation" required>
        </div>

        <button type="submit">تسجيل الحساب</button>
    </form>

</body>
</html>