---
name: NewToolSkill
description: Automates the process of adding a new web tool to the Apexia Lab project.
---

# NewToolSkill Instructions

Use this skill when the user wants to add a new web tool to the project.

## 1. Gather Information
Ensure you have the following information from the user. If not, ask for it.
- **Tool Name**: (e.g., "Calculator")
- **Tool Slug**: (e.g., "calc") - This will be the directory name.
- **Tool Description**: (e.g., "A simple calculator tool.") - Used for meta description and OGP.

## 2. Create Directory
Create a new directory for the tool using the slug.
```bash
mkdir -p [Tool Slug]
```

## 3. Generate Files
Copy the templates from `.agent/skills/NewToolSkill/templates/` to the new directory and replace placeholders.

**Templates:**
- `index.html`: Replace `{{tool_name}}`, `{{tool_slug}}`, `{{tool_description}}`
- `style.css`: Copy as is (or customize if requested)
- `script.js`: Replace `{{tool_name}}`

## 4. Update Navigation (Root index.html)
Add a new card to the `.tools-grid` section in the root `index.html`.

```html
<a href="/[Tool Slug]/" class="tool-card">
    <div class="tool-title">[Tool Name]</div>
    <div class="tool-desc">[Tool Description]</div>
</a>
```

## 5. Update Sitemap
Run the sitemap generation script to include the new tool.

```bash
python3 scripts/generate_sitemap.py
```

## 6. Finalize
- Verify the new tool page loads locally if possible.
- Notify the user that the tool scaffolding is ready.
