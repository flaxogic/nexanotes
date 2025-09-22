import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Sidebar from './components/Sidebar.tsx';
import NoteList from './components/NoteList.tsx';
import NoteEditor from './components/NoteEditor.tsx';
import TopBar from './components/TopBar.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import ProfilePage from './components/ProfilePage.tsx';
import Auth from './components/Auth.tsx';
import ShareModal from './components/ShareModal.tsx';
import SharedNoteViewer from './components/SharedNoteViewer.tsx';
import CustomCursor from './components/CustomCursor.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import HomePage from './components/HomePage.tsx';
import DiscussionPage from './components/DiscussionPage.tsx';
import { Note, Theme, User, CursorStyle, DiscussionThread, DiscussionPost, Community, WebConfig, Publication } from './types.ts';
import { summarizeNote } from './services/geminiService.ts';
import { backstage } from './services/backstage.ts';
import { appThemes } from './styles/themes.ts';

export type Language = 'en' | 'fr' | 'zh';

const translations = {
  en: {
    common: {
      notes: "Notes",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      delete: "Delete",
      untitledNote: "Untitled Note",
      newNote: "New Note",
      loading: "Loading...",
      by: "By",
      post: "post",
      posts: "posts",
      send: "Send",
      publish: "Publish",
      reject: "Reject",
      back: "Back",
    },
    auth: {
      createAccountTitle: "Create your account",
      welcomeBackTitle: "Welcome back",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      authenticating: "Authenticating...",
      createAccountButton: "Create Account",
      loginButton: "Log In",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      signUp: "Sign Up",
      logIn: "Log In",
      registrationDisabled: "Account creation is currently disabled by the administrator.",
    },
    topbar: {
      home: "Home",
      notes: "Notes",
      discussion: "Discussion",
      profile: "Profile",
      adminPanel: "Admin Panel",
      admin: "Admin",
      dev: "Dev",
      logout: "Logout",
    },
    sidebar: {
      notes: "Notes",
      newNote: "+ New Note",
      settings: "Settings",
    },
    noteList: {
      canvasAwaits: "Your Canvas Awaits... 🎨",
      startCreating: "Click \"+ New Note\" to bring your ideas to life!",
      noContent: "No content",
      summary: "Summary:",
      summarizing: "Summarizing...",
      summarize: "Summarize",
      share: "Share",
      deleteNote: "Delete note",
    },
    editor: {
      titlePlaceholder: "Note Title",
      edit: "Edit",
      split: "Split",
      preview: "Preview",
      insertEmoji: "Insert emoji",
      insertGif: "Insert GIF",
      markdownHelp: "Markdown help",
      contentPlaceholder: "Start writing your note...",
      noNoteSelected: "Select a note to begin 📝 or create a new one!",
    },
    modals: {
      settings: {
        title: "Settings",
        selectTheme: "Select a Theme",
        selectCursor: "Select a Cursor",
        cursorColor: "Color:",
        selectLanguage: "Select a Language",
      },
      share: {
        title: "Share:",
        shareableLink: "Shareable Link",
        copy: "Copy",
        copied: "Copied!",
        emailTitle: "Or send via Email",
        emailPlaceholder: "recipient@example.com",
      },
      gif: {
        title: "Search GIFs",
        close: "Close GIF picker",
        searchPlaceholder: "Search for a GIF...",
        loading: "Loading...",
        noResults: "No GIFs found for your search.",
        error: "Failed to fetch GIFs. Please try again.",
      },
      markdownHelp: {
        title: "Markdown Syntax Guide",
        close: "Close help",
        emphasis: "Emphasis",
        bold: "bold text",
        italic: "italic text",
        strikethrough: "strikethrough",
        headings: "Headings",
        lists: "Lists",
        unorderedItem: "Unordered list item",
        orderedItem: "Ordered list item",
        linksAndImages: "Links & Images",
        linkText: "Link text",
        altText: "Alt text",
        code: "Code",
        inlineCode: "inline code",
        codeBlock: "code block",
        other: "Other",
        blockquote: "Blockquote",
        horizontalRule: "horizontal rule",
        gotIt: "Got it!",
      },
      newCommunity: {
        title: "Create a New Community",
        namePlaceholder: "Community Name (e.g., 'Project_Phoenix')",
        descriptionPlaceholder: "What is this community about?",
        create: "Create Community",
      },
      newThread: {
        title: "Start a New Discussion",
        titlePlaceholder: "Discussion Title",
        contentPlaceholder: "What's on your mind?",
        create: "Create Thread",
      },
      submitPublication: {
        title: "Submit an Announcement",
        titlePlaceholder: "Announcement Title",
        contentPlaceholder: "Your message here... (Markdown supported)",
        submit: "Submit for Review",
        note: "Note: Your submission will be reviewed by an administrator before it is published."
      },
    },
    pages: {
      home: {
        welcome: "Welcome back, {{displayName}}!",
        prompt: "Ready to capture your next big idea?",
        totalNotes: "Total Notes",
        totalWords: "Total Words Written",
        notesSummarized: "Notes Summarized",
        lastActivity: "Last Activity",
        createNote: "+ Create New Note",
        publicationsBoard: "Publications Board",
        submitAnnouncement: "Submit an Announcement",
        noPublications: "No announcements yet. Check back soon!",
        publishedBy: "Published by {{authorDisplayName}} on {{date}}",
      },
      profile: {
        editTitle: "Edit Profile",
        displayName: "Display Name",
        username: "Username",
        email: "Email Address",
        profilePicture: "Profile Picture",
        changePhoto: "Change",
        bio: "Bio",
        save: "Save Profile",
        totalNotes: "Total Notes Created",
        totalWords: "Total Words Written",
        avgWords: "Average Words per Note",
        notesSummarized: "Notes Summarized",
        backToNotes: "Back to Notes",
        noBio: "No bio yet. Click \"Edit Profile\" to add one.",
        editButton: "Edit Profile",
      },
      admin: {
        title: "Admin Dashboard",
        backToNotes: "Back to Notes",
        totalUsers: "Total Registered Users",
        totalNotes: "Total Notes Created",
        configTitle: "Web Configuration",
        appName: "Application Name",
        allowRegistrations: "Allow New User Registrations",
        saveConfig: "Save Config",
        userManagement: "User Management",
        displayName: "Display Name",
        email: "Email",
        role: "Role",
        actions: "Actions",
        makeAdmin: "Make Admin",
        makeDev: "Make Dev",
        makeUser: "Make User",
        setRoleByEmail: "Set User Role by Email",
        setRole: "Set Role",
        setRoleNote: "Note: This grants privileges to an email address. If the user doesn't exist, they will get the role upon signing up.",
        publicationsManagement: "Publications Management",
        pendingSubmissions: "Pending Submissions",
        submittedBy: "Submitted By",
        noPending: "No pending submissions.",
        createPublication: "Create New Publication",
        publicationTitle: "Publication Title",
        publicationContent: "Content (Markdown)",
        publishedAnnouncements: "Published Announcements",
        noPublished: "No announcements have been published yet.",
      },
      discussion: {
        hubTitle: "Discussions Hub",
        createCommunity: "+ Create Community",
        general: "General Discussion",
        generalDescription: "Talk about anything and everything.",
        noCommunities: "No communities yet. Create one to get started!",
        threads: "Threads",
        startNew: "+ Start New",
        selectHubFirst: "Select a discussion hub first",
        startNewDiscussion: "Start New Discussion",
        noDiscussions: "No discussions here yet. Be the first to start one!",
        exploreTitle: "Explore Discussions 🗺️",
        exploreDescription: "Select a community or \"General Discussion\" to dive in.",
        canvasTitle: "Welcome to the Discussion Hub! 💬",
        canvasDescription: "Select a thread to join the conversation, or start your own! 🚀",
        startedBy: "Started by {{authorDisplayName}} on {{date}}",
        replyPlaceholder: "Write a reply...",
        sendReply: "Send Reply",
      },
      sharedNote: {
        backToNotes: "Back to My Notes",
        lastUpdated: "Last updated:",
      },
    }
  },
  fr: {
    common: {
      notes: "Notes",
      save: "Enregistrer",
      cancel: "Annuler",
      close: "Fermer",
      delete: "Supprimer",
      untitledNote: "Note sans titre",
      newNote: "Nouvelle note",
      loading: "Chargement...",
      by: "Par",
      post: "message",
      posts: "messages",
      send: "Envoyer",
      publish: "Publier",
      reject: "Rejeter",
      back: "Retour",
    },
    auth: {
      createAccountTitle: "Créez votre compte",
      welcomeBackTitle: "Bon retour",
      emailLabel: "Adresse e-mail",
      passwordLabel: "Mot de passe",
      authenticating: "Authentification...",
      createAccountButton: "Créer un compte",
      loginButton: "Se connecter",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      dontHaveAccount: "Vous n'avez pas de compte ?",
      signUp: "S'inscrire",
      logIn: "Se connecter",
      registrationDisabled: "La création de compte est actuellement désactivée par l'administrateur.",
    },
    topbar: {
      home: "Accueil",
      notes: "Notes",
      discussion: "Discussion",
      profile: "Profil",
      adminPanel: "Panneau d'administration",
      admin: "Admin",
      dev: "Dev",
      logout: "Déconnexion",
    },
    sidebar: {
      notes: "Notes",
      newNote: "+ Nouvelle Note",
      settings: "Paramètres",
    },
    noteList: {
      canvasAwaits: "Votre toile n'attend que vous... 🎨",
      startCreating: "Cliquez sur \"+ Nouvelle Note\" pour donner vie à vos idées !",
      noContent: "Pas de contenu",
      summary: "Résumé :",
      summarizing: "Résumé en cours...",
      summarize: "Résumer",
      share: "Partager",
      deleteNote: "Supprimer la note",
    },
    editor: {
      titlePlaceholder: "Titre de la note",
      edit: "Éditer",
      split: "Diviser",
      preview: "Aperçu",
      insertEmoji: "Insérer un emoji",
      insertGif: "Insérer un GIF",
      markdownHelp: "Aide Markdown",
      contentPlaceholder: "Commencez à écrire votre note...",
      noNoteSelected: "Sélectionnez une note pour commencer 📝 ou créez-en une nouvelle !",
    },
    modals: {
      settings: {
        title: "Paramètres",
        selectTheme: "Sélectionnez un thème",
        selectCursor: "Sélectionnez un curseur",
        cursorColor: "Couleur :",
        selectLanguage: "Sélectionnez une langue",
      },
      share: {
        title: "Partager :",
        shareableLink: "Lien partageable",
        copy: "Copier",
        copied: "Copié !",
        emailTitle: "Ou envoyer par e-mail",
        emailPlaceholder: "destinataire@example.com",
      },
      gif: {
        title: "Rechercher des GIFs",
        close: "Fermer le sélecteur de GIF",
        searchPlaceholder: "Rechercher un GIF...",
        loading: "Chargement...",
        noResults: "Aucun GIF trouvé pour votre recherche.",
        error: "Échec de la récupération des GIFs. Veuillez réessayer.",
      },
      markdownHelp: {
        title: "Guide de la syntaxe Markdown",
        close: "Fermer l'aide",
        emphasis: "Mise en évidence",
        bold: "texte en gras",
        italic: "texte en italique",
        strikethrough: "texte barré",
        headings: "Titres",
        lists: "Listes",
        unorderedItem: "Élément de liste non ordonnée",
        orderedItem: "Élément de liste ordonnée",
        linksAndImages: "Liens et Images",
        linkText: "Texte du lien",
        altText: "Texte alternatif",
        code: "Code",
        inlineCode: "code en ligne",
        codeBlock: "bloc de code",
        other: "Autre",
        blockquote: "Citation",
        horizontalRule: "ligne horizontale",
        gotIt: "Compris !",
      },
      newCommunity: {
        title: "Créer une nouvelle communauté",
        namePlaceholder: "Nom de la communauté (ex: 'Projet_Phoenix')",
        descriptionPlaceholder: "De quoi parle cette communauté ?",
        create: "Créer la communauté",
      },
      newThread: {
        title: "Démarrer une nouvelle discussion",
        titlePlaceholder: "Titre de la discussion",
        contentPlaceholder: "À quoi pensez-vous ?",
        create: "Créer le fil",
      },
      submitPublication: {
        title: "Soumettre une annonce",
        titlePlaceholder: "Titre de l'annonce",
        contentPlaceholder: "Votre message ici... (Markdown pris en charge)",
        submit: "Soumettre pour examen",
        note: "Note : Votre soumission sera examinée par un administrateur avant d'être publiée."
      },
    },
    pages: {
      home: {
        welcome: "Bon retour, {{displayName}} !",
        prompt: "Prêt à capturer votre prochaine grande idée ?",
        totalNotes: "Total des notes",
        totalWords: "Total des mots écrits",
        notesSummarized: "Notes résumées",
        lastActivity: "Dernière activité",
        createNote: "+ Créer une nouvelle note",
        publicationsBoard: "Tableau des publications",
        submitAnnouncement: "Soumettre une annonce",
        noPublications: "Aucune annonce pour le moment. Revenez bientôt !",
        publishedBy: "Publié par {{authorDisplayName}} le {{date}}",
      },
      profile: {
        editTitle: "Modifier le profil",
        displayName: "Nom d'affichage",
        username: "Nom d'utilisateur",
        email: "Adresse e-mail",
        profilePicture: "Photo de profil",
        changePhoto: "Changer",
        bio: "Bio",
        save: "Enregistrer le profil",
        totalNotes: "Total des notes créées",
        totalWords: "Total des mots écrits",
        avgWords: "Moyenne de mots par note",
        notesSummarized: "Notes résumées",
        backToNotes: "Retour aux notes",
        noBio: "Pas encore de bio. Cliquez sur \"Modifier le profil\" pour en ajouter une.",
        editButton: "Modifier le profil",
      },
      admin: {
        title: "Tableau de bord admin",
        backToNotes: "Retour aux notes",
        totalUsers: "Total des utilisateurs enregistrés",
        totalNotes: "Total des notes créées",
        configTitle: "Configuration Web",
        appName: "Nom de l'application",
        allowRegistrations: "Autoriser les nouvelles inscriptions d'utilisateurs",
        saveConfig: "Enregistrer la configuration",
        userManagement: "Gestion des utilisateurs",
        displayName: "Nom d'affichage",
        email: "E-mail",
        role: "Rôle",
        actions: "Actions",
        makeAdmin: "Rendre Admin",
        makeDev: "Rendre Dev",
        makeUser: "Rendre Utilisateur",
        setRoleByEmail: "Définir le rôle par e-mail",
        setRole: "Définir le rôle",
        setRoleNote: "Note : Ceci accorde des privilèges à une adresse e-mail. Si l'utilisateur n'existe pas, il obtiendra le rôle lors de son inscription.",
        publicationsManagement: "Gestion des publications",
        pendingSubmissions: "Soumissions en attente",
        submittedBy: "Soumis par",
        noPending: "Aucune soumission en attente.",
        createPublication: "Créer une nouvelle publication",
        publicationTitle: "Titre de la publication",
        publicationContent: "Contenu (Markdown)",
        publishedAnnouncements: "Annonces publiées",
        noPublished: "Aucune annonce n'a encore été publiée.",
      },
      discussion: {
        hubTitle: "Hub de discussions",
        createCommunity: "+ Créer une communauté",
        general: "Discussion générale",
        generalDescription: "Parlez de tout et de rien.",
        noCommunities: "Aucune communauté pour le moment. Créez-en une pour commencer !",
        threads: "Fils de discussion",
        startNew: "+ Démarrer",
        selectHubFirst: "Sélectionnez d'abord un hub de discussion",
        startNewDiscussion: "Démarrer une nouvelle discussion",
        noDiscussions: "Aucune discussion ici pour le moment. Soyez le premier à en démarrer une !",
        exploreTitle: "Explorez les Discussions 🗺️",
        exploreDescription: "Sélectionnez une communauté ou \"Discussion générale\" pour plonger dans le vif du sujet.",
        canvasTitle: "Bienvenue au Hub de Discussion ! 💬",
        canvasDescription: "Sélectionnez un fil pour rejoindre la conversation, ou lancez le vôtre ! 🚀",
        startedBy: "Démarré par {{authorDisplayName}} le {{date}}",
        replyPlaceholder: "Écrire une réponse...",
        sendReply: "Envoyer la réponse",
      },
      sharedNote: {
        backToNotes: "Retour à mes notes",
        lastUpdated: "Dernière mise à jour :",
      },
    }
  },
  zh: {
    common: {
      notes: "笔记",
      save: "保存",
      cancel: "取消",
      close: "关闭",
      delete: "删除",
      untitledNote: "无标题笔记",
      newNote: "新建笔记",
      loading: "加载中...",
      by: "由",
      post: "帖子",
      posts: "帖子",
      send: "发送",
      publish: "发布",
      reject: "拒绝",
      back: "返回",
    },
    auth: {
      createAccountTitle: "创建您的帐户",
      welcomeBackTitle: "欢迎回来",
      emailLabel: "电子邮件地址",
      passwordLabel: "密码",
      authenticating: "验证中...",
      createAccountButton: "创建帐户",
      loginButton: "登录",
      alreadyHaveAccount: "已经有帐户了？",
      dontHaveAccount: "没有帐户？",
      signUp: "注册",
      logIn: "登录",
      registrationDisabled: "管理员当前已禁用帐户创建。"
    },
    topbar: {
      home: "主页",
      notes: "笔记",
      discussion: "讨论",
      profile: "个人资料",
      adminPanel: "管理面板",
      admin: "管理员",
      dev: "开发者",
      logout: "登出"
    },
    sidebar: {
      notes: "笔记",
      newNote: "+ 新建笔记",
      settings: "设置"
    },
    noteList: {
      canvasAwaits: "你的画布正等待着... 🎨",
      startCreating: "点击“+ 新建笔记”，让你的想法变为现实！",
      noContent: "无内容",
      summary: "摘要：",
      summarizing: "正在生成摘要...",
      summarize: "生成摘要",
      share: "分享",
      deleteNote: "删除笔记"
    },
    editor: {
      titlePlaceholder: "笔记标题",
      edit: "编辑",
      split: "分屏",
      preview: "预览",
      insertEmoji: "插入表情符号",
      insertGif: "插入GIF",
      markdownHelp: "Markdown帮助",
      contentPlaceholder: "开始写笔记...",
      noNoteSelected: "选择一篇笔记开始 📝 或创建一个新的！"
    },
    modals: {
      settings: {
        title: "设置",
        selectTheme: "选择主题",
        selectCursor: "选择光标",
        cursorColor: "颜色：",
        selectLanguage: "选择语言"
      },
      share: {
        title: "分享：",
        shareableLink: "可分享链接",
        copy: "复制",
        copied: "已复制！",
        emailTitle: "或通过电子邮件发送",
        emailPlaceholder: "recipient@example.com"
      },
      gif: {
        title: "搜索GIF",
        close: "关闭GIF选择器",
        searchPlaceholder: "搜索GIF...",
        loading: "加载中...",
        noResults: "未找到与您搜索相关的GIF。",
        error: "获取GIF失败。请重试。"
      },
      markdownHelp: {
        title: "Markdown语法指南",
        close: "关闭帮助",
        emphasis: "强调",
        bold: "粗体文本",
        italic: "斜体文本",
        strikethrough: "删除线",
        headings: "标题",
        lists: "列表",
        unorderedItem: "无序列表项",
        orderedItem: "有序列表项",
        linksAndImages: "链接和图片",
        linkText: "链接文本",
        altText: "替代文本",
        code: "代码",
        inlineCode: "行内代码",
        codeBlock: "代码块",
        other: "其他",
        blockquote: "块引用",
        horizontalRule: "水平线",
        gotIt: "好的！"
      },
      newCommunity: {
          title: "创建新社区",
          namePlaceholder: "社区名称（例如 'Project_Phoenix'）",
          descriptionPlaceholder: "这个社区是关于什么的？",
          create: "创建社区"
      },
      newThread: {
          title: "开始新讨论",
          titlePlaceholder: "讨论标题",
          contentPlaceholder: "您在想什么？",
          create: "创建主题"
      },
      submitPublication: {
        title: "提交公告",
        titlePlaceholder: "公告标题",
        contentPlaceholder: "您的消息... (支持Markdown)",
        submit: "提交审核",
        note: "注意：您的提交内容将在发布前由管理员审核。"
      },
    },
    pages: {
      home: {
        welcome: "欢迎回来，{{displayName}}！",
        prompt: "准备好捕捉您的下一个伟大想法了吗？",
        totalNotes: "总笔记数",
        totalWords: "总字数",
        notesSummarized: "已摘要笔记数",
        lastActivity: "最后活动",
        createNote: "+ 创建新笔记",
        publicationsBoard: "公告板",
        submitAnnouncement: "提交公告",
        noPublications: "暂无公告。请稍后再回来查看！",
        publishedBy: "由 {{authorDisplayName}} 发布于 {{date}}",
      },
      profile: {
        editTitle: "编辑个人资料",
        displayName: "显示名称",
        username: "用户名",
        email: "电子邮件地址",
        profilePicture: "个人资料图片",
        changePhoto: "更改",
        bio: "个人简介",
        save: "保存个人资料",
        totalNotes: "创建的总笔记数",
        totalWords: "总字数",
        avgWords: "每篇笔记平均字数",
        notesSummarized: "已摘要笔记数",
        backToNotes: "返回笔记",
        noBio: "暂无简介。点击“编辑个人资料”添加一个。",
        editButton: "编辑个人资料"
      },
      admin: {
        title: "管理仪表板",
        backToNotes: "返回笔记",
        totalUsers: "总注册用户数",
        totalNotes: "创建的总笔记数",
        configTitle: "网站配置",
        appName: "应用名称",
        allowRegistrations: "允许新用户注册",
        saveConfig: "保存配置",
        userManagement: "用户管理",
        displayName: "显示名称",
        email: "电子邮件",
        role: "角色",
        actions: "操作",
        makeAdmin: "设为管理员",
        makeDev: "设为开发者",
        makeUser: "设为用户",
        setRoleByEmail: "通过电子邮件设置用户角色",
        setRole: "设置角色",
        setRoleNote: "注意：这将授予权限给一个电子邮件地址。如果用户不存在，他们将在注册时获得该角色。",
        publicationsManagement: "公告管理",
        pendingSubmissions: "待审核的提交",
        submittedBy: "提交者",
        noPending: "没有待处理的提交。",
        createPublication: "创建新公告",
        publicationTitle: "公告标题",
        publicationContent: "内容 (Markdown)",
        publishedAnnouncements: "已发布的公告",
        noPublished: "尚未发布任何公告。",
      },
      discussion: {
        hubTitle: "讨论中心",
        createCommunity: "+ 创建社区",
        general: "综合讨论",
        generalDescription: "谈天说地，无所不包。",
        noCommunities: "还没有社区。创建一个开始吧！",
        threads: "主题",
        startNew: "+ 开始新主题",
        selectHubFirst: "请先选择一个讨论中心",
        startNewDiscussion: "开始新讨论",
        noDiscussions: "这里还没有讨论。成为第一个发起讨论的人吧！",
        exploreTitle: "探索讨论区 🗺️",
        exploreDescription: "选择一个社区或“综合讨论”开始探索。",
        canvasTitle: "欢迎来到讨论中心！💬",
        canvasDescription: "选择一个主题加入对话，或者发起你自己的主题！🚀",
        startedBy: "由 {{authorDisplayName}} 于 {{date}} 发起",
        replyPlaceholder: "写下回复...",
        sendReply: "发送回复"
      },
      sharedNote: {
        backToNotes: "返回我的笔记",
        lastUpdated: "最后更新："
      }
    }
  }
};

interface LanguageContextType {
  t: (key: string, replacements?: { [key: string]: string }) => string;
  language: Language;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};


type AppView = 'home' | 'notes' | 'discussion' | 'profile' | 'admin';
type MobileNotesView = 'list' | 'editor';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [noteToShare, setNoteToShare] = useState<Note | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<AppView>('home');
  const [sharedNoteFromUrl, setSharedNoteFromUrl] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [webConfig, setWebConfig] = useState<WebConfig | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileNotesView, setMobileNotesView] = useState<MobileNotesView>('list');

  const selectedNote = useMemo(() => notes.find(note => note.id === selectedNoteId), [notes, selectedNoteId]);

  const currentTheme = useMemo(() => {
    const themeName = user?.themeName || 'NexaDark';
    return appThemes.find(t => t.name === themeName) || appThemes[0];
  }, [user]);
  
  const cursorStyle = useMemo(() => user?.cursorStyle || 'default', [user]);
  const cursorColor = useMemo(() => user?.cursorColor || '#FFFFFF', [user]);
  const language = useMemo(() => user?.language || 'en', [user]);

  const t = useCallback((key: string, replacements?: { [key: string]: string }) => {
    const findString = (langData: any, keys: string[]): string | undefined => {
        let result = langData;
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return undefined;
            }
        }
        return typeof result === 'string' ? result : undefined;
    };
    
    const keys = key.split('.');
    let text = findString(translations[language], keys) || findString(translations.en, keys) || key;

    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            text = text.replace(new RegExp(`{{${rKey}}}`, 'g'), replacements[rKey]);
        });
    }

    return text;
  }, [language]);


  const loadAppData = useCallback(async (loggedInUser: User) => {
    setIsLoading(true);
    const [userNotes, discussionThreads, discussionCommunities, allPublications] = await Promise.all([
      backstage.getNotes(loggedInUser.email),
      backstage.getThreads(),
      backstage.getCommunities(),
      backstage.getPublications(),
    ]);

    setNotes(userNotes);
    setThreads(discussionThreads);
    setCommunities(discussionCommunities);
    setPublications(allPublications);
    
    if (activeView === 'notes' && userNotes.length > 0 && !isMobile) {
      setSelectedNoteId(userNotes[0].id);
    }
    
    if (loggedInUser.role === 'admin' || loggedInUser.role === 'dev') {
      const [allUsersData, allNotesData] = await Promise.all([
        backstage.getAllUsers(),
        backstage.getAllNotes(),
      ]);
      setAllUsers(allUsersData);
      setAllNotes(allNotesData);
    }
    setIsLoading(false);
  }, [activeView, isMobile]);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      const config = await backstage.getWebConfig();
      setWebConfig(config);
      const sessionUser = await backstage.getCurrentUser();
      if (sessionUser) {
        setUser(sessionUser);
        await loadAppData(sessionUser);
      } else {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, [loadAppData]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#note=')) {
        try {
          const encodedNote = hash.substring('#note='.length);
          const decodedNoteString = decodeURIComponent(atob(encodedNote));
          const noteData: Note = JSON.parse(decodedNoteString);
          setSharedNoteFromUrl(noteData);
        } catch (error) {
          console.error("Failed to parse shared note from URL:", error);
          window.location.hash = '';
        }
      } else {
        setSharedNoteFromUrl(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [currentTheme]);

  const handleAuth = useCallback(async (email: string) => {
    const result = await backstage.login(email);
    if (result.user) {
      setUser(result.user);
      await loadAppData(result.user);
      setActiveView('home');
      return null;
    }
    return result.error;
  }, [loadAppData]);

  const handleLogout = useCallback(async () => {
    await backstage.logout();
    setUser(null);
    setNotes([]);
    setSelectedNoteId(null);
    setActiveView('home');
  }, []);

  const handleNavigate = useCallback((view: AppView) => {
    setActiveView(view);
    if (view === 'notes' && notes.length > 0 && !isMobile) {
      setSelectedNoteId(notes[0].id);
    }
    if (view === 'notes') {
      setMobileNotesView('list');
    }
  }, [notes, isMobile]);

  const handleAddNote = useCallback(async () => {
    if (!user) return;
    const newNote = await backstage.createNote(user.email, t('common.untitledNote'), '');
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setActiveView('notes');
    if (isMobile) {
      setMobileNotesView('editor');
    }
  }, [user, t, isMobile]);

  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
    if(isMobile) {
      setMobileNotesView('editor');
    }
  }, [isMobile]);

  const handleBackToNoteList = useCallback(() => {
    setMobileNotesView('list');
  }, []);

  const handleUpdateNote = useCallback(async (updates: Partial<Note>) => {
    if (!selectedNoteId) return;
    setNotes(prev => prev.map(n => n.id === selectedNoteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
    await backstage.updateNote(selectedNoteId, updates);
  }, [selectedNoteId]);

  const handleDeleteNote = useCallback(async (id: string) => {
    await backstage.deleteNote(id);
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (selectedNoteId === id) {
      setSelectedNoteId(newNotes.length > 0 ? newNotes[0].id : null);
      if (isMobile) {
        setMobileNotesView('list');
      }
    }
  }, [notes, selectedNoteId, isMobile]);

  const handleSummarizeNote = useCallback(async (id: string) => {
    const noteToSummarize = notes.find(n => n.id === id);
    if (!noteToSummarize || !noteToSummarize.content) return;
    setIsSummarizing(true);
    const summary = await summarizeNote(noteToSummarize.content);
    
    // update note in state without waiting for backstage
    setNotes(prev => prev.map(n => n.id === id ? { ...n, summary, updatedAt: new Date().toISOString() } : n));
    await backstage.updateNote(id, { summary });
    
    setIsSummarizing(false);
  }, [notes]);

  const handleShareNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setNoteToShare(note);
      setIsShareModalOpen(true);
    }
  }, [notes]);

  const handleUpdateUserPreferences = useCallback(async (prefs: Partial<User>) => {
    if (!user) return;
    const { user: updatedUser } = await backstage.updateUser(user.email, prefs);
    if (updatedUser) setUser(updatedUser);
  }, [user]);

  const handleSaveProfile = useCallback(async (updatedData: Partial<User>) => {
    if (!user) return null;
    const result = await backstage.updateUser(user.email, updatedData);
    if (result.user) {
      setUser(result.user);
      return null;
    }
    return result.error;
  }, [user]);

  const handleCreateCommunity = useCallback(async (name: string, description: string) => {
    if (!user) return;
    const newCommunity = await backstage.createCommunity(name, description, user.email);
    setCommunities(prev => [newCommunity, ...prev]);
  }, [user]);

  const handleCreateThread = useCallback(async (communityId: string | null, title: string, content: string) => {
    if (!user) return;
    const newThread = await backstage.createThread(communityId, title, content, user);
    setThreads(prev => [newThread, ...prev]);
  }, [user]);

  const handleAddPost = useCallback(async (threadId: string, content: string) => {
    if (!user) return;
    const updatedThread = await backstage.addPostToThread(threadId, content, user);
    setThreads(prev => prev.map(t => t.id === threadId ? updatedThread : t));
  }, [user]);

  const handleToggleLike = useCallback(async (threadId: string, postId: string) => {
    if (!user) return;
    const updatedThread = await backstage.togglePostLike(threadId, postId, user.email);
    setThreads(prev => prev.map(t => t.id === threadId ? updatedThread : t));
  }, [user]);

  const handleDeleteUser = useCallback(async (email: string) => {
    await backstage.deleteUser(email);
    setAllUsers(prev => prev.filter(u => u.email !== email));
  }, []);

  const handleSetRole = useCallback(async (email: string, role: User['role']) => {
    await backstage.setUserRole(email, role);
    setAllUsers(prev => prev.map(u => u.email === email ? { ...u, role } : u));
  }, []);

  const handleUpdateWebConfig = useCallback(async (updates: Partial<WebConfig>) => {
    const newConfig = await backstage.updateWebConfig(updates);
    setWebConfig(newConfig);
  }, []);

  // Publication Handlers
  const handleSubmitPublication = useCallback(async (title: string, content: string) => {
    if (!user) return;
    const newProposal = await backstage.submitPublicationProposal(title, content, user);
    setPublications(prev => [newProposal, ...prev]);
  }, [user]);

  const handleCreateDirectPublication = useCallback(async (title: string, content: string) => {
    if (!user) return;
    const newPublication = await backstage.createDirectPublication(title, content, user);
    setPublications(prev => [newPublication, ...prev]);
  }, [user]);

  const handleReviewPublication = useCallback(async (id: string, publish: boolean) => {
    if (!user) return;
    const updatedPublications = await backstage.reviewPublication(id, publish, user);
    if (updatedPublications) {
      setPublications(updatedPublications);
    }
  }, [user]);

  const handleDeletePublication = useCallback(async (id: string) => {
    if (!user) return;
    const updatedPublications = await backstage.deletePublication(id, user);
    setPublications(updatedPublications);
  }, [user]);


  if (sharedNoteFromUrl) {
    return (
      <LanguageContext.Provider value={{ t, language }}>
        <SharedNoteViewer note={sharedNoteFromUrl} isLoggedIn={!!user} onGoToApp={() => window.location.hash = ''} appName={webConfig?.appName || "NexaNotes"} />
      </LanguageContext.Provider>
    );
  }
  
  if (isLoading && !user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: '#E0E0E0' }}>Loading NexaNotes...</div>;
  }
  
  return (
    <LanguageContext.Provider value={{ t, language }}>
      {!user || !webConfig ? (
         <>
          <CustomCursor cursorStyle={cursorStyle} cursorColor={cursorColor} />
          <Auth onAuth={handleAuth} appName={webConfig?.appName || "NexaNotes"} registrationEnabled={webConfig?.registrationEnabled ?? true} />
        </>
      ) : (
        <>
          <CustomCursor cursorStyle={cursorStyle} cursorColor={cursorColor} />
          <div className="app-wrapper">
            <TopBar 
              user={user} 
              onLogout={handleLogout} 
              activeView={activeView} 
              onNavigate={handleNavigate} 
              appName={webConfig.appName}
              onAddNote={handleAddNote}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
            
            {activeView === 'home' && <HomePage user={user} notes={notes} onNewNote={handleAddNote} publications={publications} onSubmitPublication={handleSubmitPublication} />}
            {activeView === 'profile' && <ProfilePage user={user} notes={notes} onGoToNotes={() => handleNavigate('notes')} onSaveProfile={handleSaveProfile} />}
            {activeView === 'admin' && <AdminDashboard allUsers={allUsers} allNotes={allNotes} onGoToNotes={() => handleNavigate('notes')} currentUser={user} onDeleteUser={handleDeleteUser} onSetRole={handleSetRole} webConfig={webConfig} onUpdateWebConfig={handleUpdateWebConfig} publications={publications} onCreatePublication={handleCreateDirectPublication} onReviewPublication={handleReviewPublication} onDeletePublication={handleDeletePublication} />}
            {activeView === 'discussion' && <DiscussionPage threads={threads} user={user} onCreateThread={handleCreateThread} onAddPost={handleAddPost} onToggleLike={handleToggleLike} communities={communities} onCreateCommunity={handleCreateCommunity} />}

            {activeView === 'notes' && (
               <div className={`app-container ${isMobile ? `mobile-view-${mobileNotesView}` : ''}`}>
                    <Sidebar 
                        onAddNote={handleAddNote}
                        isCollapsed={isSidebarCollapsed}
                        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                    />
                    <main className="main-content">
                      <div className="content-area">
                        <NoteList 
                          notes={notes}
                          selectedNoteId={selectedNoteId}
                          onSelectNote={handleSelectNote}
                          onDeleteNote={handleDeleteNote}
                          onSummarizeNote={handleSummarizeNote}
                          onShareNote={handleShareNote}
                          isSummarizing={isSummarizing}
                        />
                        {selectedNote ? (
                          <NoteEditor 
                            note={selectedNote} 
                            onUpdateNote={handleUpdateNote} 
                            isMobile={isMobile}
                            onBack={handleBackToNoteList}
                          />
                        ) : (
                          <div className="no-note-selected">
                            <h2>{t('editor.noNoteSelected')}</h2>
                          </div>
                        )}
                      </div>
                    </main>
                </div>
            )}
          </div>
          <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            themes={appThemes}
            currentTheme={currentTheme}
            onSelectTheme={(theme) => handleUpdateUserPreferences({ themeName: theme.name })}
            currentCursorStyle={cursorStyle}
            onSelectCursorStyle={(style) => handleUpdateUserPreferences({ cursorStyle: style })}
            currentCursorColor={cursorColor}
            onSelectCursorColor={(color) => handleUpdateUserPreferences({ cursorColor: color })}
            currentLanguage={language}
            onSelectLanguage={(lang) => handleUpdateUserPreferences({ language: lang })}
          />
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            note={noteToShare}
          />
        </>
      )}
    </LanguageContext.Provider>
  );
};

export default App;