# MarkEdit HITL Review

A [MarkEdit](https://github.com/MarkEdit-app/MarkEdit) extension that adds structured Human-in-the-Loop (HITL) review markup to Markdown documents.

Designed for workflows where AI-generated documents require structured human review — with full attribution, multi-reviewer support, and machine-parseable annotations.

## Features

- **Six annotation types**: Comment, Request Change, Mark for Deletion, Add Content, Replace Selection, Approve/Keep
- **Reviewer identity**: Each reviewer sets their name and email — embedded in every annotation tag
- **Multi-reviewer support**: Multiple reviewers can annotate the same document with attributed markup
- **Auto-generated reviewer manifest**: A `## HITL REVIEWERS` section is inserted at the top of the document listing all reviewers (name + email)
- **Native UI**: Uses MarkEdit's native dialogs via the [MarkEdit-api](https://github.com/MarkEdit-app/MarkEdit-api)
- **Menu + keyboard shortcuts**: All commands available via Extensions menu and ⌃⌥ shortcuts

## Installation

Copy `hitl-review.js` to MarkEdit's scripts folder:

```bash
mkdir -p ~/Library/Containers/app.cyan.markedit/Data/Documents/scripts
curl -L https://raw.githubusercontent.com/beauzone/MarkEdit-hitl-review/main/hitl-review.js \
  -o ~/Library/Containers/app.cyan.markedit/Data/Documents/scripts/hitl-review.js
```

Restart MarkEdit. You should see **Extensions > HITL Review** in the menu bar.

## Usage

### Set Your Identity

**Extensions > HITL Review > Set Reviewer...** — enter your name and email address. This is required before annotating and persists for the session.

### Annotation Commands

| Command | Shortcut | Requires Selection | Output |
|---|---|---|---|
| Comment | ⌃⌥C | Optional | `<!-- HITL-NAME-COMMENT: note -->` |
| Request Change | ⌃⌥X | Yes | `<!-- HITL-NAME-CHANGE: note -->text<!-- /HITL-NAME-CHANGE -->` |
| Mark for Deletion | ⌃⌥D | Yes | `<!-- HITL-NAME-DELETE -->text<!-- /HITL-NAME-DELETE -->` |
| Add Content Here | ⌃⌥A | No | `<!-- HITL-NAME-ADD: note -->` |
| Replace Selection | ⌃⌥R | Yes | `<!-- HITL-NAME-REPLACE: replacement -->text<!-- /HITL-NAME-REPLACE -->` |
| Approve / Keep | ⌃⌥K | Yes | `<!-- HITL-NAME-KEEP -->text<!-- /HITL-NAME-KEEP -->` |

### Example Output

After two reviewers annotate a document:

```markdown
## HITL REVIEWERS

- Beau Roberts <beau@example.com>
- Jane Doe <jane@example.com>

---

# Document Title

<!-- HITL-BEAU_ROBERTS-COMMENT: This section needs more data -->
Some paragraph text here.

<!-- HITL-JANE_DOE-CHANGE: Lead with the regulatory angle -->This paragraph
should be restructured.<!-- /HITL-JANE_DOE-CHANGE -->

<!-- HITL-BEAU_ROBERTS-DELETE -->This paragraph is redundant.<!-- /HITL-BEAU_ROBERTS-DELETE -->

<!-- HITL-JANE_DOE-ADD: Insert a paragraph about compliance deadlines here -->

<!-- HITL-BEAU_ROBERTS-KEEP -->This paragraph is approved as-is.<!-- /HITL-BEAU_ROBERTS-KEEP -->
```

## Multi-Reviewer Workflow

1. **Reviewer A** opens the document in MarkEdit, sets their identity, annotates, saves
2. **Reviewer A** sends the file to **Reviewer B**
3. **Reviewer B** opens it in their MarkEdit, sets their identity, adds their annotations
4. The file is returned to the AI system with all annotations attributed to the correct reviewer

The `## HITL REVIEWERS` manifest at the top provides a machine-readable index of all reviewers, with email addresses for unambiguous identity resolution.

## AI Processing

When an annotated document is returned to an AI system for processing, the AI can:

- Parse all `<!-- HITL-*` tags using a simple regex pattern
- Attribute each annotation to a specific reviewer via the name tag
- Cross-reference name tags with the reviewer manifest for email-based identity resolution
- Apply changes, deletions, additions, and replacements programmatically
- Log reviewer attribution in a governance audit trail

### Parsing Pattern

```regex
<!-- HITL-([A-Z_]+)-(COMMENT|CHANGE|DELETE|ADD|REPLACE|KEEP)(?:: (.+?))? -->
```

## Use Cases

- **AI content review**: Human reviewers annotate AI-generated drafts before publication
- **Document governance**: Structured review with audit trail for compliance
- **Collaborative editing**: Multiple reviewers with attributed, non-destructive markup
- **Content operations**: Marketing, legal, and technical document review workflows
- **AI-native marketing operations**: HITL review within [Marketing as Code](https://github.com/beauzone/marketing-as-code) workflows

## Requirements

- [MarkEdit](https://github.com/MarkEdit-app/MarkEdit) 1.24.0 or later (requires MarkEdit-api support)
- macOS Sequoia or later

## References

- [MarkEdit Customization Guide](https://github.com/MarkEdit-app/MarkEdit/wiki/Customization)
- [MarkEdit-api](https://github.com/MarkEdit-app/MarkEdit-api)
- [List of MarkEdit Extensions](https://github.com/MarkEdit-app/MarkEdit/wiki/Extensions)

## License

MIT
