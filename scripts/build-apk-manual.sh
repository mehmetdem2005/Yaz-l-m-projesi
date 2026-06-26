#!/bin/bash
set -e

export ANDROID_HOME=/home/z/android-sdk
BUILD_TOOLS=$ANDROID_HOME/build-tools/34.0.0
PLATFORM_JAR=$ANDROID_HOME/platforms/android-34/android.jar
PROJECT=/home/z/android-apk-build
KEYSTORE=/home/z/debug.keystore
OUT=$PROJECT/app/build/outputs/apk/debug

echo "=== 1/7: Kaynakları derle ==="
mkdir -p $PROJECT/compiled_res
$BUILD_TOOLS/aapt2 compile --dir $PROJECT/app/src/main/res -o $PROJECT/compiled_res/

echo "=== 2/7: APK sablonu ==="
mkdir -p $OUT
$BUILD_TOOLS/aapt2 link -I $PLATFORM_JAR --manifest $PROJECT/app/src/main/AndroidManifest.xml -o $PROJECT/base.apk -R $PROJECT/compiled_res/*.flat --auto-add-overlay

echo "=== 3/7: Java derle ==="
mkdir -p $PROJECT/classes
javac -source 17 -target 17 -cp $PLATFORM_JAR -d $PROJECT/classes $PROJECT/app/src/main/java/com/deepseekstudio/app/MainActivity.java

echo "=== 4/7: DEX ==="
mkdir -p $PROJECT/dex
$BUILD_TOOLS/d8 --release --min-api 23 --output $PROJECT/dex --lib $PLATFORM_JAR $(find $PROJECT/classes -name "*.class")

echo "=== 5/7: APK paketle ==="
cd $PROJECT
cp base.apk app-debug.apk
cd app/src/main/assets && zip -r -0 $PROJECT/app-debug.apk www/ > /dev/null 2>&1
cd $PROJECT
cp $PROJECT/dex/classes.dex .
zip -0 app-debug.apk classes.dex > /dev/null 2>&1

echo "=== 6/7: zipalign ==="
$BUILD_TOOLS/zipalign -f 4 app-debug.apk app-debug-aligned.apk

echo "=== 7/7: imzala ==="
if [ ! -f $KEYSTORE ]; then
  keytool -genkey -v -keystore $KEYSTORE -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US" 2>/dev/null
fi
$BUILD_TOOLS/apksigner sign --ks $KEYSTORE --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android --out $OUT/app-debug.apk app-debug-aligned.apk

echo "=== TAMAMLANDI ==="
ls -lh $OUT/app-debug.apk
rm -f $PROJECT/base.apk $PROJECT/app-debug.apk $PROJECT/app-debug-aligned.apk $PROJECT/classes.dex
