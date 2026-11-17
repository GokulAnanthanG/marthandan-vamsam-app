import re

file_path = r'f:\Project\Marthandan-Vamsam\MarthandanVamsam\src\screens\FamilyTree\FamilyTreeScreen.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
if 'useLanguage' not in content:
    content = content.replace("import { useAuth } from '../../context/AuthContext';", "import { useAuth } from '../../context/AuthContext';\nimport { useLanguage } from '../../context/LanguageContext';\nimport { useSafeAreaInsets } from 'react-native-safe-area-context';")

# Add hooks
content = content.replace("const { user } = useAuth();\n  const [loading", "const { user } = useAuth();\n  const { language, setLanguage } = useLanguage();\n  const insets = useSafeAreaInsets();\n  const [loading")

# Replace header
header_regex = re.compile(r'<View style=\{styles\.header\}>.*?</View>\s*</View>', re.DOTALL)
new_header = '''<View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 24) }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitleEn} numberOfLines={1}>MARTHANDAN VAMSAM</Text>
            <Text style={styles.headerTitleTa} numberOfLines={1}>மார்த்தாண்டன் வம்சம்</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>Our Roots. Our Generations. Our Legacy.</Text>
          </View>
          
          <View style={styles.languageContainer}>
            <View style={styles.languageToggle}>
              <TouchableOpacity 
                style={language === 'ta' ? styles.langPillActive : styles.langPillInactive}
                onPress={() => setLanguage('ta')}
                activeOpacity={0.8}
              >
                <Text style={language === 'ta' ? styles.langTextActive : styles.langTextInactive}>தமிழ்</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={language === 'en' ? styles.langPillActive : styles.langPillInactive}
                onPress={() => setLanguage('en')}
                activeOpacity={0.8}
              >
                <Text style={language === 'en' ? styles.langTextActive : styles.langTextInactive}>EN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>'''
content = header_regex.sub(new_header, content)

# Replace search section to include Family selector
search_section_regex = re.compile(r'<View style=\{styles\.searchSection\}>.*?</View>', re.DOTALL)
new_search_section = '''<View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#888" style={{marginLeft: 12}} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          
          <TouchableOpacity style={styles.treeSelectBtn}>
            <MapPin size={14} color="#19352D" style={{marginRight: 4}} />
            <Text style={styles.treeSelectText}>Marthandan</Text>
            <ChevronDown size={14} color="#19352D" style={{marginLeft: 2}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal size={18} color="#19352D" />
          </TouchableOpacity>
        </View>'''
content = search_section_regex.sub(new_search_section, content)

# Add Footer before ActionSheet
footer_content = '''</View>
        {/* Sub-Navigation Footer Divider */}
        <View style={styles.subNavigationFooter}>
          <View style={styles.subNavLine} />
          <Text style={styles.subNavText}>குடும்பம்  •  உறவுகள்  •  நிகழ்வுகள்</Text>
          <View style={styles.subNavLine} />
        </View>
      </View>

      <MemberActionSheet'''
content = content.replace('</View>\n      </View>\n\n      <MemberActionSheet', footer_content)

# Update styles
styles_regex = re.compile(r'header: \{.*?\},.*?locationText: \{.*?\},', re.DOTALL)
new_styles = '''headerContainer: {
    backgroundColor: '#004831',
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    zIndex: 1,
  },
  headerTextContainer: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  headerTitleEn: {
    color: '#E1B95B',
    fontSize: 16,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerTitleTa: {
    color: '#E1B95B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'Montserrat_500Medium',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'Montserrat_500Medium',
    fontStyle: 'italic',
  },
  languageContainer: {
    width: 90,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 90, 0.5)',
    borderRadius: 20,
    backgroundColor: '#052D24',
    height: 38,
    width: 90,
    padding: 3,
  },
  langPillActive: {
    flex: 1,
    backgroundColor: '#C9A85A', 
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  langPillInactive: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  langTextActive: {
    color: '#004831',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  langTextInactive: {
    color: '#A0B09A',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Montserrat_500Medium',
  },
  treeSelectBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    paddingHorizontal: 12, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E5DDCF'
  },
  treeSelectText: { color: '#19352D', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' },
  subNavigationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 24,
    gap: 8,
  },
  subNavLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5DDCF',
  },
  subNavText: {
    color: '#7A847F',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    fontFamily: 'Montserrat_500Medium',
  },'''
content = styles_regex.sub(new_styles, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Family tree screen updated.")
