import React, { useState } from 'react';
import {
  BookOpen,
  Pill,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  FileText,
  QrCode,
  Sparkles,
  HelpCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ChevronRight,
  ExternalLink,
  Lock,
  Smartphone,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const UserManualPage: React.FC = () => {
  const { isUrdu } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('all');

  const handlePrint = () => {
    window.print();
  };

  // Content dictionaries
  const content = {
    en: {
      title: 'DawaCard Lite — Comprehensive User Manual',
      subtitle: 'Complete official guide to organizing medications, scanning prescriptions with AI, tracking allergies, checking clinical conflicts, and generating emergency health cards.',
      searchPlaceholder: 'Search manual (e.g. scan, allergies, QR code, conflicts)...',
      printManual: 'Print / Save as PDF',
      tableOfContents: 'Table of Contents',
      allChapters: 'All Chapters',
      chapters: [
        {
          id: 'quick-start',
          title: '1. Quick Start & Account Setup',
          icon: Sparkles,
          description: 'Getting set up with DawaCard Lite and cloud database sync.',
          content: [
            {
              heading: 'What is DawaCard Lite?',
              text: 'DawaCard Lite is an intelligent, patient-centric personal medication record and emergency health card web application. It helps patients, caregivers, and clinicians keep track of active medications, daily pillbox dosages, severe drug allergies, and potential drug-drug conflicts. In emergencies, first responders can instantly scan the patient\'s emergency QR code to view critical medical data without needing login credentials.',
            },
            {
              heading: 'Creating an Account & Cloud Synchronization',
              text: 'DawaCard Lite connects to a secure Supabase PostgreSQL cloud database protected by Row Level Security (RLS). To create an account:',
              steps: [
                'Click "Sign In" in the navigation bar or profile menu.',
                'Switch to the "Create Account" tab.',
                'Enter your Full Name, Email, and a secure Password (min. 6 characters).',
                'Click "Create Free Account". Your session is securely cached and synchronized in real time.',
              ],
            },
            {
              heading: 'Setting Up Your Patient Profile',
              text: 'Click on your name or "Patient Profile" on the Dashboard to record your date of birth, blood group (e.g. O+, A-, B+), primary emergency contact name & phone number, and any chronic conditions (e.g. Hypertension, Type 2 Diabetes, Asthma). This information is printed directly on your emergency card.',
            },
          ],
        },
        {
          id: 'medications',
          title: '2. Medication Management & 4-Box Daily Organizer',
          icon: Pill,
          description: 'Recording prescriptions, strengths, instructions, and daily pill schedule.',
          content: [
            {
              heading: 'Adding a Medication Record',
              text: 'Click "Add Medication" anywhere in the app to open the medication editor:',
              steps: [
                'Medication Name: Enter the trade or generic brand (e.g. Amoxicillin, Glucophage, Lipitor).',
                'Strength & Dosage Form: Specify dosage (e.g. 500 mg, 10 mg) and form (Tablet, Capsule, Syrup, Inhaler).',
                'Route & Frequency: Enter how often it should be taken (e.g. Once daily, Twice daily with meals).',
                'Daily Pillbox Timings: Select one or more of the 4 daily schedule slots (Morning, Afternoon, Evening, Bedtime) or "As Needed".',
                'Status: Mark as "Current" for active prescriptions, or "Discontinued" for past medicines.',
              ],
            },
            {
              heading: 'The 4-Box Daily Pill Organizer Grid',
              text: 'Your Dashboard and Medication List automatically categorize your active medications into a color-coded physical pillbox representation (Morning 🌅, Afternoon ☀️, Evening 🌙, Bedtime 🛌). This provides an instant visual summary for patients and caregivers, preventing missed or double doses.',
            },
            {
              heading: 'Discontinuing vs Updating Medications',
              text: 'When a doctor changes your regimen, you can edit the dose or update the status to "Discontinued". Discontinued medications remain safely archived in your history for future clinical audits but are omitted from your active daily pillbox and emergency card by default.',
            },
          ],
        },
        {
          id: 'ai-scanner',
          title: '3. AI Prescription Scanner (OCR Extraction)',
          icon: ScanLine,
          description: 'Digitizing physical paper prescriptions into structured digital fields using Google Gemini AI.',
          content: [
            {
              heading: 'How the AI Scanner Works',
              text: 'DawaCard Lite features an advanced multimodal AI extraction pipeline powered by Google Gemini. Simply take a photo or upload an image of a physical doctor\'s prescription (JPEG, PNG, or WebP up to 5 MB).',
            },
            {
              heading: 'Step-by-Step Extraction Workflow',
              steps: [
                'Click "Scan Prescription (AI)" in the sidebar or top bar.',
                'Upload a clear, well-lit photograph of the prescription.',
                'Click "Extract Information with AI". Gemini analyzes the text, doctor notes, dosages, and frequency.',
                'Mandatory Human Review: You are shown the original image side-by-side with the candidate extracted fields. Each field includes an AI confidence badge (High, Medium, Low, Uncertain) and supporting text snippet.',
                'Verify and adjust any values as needed, then click "Confirm & Save Medication".',
              ],
            },
            {
              heading: 'Privacy & Security Notice',
              text: 'Uploaded images are processed ephemerally through our secure backend proxy. Images are never permanently retained or sold to third parties.',
            },
          ],
        },
        {
          id: 'allergies',
          title: '4. Allergy & Adverse Reaction Tracking',
          icon: ShieldAlert,
          description: 'Documenting known drug allergies and confirmed No Known Allergies (NKA).',
          content: [
            {
              heading: 'Why Allergy Documentation is Critical',
              text: 'Adverse drug events and allergic reactions (such as anaphylaxis to Penicillin or bronchospasm to Aspirin/NSAIDs) are among the most dangerous medical errors in acute care. DawaCard Lite places your allergy status prominently on your digital and printed cards.',
            },
            {
              heading: 'Recording Allergy Status',
              steps: [
                'Navigate to "Allergies" from the sidebar menu.',
                'Select your overall status: "Known Allergies", "No Known Allergies (NKA)", or "Unknown".',
                'If you have allergies, click "Add Allergy Record" to specify the allergen (e.g. Penicillin, Sulfa drugs, Peanuts), reported reaction (e.g. Hives, Anaphylaxis, Swelling), and severity notes.',
              ],
            },
          ],
        },
        {
          id: 'conflict-checker',
          title: '5. AI Drug-Drug & Allergy Conflict Checker',
          icon: ShieldCheck,
          description: 'Continuous clinical pharmacovigilance protecting you from dangerous drug interactions.',
          content: [
            {
              heading: 'How the Conflict Checker Protects You',
              text: 'DawaCard Lite runs a dual-layer pharmacovigilance engine combining a deterministic clinical rule base with Google Gemini AI. It checks all active medications against each other and against your recorded allergies.',
            },
            {
              heading: 'Types of Checked Conflicts',
              steps: [
                'Drug-Drug Interactions: Checks for dangerous combinations such as blood-thinners + NSAIDs (major hemorrhage risk), ACE inhibitors + potassium diuretics (hyperkalemia), and Serotonin Syndrome.',
                'Drug-Allergy Cross-Reactivity: Automatically flags cross-reactive antibiotics (e.g. prescribing Augmentin/Amoxicillin to a patient allergic to Penicillin).',
                'Food & Dietary Precautions: Advisories regarding grapefruit juice, dairy milk chelation with antibiotics, and strict alcohol contraindications.',
              ],
            },
            {
              heading: 'Real-Time Guards in the Medication Form',
              text: 'When adding any new medication in the form, DawaCard Lite tests it in real-time. If a critical conflict is identified, an alert box appears immediately with clinical explanations, requiring explicit acknowledgment before saving.',
            },
            {
              heading: 'Prospective Drug Simulator Tool',
              text: 'Navigate to "AI Safety Checker" and use the interactive simulator search bar. Type any medicine (e.g. "Brufen", "Disprin", "Ciprofloxacin") to simulate if it is safe to add to your current regimen before buying it.',
            },
          ],
        },
        {
          id: 'health-card',
          title: '6. Emergency Health Card & QR Code Access',
          icon: FileText,
          description: 'Generating the printable A4 wallet card and instant emergency responder QR code.',
          content: [
            {
              heading: 'The Printable A4 Medical Summary',
              text: 'Navigate to "Health Card" to view your ready-to-print medical card. It neatly formats your patient demographics, emergency contacts, active medications table, 4-box daily schedule, and verified allergy alerts. Click "Print Health Card" to export to PDF or print on standard paper.',
            },
            {
              heading: 'Instant Emergency QR Code for EMTs / First Responders',
              text: 'Every patient profile generates a secure Emergency QR code containing compressed, encoded emergency health data. When a paramedic or bystander scans this code using their phone camera:',
              steps: [
                'No login or password is required for first responders in a crisis.',
                'Immediately displays blood type, critical allergies in bold red ("DO NOT ADMINISTER"), active medications, and a 1-tap "Call Emergency Contact" button.',
                'Operates smoothly even with intermittent mobile connectivity.',
              ],
            },
          ],
        },
        {
          id: 'faq',
          title: '7. Frequently Asked Questions & Clinical Disclaimer',
          icon: HelpCircle,
          description: 'Important legal notices, privacy assurances, and troubleshooting.',
          content: [
            {
              heading: 'Is my data secure?',
              text: 'Yes. All data stored in Supabase PostgreSQL is protected using Row Level Security (RLS). Only your authenticated user account can access or modify your personal medication records.',
            },
            {
              heading: 'Can I use DawaCard Lite on my smartphone?',
              text: 'Yes. DawaCard Lite is fully responsive and optimized for mobile screens. You can add it to your phone home screen for instant 1-tap access.',
            },
            {
              heading: 'Clinical Disclaimer',
              text: 'DawaCard Lite is an informational personal health record and patient education tool. It is NOT a substitute for professional medical judgment, diagnosis, or clinical prescription by a licensed physician or pharmacist. Always consult your qualified healthcare provider regarding your medications, potential interactions, or changes to treatment.',
            },
          ],
        },
      ],
    },
    ur: {
      title: 'دوا کارڈ لائٹ — جامع رہنمائے صارف (User Manual)',
      subtitle: 'ادویات کا انتظام، مصنوعی ذہانت سے نسخہ اسکین کرنا، الرجی ریکارڈ، ادویاتی تعاملات کی جانچ اور ایمرجنسی ہیلتھ کارڈ بنانے کا مکمل سرکاری طریقہ کار۔',
      searchPlaceholder: 'رہنما میں تلاش کریں (مثلاً نسخہ، الرجی، کیو آر کوڈ، خطرات)...',
      printManual: 'پرنٹ کریں / بطور PDF محفوظ کریں',
      tableOfContents: 'فہرست ابواب',
      allChapters: 'تمام ابواب',
      chapters: [
        {
          id: 'quick-start',
          title: '۱. شروعات اور اکاؤنٹ سیٹ اپ',
          icon: Sparkles,
          description: 'دوا کارڈ لائٹ کے بنیادی استعمال اور کلاؤڈ ڈیٹا بیس کا تعارف۔',
          content: [
            {
              heading: 'دوا کارڈ لائٹ کیا ہے؟',
              text: 'دوا کارڈ لائٹ ایک جدید اور مریض دوست ویب ایپلی کیشن ہے جو آپ کی تمام ادویات، خوراک کے اوقات، خطرناک الرجیز اور ادویات کے آپسی تصادم کا مکمل ریکارڈ محفوظ رکھتی ہے۔ کسی ناگہانی حادثے یا ایمرجنسی کی صورت میں، ریسکیو اور طبی عملہ مریض کا کیو آر کوڈ اسکین کر کے بغیر پاس ورڈ کے فوری طور پر خون کا گروپ اور ضروری معلومات دیکھ سکتا ہے۔',
            },
            {
              heading: 'نیا اکاؤنٹ بنانا اور کلاؤڈ پر ڈیٹا محفوظ کرنا',
              text: 'دوا کارڈ لائٹ آپ کا ڈیٹا کلاؤڈ ڈیٹا بیس (Supabase PostgreSQL) میں محفوظ رکھتا ہے جہاں را لیول سیکیورٹی (RLS) کے ذریعے آپ کا ریکارڈ مکمل محفوظ رہتا ہے:',
              steps: [
                'نیویگیشن بار میں "سائن ان" کے بٹن پر کلک کریں۔',
                '"نیا اکاؤنٹ بنائیں" (Create Account) کا انتخاب کریں۔',
                'اپنا نام، ای میل اور کم از کم 6 ہندسوں کا خفیہ پاس ورڈ درج کریں۔',
                '"Create Free Account" پر کلک کریں، آپ کا اکاؤنٹ فوراً فعال ہو جائے گا۔',
              ],
            },
            {
              heading: 'مریض کا پروفائل مکمل کرنا',
              text: 'ڈیش بورڈ پر جا کر اپنے نام یا مریض کے پروفائل پر کلک کریں۔ یہاں اپنی تاریخ پیدائش، خون کا گروپ (مثلاً +O, -A, +B)، ہنگامی رابطہ نمبر (Emergency Contact) اور پرانی بیماریاں (بلڈ پریشر، شوگر، دمہ) درج کریں۔ یہ معلومات آپ کے ایمرجنسی کارڈ پر ظاہر ہوں گی۔',
            },
          ],
        },
        {
          id: 'medications',
          title: '۲. ادویات کا انتظام اور ۴-بکسوں کا روزانہ شیڈول',
          icon: Pill,
          description: 'ادویات کا اندراج، خوراک کی مقدار، اوقات اور گولیوں کا باکس۔',
          content: [
            {
              heading: 'نئی دوائی شامل کرنے کا طریقہ',
              text: 'ایپلی کیشن میں کسی بھی جگہ "دوائی شامل کریں" پر کلک کریں:',
              steps: [
                'دوائی کا نام: دوائی کا تجارتی یا فارمولا نام درج کریں (مثلاً Panadol, Augmentin, Glucophage)۔',
                'طاقت اور قسم: خوراک کی مقدار (مثلاً 500 ملی گرام) اور قسم (گولی، کیپسول، شربت، انہیلر) منتخب کریں۔',
                'طریقہ اور تکرار: دوائی کے استعمال کی ہدایات درج کریں (مثلاً دن میں دو بار کھانے کے بعد)۔',
                'روزانہ کے اوقات: 4 خانوں میں سے منتخب کریں (صبح، دوپہر، شام، رات سوتے وقت) یا "ضرورت کے وقت"۔',
                'حیثیت: فی الوقت جاری ادویات کو "Current" اور ختم شدہ ادویات کو "Discontinued" رکھیں۔',
              ],
            },
            {
              heading: '۴-بکسوں پر مشتمل روزانہ شیڈول (Daily Pill Organizer)',
              text: 'آپ کے ڈیش بورڈ پر ادویات کا شیڈول ایک روایتی گولیوں کے باکس کی طرح چار حصوں میں تقسیم ہوتا ہے: صبح 🌅، دوپہر ☀️، شام 🌙 اور سوتے وقت 🛌۔ اس سے بزرگ مریضوں اور تیمارداروں کو یہ معلوم رہتا ہے کہ کس وقت کونسی گولیاں لینی ہیں، جس سے غلط خوراک کا خطرہ ختم ہو جاتا ہے۔',
            },
            {
              heading: 'دوائی تبدیل یا بند کرنا',
              text: 'جب ڈاکٹر نسخہ تبدیل کرے تو آپ دوائی کو حذف کرنے کی بجائے "Discontinued" پر سیٹ کر سکتے ہیں۔ اس طرح آپ کا پچھلا میڈیکل ریکارڈ محفوظ رہتا ہے لیکن وہ فعال کارڈ اور روزانہ کے شیڈول سے ہٹ جاتا ہے۔',
            },
          ],
        },
        {
          id: 'ai-scanner',
          title: '۳. مصنوعی ذہانت سے نسخہ اسکین کرنا (AI Scanner)',
          icon: ScanLine,
          description: 'کاغذی نسخے کی تصویر سے خودکار طریقے سے معلومات کا اخراج بذریعہ گوگل جیمنائی۔',
          content: [
            {
              heading: 'اے آئی اسکینر کیسے کام کرتا ہے؟',
              text: 'دوا کارڈ لائٹ میں گوگل جیمنائی (Google Gemini AI) کی جدید ترین ٹیکنالوجی استعمال کی گئی ہے۔ آپ اپنے ڈاکٹر کے لکھے ہوئے نسخے کی واضح تصویر لے کر اپلوڈ کریں، اور سسٹم خودکار طریقے سے ادویات کی تفصیل نکال لیتا ہے۔',
            },
            {
              heading: 'نسخہ اسکین کرنے کا مرحلہ وار طریقہ',
              steps: [
                'سائیڈ بار یا اوپر سے "نسخہ اسکین کریں (AI)" پر کلک کریں۔',
                'نسخے کی واضح اور روشن تصویر (JPEG, PNG یا WebP) منتخب کریں۔',
                '"Extract Information with AI" پر کلک کریں۔ سسٹم تحریر اور خوراک کا تجزیہ کرے گا۔',
                'لازمی انسانی تصدیق: اسکرین کے بائیں طرف اصل تصویر اور دائیں طرف نکالی گئی تفصیلات نظر آئیں گی۔',
                'ہر خانے کی تسلی کریں، ضرورت کے مطابق تصحیح کریں اور "Confirm & Save Medication" پر کلک کریں۔',
              ],
            },
            {
              heading: 'رازداری اور تحفظ',
              text: 'آپ کی اپلوڈ کردہ تصاویر صرف تجزیے کے وقت عارضی طور پر پراسیس ہوتی ہیں اور کسی بھی بیرونی سرور پر مستقل محفوظ نہیں کی جاتیں۔',
            },
          ],
        },
        {
          id: 'allergies',
          title: '۴. الرجی اور ادویاتی ردعمل کا اندراج',
          icon: ShieldAlert,
          description: 'جان لیوا الرجیز کا ریکارڈ تاکہ ہنگامی حالت میں غلط دوا نہ دی جائے۔',
          content: [
            {
              heading: 'الرجی کا اندراج کیوں ضروری ہے؟',
              text: 'پینسلین، سلفا یا درد کش ادویات سے الرجک ری ایکشن جان لیوا ثابت ہو سکتا ہے۔ دوا کارڈ لائٹ آپ کے الرجی اسٹیٹس کو انتہائی نمایاں انداز میں ایمرجنسی کارڈ پر ظاہر کرتا ہے۔',
            },
            {
              heading: 'الرجی ریکارڈ کرنے کا طریقہ',
              steps: [
                'سائیڈ بار مینو سے "الرجیز" کے صفحے پر جائیں۔',
                'اپنی مجموعی حیثیت کا انتخاب کریں: "معلوم الرجیز ہیں"، "کوئی الرجی نہیں"، یا "نامعلوم"۔',
                'اگر الرجی ہو تو "الرجی ریکارڈ شامل کریں" پر کلک کر کے الرجن کا نام (مثلاً Penicillin, Aspirin) اور ردعمل (مثلاً خارش، سانس پھولنا) درج کریں۔',
              ],
            },
          ],
        },
        {
          id: 'conflict-checker',
          title: '۵. اے آئی ادویاتی تصادم اور الرجی چیکر',
          icon: ShieldCheck,
          description: 'ادویات کے آپسی خطرناک اثرات اور الرجی کے تصادم کی خودکار جانچ۔',
          content: [
            {
              heading: 'ادویاتی حفاظت کا نظام',
              text: 'دوا کارڈ لائٹ کلینیکل فارماکولوجی کے اصولوں اور گوگل جیمنائی اے آئی کے ذریعے آپ کی ادویات کا تجزیہ کرتا ہے تاکہ دو متضاد ادویات ایک ساتھ کھانے سے بچا جا سکے۔',
            },
            {
              heading: 'کن خطرات کی جانچ کی جاتی ہے؟',
              steps: [
                'ادویات کا باہمی تصادم: خون پتلا کرنے والی ادویات (Warfarin) اور درد کش گولیاں (Aspirin/Brufen) مل کر اندرونی خون بہنے کا خطرہ پیدا کرتی ہیں۔',
                'الرجی کراس ری ایکشن: اگر آپ کو پینسلین سے الرجی ہے اور نسخے میں آگمنٹن (Augmentin) لکھا گیا ہے تو سسٹم فوراً ریڈ الرٹ دکھائے گا۔',
                'غذائی احتیاطیں: گریپ فروٹ کا رس، اینٹی بائیوٹک کے ساتھ دودھ کا وقفہ، اور شراب کی مکمل ممانعت جیسے مشورے فراہم کیے جاتے ہیں۔',
              ],
            },
            {
              heading: 'فارم کے اندر لائیو الرٹ',
              text: 'جب آپ کوئی نئی دوا لکھتے ہیں تو سسٹم فوراً چیک کرتا ہے۔ خطرناک صورت میں انتباہی باکس آتا ہے جس میں تصدیق کرنی ہوتی ہے کہ ڈاکٹر نے اس کا مشورہ دیا ہے۔',
            },
            {
              heading: 'نئی دوا چیک کرنے کا سمیلیٹر',
              text: '"اے آئی سیفٹی چیکر" کے صفحے پر جائیں اور سمیلیٹر باکس میں کسی بھی میڈیسن کا نام لکھ کر چیک کریں کہ آیا وہ آپ کی موجودہ ادویات کے ساتھ محفوظ ہے یا نہیں۔',
            },
          ],
        },
        {
          id: 'health-card',
          title: '۶. ایمرجنسی ہیلتھ کارڈ اور کیو آر کوڈ',
          icon: FileText,
          description: 'پرنٹ کے قابل A4 پی ڈی ایف کارڈ اور ایمرجنسی عملے کے لیے کیو آر کوڈ۔',
          content: [
            {
              heading: 'پرنٹ کے قابل میڈیکل کارڈ',
              text: '"ہیلتھ کارڈ" کے صفحے پر جائیں۔ یہاں آپ کا نام، بلڈ گروپ، ہنگامی رابطہ، ادویات کا چارٹ اور الرجیز کا مکمل خلاصہ معیاری فارمیٹ میں موجود ہوتا ہے۔ "ہیلتھ کارڈ پرنٹ کریں" پر کلک کر کے آپ اسے کاغذ پر پرنٹ کر سکتے ہیں یا PDF محفوظ کر سکتے ہیں۔',
            },
            {
              heading: 'پیرامیڈیکس اور ریسکیو کے لیے کیو آر کوڈ',
              text: 'ہر مریض کے پروفائل کا ایک مخصوص ایمرجنسی کیو آر کوڈ بنتا ہے۔ ایمرجنسی کی صورت میں جب کوئی طبی عملہ یا ریسکیو ورکر اسے اسکین کرتا ہے:',
              steps: [
                'ریسکیو ورکر کو کسی لاگ ان یا پاس ورڈ کی ضرورت نہیں ہوتی۔',
                'مریض کا بلڈ گروپ اور جان لیوا الرجیز سرخ رنگ میں ("DO NOT ADMINISTER") سب سے اوپر نظر آتی ہیں۔',
                'ایک کلک سے ایمرجنسی کنٹیکٹ کو کال یا واٹس ایپ کرنے کا بٹن ملتا ہے۔',
              ],
            },
          ],
        },
        {
          id: 'faq',
          title: '۷. عمومی سوالات اور طبی دستبرداری (Disclaimer)',
          icon: HelpCircle,
          description: 'ڈیٹا کی حفاظت اور قانونی طبی وضاحت۔',
          content: [
            {
              heading: 'کیا میرا ڈیٹا محفوظ ہے؟',
              text: 'جی ہاں، کلاؤڈ ڈیٹا بیس میں ڈیٹا انکرپشن اور Row Level Security کے ساتھ محفوظ ہے، اور صرف آپ کے لاگ ان اکاؤنٹ کے ذریعے ہی قابل رسائی ہے۔',
            },
            {
              heading: 'کیا میں اسے موبائل پر استعمال کر سکتا ہوں؟',
              text: 'جی ہاں، دوا کارڈ لائٹ ہر قسم کے اسمارٹ فون اور ٹیبلیٹ پر بہترین انداز میں چلتی ہے۔',
            },
            {
              heading: 'طبی دستبرداری (Medical Disclaimer)',
              text: 'دوا کارڈ لائٹ صرف مریضوں کے ذاتی ریکارڈ اور آگاہی کا ایک ڈیجیٹل آلہ ہے۔ یہ مستند ڈاکٹر یا فارماسسٹ کے طبی مشورے کا متبادل نہیں ہے۔ ادویات میں کسی بھی قسم کی تبدیلی سے قبل ہمیشہ اپنے معالج سے مشورہ کریں۔',
            },
          ],
        },
      ],
    },
  };

  const currentContent = isUrdu ? content.ur : content.en;

  const filteredChapters = currentContent.chapters.filter((chapter) => {
    if (activeSection !== 'all' && chapter.id !== activeSection) return false;
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const titleMatch = chapter.title.toLowerCase().includes(query);
    const descMatch = chapter.description.toLowerCase().includes(query);
    const contentMatch = chapter.content.some(
      (c) =>
        c.heading.toLowerCase().includes(query) ||
        c.text.toLowerCase().includes(query) ||
        c.steps?.some((s) => s.toLowerCase().includes(query))
    );
    return titleMatch || descMatch || contentMatch;
  });

  return (
    <div className={`space-y-6 max-w-5xl mx-auto pb-20 ${isUrdu ? 'rtl font-urdu' : 'ltr'}`}>
      {/* Header Banner */}
      <div className="bg-linear-to-r from-teal-900 via-teal-800 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-xl text-emerald-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <Badge variant="current" className="bg-teal-500/30 text-teal-100 border-teal-400/40 text-xs">
                {isUrdu ? 'سرکاری دستی کتابچہ' : 'Official User Guide'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentContent.title}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              {currentContent.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick Language Switcher */}
            <div className="bg-white/10 p-1 rounded-xl backdrop-blur-xs flex items-center gap-2 border border-white/10">
              <LanguageToggle />
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-4 h-4 text-emerald-300" />}
              onClick={handlePrint}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs"
            >
              {currentContent.printManual}
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Chapter Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrdu ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={currentContent.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] bg-white shadow-2xs ${
              isUrdu ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3'
            }`}
          />
        </div>

        {/* Quick Chapter Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              activeSection === 'all'
                ? 'bg-[#0F766E] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {currentContent.allChapters}
          </button>
          {currentContent.chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveSection(ch.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                activeSection === ch.id
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {ch.title.split('.')[0]}.
            </button>
          ))}
        </div>
      </div>

      {/* Chapters Content */}
      <div className="space-y-8">
        {filteredChapters.map((chapter) => {
          const IconComponent = chapter.icon;
          return (
            <Card
              key={chapter.id}
              id={chapter.id}
              className="p-6 sm:p-7 border-slate-200 shadow-xs space-y-6"
            >
              {/* Chapter Header */}
              <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {chapter.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {chapter.description}
                  </p>
                </div>
              </div>

              {/* Sections within Chapter */}
              <div className="space-y-6">
                {chapter.content.map((sec, idx) => (
                  <div key={idx} className="space-y-2.5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#0F766E] rounded-full inline-block" />
                      {sec.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {sec.text}
                    </p>

                    {sec.steps && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs sm:text-sm">
                        {sec.steps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="text-slate-700 leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer Legal & Clinical Notice */}
      <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-950 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{isUrdu ? 'طبی دستبرداری اور حفاظتی رہنمائی' : 'Clinical Disclaimer & Safe Usage Policy'}</span>
        </div>
        <p className="opacity-90 leading-relaxed">
          {isUrdu
            ? 'دوا کارڈ لائٹ صرف ذاتی آگاہی اور ہنگامی صورتحال کے لیے تیار کی گئی ہے۔ ادویات میں کسی بھی قسم کی تبدیلی یا خوراک میں کمی بیشی سے قبل ہمیشہ مستند ڈاکٹر یا فارماسسٹ سے براہ راست رجوع کریں۔'
            : 'DawaCard Lite is designed as a personal health management and emergency information tool. It is not an automated medical diagnostic tool and does not substitute for qualified clinical judgment. Always consult a licensed physician or pharmacist for medical advice.'}
        </p>
      </div>
    </div>
  );
};
