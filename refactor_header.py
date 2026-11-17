import os
import re

header_regex = re.compile(r'const Header = \(\{.*?\}[:a-zA-Z]*\) => \(\s*<View.*?</View>\s*\);\s*', re.DOTALL)
header_styles_regex = re.compile(r'\s*headerContainer: \{.*?\},.*?langTextInactive: \{.*?\},', re.DOTALL)

def update_file(filepath):
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Add import if not present
    if "import Header from" not in content:
        # insert after last import
        import_idx = content.rfind("import ")
        if import_idx != -1:
            end_of_line = content.find("\n", import_idx)
            # Add relative path
            # src/screens/main/EventCalendarScreen.tsx -> ../../components/common/Header
            # src/screens/FamilyTree/FamilyTreeScreen.tsx -> ../../components/common/Header
            content = content[:end_of_line+1] + "import Header from '../../components/common/Header';\n" + content[end_of_line+1:]
            
    # Replace inline Header component usage
    content = content.replace('<Header language={language} setLanguage={setLanguage} insets={insets} />', '<Header />')
    # Or in FamilyTreeScreen it was written directly inline:
    family_tree_header_regex = re.compile(r'\{\/\* Top Header \*\/\}\s*<View style=\{\[styles\.headerContainer.*?\{ paddingTop.*?\}\]\}>\s*<View style=\{styles\.headerContent\}>.*?</View>\s*</View>\s*</View>', re.DOTALL)
    content = family_tree_header_regex.sub('{/* Top Header */}\n      <Header />', content)

    # Remove Header component definition
    content = header_regex.sub('', content)
    
    # Remove header styles
    content = header_styles_regex.sub('', content)
    
    # For EventCalendarScreen where it had: 'import { useSafeAreaInsets } from ...' and 'const insets = useSafeAreaInsets();'
    # we can leave it or remove it. Better to leave it in case it's used elsewhere.

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"No changes for {filepath}")

update_file(r'f:\Project\Marthandan-Vamsam\MarthandanVamsam\src\screens\main\EventCalendarScreen.tsx')
update_file(r'f:\Project\Marthandan-Vamsam\MarthandanVamsam\src\screens\FamilyTree\FamilyTreeScreen.tsx')
update_file(r'f:\Project\Marthandan-Vamsam\MarthandanVamsam\src\screens\main\HomeScreen.tsx')

