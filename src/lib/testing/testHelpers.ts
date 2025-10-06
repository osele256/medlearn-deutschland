// src/lib/testing/testHelpers.ts
// Helper functions for manual testing in DevTools console

import { logger } from '../logger';

export const testHelpers = {
  // Test localStorage capacity
  testLocalStorageLimit: () => {
    console.log('🧪 Testing localStorage capacity...');
    let i = 0;
    try {
      for (i = 0; i < 10000; i++) {
        localStorage.setItem(`test_${i}`, 'x'.repeat(1000));
      }
    } catch (e) {
      console.log(`❌ localStorage full at ${i} items`);
      console.log(`📊 Approximate capacity: ${(i * 1000) / 1024}KB`);
    }
    
    // Cleanup
    for (let j = 0; j < i; j++) {
      localStorage.removeItem(`test_${j}`);
    }
    console.log('✅ Cleanup complete');
  },

  // Test rapid operations
  testRapidClicks: async (callback: () => Promise<void>, count = 10) => {
    console.log(`🧪 Testing ${count} rapid operations...`);
    const start = Date.now();
    
    for (let i = 0; i < count; i++) {
      try {
        await callback();
        console.log(`✅ Operation ${i + 1} completed`);
      } catch (e) {
        console.error(`❌ Operation ${i + 1} failed:`, e);
      }
    }
    
    const duration = Date.now() - start;
    console.log(`📊 Completed in ${duration}ms (avg: ${duration / count}ms per operation)`);
  },

  // Test memory usage
  testMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('📊 Memory Usage:');
      console.log(`  Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`);
    } else {
      console.log('⚠️ Memory API not available in this browser');
    }
  },

  // Test error boundary
  testErrorBoundary: () => {
    console.log('🧪 Triggering test error...');
    throw new Error('Test error from testHelpers.testErrorBoundary()');
  },

  // Test all Chrome AI APIs
  testChromeAI: async () => {
    console.log('🧪 Testing Chrome AI availability...');
    
    // Check Prompt API
    if (window.ai?.languageModel) {
      try {
        const caps = await window.ai.languageModel.capabilities();
        console.log('✅ Prompt API:', caps.available);
      } catch (e) {
        console.log('❌ Prompt API error:', e);
      }
    } else {
      console.log('❌ Prompt API not available');
    }

    // Check Translator API
    if (window.ai?.translator) {
      try {
        const caps = await window.ai.translator.capabilities();
        console.log('✅ Translator API:', caps.available);
      } catch (e) {
        console.log('❌ Translator API error:', e);
      }
    } else {
      console.log('❌ Translator API not available');
    }

    // Check Rewriter API
    if (window.ai?.rewriter) {
      try {
        const caps = await window.ai.rewriter.capabilities();
        console.log('✅ Rewriter API:', caps.available);
      } catch (e) {
        console.log('❌ Rewriter API error:', e);
      }
    } else {
      console.log('❌ Rewriter API not available');
    }
  },

  // Export logs
  exportLogs: () => {
    const logs = logger.getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medlearn-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('✅ Logs exported');
  },

  // Clear all app data
  clearAllData: () => {
    if (confirm('⚠️ This will clear all app data. Continue?')) {
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ All data cleared. Refresh the page.');
    }
  },

  // Performance measurement
  measurePerformance: (name: string, callback: () => void) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  },

  // Simulate slow network
  simulateSlowNetwork: () => {
    console.log('🐌 Simulating slow network (open DevTools → Network → Slow 3G)');
    console.log('Or use: chrome://settings/network');
  },

  // Test responsive breakpoints
  testBreakpoints: () => {
    const breakpoints = {
      'Mobile': 375,
      'Mobile L': 425,
      'Tablet': 768,
      'Laptop': 1024,
      'Laptop L': 1440,
      'Desktop': 1920,
    };

    console.log('📱 Resize window to test breakpoints:');
    Object.entries(breakpoints).forEach(([name, width]) => {
      console.log(`  ${name}: ${width}px`);
    });
    console.log('\nCurrent width:', window.innerWidth);
  },

  // Generate test data
  generateTestScenarios: (count = 10) => {
    console.log(`🧪 Use the app to generate ${count} scenarios`);
    console.log('Check state persistence, performance, and memory');
  },

  // Test all toasts
  testToasts: async () => {
    const { showToast } = await import('../components/Toast');
    
    console.log('🧪 Testing all toast types...');
    
    setTimeout(() => showToast('Success toast test', 'success'), 0);
    setTimeout(() => showToast('Error toast test', 'error'), 1000);
    setTimeout(() => showToast('Warning toast test', 'warning'), 2000);
    setTimeout(() => showToast('Info toast test', 'info'), 3000);
    
    console.log('✅ Toasts triggered (watch bottom-right)');
  },

  // Accessibility check
  checkAccessibility: () => {
    console.log('♿ Accessibility Quick Check:');
    console.log('1. Tab through all interactive elements');
    console.log('2. Check focus indicators visible');
    console.log('3. Verify color contrast (use browser DevTools)');
    console.log('4. Test with screen reader (if available)');
    console.log('\n💡 Tip: Install axe DevTools extension for detailed scan');
  },
};

// Make available globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).testHelpers = testHelpers;
  console.log('✅ Test helpers loaded! Use: testHelpers.[methodName]()');
  console.log('Available methods:', Object.keys(testHelpers).join(', '));
}

export default testHelpers;