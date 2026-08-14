# سامانه آنلاین صدور و مدیریت فاکتور (Faktor Online)

## Overview (نمای کلی پروژه)
سامانه تحت وب مدرن، کاملاً کلاینت‌ساید (بدون نیاز به سرور و دیتابیس) و ریسپانسیو برای صدور، شخصی‌سازی، پیش‌نمایش و مدیریت فاکتورهای رسمی و غیررسمی به زبان فارسی. این سامانه با رعایت کامل استانداردهای چیدمان راست‌به‌چپ (RTL)، تایپوگرافی اصیل با فونت وزیرمتن (Vazirmatn)، تقویم شمسی و تبدیل هوشمند اعداد به حروف و ارقام فارسی پیاده‌سازی شده است.

---

## Tech Stack (فناوری‌های استفاده شده)
- **Core Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 6 (با تنظیم `base: './'` سازگار با GitHub Pages)
- **Styling & Design System**: Vanilla CSS Design Tokens (Dark/Light Themes, CSS Variables, A4 Print Media Queries)
- **Icons**: Lucide React
- **PDF Export**: html2canvas + jsPDF (با مقیاس تفکیک‌پذیری بالا و رندر کامل فونت فارسی و RTL)
- **Word (.docx) Export**: docx.js + file-saver (با تنظیمات دایرکشن RTL و جدول‌های سازمان‌یافته)
- **Image Export**: html2canvas (خروجی PNG باکیفیت بالا)
- **Storage & State**: مرورگر Web Storage API (localStorage) برای ذخیره فاکتورها، وضعیت‌ها و پروفایل فروشنده
- **Deployment**: GitHub Pages با GitHub Actions

---

## Dependencies (وابستگی‌ها)
- `docx`: ساخت فایل‌های استاندارد مایکروسافت ورد با پشتیبانی از چیدمان دوطرفه و راست‌به‌چپ
- `file-saver`: ذخیره و دانلود فایل‌های ساخته‌شده در مرورگر
- `html2canvas`: تبدیل DOM پیش‌نمایش فاکتور به Canvas با وضوح بالا
- `jspdf`: تولید فایل PDF سایز A4
- `lucide-react`: آیکون‌های مدرن و هماهنگ
- `react` & `react-dom`: هسته رابط کاربری کامپوننت‌محور

---

## Architecture (معماری و ساختار فایل‌ها)
```
.github/
└── workflows/
    └── deploy.yml              # گردش‌کار خودکار استقرار در GitHub Pages
src/
├── types/
│   └── invoice.ts              # تعریف تایپ‌های فاکتور، اقلام، فروشنده، خریدار و وضعیت‌ها
├── utils/
│   ├── persianDigits.ts        # تبدیل ارقام انگلیسی/فارسی و جداسازی سه‌رقمی مبالغ
│   ├── numberToWords.ts        # تبدیل اعداد و مبالغ به حروف فارسی
│   ├── jalaliDate.ts           # الگوریتم تبدیل و فرمت‌بندی تاریخ جلالی (شمسی) و میلادی
│   ├── calculations.ts         # محاسبات مالیات، تخفیف، قیمت سطر و مبلغ نهایی
│   ├── storage.ts              # مدیریت پایدارسازی داده‌ها در localStorage
│   └── exporters.ts            # توابع تولید PDF, Word, PNG, JSON Export/Import
├── styles/
│   ├── tokens.css              # متغیرهای رنگی تم روشن/تاریک، فونت، فواصل و سایه‌ها
│   ├── global.css              # استایل‌های پایه، دکمه‌ها، فرم‌ها و مدیا پرینت (@media print)
│   ├── app.css                 # ساختار و چیدمان دو ستونه ویرایشگر و پیش‌نمایش
│   └── templates.css           # استایل‌های ۳ قالب فاکتور (رسمی، مدرن، مینیمال)
├── components/
│   ├── Header.tsx              # نوار بالایی سامانه، دکمه‌های تم، ارقام فارسی و فاکتورها
│   ├── editor/
│   │   ├── InvoiceMetaSection.tsx       # شماره فاکتور، تاریخ‌ها، وضعیت و واحد پول
│   │   ├── BusinessInfoSection.tsx      # اطلاعات فروشنده و بارگذاری لوگو
│   │   ├── ClientInfoSection.tsx        # اطلاعات خریدار
│   │   ├── LineItemsSection.tsx         # جدول پویا، سطرها، تخفیف و مالیات
│   │   ├── PaymentAndNotesSection.tsx   # حساب بانکی، شرایط پرداخت و تصویر امضا
│   │   ├── TemplateSelector.tsx         # انتخاب قالب بصری
│   │   ├── InvoiceSummaryCard.tsx       # کارت جمع مبالغ و مبلغ به حروف
│   │   └── InvoiceEditor.tsx            # گردآورنده آکاردئونی بخش‌های ویرایش
│   ├── templates/
│   │   ├── ClassicTemplate.tsx          # قالب رسمی مالیاتی (فرم استاندارد ۲)
│   │   ├── ModernTemplate.tsx           # قالب مدرن شرکتی
│   │   ├── MinimalTemplate.tsx          # قالب مینیمال تایپوگرافی
│   │   └── TemplateRenderer.tsx         # سوییچ‌کننده بین قالب‌ها
│   ├── preview/
│   │   └── PreviewPane.tsx              # پنل پیش‌نمایش با کنترل زوم و دکمه‌های خروجی
│   ├── modals/
│   │   ├── SavedInvoicesModal.tsx       # پنجره مدیریت فاکتورها (جستجو، فیلتر، تکثیر، حذف)
│   │   └── ImportModal.tsx              # پنجره بازیابی از فایل JSON
│   └── common/
│       └── Toast.tsx                    # سیستم نوتیفیکیشن و پیام‌های اطلاع‌رسانی
├── App.tsx                     # کامپوننت اصلی و هماهنگ‌کننده وضعیت‌ها
└── main.tsx                    # نقطه ورود برنامه
```

---

## نحوه استقرار در GitHub Pages (Deployment Guide)

1. مخزن (Repository) را در گیت‌هاب ایجاد کرده و فایل‌ها را به گیت‌هاب پوش (Push) کنید.
2. در صفحه گیت‌هاب مخزن خود به مسیر **Settings** > **Pages** بروید.
3. در بخش **Build and deployment**، گزینه **Source** را روی **GitHub Actions** تنظیم کنید.
4. با هر بار Push روی شاخه `main` یا `master`، وب‌سایت به صورت خودکار بیلد شده و در آدرس زیر در دسترس قرار می‌گیرد:
   ```
   https://<username>.github.io/<repository-name>/
   ```
