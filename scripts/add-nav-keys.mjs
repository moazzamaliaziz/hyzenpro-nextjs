import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const newKeys = {
  categories: 'Categories',
  find_tools: 'Find Tools',
  submit_tool: 'Submit AI tool',
  popular_categories: 'Popular Categories',
  discover: 'Discover',
  all_tools: 'All Tools',
  all_tools_desc: 'Browse the full directory',
  find_tools_desc: 'Take the guided matcher quiz',
  video_tools: 'AI Video Tools',
  video_tools_desc: 'Editors, generators, captions',
  writing_tools: 'AI Writing Tools',
  writing_tools_desc: 'Content, copy, and SEO writing',
  coding_tools: 'AI Coding Tools',
  coding_tools_desc: 'Assistants for developers',
  image_tools: 'AI Image Tools',
  image_tools_desc: 'Art generators, editors',
  automation_tools: 'AI Automation',
  automation_tools_desc: 'Workflow and task automation',
  from_the_blog: 'From the Blog',
  latest_insights: 'Latest insights on AI tools',
  read_article: 'Read article'
};

const translations = {
  ja: { categories: 'カテゴリー', find_tools: 'ツールを探す', submit_tool: 'AIツールを提出', popular_categories: '人気のカテゴリー', discover: '発見', all_tools: 'すべてのツール', all_tools_desc: 'ディレクトリを閲覧', find_tools_desc: 'ガイド付きマッチャーキズに参加', video_tools: 'AIビデオツール', video_tools_desc: 'エディター、生成器、キャプション', writing_tools: 'AIライティングツール', writing_tools_desc: 'コンテンツ、コピー、SEOライティング', coding_tools: 'AIコーディングツール', coding_tools_desc: '開発者のアシスタント', image_tools: 'AI画像ツール', image_tools_desc: 'アートジェネレーター、エディター', automation_tools: 'AIオートメーション', automation_tools_desc: 'ワークフローとタスク自動化', from_the_blog: 'ブログから', latest_insights: 'AIツールの最新インサイト', read_article: '記事を読む' },
  de: { categories: 'Kategorien', find_tools: 'Tools finden', submit_tool: 'AI-Tool einreichen', popular_categories: 'Beliebte Kategorien', discover: 'Entdecken', all_tools: 'Alle Tools', all_tools_desc: 'Das gesamte Verzeichnis durchsuchen', find_tools_desc: 'Am geführten Matcher-Quiz teilnehmen', video_tools: 'AI-Video-Tools', video_tools_desc: 'Editoren, Generatoren, Untertitel', writing_tools: 'AI-Schreibtools', writing_tools_desc: 'Inhalte, Texte und SEO-Schreiben', coding_tools: 'AI-Programmiertools', coding_tools_desc: 'Assistenten für Entwickler', image_tools: 'AI-Bildtools', image_tools_desc: 'Kunstgeneratoren, Editoren', automation_tools: 'AI-Automatisierung', automation_tools_desc: 'Workflow- und Aufgabenautomatisierung', from_the_blog: 'Aus dem Blog', latest_insights: 'Neueste Einblicke zu AI-Tools', read_article: 'Artikel lesen' },
  fr: { categories: 'Catégories', find_tools: 'Trouver des outils', submit_tool: 'Soumettre un outil IA', popular_categories: 'Catégories populaires', discover: 'Découvrir', all_tools: 'Tous les outils', all_tools_desc: 'Parcourir le répertoire complet', find_tools_desc: 'Participer au quiz de sélection guidée', video_tools: 'Outils vidéo IA', video_tools_desc: 'Éditeurs, générateurs, sous-titres', writing_tools: 'Outils de rédaction IA', writing_tools_desc: 'Contenu, copies et rédaction SEO', coding_tools: 'Outils de codage IA', coding_tools_desc: 'Assistants pour développeurs', image_tools: 'Outils image IA', image_tools_desc: 'Générateurs dart, éditeurs', automation_tools: 'Automatisation IA', automation_tools_desc: 'Automatisation des flux de travail et des tâches', from_the_blog: 'Du blog', latest_insights: 'Dernières informations sur les outils IA', read_article: 'Lire article' },
  es: { categories: 'Categorías', find_tools: 'Encontrar herramientas', submit_tool: 'Enviar herramienta IA', popular_categories: 'Categorías populares', discover: 'Descubrir', all_tools: 'Todas las herramientas', all_tools_desc: 'Explorar el directorio completo', find_tools_desc: 'Participar en el cuestionario de selección guiada', video_tools: 'Herramientas de video IA', video_tools_desc: 'Editores, generadores, subtítulos', writing_tools: 'Herramientas de escritura IA', writing_tools_desc: 'Contenido, copias y redacción SEO', coding_tools: 'Herramientas de codificación IA', coding_tools_desc: 'Asistentes para desarrolladores', image_tools: 'Herramientas de imagen IA', image_tools_desc: 'Generadores de arte, editores', automation_tools: 'Automatización IA', automation_tools_desc: 'Automatización de flujos de trabajo y tareas', from_the_blog: 'Del blog', latest_insights: 'Últimas ideas sobre herramientas IA', read_article: 'Leer artículo' },
  pt: { categories: 'Categorias', find_tools: 'Encontrar ferramentas', submit_tool: 'Enviar ferramenta IA', popular_categories: 'Categorias populares', discover: 'Descobrir', all_tools: 'Todas as ferramentas', all_tools_desc: 'Navegar pelo diretório completo', find_tools_desc: 'Participar do questionário de seleção guiada', video_tools: 'Ferramentas de vídeo IA', video_tools_desc: 'Editores, geradores, legendas', writing_tools: 'Ferramentas de escrita IA', writing_tools_desc: 'Conteúdo, cópias e redação SEO', coding_tools: 'Ferramentas de programação IA', coding_tools_desc: 'Assistentes para desenvolvedores', image_tools: 'Ferramentas de imagem IA', image_tools_desc: 'Geradores de arte, editores', automation_tools: 'Automação IA', automation_tools_desc: 'Automação de fluxos de trabalho e tarefas', from_the_blog: 'Do blog', latest_insights: 'Últimas informações sobre ferramentas IA', read_article: 'Ler artigo' },
  it: { categories: 'Categorie', find_tools: 'Trova strumenti', submit_tool: 'Invia strumento IA', popular_categories: 'Categorie popolari', discover: 'Scopri', all_tools: 'Tutti gli strumenti', all_tools_desc: 'Sfoglia elenco completo', find_tools_desc: 'Partecipa al quiz di selezione guidata', video_tools: 'Strumenti video IA', video_tools_desc: 'Editor, generatori, sottotitoli', writing_tools: 'Strumenti di scrittura IA', writing_tools_desc: 'Contenuti, copie e scrittura SEO', coding_tools: 'Strumenti di programmazione IA', coding_tools_desc: 'Assistenti per sviluppatori', image_tools: 'Strumenti di immagine IA', image_tools_desc: 'Generatori di arte, editor', automation_tools: 'Automazione IA', automation_tools_desc: 'Automazione dei flussi di lavoro e dei compiti', from_the_blog: 'Dal blog', latest_insights: 'Ultime notizie sugli strumenti IA', read_article: 'Leggi articolo' },
  ko: { categories: '카테고리', find_tools: '도구 찾기', submit_tool: 'AI 도구 제출', popular_categories: '인기 카테고리', discover: '발견', all_tools: '모든 도구', all_tools_desc: '전체 디렉토리 찾아보기', find_tools_desc: '가이드 매처 퀴즈에 참여', video_tools: 'AI 비디오 도구', video_tools_desc: '편집기, 생성기, 자막', writing_tools: 'AI 글쓰기 도구', writing_tools_desc: '콘텐츠, 카피, SEO 글쓰기', coding_tools: 'AI 코딩 도구', coding_tools_desc: '개발자를 위한 어시스턴트', image_tools: 'AI 이미지 도구', image_tools_desc: '아트 생성기, 편집기', automation_tools: 'AI 자동화', automation_tools_desc: '워크플로우 및 작업 자동화', from_the_blog: '블로그에서', latest_insights: 'AI 도구에 대한 최신 인사이트', read_article: '기사 읽기' },
  zh: { categories: '分类', find_tools: '查找工具', submit_tool: '提交AI工具', popular_categories: '热门分类', discover: '发现', all_tools: '所有工具', all_tools_desc: '浏览完整目录', find_tools_desc: '参加引导式匹配测验', video_tools: 'AI视频工具', video_tools_desc: '编辑器、生成器、字幕', writing_tools: 'AI写作工具', writing_tools_desc: '内容、文案、SEO写作', coding_tools: 'AI编码工具', coding_tools_desc: '开发人员助手', image_tools: 'AI图像工具', image_tools_desc: '艺术生成器、编辑器', automation_tools: 'AI自动化', automation_tools_desc: '工作流和任务自动化', from_the_blog: '来自博客', latest_insights: 'AI工具最新洞察', read_article: '阅读文章' },
  ru: { categories: 'Категории', find_tools: 'Найти инструменты', submit_tool: 'Отправить ИИ-инструмент', popular_categories: 'Популярные категории', discover: 'Открыть', all_tools: 'Все инструменты', all_tools_desc: 'Просмотреть полный каталог', find_tools_desc: 'Пройти викторину подбора', video_tools: 'Видео-ИИ инструменты', video_tools_desc: 'Редакторы, генераторы, субтитры', writing_tools: 'ИИ для письма', writing_tools_desc: 'Контент, копирайтинг, SEO', coding_tools: 'ИИ для кодирования', coding_tools_desc: 'Ассистенты для разработчиков', image_tools: 'ИИ для изображений', image_tools_desc: 'Генераторы искусства, редакторы', automation_tools: 'ИИ-автоматизация', automation_tools_desc: 'Автоматизация рабочих процессов', from_the_blog: 'Из блога', latest_insights: 'Последние новости об ИИ-инструментах', read_article: 'Читать статью' },
  ar: { categories: 'الفئات', find_tools: 'البحث عن الأدوات', submit_tool: 'إرسال أداة ذكاء اصطناعي', popular_categories: 'الفئات الشائعة', discover: 'اكتشف', all_tools: 'جميع الأدوات', all_tools_desc: 'تصفح الدليل الكامل', find_tools_desc: 'شارك في اختبار المطابقة', video_tools: 'أدوات الفيديو بالذكاء الاصطناعي', video_tools_desc: 'محررون، مولدون، ترجمات', writing_tools: 'أدوات الكتابة بالذكاء الاصطناعي', writing_tools_desc: 'المحتوى والنصوص وكتابة SEO', coding_tools: 'أدوات البرمجة بالذكاء الاصطناعي', coding_tools_desc: 'مساعدون للمطورين', image_tools: 'أدوات الصور بالذكاء الاصطناعي', image_tools_desc: 'مولدو الفن، محررون', automation_tools: 'الأتمتة بالذكاء الاصطناعي', automation_tools_desc: 'أتمتة سير العمل والمهام', from_the_blog: 'من المدونة', latest_insights: 'آخر الأفكار حول أدوات الذكاء الاصطناعي', read_article: 'اقرأ المقال' },
  hi: { categories: 'श्रेणियाँ', find_tools: 'उपकरण खोजें', submit_tool: 'AI उपकरण सबमिट करें', popular_categories: 'लोकप्रिय श्रेणियाँ', discover: 'खोजें', all_tools: 'सभी उपकरण', all_tools_desc: 'पूरी डायरेक्टरी ब्राउज़ करें', find_tools_desc: 'गाइडेड मैचर क्विज़ में भाग लें', video_tools: 'AI वीडियो उपकरण', video_tools_desc: 'एडिटर, जनरेटर, कैप्शन', writing_tools: 'AI लेखन उपकरण', writing_tools_desc: 'सामग्री, कॉपी, SEO लेखन', coding_tools: 'AI कोडिंग उपकरण', coding_tools_desc: 'डेवलपर्स के लिए सहायक', image_tools: 'AI छवि उपकरण', image_tools_desc: 'कला जनरेटर, एडिटर', automation_tools: 'AI ऑटोमेशन', automation_tools_desc: 'वर्कफ़्लो और कार्य स्वचालन', from_the_blog: 'ब्लॉग से', latest_insights: 'AI उपकरणों पर नवीनतम अंतर्दृष्टि', read_article: 'लेख पढ़ें' }
};

const locales = ['ja','de','fr','es','pt','it','ko','zh','ru','ar','hi','nl','pl','tr','vi','th','id','ms','sv','no','da','fi','cs','el','ro','hu','uk','bn','ta','he'];

for (const loc of locales) {
  const file = join('messages', loc, 'common.json');
  if (!existsSync(file)) continue;
  const json = JSON.parse(readFileSync(file, 'utf8'));
  if (!json.nav) continue;
  let added = false;
  const t = translations[loc] || {};
  for (const [key, enVal] of Object.entries(newKeys)) {
    if (!(key in json.nav)) {
      json.nav[key] = t[key] || enVal;
      added = true;
    }
  }
  if (added) {
    writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log('Updated ' + loc);
  } else {
    console.log(loc + ' already has all keys');
  }
}
