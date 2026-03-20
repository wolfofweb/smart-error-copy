import * as vscode from "vscode";

// 🔥 Find best error based on priority
function findBestErrorIndex(lines: string[]): number {
  const getPriority = (line: string): number => {
    const l = line.toLowerCase();

    // 🥇 Highest priority
    if (l.includes("failed to compile")) { return 1; }
    if (l.includes("syntax error")) { return 1; }

    // 🥈 Runtime errors
    if (l.includes("typeerror")) { return 2; }
    if (l.includes("referenceerror")) { return 2; }

    // 🥉 Generic
    if (l.includes("error:")) { return 3; }

    return 999;
  };

  let bestIndex = -1;
  let bestPriority = 999;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("at ")) { continue; }

    const priority = getPriority(line);

    if (priority < bestPriority) {
      bestPriority = priority;
      bestIndex = i;
    }
  }

  return bestIndex;
}

// 🔍 Extract proper error block
function extractRelevantError(text: string): string {
  const lines = text.split("\n");

  const promptPatterns = [" % ", " $ ", " > "];
  const promptIndexes: number[] = [];

  // Find terminal prompts
  lines.forEach((line, index) => {
    if (promptPatterns.some((p) => line.includes(p))) {
      promptIndexes.push(index);
    }
  });

  if (promptIndexes.length === 0) {
    return "No terminal command detected";
  }

  let start = promptIndexes[promptIndexes.length - 1];
  let end = lines.length;

  if (promptIndexes.length >= 2) {
    start = promptIndexes[promptIndexes.length - 2];
    end = promptIndexes[promptIndexes.length - 1];
  }

  // Extract command block
  let block = lines.slice(start + 1, end);

  // 🔥 Remove noise
  block = block.filter(
    (line) =>
      !line.includes("Node.js") &&
      !line.includes("npm notice") &&
      !line.includes("✔") &&
      !line.includes("ℹ")
  );

  // 🔥 Find best error
  const errorIndex = findBestErrorIndex(block);

  if (errorIndex === -1) {
    return "No clear error found in this command output";
  }

  const result: string[] = [];

  // 🔥 1. Capture context ABOVE error
  for (let i = errorIndex - 1; i >= 0; i--) {
    const line = block[i].trim().toLowerCase();

    if (
      line.startsWith("warn") ||
      line.startsWith(">") ||
      line.includes("compiling") ||
      line.includes("listening") ||
      line === ""
    ) {
      break;
    }

    result.unshift(block[i]);
  }

  // 🔥 2. Capture error + stack BELOW
  let insideObject = false;

  for (let i = errorIndex; i < block.length; i++) {
    const line = block[i].trim();

    if (line.includes("{")) { insideObject = true; }
    if (line.includes("}")) { insideObject = false; }

    if (
      i > errorIndex &&
      !line.startsWith("at ") &&
      line === "" &&
      !insideObject
    ) {
      break;
    }

    result.push(block[i]);
  }

  return result.join("\n").trim();
}

export function activate(context: vscode.ExtensionContext) {
  // ✅ Editor Command
  const copyFromEditor = vscode.commands.registerCommand(
    "smart-error-copy.copyError",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showWarningMessage("⚠️ Open a file first");
        return;
      }

      const selection = editor.selection;
      let selectedText = editor.document.getText(selection);

      if (!selectedText) {
        selectedText = editor.document.lineAt(selection.active.line).text;
      }

      const fileName = editor.document.fileName;
      const lineNumber = selection.active.line + 1;

      const formatted = `### 🚨 Error Context

**Error:**
${selectedText.trim()}

**File:**
${fileName}

**Line:**
${lineNumber}

**Timestamp:**
${new Date().toLocaleString()}
`;

      await vscode.env.clipboard.writeText(formatted);
      vscode.window.showInformationMessage("✅ Context copied!");
    }
  );

  // 🔥 Terminal Command
  const copyFromTerminal = vscode.commands.registerCommand(
    "smart-error-copy.copyFromTerminal",
    async () => {
      try {
        await vscode.commands.executeCommand("workbench.action.terminal.focus");
        await vscode.commands.executeCommand("workbench.action.terminal.selectAll");
        await vscode.commands.executeCommand("workbench.action.terminal.copySelection");

        const fullText = await vscode.env.clipboard.readText();

        if (!fullText) {
          vscode.window.showWarningMessage("⚠️ No terminal output found");
          return;
        }

        const errorBlock = extractRelevantError(fullText);

        if (
          errorBlock.includes("No clear error") ||
          errorBlock.length < 20
        ) {
          vscode.window.showWarningMessage("⚠️ No valid error found in terminal output");
          return;
        }

        const cleanedError = errorBlock
          .split("\n")
          .map((line) => line.replace(/^\s+/, "").trimEnd())
          .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
          .join("\n")
          .trim();

        const formatted = `### 🚨 Terminal Error Context

--- ERROR START ---
${cleanedError}
--- ERROR END ---

Timestamp: ${new Date().toLocaleString()}
`;

        await vscode.env.clipboard.writeText(formatted);

        vscode.window.showInformationMessage("✅ Error context auto-copied!");
      } catch (err) {
        vscode.window.showErrorMessage("❌ Failed to capture terminal output");
      }
    }
  );

  context.subscriptions.push(copyFromEditor);
  context.subscriptions.push(copyFromTerminal);
}

export function deactivate() {}