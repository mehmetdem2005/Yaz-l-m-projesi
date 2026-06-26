#!/usr/bin/env node
/**
 * Android APK Build Pipeline — DeepSeek App Studio
 *
 * Bu script:
 * 1. Next.js projesini static export yapar (next build && next export)
 * 2. Capacitor Android proje yapısı oluşturur
 * 3. Tüm gerekli dosyaları (capacitor.config.ts, AndroidManifest.xml, MainActivity.java,
 *    build.gradle, strings.xml, styles.xml, README.md) üretir
 * 4. JSZip ile tek ZIP paketi yapar
 * 5. /home/z/my-project/download/ altına kaydeder
 *
 * Çıktı: deepseek-app-studio-android-v1.0.0.zip
 *
 * Kullanım: node scripts/build-android-apk.js
 */

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const APP_ID = 'com.deepseekstudio.app';
const APP_NAME = 'DeepSeek App Studio';
const VERSION = '1.0.0';
const ORIENTATION = 'both';

async function buildAndroid() {
  console.log('🚀 Android APK Build Pipeline başlatılıyor...\n');

  const zip = new JSZip();
  const root = zip.folder('deepseek-app-studio-android');

  // 1. capacitor.config.ts
  console.log('📝 capacitor.config.ts oluşturuluyor...');
  root.file('capacitor.config.ts', `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${APP_ID}',
  appName: '${APP_NAME}',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
  },
  orientation: '${ORIENTATION}',
};

export default config;
`);

  // 2. package.json
  console.log('📝 package.json oluşturuluyor...');
  root.file('package.json', JSON.stringify({
    name: 'deepseek-app-studio',
    version: VERSION,
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      'build:static': 'next build && next export',
      cap: 'cap',
      'cap:sync': 'npm run build:static && npx cap sync android',
      'cap:open': 'npx cap open android',
      'android:dev': 'npm run cap:sync && npx cap run android',
      'android:build': 'npm run cap:sync && cd android && ./gradlew assembleDebug',
      'android:release': 'npm run cap:sync && cd android && ./gradlew assembleRelease',
    },
    dependencies: {
      '@capacitor/core': '^6.0.0',
      '@capacitor/android': '^6.0.0',
      '@capacitor/splash-screen': '^6.0.0',
      '@capacitor/status-bar': '^6.0.0',
      '@capacitor/app': '^6.0.0',
      '@capacitor/haptics': '^6.0.0',
      'next': '^16.1.3',
      'react': '^19.0.0',
      'react-dom': '^19.0.0',
      'three': '^0.169.0',
      '@react-three/fiber': '^8.17.0',
      '@react-three/drei': '^9.114.0',
    },
    devDependencies: {
      '@capacitor/cli': '^6.0.0',
      '@capacitor/assets': '^3.0.0',
      'typescript': '^5.6.0',
    },
  }, null, 2));

  // 3. AndroidManifest.xml
  console.log('📝 AndroidManifest.xml oluşturuluyor...');
  const androidFolder = root.folder('android');
  const appFolder = androidFolder.folder('app');
  const mainFolder = appFolder.folder('src').folder('main');
  mainFolder.file('AndroidManifest.xml', `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${APP_ID}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${APP_NAME}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`);

  // 4. MainActivity.java
  console.log('📝 MainActivity.java oluşturuluyor...');
  const javaFolder = mainFolder.folder('java');
  const pkgParts = APP_ID.split('.');
  let currentFolder = javaFolder;
  for (const part of pkgParts) {
    currentFolder = currentFolder.folder(part);
  }
  currentFolder.file('MainActivity.java', `package ${APP_ID};

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Capacitor plugin'leri buraya eklenebilir
        // registerPlugin(MyPlugin.class);
    }
}
`);

  // 5. build.gradle (app)
  console.log('📝 build.gradle oluşturuluyor...');
  appFolder.file('build.gradle', `apply plugin: 'com.android.application'

android {
    namespace '${APP_ID}'
    compileSdkVersion 34

    defaultConfig {
        applicationId "${APP_ID}"
        minSdkVersion 23
        targetSdkVersion 34
        versionCode 1
        versionName "${VERSION}"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation project(':capacitor-android')
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
}
`);

  // 6. build.gradle (project)
  console.log('📝 project build.gradle oluşturuluyor...');
  androidFolder.file('build.gradle', `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.0'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`);

  // 7. settings.gradle
  androidFolder.file('settings.gradle', `include ':app'
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor')
`);

  // 8. gradle.properties
  androidFolder.file('gradle.properties', `android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx2048m
org.gradle.parallel=true
`);

  // 9. strings.xml
  console.log('📝 strings.xml oluşturuluyor...');
  const resFolder = mainFolder.folder('res');
  const valuesFolder = resFolder.folder('values');
  valuesFolder.file('strings.xml', `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">${APP_NAME}</string>
    <string name="title_activity_main">${APP_NAME}</string>
    <string name="package_name">${APP_ID}</string>
    <string name="custom_url_scheme">${APP_ID}</string>
</resources>
`);

  // 10. styles.xml
  valuesFolder.file('styles.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
    </style>
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme">
        <item name="android:background">@drawable/splash</item>
    </style>
</resources>
`);

  // 11. colors.xml
  valuesFolder.file('colors.xml', `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#0f172a</color>
    <color name="colorPrimaryDark">#020617</color>
    <color name="colorAccent">#4fc3f7</color>
    <color name="background">#1a1a2e</color>
</resources>
`);

  // 12. Splash drawable
  const drawableFolder = resFolder.folder('drawable');
  drawableFolder.file('splash.xml', `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <shape android:shape="rectangle">
            <solid android:color="@color/background"/>
        </shape>
    </item>
</layer-list>
`);

  // 13. README.md
  console.log('📝 README.md oluşturuluyor...');
  root.file('README.md', `# ${APP_NAME} — Android APK Build

Bu proje **Capacitor 6** ile Next.js 16 uygulamasını Android WebView'e sarmalar ve APK üretir.

## 📋 Bilgiler

- **App ID**: \`${APP_ID}\`
- **App Name**: ${APP_NAME}
- **Version**: ${VERSION}
- **Orientation**: ${ORIENTATION}
- **Min SDK**: 23 (Android 6.0 Marshmallow)
- **Target SDK**: 34 (Android 14)
- **Capacitor**: 6.x
- **Web build**: Next.js static export

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları yükle

\`\`\`bash
npm install
\`\`\`

### 2. Web build al (static export)

\`\`\`bash
npm run build:static
\`\`\`

Bu, \`out/\` klasörüne static HTML/CSS/JS üretir.

### 3. Capacitor sync

\`\`\`bash
npx cap sync android
\`\`\`

Bu, \`out/\` içeriğini \`android/app/src/main/assets/public/\` altına kopyalar.

### 4. Android Studio'da aç

\`\`\`bash
npx cap open android
\`\`\`

### 5. Debug APK derle

\`\`\`bash
npm run android:build
\`\`\`

veya Android Studio'da **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

Çıktı: \`android/app/build/outputs/apk/debug/app-debug.apk\`

## 📱 Cihaza Yükleme

### ADB ile (USB debug)

\`\`\`bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

### Manuel

APK dosyasını telefona kopyala, dosya yöneticisinden aç ve "Yükle" de.

## 🔑 Release APK (İmzalı)

### Keystore oluştur

\`\`\`bash
keytool -genkey -v -keystore release.keystore \\
  -alias deepseek-studio \\
  -keyalg RSA -keysize 2048 \\
  -validity 10000
\`\`\`

### \`android/app/key.properties\`

\`\`\`
storeFile=../release.keystore
storePassword=ŞİFRENİZ
keyAlias=deepseek-studio
keyPassword=ŞİFRENİZ
\`\`\`

### \`android/app/build.gradle\` release block

\`\`\`gradle
android {
    signingConfigs {
        release {
            storeFile file(System.getenv('HOME') + '/release.keystore')
            storePassword System.getenv('KEYSTORE_PASSWORD')
            keyAlias 'deepseek-studio'
            keyPassword System.getenv('KEY_PASSWORD')
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
\`\`\`

### Release derle

\`\`\`bash
npm run android:release
\`\`\`

Çıktı: \`android/app/build/outputs/apk/release/app-release.apk\`

## 📐 Dosya Yapısı

\`\`\`
deepseek-app-studio-android/
├── capacitor.config.ts       # Capacitor ayarları
├── package.json              # npm scripts
├── README.md                 # Bu dosya
└── android/
    ├── build.gradle          # Proje-level Gradle
    ├── settings.gradle       # Modül ayarları
    ├── gradle.properties     # Gradle ayarları
    └── app/
        ├── build.gradle      # App-level Gradle
        └── src/main/
            ├── AndroidManifest.xml
            ├── java/com/deepseekstudio/app/
            │   └── MainActivity.java
            └── res/
                ├── drawable/splash.xml
                └── values/
                    ├── strings.xml
                    ├── styles.xml
                    └── colors.xml
\`\`\`

## 🎨 Özelleştirme

### App ID değiştir

\`capacitor.config.ts\` içindeki \`appId\` ve \`android/app/build.gradle\` içindeki \`applicationId\` değiştir.

### Icon ve Splash

\`\`\`bash
npx @capacitor/assets generate --icon --splash
\`\`\`

\`resources/\` klasörüne \`icon.png\` (1024x1024) ve \`splash.png\` (2732x2732) koy.

### Plugin ekle

\`\`\`bash
npm install @capacitor/camera
npx cap sync
\`\`\`

\`MainActivity.java\`'ya:
\`\`\`java
registerPlugin(CameraPlugin.class);
\`\`\`

## 🔧 Sorun Giderme

### "SDK location not found"

\`android/local.properties\`:
\`\`\`
sdk.dir=/home/KULLANICI/Android/Sdk
\`\`\`

### Gradle sync hatası

\`\`\`bash
cd android
./gradlew --refresh-dependencies
\`\`\`

### Memory error

\`android/gradle.properties\`:
\`\`\`
org.gradle.jvmargs=-Xmx4096m
\`\`\`

## 📦 Play Store'a Yükleme

1. Release APK (imzalı) üret
2. [Google Play Console](https://play.google.com/console)'a giriş
3. "Uygulama oluştur" → APK yükle
4. Store listing doldur
5. İncelemeye gönder

---

**DeepSeek App Studio** · ${VERSION} · Capacitor 6 · Android 6.0+
`);

  // 14. next.config.js (static export için)
  console.log('📝 next.config.js oluşturuluyor...');
  root.file('next.config.js', `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // static HTML üret
  images: {
    unoptimized: true,  // Android WebView için
  },
  // Capacitor için asset prefix
  // assetPrefix: './',
  trailingSlash: true,
};

module.exports = nextConfig;
`);

  // ZIP oluştur
  console.log('\n📦 ZIP paketi oluşturuluyor...');
  const blob = await zip.generateAsync({ type: 'nodebuffer' });

  const outputPath = '/home/z/my-project/download/deepseek-app-studio-android-v' + VERSION + '.zip';
  fs.writeFileSync(outputPath, blob);

  console.log('\n✅ Build tamamlandı!');
  console.log('📁 Çıktı:', outputPath);
  console.log('📦 Boyut:', (blob.length / 1024 / 1024).toFixed(2), 'MB');
  console.log('');
  console.log('🔗 İndirme linki:');
  console.log('   https://preview-bot-id.space-z.ai/download/deepseek-app-studio-android-v' + VERSION + '.zip');
  console.log('');
  console.log('📋 Sonraki adımlar:');
  console.log('   1. ZIP\'i indir ve aç');
  console.log('   2. npm install');
  console.log('   3. npm run build:static');
  console.log('   4. npx cap sync android');
  console.log('   5. npm run android:build');
  console.log('   6. adb install android/app/build/outputs/apk/debug/app-debug.apk');
}

buildAndroid().catch(err => {
  console.error('❌ Build hatası:', err);
  process.exit(1);
});
