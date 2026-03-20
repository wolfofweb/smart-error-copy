# Smart Error Copy 🚀

**Copy full error context (message, file, line, stack trace) with one command.**

Stop manually highlighting and copying error messages. **Smart Error Copy** intelligently extracts the core error from your editor or terminal and formats it perfectly for sharing in Jira, Slack, or GitHub.

---

## ✨ Features

### 🔍 Smart Terminal Extraction
The "magic" command:
- Automatically selects and copies the last relevant error from your terminal output.
- Finds best-match errors (SyntaxError, TypeError, ReferenceError, etc.).
- Intelligently filters out terminal noise like `npm notice`, `Node.js` version logs, and progress indicators.
- Extracts the relevant stack trace automatically.

### 📝 Editor Context Copy
Quickly capture what you're looking at:
- Right-click any line in the editor to copy it with full context.
- Includes **Absolute File Path**, **Line Number**, and **Timestamp**.
- Automatically uses your current selection if you have one.

---

## 🚀 How to Use

### 1. From the Editor
- **Right-Click**: Choose `Copy Full Error Context` from the context menu.
- **Command Palette**: Run `Smart Error Copy: Copy Full Error Context`.

### 2. From the Terminal
- **Right-Click**: Anywhere in the terminal and choose `Copy Error From Terminal`.
- **Command Palette**: Run `Smart Error Copy: Copy Error From Terminal`.

---

## 📋 Formatted Output Example

When you use the terminal command, your clipboard gets filled with a clean, structured block like this:

```markdown
### 🚨 Terminal Error Context

--- ERROR START ---
TypeError: Cannot read properties of undefined (reading 'split')
    at extractRelevantError (/Users/user/project/src/extension.ts:43:18)
    at /Users/user/project/src/extension.ts:187:28
--- ERROR END ---

Timestamp: 2026-03-20, 12:18:22 PM
```

---

## ⚙️ Requirements

- **VS Code 1.85.0** or higher.

---

## 🛠️ Known Issues

- Currently optimized for Node.js/JavaScript/TypeScript error formats. Support for other languages is coming soon!

---

## 📅 Release Notes

### 0.0.1
- Initial release.
- Added intelligent terminal error extraction.
- Added editor context capture (File, Line, Timestamp).

---

**Enjoy a smarter way to debug!**

