#!/usr/bin/env node

/**
 * Bundle Size Monitoring Script
 * Checks bundle size and warns if it exceeds thresholds
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUNDLE_SIZE_THRESHOLDS = {
  // Size limits in KB
  web: {
    warning: 500, // 500 KB
    error: 1000,  // 1 MB
  },
  android: {
    warning: 2000, // 2 MB
    error: 5000,   // 5 MB
  },
  ios: {
    warning: 2000, // 2 MB
    error: 5000,   // 5 MB
  },
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) {
    return 0;
  }
  
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

function checkWebBundle() {
  const webBuildPath = path.join(process.cwd(), 'web-build');
  
  if (!fs.existsSync(webBuildPath)) {
    console.log('⚠️  Web build not found. Run "npx expo export:web" first.');
    return { success: true, skipped: true };
  }
  
  const totalSize = getDirectorySize(webBuildPath);
  const sizeKB = totalSize / 1024;
  const threshold = BUNDLE_SIZE_THRESHOLDS.web;
  
  console.log(`\n📦 Web Bundle Size: ${formatBytes(totalSize)} (${sizeKB.toFixed(2)} KB)`);
  
  if (sizeKB > threshold.error) {
    console.error(`❌ Bundle size exceeds error threshold (${threshold.error} KB)`);
    return { success: false, size: sizeKB, threshold: threshold.error };
  } else if (sizeKB > threshold.warning) {
    console.warn(`⚠️  Bundle size exceeds warning threshold (${threshold.warning} KB)`);
    return { success: true, warning: true, size: sizeKB, threshold: threshold.warning };
  } else {
    console.log(`✅ Bundle size is within limits (threshold: ${threshold.warning} KB)`);
    return { success: true, size: sizeKB };
  }
}

function checkAndroidBundle() {
  const androidBuildPath = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk');
  
  if (!fs.existsSync(androidBuildPath)) {
    console.log('⚠️  Android build not found. Build the app first.');
    return { success: true, skipped: true };
  }
  
  const apkFiles = fs.readdirSync(androidBuildPath)
    .filter(file => file.endsWith('.apk'))
    .map(file => ({
      name: file,
      path: path.join(androidBuildPath, file),
      size: fs.statSync(path.join(androidBuildPath, file)).size,
    }));
  
  if (apkFiles.length === 0) {
    console.log('⚠️  No APK files found.');
    return { success: true, skipped: true };
  }
  
  console.log('\n📦 Android APK Sizes:');
  const threshold = BUNDLE_SIZE_THRESHOLDS.android;
  let hasError = false;
  let hasWarning = false;
  
  for (const apk of apkFiles) {
    const sizeKB = apk.size / 1024;
    console.log(`  ${apk.name}: ${formatBytes(apk.size)} (${sizeKB.toFixed(2)} KB)`);
    
    if (sizeKB > threshold.error) {
      console.error(`  ❌ Exceeds error threshold (${threshold.error} KB)`);
      hasError = true;
    } else if (sizeKB > threshold.warning) {
      console.warn(`  ⚠️  Exceeds warning threshold (${threshold.warning} KB)`);
      hasWarning = true;
    }
  }
  
  return { 
    success: !hasError, 
    warning: hasWarning,
    files: apkFiles.map(f => ({ name: f.name, size: f.size / 1024 })),
  };
}

function main() {
  const platform = process.argv[2] || 'web';
  
  console.log('🔍 Checking bundle sizes...\n');
  
  let result;
  
  switch (platform) {
    case 'web':
      result = checkWebBundle();
      break;
    case 'android':
      result = checkAndroidBundle();
      break;
    case 'all':
      const webResult = checkWebBundle();
      const androidResult = checkAndroidBundle();
      result = {
        success: webResult.success && androidResult.success,
        web: webResult,
        android: androidResult,
      };
      break;
    default:
      console.error(`Unknown platform: ${platform}`);
      console.log('Usage: node scripts/check-bundle-size.js [web|android|all]');
      process.exit(1);
  }
  
  if (!result.success) {
    console.error('\n❌ Bundle size check failed!');
    process.exit(1);
  } else if (result.warning) {
    console.warn('\n⚠️  Bundle size warnings detected.');
    process.exit(0);
  } else {
    console.log('\n✅ All bundle size checks passed!');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkWebBundle, checkAndroidBundle };

