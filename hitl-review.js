"use strict";

var markedit = require("markedit-api");
var cmView = require("@codemirror/view");
var cmState = require("@codemirror/state");

var MarkEdit = markedit.MarkEdit;
var keymap = cmView.keymap;
var Prec = cmState.Prec;

// Reviewer identity — persists for the session
var reviewerName = "";
var reviewerEmail = "";
var reviewerTag = "HITL";
var headerInserted = false;

function formatName(name) {
  return name.trim().toUpperCase().replace(/\s+/g, "_");
}

function prefix() {
  return reviewerName ? "HITL-" + reviewerTag : "HITL";
}

function reviewerEntry() {
  return "- " + reviewerName + " <" + reviewerEmail + ">";
}

async function setReviewer() {
  var name = await MarkEdit.showTextBox({
    title: "Set HITL Reviewer \u2014 Name",
    prompt: "Enter your full name (e.g. Beau Roberts):",
    defaultValue: reviewerName || ""
  });
  if (name === undefined || name === null || name.trim() === "") return;

  var email = await MarkEdit.showTextBox({
    title: "Set HITL Reviewer \u2014 Email",
    prompt: "Enter your email address:",
    defaultValue: reviewerEmail || ""
  });
  if (email === undefined || email === null || email.trim() === "") return;

  reviewerName = name.trim();
  reviewerEmail = email.trim();
  reviewerTag = formatName(name);
  headerInserted = false;
  await MarkEdit.showAlert({
    title: "HITL Reviewer Set",
    message: "Name: " + reviewerName + "\nEmail: " + reviewerEmail + "\nTag prefix: " + prefix()
  });
}

function getSelection() {
  var state = MarkEdit.editorView.state;
  var range = state.selection.main;
  var text = state.sliceDoc(range.from, range.to);
  return { from: range.from, to: range.to, text: text, hasSelection: range.from !== range.to };
}

function insertText(from, to, text) {
  MarkEdit.editorView.dispatch({ changes: { from: from, to: to, insert: text } });
}

function ensureReviewerHeader() {
  if (headerInserted) return;
  var doc = MarkEdit.editorView.state.doc.toString();
  var headerMarker = "## HITL REVIEWERS";
  var entry = reviewerEntry();

  if (doc.indexOf(headerMarker) === -1) {
    var header = headerMarker + "\n\n" + entry + "\n\n---\n\n";
    insertText(0, 0, header);
  } else {
    if (doc.indexOf(entry) === -1) {
      var headerPos = doc.indexOf(headerMarker);
      var dividerPos = doc.indexOf("\n---", headerPos);
      if (dividerPos !== -1) {
        insertText(dividerPos, dividerPos, "\n" + entry);
      }
    }
  }
  headerInserted = true;
}

async function ensureReviewer() {
  if (reviewerName && reviewerEmail) return true;
  var name = await MarkEdit.showTextBox({
    title: "Set HITL Reviewer \u2014 Name",
    prompt: "Enter your full name before annotating.\nThis identifies your feedback in the document.",
    defaultValue: ""
  });
  if (name === undefined || name === null || name.trim() === "") return false;

  var email = await MarkEdit.showTextBox({
    title: "Set HITL Reviewer \u2014 Email",
    prompt: "Enter your email address:",
    defaultValue: ""
  });
  if (email === undefined || email === null || email.trim() === "") return false;

  reviewerName = name.trim();
  reviewerEmail = email.trim();
  reviewerTag = formatName(name);
  headerInserted = false;
  return true;
}

async function hitlComment() {
  if (!(await ensureReviewer())) return;
  ensureReviewerHeader();
  var sel = getSelection();
  var note = await MarkEdit.showTextBox({
    title: prefix() + " \u2014 Comment",
    prompt: sel.hasSelection ? "Enter your comment on the selected text:" : "Enter your comment at this position:",
    defaultValue: ""
  });
  if (note === undefined || note === null) return;
  var p = prefix();
  if (sel.hasSelection) {
    insertText(sel.from, sel.to, "<!-- " + p + "-COMMENT: " + note + " -->\n" + sel.text);
  } else {
    insertText(sel.from, sel.from, "<!-- " + p + "-COMMENT: " + note + " -->");
  }
}

async function hitlChange() {
  if (!(await ensureReviewer())) return;
  ensureReviewerHeader();
  var sel = getSelection();
  if (!sel.hasSelection) {
    await MarkEdit.showAlert({ title: "HITL Change", message: "Please select text first." });
    return;
  }
  var note = await MarkEdit.showTextBox({ title: prefix() + " \u2014 Change", prompt: "Describe the change you want:", defaultValue: "" });
  if (note === undefined || note === null) return;
  var p = prefix();
  insertText(sel.from, sel.to, "<!-- " + p + "-CHANGE: " + note + " -->" + sel.text + "<!-- /" + p + "-CHANGE -->");
}

async function hitlDelete() {
  if (!(await ensureReviewer())) return;
  ensureReviewerHeader();
  var sel = getSelection();
  if (!sel.hasSelection) {
    await MarkEdit.showAlert({ title: "HITL Delete", message: "Please select text first." });
    return;
  }
  var p = prefix();
  insertText(sel.from, sel.to, "<!-- " + p + "-DELETE -->" + sel.text + "<!-- /" + p + "-DELETE -->");
}

async function hitlAdd() {
  if (!(await ensureReviewer())) return;
  ensureReviewerHeader();
  var note = await MarkEdit.showTextBox({ title: prefix() + " \u2014 Add", prompt: "Describe what should be added here:", defaultValue: "" });
  if (note === undefined || note === null) return;
  var sel = getSelection();
  var p = prefix();
  insertText(sel.from, sel.from, "<!-- " + p + "-ADD: " + note + " -->");
}

async function hitlReplace() {
  if (!(await ensureReviewer())) return;
  ensureReviewerHeader();
  var sel = getSelection();
  if (!sel.hasSelection) {
    await MarkEdit.showAlert({ title: "HITL Replace", message: "Please select text first." });
    return;
  }
  var note = await MarkEdit.showTextBox({ title: prefix() + " \u2014 Replace", prompt: "Enter the replacement text:", defaultValue: "" });
  if (note === undefined || note === null) return;
  var p = prefix();
  insertText(sel.from, sel.to, "<!-- " + p + "-REPLACE: " + note + " -->" + sel.text + "<!-- /" + p + "-REPLACE -->");
}

async function hitlKeep() {
  if (!(await ensureReviewer())) return;
  ensureReviewerHeader();
  var sel = getSelection();
  if (!sel.hasSelection) {
    await MarkEdit.showAlert({ title: "HITL Keep", message: "Please select text first." });
    return;
  }
  var p = prefix();
  insertText(sel.from, sel.to, "<!-- " + p + "-KEEP -->" + sel.text + "<!-- /" + p + "-KEEP -->");
}

// Register keybindings
MarkEdit.addExtension(
  Prec.high(keymap.of([
    { key: "Ctrl-Alt-c", run: function() { hitlComment(); return true; } },
    { key: "Ctrl-Alt-x", run: function() { hitlChange(); return true; } },
    { key: "Ctrl-Alt-d", run: function() { hitlDelete(); return true; } },
    { key: "Ctrl-Alt-a", run: function() { hitlAdd(); return true; } },
    { key: "Ctrl-Alt-r", run: function() { hitlReplace(); return true; } },
    { key: "Ctrl-Alt-k", run: function() { hitlKeep(); return true; } }
  ]))
);

// Register menu items
MarkEdit.addMainMenuItem({
  title: "HITL Review",
  children: [
    { title: "Set Reviewer...", action: function() { setReviewer(); } },
    { separator: true },
    { title: "Comment",           key: "c", modifiers: ["Control", "Option"], action: function() { hitlComment(); } },
    { title: "Request Change",    key: "x", modifiers: ["Control", "Option"], action: function() { hitlChange(); } },
    { title: "Mark for Deletion", key: "d", modifiers: ["Control", "Option"], action: function() { hitlDelete(); } },
    { separator: true },
    { title: "Add Content Here",  key: "a", modifiers: ["Control", "Option"], action: function() { hitlAdd(); } },
    { title: "Replace Selection", key: "r", modifiers: ["Control", "Option"], action: function() { hitlReplace(); } },
    { separator: true },
    { title: "Approve / Keep",    key: "k", modifiers: ["Control", "Option"], action: function() { hitlKeep(); } }
  ]
});

console.log("[HITL Review] Extension loaded successfully.");
