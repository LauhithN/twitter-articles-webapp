#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BugDetector {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.isPreCommit = process.argv.includes('--pre-commit');
  }

  log(message, type = 'info') {
    const icons = { info: '📋', error: '❌', warning: '⚠️', success: '✅' };
    console.log(`${icons[type] || '📋'} ${message}`);
  }

  addIssue(file, line, message, severity = 'error') {
    const issue = { file, line, message, severity };
    if (severity === 'error') {
      this.issues.push(issue);
    } else {
      this.warnings.push(issue);
    }
  }

  // Check for common JavaScript/TypeScript anti-patterns
  checkJavaScriptPatterns(filePath, content) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for console.log (should be removed in production)
      if (line.includes('console.log') && !line.trim().startsWith('//')) {
        this.addIssue(filePath, index + 1, 'Avoid console.log in production code', 'warning');
      }

      // Check for == instead of ===
      if (line.match(/[^=!]==[^=]/) || line.match(/[^=!]!=[^=]/)) {
        this.addIssue(filePath, index + 1, 'Use === or !== instead of == or !=', 'error');
      }

      // Check for var usage
      if (line.match(/\bvar\s+/)) {
        this.addIssue(filePath, index + 1, 'Use const or let instead of var', 'warning');
      }

      // Check for empty catch blocks
      if (line.trim() === 'catch (e) {}' || line.trim() === 'catch (error) {}') {
        this.addIssue(filePath, index + 1, 'Empty catch block - handle errors properly', 'error');
      }

      // Check for TODO/FIXME comments
      if (line.includes('TODO:') || line.includes('FIXME:')) {
        this.addIssue(filePath, index + 1, 'Unresolved TODO/FIXME found', 'warning');
      }

      // Check for hardcoded credentials patterns
      if (line.match(/password\s*=\s*["'][^"']+["']/i) ||
          line.match(/api[_-]?key\s*=\s*["'][^"']+["']/i) ||
          line.match(/secret\s*=\s*["'][^"']+["']/i)) {
        this.addIssue(filePath, index + 1, 'Potential hardcoded credentials detected', 'error');
      }

      // Check for eval usage
      if (line.includes('eval(')) {
        this.addIssue(filePath, index + 1, 'Avoid using eval() - security risk', 'error');
      }

      // Check for dangerouslySetInnerHTML (React)
      if (line.includes('dangerouslySetInnerHTML')) {
        this.addIssue(filePath, index + 1, 'dangerouslySetInnerHTML can lead to XSS vulnerabilities', 'warning');
      }
    });
  }

  // Check for common Python anti-patterns
  checkPythonPatterns(filePath, content) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for bare except
      if (line.trim() === 'except:') {
        this.addIssue(filePath, index + 1, 'Avoid bare except: - specify exception type', 'error');
      }

      // Check for print statements (should use logging)
      if (line.match(/^\s*print\(/) && !line.includes('#')) {
        this.addIssue(filePath, index + 1, 'Consider using logging instead of print', 'warning');
      }

      // Check for == None instead of is None
      if (line.includes('== None') || line.includes('!= None')) {
        this.addIssue(filePath, index + 1, 'Use "is None" or "is not None" instead of ==', 'error');
      }

      // Check for mutable default arguments
      if (line.match(/def\s+\w+\([^)]*=\s*(\[\]|\{\})/)) {
        this.addIssue(filePath, index + 1, 'Mutable default argument detected - use None instead', 'error');
      }

      // Check for hardcoded credentials
      if (line.match(/password\s*=\s*["'][^"']+["']/i) ||
          line.match(/api[_-]?key\s*=\s*["'][^"']+["']/i)) {
        this.addIssue(filePath, index + 1, 'Potential hardcoded credentials detected', 'error');
      }
    });
  }

  // Check for common security issues
  checkSecurityIssues(filePath, content) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // SQL Injection patterns
      if (line.match(/execute\([^)]*\+[^)]*\)/) ||
          line.match(/query\([^)]*\+[^)]*\)/)) {
        this.addIssue(filePath, index + 1, 'Potential SQL injection - use parameterized queries', 'error');
      }

      // Command injection
      if (line.includes('exec(') || line.includes('system(')) {
        this.addIssue(filePath, index + 1, 'Potential command injection vulnerability', 'error');
      }

      // Insecure random
      if (line.includes('Math.random()')) {
        this.addIssue(filePath, index + 1, 'Use crypto.randomBytes() for security-sensitive operations', 'warning');
      }
    });
  }

  // Scan directory for files
  scanDirectory(dir, extensions) {
    const files = [];

    const walk = (currentPath) => {
      if (fs.existsSync(currentPath)) {
        const stat = fs.statSync(currentPath);

        if (stat.isDirectory()) {
          // Skip node_modules, .git, venv, etc.
          const basename = path.basename(currentPath);
          if (['node_modules', '.git', 'venv', '__pycache__', 'dist', 'build', '.next'].includes(basename)) {
            return;
          }

          const items = fs.readdirSync(currentPath);
          items.forEach(item => walk(path.join(currentPath, item)));
        } else if (stat.isFile()) {
          const ext = path.extname(currentPath);
          // Skip this file itself to avoid false positives from pattern matching code
          const filename = path.basename(currentPath);
          if (extensions.includes(ext) && filename !== 'bug-detector.js') {
            files.push(currentPath);
          }
        }
      }
    };

    walk(dir);
    return files;
  }

  // Main analysis function
  analyze() {
    this.log('🤖 BugBot: Starting bug detection...', 'info');

    const rootDir = process.cwd();

    // Scan JavaScript/TypeScript files
    const jsFiles = this.scanDirectory(rootDir, ['.js', '.jsx', '.ts', '.tsx']);
    this.log(`Analyzing ${jsFiles.length} JavaScript/TypeScript files...`, 'info');

    jsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      this.checkJavaScriptPatterns(file, content);
      this.checkSecurityIssues(file, content);
    });

    // Scan Python files
    const pyFiles = this.scanDirectory(rootDir, ['.py']);
    this.log(`Analyzing ${pyFiles.length} Python files...`, 'info');

    pyFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      this.checkPythonPatterns(file, content);
      this.checkSecurityIssues(file, content);
    });

    this.printReport();
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    this.log('BugBot Analysis Report', 'info');
    console.log('='.repeat(60) + '\n');

    if (this.issues.length === 0 && this.warnings.length === 0) {
      this.log('No issues found! Your code looks good! 🎉', 'success');
      return;
    }

    if (this.issues.length > 0) {
      this.log(`Found ${this.issues.length} error(s):`, 'error');
      this.issues.forEach(issue => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.message}`);
      });
      console.log('');
    }

    if (this.warnings.length > 0) {
      this.log(`Found ${this.warnings.length} warning(s):`, 'warning');
      this.warnings.forEach(warning => {
        console.log(`  ${warning.file}:${warning.line} - ${warning.message}`);
      });
      console.log('');
    }

    console.log('='.repeat(60));

    // Exit with error code if critical issues found
    if (this.issues.length > 0 && this.isPreCommit) {
      this.log('Pre-commit check failed! Fix errors before committing.', 'error');
      process.exit(1);
    }
  }
}

// Run the bug detector
const detector = new BugDetector();
detector.analyze();
