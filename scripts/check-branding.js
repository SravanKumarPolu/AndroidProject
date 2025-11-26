#!/usr/bin/env node

/**
 * Branding Checker Script
 * 
 * Validates that all branding elements are properly configured
 * Run: node scripts/check-branding.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    console.log(`${colors.green}✓${colors.reset} ${description}: ${filePath} (${(stats.size / 1024).toFixed(2)} KB)`);
    return true;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${description}: ${filePath} - MISSING`);
    return false;
  }
}

function checkIconSize(filePath, expectedSize) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) return false;
  
  // Note: Actual image dimension checking would require image library
  // This is a basic file existence check
  const stats = fs.statSync(fullPath);
  const sizeKB = stats.size / 1024;
  
  if (sizeKB < 1) {
    console.log(`${colors.yellow}⚠${colors.reset} ${filePath} seems too small (${sizeKB.toFixed(2)} KB)`);
    return false;
  }
  
  return true;
}

function checkConfig() {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appConfigPath = path.join(__dirname, '..', 'src/constants/app.ts');
  
  const issues = [];
  
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Check for placeholder values
    if (appJson.expo.name.includes('ImpulseVault')) {
      console.log(`${colors.blue}ℹ${colors.reset} App name still uses default: "${appJson.expo.name}"`);
    }
    
    if (appJson.expo.extra?.eas?.projectId === 'your-project-id') {
      issues.push('EAS project ID is still placeholder. Run: eas build:configure');
    }
  }
  
  if (fs.existsSync(appConfigPath)) {
    const content = fs.readFileSync(appConfigPath, 'utf8');
    
    if (content.includes('yourdomain.com')) {
      issues.push('Privacy policy URL still uses placeholder (yourdomain.com)');
    }
    
    if (content.includes('support@impulsevault.com')) {
      console.log(`${colors.blue}ℹ${colors.reset} Support email still uses default`);
    }
  }
  
  return issues;
}

console.log('\n🎨 Branding Configuration Check\n');
console.log('='.repeat(50));

// Check icon files
console.log('\n📱 Icon Files:');
let iconCount = 0;
iconCount += checkFile('assets/icon.png', 'Main app icon') ? 1 : 0;
iconCount += checkFile('assets/adaptive-icon.png', 'Android adaptive icon') ? 1 : 0;
iconCount += checkFile('assets/favicon.png', 'Web favicon') ? 1 : 0;

// Check icon sizes
console.log('\n📏 Icon Sizes:');
checkIconSize('assets/icon.png', 1024);
checkIconSize('assets/adaptive-icon.png', 1024);
checkIconSize('assets/favicon.png', 512);

// Check configuration files
console.log('\n⚙️  Configuration Files:');
checkFile('app.json', 'Expo configuration');
checkFile('src/constants/app.ts', 'App constants');
checkFile('BRANDING_GUIDE.md', 'Branding guide');

// Check for issues
console.log('\n🔍 Configuration Issues:');
const issues = checkConfig();

if (issues.length === 0) {
  console.log(`${colors.green}✓${colors.reset} No critical issues found`);
} else {
  issues.forEach(issue => {
    console.log(`${colors.yellow}⚠${colors.reset} ${issue}`);
  });
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:');
console.log(`Icons found: ${iconCount}/3`);

if (iconCount === 3 && issues.length === 0) {
  console.log(`${colors.green}✓ Branding looks good!${colors.reset}`);
} else if (iconCount < 3) {
  console.log(`${colors.yellow}⚠ Some icon files are missing${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠ Some configuration values need updating${colors.reset}`);
}

console.log('\n💡 Tip: See BRANDING_GUIDE.md for customization instructions\n');


