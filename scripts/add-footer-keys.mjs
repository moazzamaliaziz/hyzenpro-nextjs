import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const footerKeys = {
  listed_on: 'Listed On',
  all_rights: 'All rights reserved. AI tool ratings are based on independent testing.',
  independent: 'HyzenPro is an independent publication. Brand names and logos are property of their respective owners.',
  footer_ai_tools: 'AI Tools',
  footer_compare: 'Compare',
  footer_resources: 'Resources',
  footer_company: 'Company',
  footer_side_by_side: 'Side-by-side Compare',
  footer_find_quiz: 'Find Tools Quiz',
  footer_editors_choice: "Editor's choice",
  footer_buyers_quiz: "Buyer's quiz",
  footer_how_we_review: 'How we review',
  footer_submit: 'Submit AI Tool',
  footer_about: 'About HyzenPro',
  footer_advertise: 'Advertise',
  footer_privacy: 'Privacy Policy',
  footer_terms: 'Terms of Service',
  footer_privacy_short: 'Privacy',
  footer_terms_short: 'Terms',
  footer_contact: 'Contact',
  footer_submit_short: 'Submit Tool',
  footer_tagline: 'Independent reviews and side-by-side comparisons of the best AI tools for creators, marketers, developers and small teams. Reader-funded — never pay-to-play.'
};

const translations = {
  ja: { listed_on: '掲載平台', all_rights: '全著作権所有。AIツールの評価は独立したテストに基づいています。', independent: 'HyzenProは独立した出版物です。ブランド名とロゴは各所有者の財産です。', footer_ai_tools: 'AIツール', footer_compare: '比較', footer_resources: 'リソース', footer_company: '会社情報', footer_side_by_side: 'サイドバイサイド比較', footer_find_quiz: 'ツール検索クイズ', footer_editors_choice: 'エディターズチョイス', footer_buyers_quiz: 'バイヤーズクイズ', footer_how_we_review: 'レビュー方法', footer_submit: 'AIツールを提出', footer_about: 'HyzenProについて', footer_advertise: '広告掲載', footer_privacy: 'プライバシーポリシー', footer_terms: '利用規約', footer_privacy_short: 'プライバシー', footer_terms_short: '利用規約', footer_contact: 'お問い合わせ', footer_submit_short: 'ツール提出', footer_tagline: 'クリエイター、マーケター、開発者、小規模チーム向けの最高のAIツールの独立したレビューと並べ替え比較。リーダー資本 — 決してペイ・トゥ・プレイではありません。' },
  de: { listed_on: 'Aufgelistet auf', all_rights: 'Alle Rechte vorbehalten. AI-Bewertungen basieren auf unabhängigen Tests.', independent: 'HyzenPro ist eine unabhängige Veröffentlichung. Markennamen und Logos sind Eigentum der jeweiligen Eigentümer.', footer_ai_tools: 'AI-Tools', footer_compare: 'Vergleichen', footer_resources: 'Ressourcen', footer_company: 'Unternehmen', footer_side_by_side: 'Seite an Seite vergleichen', footer_find_quiz: 'Tool-Finder-Quiz', footer_editors_choice: 'Redaktionswahl', footer_buyers_quiz: 'Käufer-Quiz', footer_how_we_review: 'So testen wir', footer_submit: 'AI-Tool einreichen', footer_about: 'Über HyzenPro', footer_advertise: 'Werbung', footer_privacy: 'Datenschutzrichtlinie', footer_terms: 'Nutzungsbedingungen', footer_privacy_short: 'Datenschutz', footer_terms_short: 'Nutzung', footer_contact: 'Kontakt', footer_submit_short: 'Tool einreichen', footer_tagline: 'Unabhängige Vergleiche und Bewertungen der besten AI-Tools für Ersteller, Vermarkter, Entwickler und kleine Teams. Leserfinanziert — niemals Pay-to-Play.' },
  fr: { listed_on: 'Inscrit sur', all_rights: 'Tous droits réservés. Les notes des outils IA sont basées sur des tests indépendants.', independent: 'HyzenPro est une publication indépendante. Les noms de marque et logos sont la propriété de leurs propriétaires respectifs.', footer_ai_tools: 'Outils IA', footer_compare: 'Comparer', footer_resources: 'Ressources', footer_company: 'Entreprise', footer_side_by_side: 'Comparaison côte à côte', footer_find_quiz: 'Quiz de sélection', footer_editors_choice: 'Choix de la rédaction', footer_buyers_quiz: 'Quiz acheteur', footer_how_we_review: 'Notre méthode', footer_submit: 'Soumettre un outil IA', footer_about: 'À propos de HyzenPro', footer_advertise: 'Publicité', footer_privacy: 'Politique de confidentialité', footer_terms: "Conditions d'utilisation", footer_privacy_short: 'Confidentialité', footer_terms_short: 'Conditions', footer_contact: 'Contact', footer_submit_short: 'Soumettre', footer_tagline: "Comparaisons et critiques indépendantes des meilleurs outils IA pour les créateurs, marketeurs, développeurs et petites équipes. Financé par les lecteurs — jamais pay-to-play." },
  es: { listed_on: 'Publicado en', all_rights: 'Todos los derechos reservados. Las calificaciones de herramientas IA se basan en pruebas independientes.', independent: 'HyzenPro es una publicación independiente. Las marcas y logotipos son propiedad de sus respectivos dueños.', footer_ai_tools: 'Herramientas IA', footer_compare: 'Comparar', footer_resources: 'Recursos', footer_company: 'Empresa', footer_side_by_side: 'Comparación lado a lado', footer_find_quiz: 'Cuestionario de selección', footer_editors_choice: 'Elección del editor', footer_buyers_quiz: 'Cuestionario de compra', footer_how_we_review: 'Cómo evaluamos', footer_submit: 'Enviar herramienta IA', footer_about: 'Sobre HyzenPro', footer_advertise: 'Publicidad', footer_privacy: 'Política de privacidad', footer_terms: 'Términos de servicio', footer_privacy_short: 'Privacidad', footer_terms_short: 'Términos', footer_contact: 'Contacto', footer_submit_short: 'Enviar', footer_tagline: 'Reseñas y comparaciones independientes de las mejores herramientas IA para creadores, vendedores, desarrolladores y equipos pequeños. Financiado por lectores — nunca pay-to-play.' },
  pt: { listed_on: 'Listado em', all_rights: 'Todos os direitos reservados. As classificações de ferramentas IA são baseadas em testes independentes.', independent: 'HyzenPro é uma publicação independente. Nomes de marcas e logotipos são propriedade de seus respectivos donos.', footer_ai_tools: 'Ferramentas IA', footer_compare: 'Comparar', footer_resources: 'Recursos', footer_company: 'Empresa', footer_side_by_side: 'Comparação lado a lado', footer_find_quiz: 'Quiz de seleção', footer_editors_choice: 'Escolha do editor', footer_buyers_quiz: 'Quiz do comprador', footer_how_we_review: 'Como avaliamos', footer_submit: 'Enviar ferramenta IA', footer_about: 'Sobre o HyzenPro', footer_advertise: 'Publicidade', footer_privacy: 'Política de Privacidade', footer_terms: 'Termos de Serviço', footer_privacy_short: 'Privacidade', footer_terms_short: 'Termos', footer_contact: 'Contato', footer_submit_short: 'Enviar', footer_tagline: 'Avaliações e comparações independentes das melhores ferramentas IA para criadores, profissionais de marketing, desenvolvedores e pequenas equipes. Financiado pelos leitores — nunca pay-to-play.' },
  it: { listed_on: 'Elencato su', all_rights: 'Tutti i diritti riservati. I punteggi degli strumenti IA si basano su test indipendenti.', independent: 'HyzenPro è una pubblicazione indipendente. I marchi e i loghi sono di proprietà dei rispettivi proprietari.', footer_ai_tools: 'Strumenti IA', footer_compare: 'Confronta', footer_resources: 'Risorse', footer_company: 'Azienda', footer_side_by_side: 'Confronto fianco a fianco', footer_find_quiz: 'Quiz di selezione', footer_editors_choice: 'Scelta della redazione', footer_buyers_quiz: "Quiz dell'acquirente", footer_how_we_review: 'Come valutiamo', footer_submit: 'Invia strumento IA', footer_about: 'Su HyzenPro', footer_advertise: 'Pubblicità', footer_privacy: 'Informativa sulla privacy', footer_terms: 'Termini di servizio', footer_privacy_short: 'Privacy', footer_terms_short: 'Termini', footer_contact: 'Contatto', footer_submit_short: 'Invia', footer_tagline: "Recensioni e confronti indipendenti dei migliori strumenti IA per creatori, marketer, sviluppatori e piccoli team. Finanziato dai lettori — mai pay-to-play." },
  ko: { listed_on: '등록 플랫폼', all_rights: '모든 권리 보유. AI 도구 평가는 독립 테스트를 기반으로 합니다.', independent: 'HyzenPro는 독립 간행물입니다. 브랜드명과 로고는 각 소유자의 재산입니다.', footer_ai_tools: 'AI 도구', footer_compare: '비교', footer_resources: '리소스', footer_company: '회사', footer_side_by_side: '나란히 비교', footer_find_quiz: '도구 찾기 퀴즈', footer_editors_choice: '편집자 선택', footer_buyers_quiz: '구매자 퀴즈', footer_how_we_review: '검토 방법', footer_submit: 'AI 도구 제출', footer_about: 'HyzenPro 소개', footer_advertise: '광고', footer_privacy: '개인정보 처리방침', footer_terms: '서비스 약관', footer_privacy_short: '개인정보', footer_terms_short: '약관', footer_contact: '문의', footer_submit_short: '제출', footer_tagline: '크리에이터, 마케터, 개발자, 소규모 팀을 위한 최고의 AI 도구에 대한 독립적 리뷰 및 나란히 비교. 독자 자금 지원 — 결코 페이 투 플레이가 아닙니다.' },
  zh: { listed_on: '发布平台', all_rights: '版权所有。AI工具评分基于独立测试。', independent: 'HyzenPro是独立出版物。品牌名称和标志为其各自所有者的财产。', footer_ai_tools: 'AI工具', footer_compare: '比较', footer_resources: '资源', footer_company: '公司', footer_side_by_side: '并排比较', footer_find_quiz: '工具查找测验', footer_editors_choice: '编辑推荐', footer_buyers_quiz: '购买者测验', footer_how_we_review: '评审方法', footer_submit: '提交AI工具', footer_about: '关于HyzenPro', footer_advertise: '广告', footer_privacy: '隐私政策', footer_terms: '服务条款', footer_privacy_short: '隐私', footer_terms_short: '条款', footer_contact: '联系', footer_submit_short: '提交', footer_tagline: '为创作者、营销人员、开发者和小团队提供最佳AI工具的独立评测和并排比较。读者资助——绝不付费排名。' },
  ru: { listed_on: 'Опубликовано на', all_rights: 'Все права защищены. Рейтинги ИИ-инструментов основаны на независимом тестировании.', independent: 'HyzenPro является независимым изданием. Торговые марки и логотипы принадлежат их владельцам.', footer_ai_tools: 'ИИ-инструменты', footer_compare: 'Сравнить', footer_resources: 'Ресурсы', footer_company: 'Компания', footer_side_by_side: 'Сравнение бок о бок', footer_find_quiz: 'Квиз подбора инструментов', footer_editors_choice: 'Выбор редакции', footer_buyers_quiz: 'Квиз покупателя', footer_how_we_review: 'Как мы тестируем', footer_submit: 'Отправить ИИ-инструмент', footer_about: 'О HyzenPro', footer_advertise: 'Реклама', footer_privacy: 'Политика конфиденциальности', footer_terms: 'Условия использования', footer_privacy_short: 'Конфиденциальность', footer_terms_short: 'Условия', footer_contact: 'Контакт', footer_submit_short: 'Отправить', footer_tagline: 'Независимые обзоры и сравнения лучших ИИ-инструментов для создателей контента, маркетологов, разработчиков и небольших команд. Финансируется читателями — никогда не платное размещение.' }
};

const locales = ['ja','de','fr','es','pt','it','ko','zh','ru','ar','hi','nl','pl','tr','vi','th','id','ms','sv','no','da','fi','cs','el','ro','hu','uk','bn','ta','he'];

for (const loc of locales) {
  const file = join('messages', loc, 'common.json');
  if (!existsSync(file)) continue;
  const json = JSON.parse(readFileSync(file, 'utf8'));
  if (!json.common) continue;
  let added = false;
  const t = translations[loc] || {};
  for (const [key, enVal] of Object.entries(footerKeys)) {
    if (!(key in json.common)) {
      json.common[key] = t[key] || enVal;
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
